word = input("Word? ")
position = -1
index = 0
for letter in word:
    if letter in "aeiouAEIOU":
        position = index
        break
    index += 1
print(position)
