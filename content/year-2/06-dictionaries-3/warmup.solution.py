notes = {"Monday": {"bathroom": "clank", "hall": "sob"}, "Tuesday": {"bathroom": "clank"}}
print(f"Monday bathroom: {notes['Monday']['bathroom']}")
notes.setdefault("Friday", {})["pipes"] = "gurgle"
print(f"Tuesday tower: {notes.get('Tuesday', {}).get('tower', 'silence')}")
print(f"Nights: {len(notes)}")
