def test_runs_cleanly():
    r = run_student(allow_error=True)
    check(r.error is None or r.error["type"] != "NameError",
          "Python tried to use `galleons` before it had any value. Which line has to come first so the trunk isn't empty?")
    check(r.error is None, "The ledger crashed. Read the error: which line fails, and why?")


def test_prints_last():
    r = run_student()
    check(len(r.lines) == 1,
          "The ledger should print exactly one line.")
    lines = [l.strip() for l in source().strip().splitlines()]
    check(lines[-1].startswith("print"),
          "If you print the balance before all the sums are done, the goblins see an unfinished number. Where should the print line go?")


def test_balance_is_30():
    r = run_student()
    check(r.lines == ["Gringotts balance: 30"],
          f"The ledger shows '{r.lines[0]}', not 30. Walk through it: after each line, what is inside `galleons`? Does adding before or after doubling matter?")
