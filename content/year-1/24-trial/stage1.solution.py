answer = input("Your answer (a/b/c/d)? ").strip().lower()
while answer not in ["a", "b", "c", "d"]:
    answer = input("Your answer (a/b/c/d)? ").strip().lower()
print(f"The Hat hears: {answer}")
