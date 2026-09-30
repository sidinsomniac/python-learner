post = [
    {"shop": "Borgin and Burkes", "items": ["Vanishing Cabinet", "mirror"]},
    {"shop": "Gladrags", "items": ["Mirror ", "Socks"]},
    {"shop": "Dodgy Dealings Ltd", "items": ["vanishing cabinet"]},
    {"shop": "Gladrags", "items": ["socks"]},
]
senders = {}
for delivery in post:
    for item in delivery["items"]:
        key = item.strip().lower()
        senders.setdefault(key, set()).add(delivery["shop"])
found = False
for key in sorted(senders):
    if len(senders[key]) >= 2:
        print(f"{key.capitalize()}: {', '.join(sorted(senders[key]))}")
        found = True
if not found:
    print("No item has two senders.")
