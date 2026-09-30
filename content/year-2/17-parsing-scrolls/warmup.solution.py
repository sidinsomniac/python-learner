def parse_line(line):
    key, colon, value = line.partition(":")
    if not colon:
        return None
    return key.strip().lower(), value.strip()
