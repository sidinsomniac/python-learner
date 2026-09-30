def case_file(clues):
    if not clues:
        return {"count": 0, "tags": [], "everywhere": [], "shiny": []}
    all_tags = set()
    everywhere = set(clues[0]["tags"])
    for clue in clues:
        all_tags |= clue["tags"]
        everywhere &= clue["tags"]
    shiny = [clue["text"] for clue in clues if "shiny" in clue["tags"]]
    return {"count": len(clues), "tags": sorted(all_tags), "everywhere": sorted(everywhere), "shiny": shiny}
