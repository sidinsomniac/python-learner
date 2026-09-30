answer = input("Password? ")
tries = 1
while answer != "Caput Draconis":
    answer = input("Password? ")
    tries = tries + 1
if tries == 1:
    print("Welcome! It took you 1 try.")
else:
    print(f"Welcome! It took you {tries} tries.")
