a = int(input("First mark? "))
b = int(input("Second mark? "))
c = int(input("Third mark? "))
if b <= a <= c or c <= a <= b:
    print(a)
elif a <= b <= c or c <= b <= a:
    print(b)
else:
    print(c)
