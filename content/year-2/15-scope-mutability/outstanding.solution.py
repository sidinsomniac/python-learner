def give_back(hoard):
    owners = {}
    for item, owner in hoard:
        owners.setdefault(owner, []).append(item)
    return owners

def without_owner(hoard, owner):
    return [pair for pair in hoard if pair[1] != owner]
