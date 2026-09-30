# Scope and mutability

- Variables made inside a function are local; assigning to a name inside a function makes a new local one.
- Reading globals works, but good spells take parameters and **return** results.
- A list passed in is the SAME list - `.append` changes the caller's list; `x = x + [...]` doesn't.
- **Never** `def f(bag=[])` - the default is made once and shared by every call.
- Fix: `def f(bag=None):` then `if bag is None: bag = []`.
- Prefer returning a new list/dict to secretly changing an argument.
