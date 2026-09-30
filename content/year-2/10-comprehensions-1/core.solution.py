letters = [("Dora", 2, 5), ("Bill", 2, 1), ("Ann", 2, 6), ("Cho", 1, 9), ("Eve", 3, 4)]
week = 2
keen = sorted([sender for sender, w, hearts in letters if w == week and hearts >= 3])
if keen:
    print(f"Keen fans: {', '.join(keen)}")
else:
    print("Keen fans: none")
print(f"Hearts this week: {sum([hearts for _, w, hearts in letters if w == week])}")
print(f"Weeks: {sorted(set([w for _, w, _ in letters]))}")
