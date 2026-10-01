def log(*sightings, sep=", ", level="INFO"):
    if not sightings:
        text = "nothing seen"
    else:
        text = sep.join(str(sighting) for sighting in sightings)
    return f"[{level}] {text}"
