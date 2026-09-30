# Slice steps

- `text[start:stop:step]` - every `step`-th character.
- `text[::2]` - every other character from the start; `text[1::2]` - every
  other one, starting from position 1.
- `text[::-1]` - the whole string reversed.
- `==` compares exactly (capitals matter). Lowercase both sides to ignore case.
- A **palindrome** reads the same forwards and backwards: `word == word[::-1]`.
