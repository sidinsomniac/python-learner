# Float gotchas

- Floats are *almost* exact: `0.1 + 0.2` is `0.30000000000000004`.
- Never test floats with `==`. Instead check they're close:
  `abs(a - b) < 0.001`.
- `abs(x)` removes the sign: `abs(-5)` is `5`.
- `round(x)` and `round(x, 2)` round - but halves go to the nearest **even**
  number: `round(2.5)` is `2`, `round(3.5)` is `4`.
- `==` asks "equal?", `<` asks "smaller?". Both answer `True` or `False`.
