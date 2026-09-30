best = None
reading = input("Temperature (or done)? ")
while reading != "done":
    t = int(reading)
    if best is None or t > best:
        best = t
    reading = input("Temperature (or done)? ")
if best is None:
    print("No readings")
else:
    print(f"Highest: {best}")
