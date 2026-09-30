score = int(input("Score? "))
if score < 0 or score > 100:
    print("Invalid score")
elif score >= 90:
    print("Outstanding")
elif score >= 75:
    print("Exceeds Expectations")
elif score >= 60:
    print("Acceptable")
elif score >= 45:
    print("Poor")
elif score >= 30:
    print("Dreadful")
else:
    print("Troll")
