house = input("House? ")
points = int(input("House points? "))

if house == "Gryffindor" or house == "Slytherin":
    print("Moving staircase")
else:
    print("Side stairs")

if points > 100:
    print("Excellent!")
elif points > 50:
    print("Good effort")
else:
    print("Try harder")
