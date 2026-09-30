gryffindor = 0
hufflepuff = 0
ravenclaw = 0
slytherin = 0
for question in range(5):
    answer = input(f"Answer {question + 1}? ")
    if answer == "a":
        gryffindor += 1
    elif answer == "b":
        hufflepuff += 1
    elif answer == "c":
        ravenclaw += 1
    else:
        slytherin += 1
print(f"Gryffindor: {gryffindor}")
print(f"Hufflepuff: {hufflepuff}")
print(f"Ravenclaw: {ravenclaw}")
print(f"Slytherin: {slytherin}")
