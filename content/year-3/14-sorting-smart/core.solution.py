def file_sightings(sightings):
    by_witness = sorted(sightings, key=lambda s: s["witness"], reverse=True)
    return sorted(by_witness, key=lambda s: (-s["year"], s["place"]))
