# How wizards solve problems

1. **Understand**: in your own words - what goes in, what comes out?
2. **Examples first**: ordinary, smallest (empty, 0, one), edges, ties, bad input.
3. **Plan** in pseudocode.
4. **Checks first**: `assert spell(x) == expected`.
5. **Check your checks**: write `check_spell(candidate)` that returns True/False, and make sure it rejects broken versions.
- Checking an error: `try: candidate(bad)` / `except ValueError: return True` / then `return False`.
