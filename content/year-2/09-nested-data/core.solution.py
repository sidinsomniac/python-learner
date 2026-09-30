post = [
    {"from": "Diagon Alley", "to": "Hogwarts", "items": ["Fan mail"], "signed": "G.L."},
    {"from": "Knockturn Alley", "to": "Hogwarts", "items": ["Vanishing Cabinet"], "signed": "G.L."},
    {"from": "Diagon Alley", "to": "The Burrow", "items": ["Gnome repellent"], "signed": "M.W."},
    {"from": "Hogsmeade", "to": "Hogwarts", "items": ["Sweets", "Toffee"]},
]
per_origin = {}
for delivery in post:
    if delivery["to"] != "Hogwarts":
        continue
    if "signed" in delivery:
        signature = f"signed {delivery['signed']}"
    else:
        signature = "unsigned"
    for item in delivery["items"]:
        print(f"{item} from {delivery['from']} ({signature})")
        per_origin[delivery["from"]] = per_origin.get(delivery["from"], 0) + 1
for origin in sorted(per_origin):
    print(f"{origin}: {per_origin[origin]}")
