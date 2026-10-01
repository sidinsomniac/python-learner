"""Grading harness for Parseltongue Academy.

Loaded once into Pyodide (in the browser worker and in the Node content
validator). It runs the learner's code in a sandboxed namespace, feeds
scripted answers to input(), runs a quest's hidden tests, and runs the
flaw detectors. Every piece of feedback it produces is a *question*, never
a fix.
"""

import ast
import builtins
import contextlib
import copy
import io
import json
import os
import shutil
import sys
import time
import traceback
import types

STUDENT_FILE = "<your spell>"
MAX_OUTPUT = 20_000

_student_code = ""

# --------------------------------------------------------------------------
# The desk - a fresh working folder holding the exercise's files (Year 3 on).
# Every run, every test and every Pensieve replay starts from a clean desk, so
# a spell that writes a file can't leak it into the next run.
# --------------------------------------------------------------------------

DESK = "/tmp/desk"
_desk_files = {}


def _reset_desk(files=None):
    """Empty the desk, lay out `files` ({name: text}) on it and work there."""
    os.chdir("/")
    shutil.rmtree(DESK, ignore_errors=True)
    os.makedirs(DESK)
    for name, text in (files if files is not None else _desk_files).items():
        path = os.path.join(DESK, name)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as handle:
            handle.write(text)
    os.chdir(DESK)


def write_files(files):
    """Used by quest tests: replace everything on the desk with these files.

    Like run_with(), it lets the examiners hand the spell a scroll the learner
    has never seen, so the answer can't be memorised.
    """
    _reset_desk(files)


def read_file(name):
    """Used by quest tests: the text of a file on the desk, or None if it doesn't exist."""
    path = os.path.join(DESK, name)
    if not os.path.isfile(path):
        return None
    with open(path, encoding="utf-8") as handle:
        return handle.read()


class CheckFailed(Exception):
    """Raised by check() - carries a guiding question for the learner."""


class StudentCrashed(Exception):
    """The learner's code raised an error while a test was running it."""

    def __init__(self, error):
        super().__init__(error["type"])
        self.error = error


class RunResult:
    def __init__(self, stdout, namespace, error):
        self.stdout = stdout
        self.ns = namespace
        self.error = error

    @property
    def lines(self):
        """Output lines with trailing spaces removed and blank lines dropped."""
        return [line.rstrip() for line in self.stdout.splitlines() if line.strip()]


def check(condition, question):
    """Fail the current test with a guiding question if condition is false."""
    if not condition:
        raise CheckFailed(question)


def _error_info(exc):
    info = {"type": type(exc).__name__, "message": str(exc), "line": None}
    if isinstance(exc, SyntaxError):
        info["message"] = exc.msg
        info["line"] = exc.lineno
        info["text"] = (exc.text or "").rstrip("\n")
    else:
        for frame in traceback.extract_tb(exc.__traceback__):
            if frame.filename == STUDENT_FILE:
                info["line"] = frame.lineno
    info["formatted"] = "".join(
        traceback.format_exception_only(type(exc), exc)
    ).strip()
    return info


# In the browser a runaway spell is stopped by terminating the worker. Where
# that isn't possible (the Node content validator), set STEP_LIMIT to stop any
# spell after that many lines have run.
STEP_LIMIT = None


class SpellTimeout(TimeoutError):
    """The spell ran more lines than STEP_LIMIT allows."""


def _step_guard():
    steps = 0

    def guard(frame, event, arg):
        nonlocal steps
        if frame.f_code.co_filename != STUDENT_FILE:
            return None
        if event == "line":
            steps += 1
            if steps > STEP_LIMIT:
                raise SpellTimeout("The spell ran for too long. Is something looping forever?")
        return guard

    return guard


def _execute(code, inputs):
    """Run code (source text or a parsed module) with scripted input() answers.

    Returns (stdout, namespace, error).
    """
    out = io.StringIO()
    feed = [str(v) for v in inputs]

    def scripted_input(prompt=""):
        out.write(str(prompt))
        if not feed:
            raise EOFError(
                "The spell asked input() for more answers than were provided."
            )
        value = feed.pop(0)
        out.write(value + "\n")  # echo, like a real terminal
        return value

    safe_builtins = dict(vars(builtins))
    safe_builtins["input"] = scripted_input
    namespace = {"__name__": "__main__", "__builtins__": safe_builtins}
    error = None
    guard = _step_guard() if STEP_LIMIT else None
    try:
        compiled = compile(code, STUDENT_FILE, "exec")
        with contextlib.redirect_stdout(out):
            if guard:
                sys.settrace(guard)
            try:
                exec(compiled, namespace)
            finally:
                if guard:
                    sys.settrace(None)
    except BaseException as exc:  # noqa: BLE001 - we report every error kind
        error = _error_info(exc)
    stdout = out.getvalue()
    if len(stdout) > MAX_OUTPUT:
        stdout = stdout[:MAX_OUTPUT] + "\n... (output truncated)"
    return stdout, namespace, error


def run_student(inputs=(), allow_error=False):
    """Used by quest tests: run the learner's code with the given inputs."""
    stdout, namespace, error = _execute(_student_code, inputs)
    if error is not None and not allow_error:
        raise StudentCrashed(error)
    return RunResult(stdout, namespace, error)


def run_with(inputs=(), allow_error=False, **values):
    """Run the learner's code with some starting values changed.

    For exercises that begin with lines like `knuts = 1000`: the examiners
    swap in other values (run_with(knuts=7)) to check the spell really
    calculates, rather than printing a memorised answer.
    """
    module = ast.parse(_student_code)
    for name, value in values.items():
        for node in module.body:
            if (
                isinstance(node, ast.Assign) and len(node.targets) == 1
                and isinstance(node.targets[0], ast.Name) and node.targets[0].id == name
            ):
                # repr() round-trips lists, dicts, tuples, strings and numbers.
                node.value = ast.copy_location(ast.parse(repr(value), mode="eval").body, node.value)
                ast.fix_missing_locations(node)
                break
        else:
            check(False, f"Keep the line that sets `{name}` near the top of your spell - the examiners change its value to test you.")
    stdout, namespace, error = _execute(module, inputs)
    if error is not None and not allow_error:
        raise StudentCrashed(error)
    return RunResult(stdout, namespace, error)


def source():
    """Used by quest tests: the learner's source code."""
    return _student_code


def tree():
    """Used by quest tests: the learner's code parsed into an AST."""
    return ast.parse(_student_code)


# --------------------------------------------------------------------------
# Flaw detectors - reusable AST checks that ask questions about design.
# --------------------------------------------------------------------------

_BUILTIN_NAMES = {
    "print", "input", "str", "int", "float", "len", "list", "dict", "set",
    "tuple", "bool", "type", "sum", "max", "min", "range", "id", "open",
    "round", "abs", "sorted",
}


def _detect_shadowed_builtin(module):
    for node in ast.walk(module):
        if (
            isinstance(node, ast.Name)
            and isinstance(node.ctx, ast.Store)
            and node.id in _BUILTIN_NAMES
        ):
            return {
                "id": "shadowed-builtin",
                "line": node.lineno,
                "question": (
                    f"On line {node.lineno} you created a variable called "
                    f"`{node.id}`, which is also the name of a built-in spell. "
                    f"What happens to the original `{node.id}()` after that "
                    "line runs? Could a different name avoid the clash?"
                ),
            }
    return None


def _detect_unused_variable(module):
    stored, loaded = {}, set()
    for node in ast.walk(module):
        # A loop counter nobody reads (`for i in range(3)`) is normal.
        if isinstance(node, (ast.For, ast.comprehension)):
            loaded.update(n.id for n in ast.walk(node.target) if isinstance(n, ast.Name))
        if isinstance(node, ast.Name):
            if isinstance(node.ctx, ast.Store):
                stored.setdefault(node.id, node.lineno)
            else:
                loaded.add(node.id)
    for name, line in sorted(stored.items(), key=lambda item: item[1]):
        if name not in loaded and not name.startswith("_"):
            return {
                "id": "unused-variable",
                "line": line,
                "question": (
                    f"You stored something in `{name}` on line {line}, but "
                    "nothing ever reads it again. Was it meant to appear "
                    "somewhere later - perhaps in what you print?"
                ),
            }
    return None


DETECTORS = [_detect_shadowed_builtin, _detect_unused_variable]


def detect_flaws(code):
    try:
        module = ast.parse(code)
    except SyntaxError:
        return []
    return [flaw for flaw in (d(module) for d in DETECTORS) if flaw]


# --------------------------------------------------------------------------
# More helpers for quest tests.
# --------------------------------------------------------------------------

def student_function(name, inputs=()):
    """Run the learner's code and return the function they defined."""
    result = run_student(inputs)
    fn = result.ns.get(name)
    check(
        callable(fn),
        f"I can't find a spell called `{name}`. Did you define it with `def {name}(...)`, spelled exactly like that?",
    )
    return fn


_last_printed = ""


def call(fn, *args, **kwargs):
    """Call one of the learner's functions like a test would.

    Anything it prints is captured (read it with printed()), a runaway loop is
    stopped by the step guard, and an error inside it is reported as the
    learner's crash - with its line number - rather than as a broken test.
    """
    global _last_printed
    out = io.StringIO()
    guard = _step_guard() if STEP_LIMIT else None
    try:
        with contextlib.redirect_stdout(out):
            if guard:
                sys.settrace(guard)
            try:
                return fn(*args, **kwargs)
            finally:
                if guard:
                    sys.settrace(None)
    except (CheckFailed, StudentCrashed):
        raise
    except BaseException as exc:  # noqa: BLE001 - we report every error kind
        raise StudentCrashed(_error_info(exc)) from None
    finally:
        _last_printed = out.getvalue()


def printed():
    """What the learner's function printed during the last call()."""
    return _last_printed


def calls(name):
    """Does the learner's code call `name(...)` or `something.name(...)`?"""
    for node in ast.walk(tree()):
        if isinstance(node, ast.Call):
            func = node.func
            if isinstance(func, ast.Name) and func.id == name:
                return True
            if isinstance(func, ast.Attribute) and func.attr == name:
                return True
    return False


def uses(*node_types):
    """Does the learner's code contain any of these AST node types?"""
    return any(isinstance(node, node_types) for node in ast.walk(tree()))


def count_nodes(*node_types):
    return sum(isinstance(node, node_types) for node in ast.walk(tree()))


def timed(fn, *args, limit=1.0, question="Your spell is correct but slow. How many steps does it take for a huge input?"):
    """Call fn(*args) and fail with a question if it takes longer than limit seconds."""
    start = time.perf_counter()
    value = fn(*args)
    check(time.perf_counter() - start <= limit, question)
    return value


TEST_HELPERS = {
    "check": check,
    "run_student": run_student,
    "student_function": student_function,
    "call": call,
    "printed": printed,
    "run_with": run_with,
    "source": source,
    "tree": tree,
    "calls": calls,
    "uses": uses,
    "count_nodes": count_nodes,
    "timed": timed,
    "write_files": write_files,
    "read_file": read_file,
    "ast": ast,
}


# --------------------------------------------------------------------------
# Snape's code review - style remarks shown only AFTER a spell passes.
# The engine enables each rule once the idea it relies on has been taught.
# --------------------------------------------------------------------------

def _is_bool_const(node):
    return isinstance(node, ast.Constant) and isinstance(node.value, bool)


def _rv_eq_bool(module):
    for node in ast.walk(module):
        if isinstance(node, ast.Compare) and any(isinstance(op, (ast.Eq, ast.NotEq, ast.Is)) for op in node.ops):
            if _is_bool_const(node.left) or any(_is_bool_const(c) for c in node.comparators):
                return node.lineno, "Comparing with `True` or `False`, line {line}. A boolean is *already* true or false. Why ask it twice?"


def _rv_not_eq(module):
    for node in ast.walk(module):
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.Not):
            inner = node.operand
            if isinstance(inner, ast.Compare) and len(inner.ops) == 1 and isinstance(inner.ops[0], ast.Eq):
                return node.lineno, "`not a == b` on line {line}. Is there no operator that means *not equal*? I believe there is."


def _rv_range_len(module):
    for node in ast.walk(module):
        if isinstance(node, ast.For) and isinstance(node.iter, ast.Call):
            call = node.iter
            if (
                isinstance(call.func, ast.Name) and call.func.id == "range" and len(call.args) == 1
                and isinstance(call.args[0], ast.Call) and isinstance(call.args[0].func, ast.Name)
                and call.args[0].func.id == "len"
            ):
                return node.lineno, "`range(len(...))` on line {line}. Do you truly need the positions, or could you loop over the items themselves?"


def _rv_redundant_bool(module):
    for node in ast.walk(module):
        if isinstance(node, ast.If) and len(node.body) == 1 and len(node.orelse) == 1:
            a, b = node.body[0], node.orelse[0]
            if isinstance(a, ast.Return) and isinstance(b, ast.Return) and _is_bool_const(a.value) and _is_bool_const(b.value):
                return node.lineno, "An `if` that returns True or else False, line {line}. The condition *is* the answer already."
            if (
                isinstance(a, ast.Assign) and isinstance(b, ast.Assign)
                and _is_bool_const(a.value) and _is_bool_const(b.value)
                and ast.dump(a.targets[0]) == ast.dump(b.targets[0])
            ):
                return node.lineno, "An `if` that stores True or else False, line {line}. Why not store the condition itself?"


def _rv_augment(module):
    for node in ast.walk(module):
        if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
            value = node.value
            if (
                isinstance(value, ast.BinOp) and isinstance(value.op, (ast.Add, ast.Sub, ast.Mult))
                and isinstance(value.left, ast.Name) and value.left.id == node.targets[0].id
            ):
                op = {ast.Add: "+=", ast.Sub: "-=", ast.Mult: "*="}[type(value.op)]
                return node.lineno, "`x = x + ...` on line {line}. There is a shorter incantation: `" + op + "`. Perhaps you slept through that lesson."


def _rv_str_in_fstring(module):
    for node in ast.walk(module):
        if isinstance(node, ast.FormattedValue) and isinstance(node.value, ast.Call):
            func = node.value.func
            if isinstance(func, ast.Name) and func.id == "str":
                return node.lineno, "`str()` inside an f-string, line {line}. The f-string converts it for you. Redundant."


def _rv_concat_str(module):
    for node in ast.walk(module):
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
            converted = [n for n in ast.walk(node) if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == "str"]
            texts = [n for n in ast.walk(node) if isinstance(n, ast.Constant) and isinstance(n.value, str)]
            if converted and texts:
                return node.lineno, "Gluing text together with `+` and `str()`, line {line}. An f-string would read far more cleanly."


class _Shape(ast.NodeTransformer):
    def visit_Constant(self, node):
        return ast.Constant(value="#")


def _shape(stmt):
    return ast.dump(_Shape().visit(copy.deepcopy(stmt)))


def _rv_repeated(module):
    for node in ast.walk(module):
        for field in ("body", "orelse"):
            body = getattr(node, field, None)
            if not isinstance(body, list):
                continue
            run = 1
            for prev, cur in zip(body, body[1:]):
                run = run + 1 if _shape(prev) == _shape(cur) else 1
                if run >= 4:
                    return cur.lineno, "Four or more near-identical lines, ending on line {line}. Repeating yourself is not magic. It is *typing*. Was there no loop in your repertoire?"


def _is_zero_assign(stmt, name):
    return (
        isinstance(stmt, ast.Assign) and len(stmt.targets) == 1 and isinstance(stmt.targets[0], ast.Name)
        and stmt.targets[0].id == name and isinstance(stmt.value, ast.Constant) and stmt.value.value == 0
    )


def _rv_enumerate(module):
    for node in ast.walk(module):
        body = getattr(node, "body", None)
        if not isinstance(body, list):
            continue
        for before, loop in zip(body, body[1:]):
            if not isinstance(loop, ast.For):
                continue
            for stmt in loop.body:
                if (
                    isinstance(stmt, ast.AugAssign) and isinstance(stmt.op, ast.Add) and isinstance(stmt.target, ast.Name)
                    and isinstance(stmt.value, ast.Constant) and stmt.value.value == 1 and _is_zero_assign(before, stmt.target.id)
                ):
                    return loop.lineno, "A counter you add 1 to by hand on every pass, line {line}. `enumerate` counts for you - have you met it?"


def _rv_dict_keys(module):
    for node in ast.walk(module):
        if isinstance(node, (ast.For, ast.comprehension)) and isinstance(node.iter, ast.Call):
            func = node.iter.func
            if isinstance(func, ast.Attribute) and func.attr == "keys" and not node.iter.args:
                line = getattr(node, "lineno", getattr(node.iter, "lineno", 0))
                return line, "Looping over `.keys()`, line {line}. A dictionary already loops over its keys. Redundant."


def _rv_append_loop(module):
    for node in ast.walk(module):
        body = getattr(node, "body", None)
        if not isinstance(body, list):
            continue
        for before, loop in zip(body, body[1:]):
            if not (isinstance(loop, ast.For) and len(loop.body) == 1 and not loop.orelse):
                continue
            inner = loop.body[0]
            if isinstance(inner, ast.If) and len(inner.body) == 1 and not inner.orelse:
                inner = inner.body[0]
            if not (isinstance(inner, ast.Expr) and isinstance(inner.value, ast.Call)):
                continue
            func = inner.value.func
            if (
                isinstance(func, ast.Attribute) and func.attr == "append" and isinstance(func.value, ast.Name)
                and isinstance(before, ast.Assign) and isinstance(before.value, ast.List) and not before.value.elts
                and len(before.targets) == 1 and isinstance(before.targets[0], ast.Name)
                and before.targets[0].id == func.value.id
            ):
                return loop.lineno, "An empty list, then a loop that only appends to it, line {line}. A list comprehension says that in one line."


def _rv_mutable_default(module):
    for node in ast.walk(module):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            for default in node.args.defaults + node.args.kw_defaults:
                if isinstance(default, (ast.List, ast.Dict, ast.Set)):
                    return node.lineno, "A list or dict as a default argument, line {line}. It is created ONCE and shared by every call. A classic, catastrophic mistake."


def _rv_bare_except(module):
    for node in ast.walk(module):
        if isinstance(node, ast.ExceptHandler):
            if node.type is None:
                return node.lineno, "A bare `except:` on line {line}. It catches *everything* - even the errors you never imagined. Name the exception you expect."
            broad = isinstance(node.type, ast.Name) and node.type.id in ("Exception", "BaseException")
            if broad and len(node.body) == 1 and isinstance(node.body[0], ast.Pass):
                return node.lineno, "`except Exception: pass` on line {line}. Swallowing every error in silence. The Dementors thank you."


def _is_open_call(node):
    return isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "open"


def _rv_open_without_with(module):
    in_with = set()
    for node in ast.walk(module):
        if isinstance(node, ast.With):
            in_with.update(id(item.context_expr) for item in node.items)
    for node in ast.walk(module):
        if _is_open_call(node) and id(node) not in in_with:
            return node.lineno, "`open()` without `with`, line {line}. And who, precisely, is going to close that file? Not you, evidently."


def _rv_lambda_assign(module):
    for node in ast.walk(module):
        if isinstance(node, ast.Assign) and isinstance(node.value, ast.Lambda) and all(isinstance(t, ast.Name) for t in node.targets):
            return node.lineno, "A lambda given a name, line {line}. If it deserves a name, it deserves a `def`."


def _rv_needless_lambda(module):
    for node in ast.walk(module):
        if not isinstance(node, ast.Lambda):
            continue
        args, body = node.args, node.body
        if args.vararg or args.kwarg or args.kwonlyargs or args.defaults or len(args.args) != 1:
            continue
        name = args.args[0].arg
        if (
            isinstance(body, ast.Call) and len(body.args) == 1 and not body.keywords
            and isinstance(body.args[0], ast.Name) and body.args[0].id == name
            and isinstance(body.func, ast.Name) and body.func.id != name
        ):
            return node.lineno, "`lambda x: " + body.func.id + "(x)` on line {line}. A wrapper that adds nothing. `" + body.func.id + "` is already a spell - pass it as it is."


def _rv_unused(module):
    flaw = _detect_unused_variable(module)
    if flaw:
        return flaw["line"], "A variable created on line {line} and never used again. Clutter, like Longbottom's cauldron."


def _rv_shadow(module):
    flaw = _detect_shadowed_builtin(module)
    if flaw:
        return flaw["line"], "You named a variable after a built-in spell on line {line}. Reckless."


REVIEW_RULES = {
    "unused-variable": _rv_unused,
    "shadowed-builtin": _rv_shadow,
    "str-in-fstring": _rv_str_in_fstring,
    "concat-str": _rv_concat_str,
    "eq-bool": _rv_eq_bool,
    "not-eq": _rv_not_eq,
    "redundant-bool": _rv_redundant_bool,
    "repeated-lines": _rv_repeated,
    "range-len": _rv_range_len,
    "augmented-assign": _rv_augment,
    "enumerate-counter": _rv_enumerate,
    "dict-keys": _rv_dict_keys,
    "append-comprehension": _rv_append_loop,
    "mutable-default": _rv_mutable_default,
    "bare-except": _rv_bare_except,
    "open-without-with": _rv_open_without_with,
    "lambda-assign": _rv_lambda_assign,
    "needless-lambda": _rv_needless_lambda,
}


def review_code(code, enabled):
    try:
        module = ast.parse(code)
    except SyntaxError:
        return []
    remarks = []
    for rule_id in enabled:
        rule = REVIEW_RULES.get(rule_id)
        found = rule(module) if rule else None
        if found:
            line, text = found
            remarks.append({"id": rule_id, "line": line, "remark": text.replace("{line}", str(line))})
    return remarks[:3]


# --------------------------------------------------------------------------
# The Pensieve - record a spell line by line.
# --------------------------------------------------------------------------

class _TooManySteps(Exception):
    pass


def _short_repr(value, limit=60):
    try:
        text = repr(value)
    except Exception:  # noqa: BLE001
        text = "<?>"
    return text if len(text) <= limit else text[: limit - 3] + "..."


def _snapshot(frame_vars):
    snap = {}
    for name, value in frame_vars.items():
        if name.startswith("__") or isinstance(value, types.ModuleType):
            continue
        if isinstance(value, types.FunctionType):
            snap[name] = f"<spell {name}()>"
        elif isinstance(value, type):
            snap[name] = f"<class {name}>"
        else:
            snap[name] = _short_repr(value)
    return snap


def _scope_name(frame):
    return "main" if frame.f_code.co_name == "<module>" else frame.f_code.co_name


def _call_stack(frame):
    """The learner's frames from the outermost (main) to this one."""
    stack = []
    while frame is not None:
        if frame.f_code.co_filename == STUDENT_FILE:
            stack.append(_scope_name(frame))
        frame = frame.f_back
    return stack[::-1]


def trace_json(code, inputs_json, files_json="{}", max_steps=1500):
    """Run code under sys.settrace, recording the variables before each line.

    Each step also records the call stack, so recursion can be watched frame
    by frame, and every return from one of the learner's functions becomes a
    step of its own, showing the value handed back.
    """
    global _desk_files
    _desk_files = json.loads(files_json)
    _reset_desk()
    out = io.StringIO()
    feed = [str(v) for v in json.loads(inputs_json)]
    steps = []

    def scripted_input(prompt=""):
        out.write(str(prompt))
        if not feed:
            raise EOFError("The spell asked input() for more answers than were provided.")
        value = feed.pop(0)
        out.write(value + "\n")
        return value

    raising = set()

    def record(frame, **extra):
        if len(steps) >= max_steps:
            raise _TooManySteps()
        steps.append({
            "line": frame.f_lineno,
            "scope": _scope_name(frame),
            "stack": _call_stack(frame),
            "vars": _snapshot(frame.f_locals),
            "out": len(out.getvalue()),
            **extra,
        })

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != STUDENT_FILE:
            return None
        if event == "line":
            raising.discard(id(frame))  # an exception caught inside this frame
            record(frame)
        elif event == "exception":
            raising.add(id(frame))
        elif event == "return" and frame.f_code.co_name != "<module>":
            if id(frame) in raising:
                raising.discard(id(frame))
            else:
                record(frame, event="return", value=_short_repr(arg))
        return tracer

    safe_builtins = dict(vars(builtins))
    safe_builtins["input"] = scripted_input
    namespace = {"__name__": "__main__", "__builtins__": safe_builtins}
    error = None
    truncated = False
    try:
        compiled = compile(code, STUDENT_FILE, "exec")
        with contextlib.redirect_stdout(out):
            sys.settrace(tracer)
            try:
                exec(compiled, namespace)
            finally:
                sys.settrace(None)
    except _TooManySteps:
        truncated = True
    except BaseException as exc:  # noqa: BLE001 - every error is shown in the Pensieve
        error = _error_info(exc)
    steps.append({"line": None, "scope": "main", "stack": ["main"], "vars": _snapshot(namespace), "out": len(out.getvalue())})
    return json.dumps({
        "steps": steps,
        "stdout": out.getvalue()[:MAX_OUTPUT],
        "error": error,
        "truncated": truncated,
    })


# --------------------------------------------------------------------------
# Entry points called from JavaScript. They take and return JSON strings.
# --------------------------------------------------------------------------

def run_json(code, inputs_json, files_json="{}"):
    global _desk_files
    _desk_files = json.loads(files_json)
    _reset_desk()
    stdout, _, error = _execute(code, json.loads(inputs_json))
    return json.dumps({"stdout": stdout, "error": error})


def grade_json(code, tests_src, inputs_json, review_json="[]", files_json="{}"):
    """Run the learner's code once (for display) and then every test_ function.

    Stops at the first failing test, so the learner focuses on one idea at a
    time. If every test passes, Snape reviews the code. Each run and each test
    starts from a fresh desk holding the exercise's files.
    """
    global _student_code, _desk_files
    _student_code = code
    _desk_files = json.loads(files_json)
    _reset_desk()
    inputs = json.loads(inputs_json)
    stdout, _, error = _execute(code, inputs)
    result = {
        "stdout": stdout,
        "error": error,
        "flaws": detect_flaws(code),
        "passed": 0,
        "total": 0,
        "failure": None,
        "review": [],
    }

    test_ns = dict(TEST_HELPERS)
    exec(compile(tests_src, "<tests>", "exec"), test_ns)
    tests = [
        (name, fn)
        for name, fn in test_ns.items()
        if name.startswith("test_") and callable(fn)
    ]
    result["total"] = len(tests)

    if error is not None and error["type"] == "SyntaxError":
        result["failure"] = {"test": None, "kind": "crash", "error": error}
        return json.dumps(result)

    for name, fn in tests:
        _reset_desk()
        try:
            fn()
        except CheckFailed as failed:
            result["failure"] = {"test": name, "kind": "check", "question": str(failed)}
            break
        except StudentCrashed as crashed:
            result["failure"] = {"test": name, "kind": "crash", "error": crashed.error}
            break
        except Exception as exc:  # noqa: BLE001 - a bug in the quest's tests
            result["failure"] = {
                "test": name,
                "kind": "internal",
                "question": f"The examiners' scroll is smudged ({type(exc).__name__}: {exc}).",
            }
            break
        result["passed"] += 1
    if result["failure"] is None:
        result["review"] = review_code(code, json.loads(review_json))
    return json.dumps(result)
