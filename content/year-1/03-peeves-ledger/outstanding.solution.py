first = input("First goblet? ")
second = input("Second goblet? ")
third = input("Third goblet? ")

spare = third
third = second
second = first
first = spare

print(first, second, third)
