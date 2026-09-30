year = int(input("Which year are you in? "))
broom = input("Do you own a broom? ")
permission = input("Special permission from McGonagall? ")
old_enough = year >= 2 or permission == "yes"
print(broom == "yes" and old_enough and 1 <= year <= 7)
