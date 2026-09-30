def parse_receipt(text):
    raw = {}
    for line in text.splitlines():
        key, colon, value = line.partition(":")
        if colon:
            raw.setdefault(key.strip().lower(), []).append(value.strip())
    fields = {}
    for key, values in raw.items():
        if len(values) == 1 and values[0].isdigit():
            fields[key] = int(values[0])
        else:
            fields[key] = ", ".join(values)
    return fields
