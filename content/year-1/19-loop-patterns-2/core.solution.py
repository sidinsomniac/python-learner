n = int(input("Number? "))
if n < 2:
    print(f"{n} is not prime")
else:
    for d in range(2, n):
        if n % d == 0:
            print(f"{n} is not prime")
            break
    else:
        print(f"{n} is prime")
