import math
import random

def farthest_pair(spots):
    names = list(spots)
    best = None
    best_distance = -1
    for i, first in enumerate(names):
        for second in names[i + 1:]:
            distance = math.dist(spots[first], spots[second])
            if distance > best_distance:
                best, best_distance = (first, second), distance
    return best

def patrol(names, seed):
    random.seed(seed)
    order = list(names)
    random.shuffle(order)
    return order
