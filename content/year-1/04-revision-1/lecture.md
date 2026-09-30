# Revision I: print, variables, input, and running order

No new spells today - just three short challenges that mix everything so far.
Before you start, a quick memory check:

```checkpoint
q: What does `print("Ron" + "Weasley")` show?
options: ["Ron Weasley", "RonWeasley", "Ron+Weasley"]
answer: 1
why: "`+` glues strings together exactly - it never adds a space for you."
```

```checkpoint
q: Which line creates a variable called `spell` holding the text Nox?
options: ['`"spell" = Nox`', '`spell = "Nox"`', '`spell == "Nox"`']
answer: 1
why: The variable name goes on the left of `=`, and text needs quotes.
```

Remember: Python runs **top to bottom**, and `input()` always gives back what
was typed as a **string**.
