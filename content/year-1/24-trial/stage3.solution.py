answers = []
for question in range(5):
    answers.append(input(f"Answer {question + 1}? "))
top = max(answers.count("a"), answers.count("b"), answers.count("c"), answers.count("d"))
winner = ""
for answer in answers:
    if answers.count(answer) == top:
        winner = answer
        break
if winner == "a":
    print("Gryffindor")
elif winner == "b":
    print("Hufflepuff")
elif winner == "c":
    print("Ravenclaw")
else:
    print("Slytherin")
