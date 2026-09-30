import math

def cauldron_volume(radius, height):
    return round(math.pi * radius * radius * height, 2)

def trips_needed(potion, cauldron):
    return math.ceil(potion / cauldron)
