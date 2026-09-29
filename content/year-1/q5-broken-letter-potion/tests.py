def test_no_crash():
    r = run_student(["Hermione", "9"], allow_error=True)
    if r.error and r.error["type"] == "TypeError":
        check(False,
              f"Python raised a TypeError on line {r.error['line']}. What *type* of value does input() always give back, and can you subtract that type from a number?")
    check(r.error is None,
          f"The spell still crashes with a {r.error['type'] if r.error else ''}. Read the message: what is Python complaining about?")


def test_number_appears():
    r = run_student(["Hermione", "9"])
    check("years_left" not in r.stdout,
          "Your letter literally says 'years_left'. How do you tell an f-string to show a variable's *value* instead of its name?")
    check("2 years" in r.stdout,
          "For a 9-year-old the letter should say 2 years. What does your spell print instead, and why?")


def test_exact_message():
    r = run_student(["Hermione", "9"])
    check("Welcome Hermione! Your letter arrives in 2 years." in r.stdout,
          "Nearly! Compare your output with the task's example one character at a time.")


def test_other_student():
    r = run_student(["Ginny", "5"])
    check("Welcome Ginny! Your letter arrives in 6 years." in r.stdout,
          "Hermione works, but Ginny (age 5) doesn't get the right letter. Is anything in your spell fixed when it should come from the trunks (variables)?")
