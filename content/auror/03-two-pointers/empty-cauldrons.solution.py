def sink_empty(cauldrons):
    slot = 0
    for i, cauldron in enumerate(cauldrons):
        if cauldron != 0:
            cauldrons[slot], cauldrons[i] = cauldrons[i], cauldrons[slot]
            slot += 1
