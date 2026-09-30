word = input("Word? ")
vowels = 0
for letter in word:
    if letter in "aeiouAEIOU":
        vowels = vowels + 1
print(vowels)
