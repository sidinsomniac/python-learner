# Debugging

- Read tracebacks from the bottom: WHAT (type and message), then WHERE (line and function).
- NameError, TypeError, KeyError, IndexError, ValueError, AttributeError (often a None), ZeroDivisionError.
- Guess, then test: temporary `print("DEBUG", x)`, or step through in the Pensieve.
- `assert condition, "message"` - make assumptions loud.
- Traps: off-by-one, changing a list while looping over it, return inside a loop, case, mutable defaults.
- Explain it to the rubber duck.
