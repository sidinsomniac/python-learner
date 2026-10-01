# Raising errors

- `raise ValueError("what went wrong")` - stops the spell unless caught.
- Raise when the input is simply wrong; return `None` when "nothing" is a normal answer.
- `TypeError`: wrong kind of thing. `ValueError`: right kind, bad value.
- `isinstance(x, int)`, `isinstance(x, (list, tuple))`.
- Beware: `True` and `False` count as `int`s too! `isinstance(True, int)` is True.
- Guard clauses: check each bad case first, in a safe order, then do the real work.
- Better messages: catch Python's error, then `raise ValueError(f"...")` with your own.
