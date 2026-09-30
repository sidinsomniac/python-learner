seconds = 3930

hours = seconds // 3600
left = seconds % 3600
minutes = left // 60
secs = left % 60
print(hours, "hours", minutes, "minutes", secs, "seconds")
