# ★ Lesson 12: String Spells

## Two pointers on a string

To check whether a string is a palindrome without making a reversed copy,
put one finger at each end, and walk them towards each other:

```python
def is_palindrome(text):
    left, right = 0, len(text) - 1
    while left < right:
        if text[left] != text[right]:
            return False
        left += 1
        right -= 1
    return True

print(is_palindrome("racecar"), is_palindrome("tobias"))
```

## Building strings efficiently

Strings never change, so `result += piece` in a loop builds a brand new
string each time. For long results, collect the pieces in a **list** and
`join` them once at the end:

```python
pieces = []
for word in ["one", "more", "turn"]:
    pieces.append(word.upper())
print("-".join(pieces))
```

## Run-length encoding

Long runs of the same character can be squashed into **count + character**:

```text
WWWWWWWWWWWWRBBB  ->  12W1R3B
```

To **encode**, walk along the string, counting how long each run of equal
characters is. A run ends when the next character is different, or when the
string runs out. Don't forget that last run!

To **decode**, read the digits to get a count, which may be **more than one
digit** (`12W`), then repeat the character that follows.

```checkpoint
q: 'What does "12W1R" decode to?'
options: ["WWR", "WWWWWWWWWWWWR", "12 copies of 'W1R'"]
answer: 1
why: The digits 1 and 2 together make 12 - then one R.
```

## Longest common prefix

The longest start that several words share. Compare letter by letter, and
stop at the first position where they disagree, or where the shortest word
runs out:

```python
def common_prefix(words):
    if not words:
        return ""
    shortest = min(words, key=len)
    for i, letter in enumerate(shortest):
        if any(word[i] != letter for word in words):
            return shortest[:i]
    return shortest

print(common_prefix(["Wingardium", "Wingless", "Winged"]))
```

## Palindromes hiding inside strings

`"banana"` isn't a palindrome, but it contains one: `"anana"`. To find the
longest, one good idea is to stand at every possible **centre** and spread
outwards for as long as the two sides match. A centre can be a letter
(`"aba"`), or the gap between two letters (`"abba"`).

```checkpoint
q: How many possible centres does a string of length n have?
options: ["n", "2n - 1", "n²"]
answer: 1
why: n letters plus the n - 1 gaps between them.
```
