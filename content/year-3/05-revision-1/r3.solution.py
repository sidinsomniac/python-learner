def top_n(records, n, key):
    return sorted(records, key=key, reverse=True)[:n]
