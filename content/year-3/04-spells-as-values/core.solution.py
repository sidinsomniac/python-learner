def order_prophecies(records):
    return sorted(records, key=lambda record: (record[0], -record[1]))
