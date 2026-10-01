# Stacks of time

- Each call gets a frame with its own variables; frames pile up on the **call stack**.
- About 1,000 frames is the limit: then `RecursionError`.
- On a RecursionError ask: is there a base case? Does every call get closer to it?
- Lists shrink with `items[1:]`; the base case is usually `if not items:`.
- Nested lists: loop over the items, recurse when `isinstance(item, list)`.
- Memoization: store answers in a dict the first time, look them up after.
