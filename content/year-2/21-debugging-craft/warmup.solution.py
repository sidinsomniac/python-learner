def glimmer(values):
    if not values:
        return 0
    return round(sum(values) / len(values), 1)

print(glimmer([10, 20, 30]))
print(glimmer([]))
