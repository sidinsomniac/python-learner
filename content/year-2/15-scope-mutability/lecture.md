# Lesson 9: Scope and Mutability

## Where do variables live?

Variables created **inside** a function are **local**: they exist only while
the function runs, and nobody outside can see them.

```python
def charm():
    secret = "Alohomora"
    return len(secret)

print(charm())
```

After `charm()` returns, `secret` is gone. Printing it outside the function
would be a `NameError`.

A function can **read** a variable from outside (a **global**), but if it
**assigns** to that name, Python makes a new local one instead:

```python
house_points = 10

def award():
    house_points = 50
    return house_points

print(award(), house_points)
```

The function's `house_points` is a separate, local variable. The global one
is still 10. (There is a `global` keyword to change that - but good spells
**return** new values instead of reaching outside.)

```checkpoint
q: 'After the example above, what is the global `house_points`?'
options: ["10", "50", "60"]
answer: 0
why: Assigning inside the function made a new local variable; the global was never touched.
```

## Passing a list into a function

Remember Filch's "copy" in Lesson 1? Passing a list to a function works the
same way. The parameter is **another name for the same list**, so changes
made through it are seen outside:

```python
def add_item(bag, item):
    bag.append(item)

mine = ["wand"]
add_item(mine, "quill")
print(mine)
```

That can be useful - but it can also surprise the caller. A function that
changes its arguments should say so in its docstring. Many good functions
instead build and **return a new list**, leaving the original alone.

```checkpoint
q: 'A function does `items = items + ["x"]` to its parameter. Does the caller''s list change?'
options: ["Yes", "No"]
answer: 1
why: "`items + [...]` builds a NEW list, and `=` just points the local name at it. `.append` would change the shared list."
```

## The mutable default trap

Here is the famous bug:

```python
def collect(item, bag=[]):
    bag.append(item)
    return bag

print(collect("mirror"))
print(collect("cup"))
```

You might expect `['mirror']` then `['cup']`. But you get `['mirror']` then
`['mirror', 'cup']`!

**Why?** The default `[]` is created **once**, when the `def` line runs - not
each time the function is called. Every call that uses the default shares
that one list, and `append` keeps adding to it.

The same goes for any default that can change: `{}` and `set()` too.
Numbers, strings, tuples and `None` are safe, because they can't be changed.

## The fix: `None` as the default

Use `None` to mean "not given", and make a **fresh** list inside the
function:

```python
def pack(item, trunk=None):
    if trunk is None:
        trunk = []
    trunk.append(item)
    return trunk
```

From this lesson on, Professor Snape will spot a list or dictionary default
from across the dungeon.

```checkpoint
q: 'When is the default `[]` in `def f(x, bag=[]):` created?'
options: ["Every time f is called", "Once, when the def line runs", "Never - it's always None"]
answer: 1
why: Defaults are worked out once. That's why a list default is shared by every call.
```
