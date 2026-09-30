marks = []
entry = input("Mark (or done)? ")
while entry != "done":
    marks.append(int(entry))
    entry = input("Mark (or done)? ")
if len(marks) == 0:
    print("No marks yet")
else:
    print(f"Average: {sum(marks) / len(marks):.1f}")
    print(f"Best: {max(marks)}")
