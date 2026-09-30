ingredients = []
item = input("Ingredient (or done)? ")
while item != "done":
    ingredients.append(item)
    item = input("Ingredient (or done)? ")
print(f"You need {len(ingredients)} ingredients:")
for ingredient in ingredients:
    print("- " + ingredient)
