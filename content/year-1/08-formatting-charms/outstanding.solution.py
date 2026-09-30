percent = 50

full = percent // 10
bar = "#" * full + "-" * (10 - full)
print(f"[{bar}] {percent}%")
