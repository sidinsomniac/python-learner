def first_repeat(owls):
    seen = set()
    for owl in owls:
        if owl in seen:
            return owl
        seen.add(owl)
    return None
