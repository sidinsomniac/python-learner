name = input("Your name? ")
answers = []
for question in range(5):
    answer = input(f"Question {question + 1} (a/b/c/d)? ").strip().lower()
    while answer not in ["a", "b", "c", "d"]:
        answer = input(f"Question {question + 1} (a/b/c/d)? ").strip().lower()
    answers.append(answer)

houses = ["Gryffindor", "Hufflepuff", "Ravenclaw", "Slytherin"]
letters = ["a", "b", "c", "d"]
counts = []
for letter in letters:
    counts.append(answers.count(letter))

top = max(counts)
winner = ""
for answer in answers:
    if answers.count(answer) == top:
        winner = houses[letters.index(answer)]
        break

tally = ""
for i in range(4):
    tally += f"{houses[i]} {counts[i]} | "
print("~" * 26)
print("The Sorting Hat has spoken!")
print(tally[:-3])
print(f"{name.upper()} belongs in {winner.upper()}!")
print("~" * 26)
