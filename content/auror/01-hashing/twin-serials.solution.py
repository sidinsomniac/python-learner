def has_twin(serials):
    seen = set()
    for serial in serials:
        if serial in seen:
            return True
        seen.add(serial)
    return False
