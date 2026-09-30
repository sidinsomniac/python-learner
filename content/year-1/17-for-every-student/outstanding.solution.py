n = int(input("How high? "))
for i in range(1, n + 1):
    if i % 3 == 0 and i % 5 == 0:
        print("Gryffinpuff")
    elif i % 3 == 0:
        print("Gryffindor")
    elif i % 5 == 0:
        print("Hufflepuff")
    else:
        print(i)
