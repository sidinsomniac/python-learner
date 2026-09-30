# Lesson 9: True or False

A **boolean** is one of two values: `True` or `False`. Comparisons produce
booleans:

| Operator | Asks | `5 ? 3` |
|---|---|---|
| `==` | equal? | `False` |
| `!=` | not equal? | `True` |
| `<` `>` | smaller? bigger? | `False`, `True` |
| `<=` `>=` | smaller or equal? bigger or equal? | `False`, `True` |

Remember: `=` **stores** a value, while `==` **asks** a question.

## Chained comparisons

Python lets you chain comparisons like a mathematician:

```python
temperature = 15
print(10 < temperature < 20)
```

## Joining questions: `and`, `or`, `not`

- `a and b` is True only if **both** are True.
- `a or b` is True if **at least one** is True.
- `not a` flips True and False.

```python
has_wand = True
has_robes = False
print(has_wand and has_robes)
print(has_wand or has_robes)
print(not has_robes)
```

```checkpoint
q: 'What is `True and not False`?'
options: ["True", "False"]
answer: 0
why: "`not False` is True, and `True and True` is True."
```

**Order**: `not` happens first, then `and`, then `or` - just like `*` before
`+`. Use brackets when mixing `and` with `or`, so nobody (including you)
gets confused.

```checkpoint
q: 'What is `False and False or True`?'
options: ["True", "False"]
answer: 0
why: "`and` goes first: `False and False` is False - then `False or True` is True."
```

## `in`

`in` asks whether something appears inside a string: `"ron" in "Ron Weasley"`
is `False` (capitals!), but `"Ron" in "Ron Weasley"` is `True`.
