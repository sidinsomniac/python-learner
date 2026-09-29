def _uses_input():
    return any(
        isinstance(node, ast.Call) and getattr(node.func, "id", None) == "input"
        for node in ast.walk(tree())
    )


def test_asks_a_question():
    check(_uses_input(),
          "How does your spell *listen* to the student? Which spell pauses and waits for them to type?")


def test_welcomes_harry():
    r = run_student(["Harry"])
    check(any("Welcome to Hogwarts" in line for line in r.lines),
          "When Harry types his name, does your spell print a line that starts with 'Welcome to Hogwarts'?")
    check("Welcome to Hogwarts, Harry!" in r.stdout,
          "Harry typed his name, but the welcome line isn't quite 'Welcome to Hogwarts, Harry!'. Look carefully at the comma, the spaces and the '!'.")


def test_works_for_anyone():
    r = run_student(["Luna"])
    check("Welcome to Hogwarts, Luna!" in r.stdout,
          "Your spell works for Harry, but when Luna arrives it doesn't greet *her*. Where does the name in your welcome come from: the trunk (variable) or fixed text?")


def test_single_welcome():
    r = run_student(["Neville"])
    welcomes = [line for line in r.lines if "Welcome" in line]
    check(len(welcomes) == 1,
          f"Neville got {len(welcomes)} welcome lines. How many should one student receive?")
