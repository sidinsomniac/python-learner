n = int(input("Primes below? "))
found = ""
for candidate in range(2, n):
    for d in range(2, candidate):
        if candidate % d == 0:
            break
    else:
        found += f"{candidate} "
if found == "":
    print("none")
else:
    print(found.strip())
