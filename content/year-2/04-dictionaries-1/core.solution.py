lost = ["Quidditch Cup", "Award for Charm", "Nick's Head", "Smile of the Year"]
returned = {"Award for Charm": "Lockhart", "Smile of the Year": "Lockhart"}
for trophy in lost:
    if trophy in returned:
        print(f"{trophy}: back with {returned[trophy]}")
    else:
        print(f"{trophy}: still missing")
lockharts = 0
for owner in returned.values():
    if owner == "Lockhart":
        lockharts += 1
print(f"Lockhart's trophies: {lockharts}")
