def subsets(items):
    if not items:
        return [[]]
    without = subsets(items[1:])
    return without + [[items[0]] + rest for rest in without]
