ledger = {"Dented Goblet": "Filch", "Award for Charm": "Lockhart", "Shield": "Hufflepuff"}
ledger["Quidditch Cup"] = "Gryffindor"
print(f"Silver Mirror: {ledger.get('Silver Mirror', 'unknown')}")
if "Dented Goblet" in ledger:
    del ledger["Dented Goblet"]
print(f"Trophies: {len(ledger)}")
