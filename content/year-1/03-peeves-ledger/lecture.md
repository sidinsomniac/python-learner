# Lesson 3: Order Matters

Python runs your spell **from top to bottom**, one line at a time. Changing
the order of the lines can change the result, or break the spell entirely.

## Changing what's in a trunk

A variable can be given a **new** value later. The old value is replaced:

```python
owls = 1
owls = 4
print(owls)
```

That prints `4`.

## Using a trunk to refill itself

The right-hand side of `=` is worked out **first**, using the current value.
Only then is the result stored:

```python
points = 10
points = points + 5
print(points)
```

Step by step: `points + 5` is `10 + 5`, which is `15`, and 15 goes back
into `points`.

```checkpoint
q: "What does this print?  `a = \"toad\"` then `b = a` then `a = \"owl\"` then `print(b)`"
options: ["toad", "owl", "An error"]
answer: 0
why: "`b = a` copies what `a` held *at that moment* (toad). Changing `a` afterwards doesn't touch `b`."
```

## Can't use an empty trunk

Using a variable *before* it has been given a value causes a `NameError`,
because Python doesn't know what you mean yet:

```python
print(sickles)
sickles = 3
```

Try running that one to see the error!
