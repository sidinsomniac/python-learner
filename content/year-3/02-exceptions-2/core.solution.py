HOUSES = ["Gryffindor", "Hufflepuff", "Ravenclaw", "Slytherin"]
FIELDS = ["name", "year", "house", "signed_by", "date"]


def is_date(text):
    if not isinstance(text, str) or len(text) != 10:
        return False
    if text[4] != "-" or text[7] != "-":
        return False
    return (text[:4] + text[5:7] + text[8:]).isdigit()


def validate_slip(slip):
    if not isinstance(slip, dict):
        raise TypeError("a slip must be a dictionary")
    for field in FIELDS:
        if field not in slip:
            raise ValueError(f"missing field: {field}")
    if not str(slip["name"]).strip():
        raise ValueError("name is blank")
    year = slip["year"]
    if isinstance(year, bool) or not isinstance(year, int):
        raise TypeError("year must be a whole number")
    if not 3 <= year <= 7:
        raise ValueError("year must be 3-7")
    if slip["house"] not in HOUSES:
        raise ValueError(f"house {slip['house']!r} is not a Hogwarts house")
    if not str(slip["signed_by"]).strip():
        raise ValueError("signed_by is blank")
    if not is_date(slip["date"]):
        raise ValueError("date must look like YYYY-MM-DD")
    return True
