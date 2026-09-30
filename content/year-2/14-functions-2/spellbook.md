# Defaults, keywords, many returns

- Default: `def brew(potion, doses=1):` - defaults come after the other parameters.
- Keyword call: `describe("cup", owner="Filch")` - named, any order, after positionals.
- Return several values as a tuple: `return low, high`; unpack: `low, high = f(x)`.
- Docstring: `"""What goes in, what comes out."""` as the first line of the body.
- "Not given": default to `None`, then `if value is None:`.
