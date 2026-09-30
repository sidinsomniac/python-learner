missing = ["Mirror ", "sock", "trophy", " MIRROR", "badge", "mirror", "Sweet"]
shiny = ["mirror", "trophy", "badge", "cup"]
counts = {}
for kind in missing:
    tidy = kind.strip().lower()
    counts[tidy] = counts.get(tidy, 0) + 1
shiny_total = 0
for kind in sorted(counts):
    print(f"{kind}: {counts[kind]}")
    if kind in shiny:
        shiny_total += counts[kind]
print(f"Shiny: {shiny_total} of {len(missing)}")
