# Lesson 10, Part 2: Trick Steps

## Trick step 1: the `or` trap

This looks right, but is **always** True:

```python
house = "Hufflepuff"
if house == "Gryffindor" or "Slytherin":
    print("Moving staircase")
```

Python reads it as `(house == "Gryffindor") or ("Slytherin")` - and a
non-empty string like `"Slytherin"` is *truthy*! Each side of `or` must be a
complete question:

```python
house = "Hufflepuff"
if house == "Gryffindor" or house == "Slytherin":
    print("Moving staircase")
```

```checkpoint
q: 'With `pet = "rat"`, is `pet == "owl" or "cat"` truthy?'
options: ["Yes - always", "No - pet isn't owl or cat"]
answer: 0
why: '`"cat"` on its own is a non-empty string, so the whole `or` is truthy, whatever pet is.'
```

## Trick step 2: the order of `elif`

Only the **first** True branch runs. Put a broad check first and the
specific one never gets a chance:

```python
gold = 500
if gold > 10:
    print("Comfortable")
elif gold > 100:
    print("Rich")
```

That prints `Comfortable` - the `Rich` branch can never run. Check the
**strictest** condition first.

## Trick step 3: `=` versus `==`

`if x = 5:` is a `SyntaxError`. Inside an `if`, you want `==`.

## Nesting

An `if` can live inside another `if` - indent it further:

```python
year = 3
has_form = True
if year >= 3:
    if has_form:
        print("Off to Hogsmeade!")
```

Deep nesting gets hard to read quickly. Often `and` or a clean `elif` chain
says the same thing more clearly.
