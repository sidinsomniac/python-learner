# Flexible spells

- `def f(*args):` - extra positional arguments arrive as a **tuple** (maybe empty).
- Parameters after `*args` are **keyword-only**: `def f(*names, house="G"):`.
- `def f(**kwargs):` - extra named arguments arrive as a **dict**.
- Full order: `def f(a, *args, option=1, **kwargs):`.
- In a call, `f(*items)` spreads a list out; `f(**options)` spreads a dict out as keywords.
- Pass everything along: `return spell(*args, **kwargs)`.
