def reverse(text):
    if text == "":
        return ""
    return reverse(text[1:]) + text[0]


def is_palindrome(text):
    if len(text) <= 1:
        return True
    if text[0].lower() != text[-1].lower():
        return False
    return is_palindrome(text[1:-1])
