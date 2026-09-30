notes = "Every shiny thing. EVERY shiny, shiny? no - every shiny thing!"
words = [word.strip(".,!?").lower() for word in notes.split()]
index = {w: [p for p, other in enumerate(words) if other == w] for w in set(words)}
repeats = [f"{w}: {index[w]}" for w in sorted(index) if len(index[w]) > 1]
if repeats:
    print("\n".join(repeats))
else:
    print("No repeats.")
