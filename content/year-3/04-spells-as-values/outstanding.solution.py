def pipeline(spells, value):
    for spell in spells:
        value = spell(value)
    return value


def make_pipeline(spells):
    def run(value):
        return pipeline(spells, value)
    return run
