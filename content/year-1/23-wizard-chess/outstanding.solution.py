n = int(input("Size? "))
for row in range(1, n + 1):
    line = ""
    for col in range(1, n + 1):
        line += f"{row * col:4}"
    print(line)
