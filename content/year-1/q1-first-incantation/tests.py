def test_prints_something():
    r = run_student()
    check(len(r.lines) > 0,
          "Your spell ran, but it said nothing at all. Which spell makes Python *show* words on the screen?")


def test_first_line():
    r = run_student()
    first = r.lines[0]
    check(first.lower().replace(" ", "") == "hello,hogwarts!",
          "Read your first line of output aloud. Does it say the same words as the first line in the task?")
    check(first == "Hello, Hogwarts!",
          "Your first line is close! Compare it with the task one character at a time: capitals, the comma, the space, the '!'.")


def test_second_line():
    r = run_student()
    check(len(r.lines) >= 2,
          "The task asks for two lines, but your spell only shows one. How many times do you need to call print?")
    check(r.lines[1] == "I am ready to learn magic.",
          "Your second line doesn't quite match. Is every word, capital letter and the final full stop the same as in the task?")


def test_nothing_extra():
    r = run_student()
    check(len(r.lines) == 2,
          f"Your spell printed {len(r.lines)} lines, but the task wants exactly 2. Which lines are extra?")
