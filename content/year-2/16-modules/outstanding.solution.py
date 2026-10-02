import json
from collections import Counter, defaultdict


def group_deliveries(text):
    groups = defaultdict(list)
    for delivery in json.loads(text):
        groups[delivery["to"]].append(delivery["item"])
    return json.dumps(groups, sort_keys=True)


def busiest(text):
    counts = Counter(delivery["to"] for delivery in json.loads(text))
    if not counts:
        return None
    return counts.most_common(1)[0][0]
