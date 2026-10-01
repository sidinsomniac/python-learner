# Catching errors

- Errors have types: `ValueError`, `TypeError`, `KeyError`, `IndexError`, `ZeroDivisionError`...
- `try:` the risky line, then `except ValueError:` to handle it. The rest of `try` is skipped after an error.
- Catch the **specific** type you expect, never a bare `except:`.
- Several kinds: `except (ValueError, TypeError):` or several `except` blocks.
- `except ValueError as err:` - `err` holds the error; `print(err)` shows its message.
- `else:` runs if nothing went wrong; `finally:` runs every time.
- Keep the `try` block small: just the line that can fail.
