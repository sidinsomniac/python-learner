def count_names(path):
    with open(path) as register:
        return sum(1 for line in register if line.strip())
