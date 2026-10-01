def sort_by(records, *rules):
    result = list(records)
    for key, backwards in reversed(rules):
        result = sorted(result, key=key, reverse=backwards)
    return result
