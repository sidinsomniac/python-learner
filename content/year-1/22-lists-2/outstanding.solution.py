items = []
item = input("Item (or done)? ")
while item != "done":
    items.append(item)
    item = input("Item (or done)? ")

left = 0
right = len(items) - 1
while left < right:
    spare = items[left]
    items[left] = items[right]
    items[right] = spare
    left += 1
    right -= 1

print(items)
