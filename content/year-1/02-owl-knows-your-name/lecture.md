# Lesson 2: Trunks, Labels and Listening Ears

## Variables are labelled trunks

A **variable** is a name that stores a value, like a label stuck on a school
trunk.

```python
house = "Hufflepuff"
print(house)
```

`=` does **not** mean "equals" here. It means **"put the value on the right
into the trunk labelled on the left."** Read it as *"house becomes
Hufflepuff"*.

Once a trunk is labelled, you can use its name anywhere you would have used
the value. Notice that `print(house)` has **no quotes**. With quotes,
`print("house")` would show the word *house* rather than what's in the
trunk.

```checkpoint
q: "After `house = \"Ravenclaw\"`, what does `print(\"house\")` show?"
options: ["Ravenclaw", "house", "An error"]
answer: 1
why: The quotes make it a string - the word *house* itself, not what's stored in the variable.
```

## Listening with `input`

`input` pauses the spell, shows a question, and waits for the person to type
an answer. Whatever they type comes back as a **string**, so you usually
store it in a variable:

```python
pet = input("What pet did you bring? ")
print(pet)
```

## Gluing strings together

You can join strings with `+`. This is called **concatenation**:

```python
spell = "Wingardium" + " " + "Leviosa"
print(spell)
```

Mind the spaces: `+` glues things together *exactly*, so Python won't add
a space for you.

You can also give `print` several things separated by commas. It puts a
space between each one:

```python
print("Your pet is", pet)
```
