# Lesson 7, Part 1: Functions

A **function** is a spell you name once and cast whenever you like. You
define it with `def`:

```python
def greet(name):
    return f"Welcome to Hogwarts, {name}!"

message = greet("Ginny")
print(message)
print(greet("Colin"))
```

- `def greet(name):` - the function's name, and its **parameters** in brackets.
- The indented block is the function's **body**. It doesn't run until the
  function is **called**: `greet("Ginny")`.
- The value you pass in (`"Ginny"`) is an **argument**; inside the body it's
  known by the parameter's name, `name`.
- `return` hands a value **back** to whoever called it, and ends the function
  immediately.

## `return` versus `print`

This is the most important idea of the whole lesson:

- `print` **shows** a value on the screen. The program can't use it again.
- `return` **gives** the value back to the code that called the function,
  which can store it, compare it, or pass it on.

```python
def shout_print(word):
    print(word.upper())

def shout_return(word):
    return word.upper()

a = shout_print("nox")
b = shout_return("lumos")
print(a, b)
```

`shout_print` shows `NOX`, but gives back nothing - so `a` is `None`.
Every function that ends without a `return` gives back `None`.

```checkpoint
q: 'What does `x = print("hi")` store in x?'
options: ["'hi'", "None", "An error"]
answer: 1
why: print shows text on screen but returns None.
```

**Rule of thumb:** functions should `return` their answers. Leave printing to
the code that calls them. A function that returns can be used anywhere; one
that prints can only ever print.

## Several parameters, and returning early

```python
def is_keen(hearts, minimum):
    return hearts >= minimum

def grade(score):
    if score >= 90:
        return "O"
    if score >= 70:
        return "E"
    return "A"

print(is_keen(5, 3), grade(75))
```

Arguments are matched to parameters **by position**: `hearts` gets 5 and
`minimum` gets 3. As soon as `grade` reaches a `return`, it stops - that's
why the later `if`s don't need `elif`.

```checkpoint
q: 'In `grade(95)`, how many `return` lines actually run?'
options: ["1", "2", "3"]
answer: 0
why: The first return hands back "O" and the function ends right there.
```

## Functions calling functions

Functions can use each other, and the variables inside one function belong
to that function alone (more on that in Lesson 9):

```python
def double(n):
    return n * 2

def quadruple(n):
    return double(double(n))

print(quadruple(3))
```

## How your spells are tested now

From this lesson on, the examiners **call your functions** with their own
arguments and check what they **return**. So spell the function's name
exactly as the task says, and `return` - don't `print` - the answer.
