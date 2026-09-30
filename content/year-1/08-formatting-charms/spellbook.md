# Formatting charms (f-string format specs)

| Spec | Meaning | `f"{x:spec}"` for x = 3.14159 or "owl" |
|---|---|---|
| `.2f` | 2 decimal places | `3.14` |
| `8` | at least 8 wide | `owl     ` (text leans left) |
| `>8` | right-aligned, 8 wide | `     owl` |
| `<8` / `^8` | left / centred | `owl     ` / `  owl   ` |
| `>8.2f` | right-aligned, 8 wide, 2 decimals | `    3.14` |
| `,` | thousands separators | `1,234,567` |

A single character repeated: `"-" * 10` is `----------`.
