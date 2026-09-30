seen = []
word = input("Word (or done)? ")
while word != "done":
    if word not in seen:
        seen.append(word)
    word = input("Word (or done)? ")
if len(seen) == 0:
    print("No words")
else:
    line = ""
    for w in seen:
        line += f"{w}, "
    print(line[:-2])
