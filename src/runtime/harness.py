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
import io
import json
import traceback

STUDENT_FILE = "<your spell>"
MAX_OUTPUT = 20_000

_student_code = ""


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


def _execute(code, inputs):
    """Run code with scripted input() answers. Returns (stdout, ns, error)."""
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
    try:
        compiled = compile(code, STUDENT_FILE, "exec")
        with contextlib.redirect_stdout(out):
            exec(compiled, namespace)
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
# Entry points called from JavaScript. They take and return JSON strings.
# --------------------------------------------------------------------------

def run_json(code, inputs_json):
    stdout, _, error = _execute(code, json.loads(inputs_json))
    return json.dumps({"stdout": stdout, "error": error})


def grade_json(code, tests_src, inputs_json):
    """Run the learner's code once (for display) and then every test_ function.

    Stops at the first failing test, so the learner focuses on one idea at a
    time.
    """
    global _student_code
    _student_code = code
    inputs = json.loads(inputs_json)
    stdout, _, error = _execute(code, inputs)
    result = {
        "stdout": stdout,
        "error": error,
        "flaws": detect_flaws(code),
        "passed": 0,
        "total": 0,
        "failure": None,
    }

    test_ns = {
        "check": check,
        "run_student": run_student,
        "source": source,
        "tree": tree,
        "ast": ast,
    }
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
    return json.dumps(result)
