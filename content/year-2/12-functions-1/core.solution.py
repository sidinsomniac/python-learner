def is_shiny(material):
    return material.lower() in ["silver", "gold", "glass"]

def shiny_items(castle):
    return sorted([item for item, material in castle.items() if is_shiny(material)])

def report(castle):
    shiny = shiny_items(castle)
    if shiny:
        return f"{len(shiny)} of {len(castle)} items shine: {', '.join(shiny)}"
    return f"0 of {len(castle)} items shine"

print(report({"mirror": "Silver", "sock": "wool", "cup": "GOLD"}))
