# Lesson 13: ★ Cipher Craft

## Letters are numbers

Every character has a number, its **code point**. `ord` turns a character
into its number; `chr` turns a number back into a character:

```python
print(ord("A"), ord("B"), ord("Z"))
print(ord("a"))
print(chr(72) + chr(105))
```

Capital letters run from 65 (`A`) to 90 (`Z`); lowercase from 97 (`a`) to
122 (`z`). So the **position** of a capital letter in the alphabet (A = 0,
B = 1, ... Z = 25) is `ord(ch) - ord("A")`.

```checkpoint
q: 'What is `ord("D") - ord("A")`?'
options: ["3", "4", "68"]
answer: 0
why: A is position 0, so D is position 3.
```

## Wrapping around with `%`

A **Caesar cipher** moves every letter the same number of places along the
alphabet. With a shift of 3, `A` becomes `D` and `B` becomes `E`. But what
happens to `Y`? It should wrap round to the start: `Y -> B`.

`%` does the wrapping for you. Shifting position `p` by `k`:

```text
new position = (p + k) % 26
Y: (24 + 3) % 26 = 27 % 26 = 1  ->  B
```

`%` even handles **negative** shifts correctly in Python: `(1 - 3) % 26` is
24, so shifting `B` back by 3 gives `Y`. That's how you decode - shift by
`-k`.

```checkpoint
q: 'Shifting "Z" (position 25) by 2 gives which position?'
options: ["27", "1", "0"]
answer: 1
why: (25 + 2) % 26 is 1, which is B.
```

Here is the whole idea for one capital letter:

```python
letter = "Y"
k = 3
position = ord(letter) - ord("A")
moved = chr((position + k) % 26 + ord("A"))
print(moved)
```

Lowercase letters work the same, measured from `ord("a")`. Anything that
isn't a letter - spaces, punctuation - is left exactly as it is.

## Building a new string

Strings can't be changed, so a cipher **builds a new one**. Collect the
pieces in a list and join them at the end:

```python
pieces = [ch.upper() for ch in "nox!"]
print("".join(pieces))
```

## Cracking a cipher you don't know

If you don't know the shift, there are only 26 possibilities - you could try
them all! But which answer is English? **Frequency analysis** helps: in
English, **E** is by far the most common letter. So in a long enough coded
message, the most common letter is probably E in disguise:

```text
coded: "AOL JHIPULA OBUNLYZ. MLLK PA ZOPUF AOPUNZ."
most common letter: L
L is position 11, E is position 4 -> the shift is probably 11 - 4 = 7
```

Shift back by 7 and read. It doesn't always work for short messages - which
is why the Trial will use a cleverer score.
