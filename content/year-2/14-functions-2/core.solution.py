def find_items(items, shiny=True, limit=None):
    """Return the names whose shininess matches `shiny`, at most `limit` of them."""
    matches = [name for name, is_shiny in items if is_shiny == shiny]
    if limit is not None:
        return matches[:limit]
    return matches
