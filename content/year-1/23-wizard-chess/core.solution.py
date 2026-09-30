n = int(input("Board size? "))
for row in range(n):
    line = ""
    for col in range(n):
        if (row + col) % 2 == 0:
            line += "♜"
        else:
            line += "♖"
    print(line)
