FEAST_ORDER = {"Hufflepuff": 0, "Ravenclaw": 1, "Gryffindor": 2, "Slytherin": 3}


def seat(students):
    return sorted(students, key=lambda student: FEAST_ORDER[student[1]])
