def count_admirers(letters):
    return len(letters)

def best_letter(letters):
    best_name, best_hearts = letters[0]
    for name, hearts in letters:
        if hearts > best_hearts:
            best_name, best_hearts = name, hearts
    return f"{best_name} ({best_hearts} hearts)"

fan_mail = [("Ann", 3), ("Dora", 5), ("Bill", 5)]
print(f"{count_admirers(fan_mail)} letters - the best from {best_letter(fan_mail)}")
