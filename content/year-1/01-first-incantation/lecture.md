# Lesson 1: Speaking Parseltongue

Welcome, first-year! A **program** is a list of instructions that the computer
follows **from top to bottom**, one line at a time. At Hogwarts we call
programs *spells*.

## Your first spell: `print`

`print` makes Python show something on the screen:

```python
print("Lumos")
```

It has three parts:

1. `print` - the name of the spell.
2. `( )` - round brackets. Whatever is inside is what the spell acts on.
3. `"Lumos"` - text in quotes. Text in quotes is called a **string**.

```checkpoint
q: Which of these shows the word Nox on the screen?
options:
  - "`print(Nox)`"
  - "`print(\"Nox\")`"
  - "`Print(\"Nox\")`"
answer: 1
why: Text needs quotes, and Python is case-sensitive - `Print` with a capital P is a different (unknown) name.
```

## Strings

A string is text wrapped in quotes: double `"..."` or single `'...'`. Use the
same kind at both ends. That gives you a neat trick: to put one kind of quote
*inside* a string, wrap it in the *other* kind.

```python
print('The sign said "KEEP OUT"')
print("Hagrid's hut")
```

## One print, one line

Each `print` shows one line. A `print()` with nothing inside shows an
**empty line**.

```python
print("First line")
print()
print("Third line")
```

## The newline charm: `\n`

Inside a string, `\n` means "start a new line here". So one print can show
several lines:

```python
print("Up\nDown")
```

```checkpoint
q: "How many lines does `print(\"A\\nB\\nC\")` show?"
options: ["1", "2", "3"]
answer: 2
why: Each `\n` starts a new line, so A, B and C each get their own line.
```

## Comments

Anything after a `#` is a **comment**. Python ignores it - it's a note for
humans.

```python
# This line is a note to myself
print("Comments are invisible to Python")  # so is this
```

Click **Try it** on any example to load it into the sandbox below, then press
**Run**. Experiment! Nothing can break. (Psst... some magic words may do more
than you'd expect when printed.)
