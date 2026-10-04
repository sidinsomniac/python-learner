def unpack(trunk):
    items = []
    for thing in trunk:
        if isinstance(thing, list):
            items.extend(unpack(thing))
        else:
            items.append(thing)
    return items
