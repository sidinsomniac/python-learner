def first_error(spells):
    for spell in spells:
        try:
            spell()
        except Exception as err:
            return type(err).__name__
    return None
