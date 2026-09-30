# Lesson 4: Sets

A **set** is an unordered collection with **no duplicates**. It's written
with curly brackets, like a dictionary without the values:

```python
near = {"Draco", "Ginny", "Draco", "Filch"}
print(len(near))
print("Ginny" in near)
near.add("Myrtle")
near.discard("Filch")
print(sorted(near))
```

- Duplicates vanish automatically - `near` has 3 names, not 4.
- Sets have **no order** and no positions: `near[0]` is a `TypeError`.
  Use `sorted(s)` when you want to print them tidily.
- `set(some_list)` turns a list into a set. `set()` is an empty set - `{}`
  is an empty **dictionary**!

```checkpoint
q: 'What is `len(set("banana"))`?'
options: ["6", "3", "1"]
answer: 1
why: The distinct letters are b, a and n.
```

## Set algebra

Sets can answer "who is in both?" and friends in a single operator:

| Spell | Meaning |
|---|---|
| `a & b` | in **both** (intersection) |
| `a \| b` | in **either** (union) |
| `a - b` | in `a` but **not** `b` (difference) |
| `a ^ b` | in exactly one of them |
| `a <= b` | is every item of `a` also in `b`? |

```python
monday = {"Draco", "Ginny", "Filch"}
tuesday = {"Ginny", "Myrtle"}
print(sorted(monday & tuesday))
print(sorted(monday | tuesday))
print(sorted(monday - tuesday))
```

To keep narrowing down, update a set in place with `&=`:
`suspects &= tuesday` keeps only the suspects also seen on Tuesday.

```checkpoint
q: 'What is `{1, 2, 3} - {2, 5}`?'
options: ["{1, 3}", "{1, 3, 5}", "{2}"]
answer: 0
why: Difference keeps what's in the first set but not the second. 5 was never in the first.
```

## Why sets are fast

`x in some_list` checks the list item by item. For a list of 100,000 names
that can take 100,000 steps - every time. `x in some_set` jumps straight to
the answer, however big the set is, just like a dictionary key lookup.

So when you need to ask "is this in there?" many times, **make a set first**.

```checkpoint
q: 'You need to check 50,000 names against a list of 50,000 names. What should you do first?'
options: ["Sort the list", "Turn the list into a set", "Nothing - `in` is always fast"]
answer: 1
why: Each set lookup takes one step instead of up to 50,000.
```
