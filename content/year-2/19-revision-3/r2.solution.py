def first_shiny(items, shiny=("mirror", "cup", "badge")):
    for i, item in enumerate(items):
        if item in shiny:
            return i
    return -1
