def counted(spell):
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return spell(*args, **kwargs)
    wrapper.calls = 0
    return wrapper
