def _cell(text):
    text = text.strip()
    if text.isdigit():
        return int(text)
    return text

def parse_table(text):
    lines = [line for line in text.splitlines() if line.strip()]
    if not lines:
        return []
    names = [name.strip() for name in lines[0].split("|")]
    rows = []
    for line in lines[1:]:
        cells = [_cell(cell) for cell in line.split("|")]
        if len(cells) == len(names):
            rows.append(dict(zip(names, cells)))
    return rows

def format_table(rows, columns):
    widths = {c: max([len(c)] + [len(str(row[c])) for row in rows]) for c in columns}
    lines = []
    for cells in [columns] + [[str(row[c]) for c in columns] for row in rows]:
        padded = [cell.ljust(widths[c]) for c, cell in zip(columns, cells)]
        lines.append(" | ".join(padded).rstrip())
    return "\n".join(lines)
