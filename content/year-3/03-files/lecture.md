# Lesson 2: Files

Everything your spells have known so far vanished when they finished. A
**file** remembers. In this lesson the files sit on your **desk** (the
spell's working folder). Open the "📂 On the desk" panel in the sandbox to
read them.

## Opening a file with `with`

```python
with open("register.txt") as scroll:
    text = scroll.read()
print(text)
```

- `open(name)` opens the file for **reading**.
- `with ... as scroll:` gives the open file a name, and **closes it
  automatically** when the indented block ends, even if an error happens.
  Always open files this way.

```checkpoint
q: Why use `with open(...) as f:` rather than `f = open(...)`?
options: ["It reads faster", "It closes the file for you, even if an error happens", "It's the only way to read"]
answer: 1
why: The with block guarantees the file is closed when the block ends.
```

## Reading line by line

A file can be looped over, one line at a time. Each line **keeps its
`\n`** at the end, so strip it off:

```python
with open("register.txt") as scroll:
    for line in scroll:
        print(repr(line), "->", repr(line.strip()))
```

Notice the blank line in the middle. After stripping it becomes `""`,
which is falsy, so you can skip it with `if not line.strip(): continue`.

Other ways to read:

| Spell | Gives |
|---|---|
| `scroll.read()` | the whole file as one string |
| `scroll.read().splitlines()` | a list of lines, **without** the `\n` |
| `scroll.readlines()` | a list of lines, each **with** its `\n` |

## Text with fields: CSV

`owls.csv` holds **comma-separated values**: the first line is a header,
and every other line is one record:

```python
with open("owls.csv") as table:
    lines = table.read().splitlines()

header = lines[0].split(",")
print(header)
for line in lines[1:]:
    owl, owner, letters = line.split(",")
    print(f"{owl} carries for {owner}: {int(letters)} letters")
```

Everything in a file is **text**: turn numbers into numbers yourself, and
be ready for the ones that won't turn (Lesson 1!).

```checkpoint
q: 'What does `"Errol, Ron ,3".split(",")` give?'
options: ["['Errol', 'Ron', '3']", "['Errol', ' Ron ', '3']", "['Errol, Ron ,3']"]
answer: 1
why: split only cuts at the commas. The spaces stay, so strip each part.
```

## Writing a file

Open with mode `"w"` to **write**. It creates the file, or **wipes** it if
it already exists. `write` doesn't add a newline for you:

```python
with open("notes.txt", "w") as notes:
    notes.write("Mischief managed\n")
    notes.write("Nox\n")

with open("notes.txt") as notes:
    print(notes.read())
```

Mode `"a"` **appends** to the end instead of wiping:

```python
with open("notes.txt", "a") as notes:
    notes.write("Lumos\n")
```

## A missing file

Opening a file that isn't there raises `FileNotFoundError`, which you can
catch like any other error:

```python
try:
    with open("diary-1926.txt") as diary:
        print(diary.read())
except FileNotFoundError:
    print("No such diary on the desk")
```
