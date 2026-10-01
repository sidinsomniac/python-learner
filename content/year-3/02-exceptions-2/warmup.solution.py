def check_year(n):
    if not 1 <= n <= 7:
        raise ValueError("year must be 1-7")
    return n
