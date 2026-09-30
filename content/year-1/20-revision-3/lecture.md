# Revision III: decisions and loops

Three mixed challenges on booleans, `if`, and loops.

```checkpoint
q: 'How many times does `for i in range(2, 8, 2):` loop?'
options: ["3", "4", "6"]
answer: 0
why: It visits 2, 4 and 6 - the stop value 8 isn't included.
```

```checkpoint
q: 'With `n = 0`, what is `n > 0 or n == 0 and not n`?'
options: ["True", "False"]
answer: 0
why: "`and` first: `n == 0 and not n` is `True and True` - so the whole thing is `False or True`, which is True."
```
