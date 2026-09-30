n = 10
old = []
new = []
for i in range(n):
    old.append(f"wizard{i * 2}")
    new.append(f"wizard{i * 3}")
lookup = set(new)
shared = []
for name in old:
    if name in lookup:
        shared.append(name)
print(f"In both: {len(shared)}")
if shared:
    print(f"First: {', '.join(shared[:3])}")
else:
    print("First: none")
