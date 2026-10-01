# Recursion

- A recursive function calls itself on a **smaller** problem.
- **Base case**: small enough to answer directly - no more calls. Always check it first.
- **Recursive case**: a little work + a call on a smaller problem, closer to the base case.
- Each call has its own variables. Watch the call stack grow and shrink in the Pensieve.
- Trust the smaller call: "if `f(n - 1)` is right, how do I build `f(n)`?"
- Numbers shrink by `n - 1` or `n // 10`; strings by `text[1:]`; lists by `items[1:]`.
