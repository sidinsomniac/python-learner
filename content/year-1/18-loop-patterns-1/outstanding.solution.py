best = None
second = None
reading = input("Number (or done)? ")
while reading != "done":
    t = int(reading)
    if t == best:
        pass
    elif best is None or t > best:
        second = best
        best = t
    elif second is None or t > second:
        second = t
    reading = input("Number (or done)? ")
if second is None:
    print("Not enough readings")
else:
    print(f"Second highest: {second}")
