post = [{"from": "Diagon Alley", "items": ["quills", "ink", "parchment"]}, {"from": "Hogsmeade", "items": ["sweets"]}]
print(f"First from: {post[0]['from']}")
print(f"Last item: {post[-1]['items'][-1]}")
total = 0
for delivery in post:
    total += len(delivery["items"])
print(f"Items: {total}")
