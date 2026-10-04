from collections import Counter


def same_letters(spoken, password):
    return Counter(spoken) == Counter(password)
