knuts = 1000

knuts_per_galleon = 17 * 29
galleons = knuts // knuts_per_galleon
left = knuts % knuts_per_galleon
sickles = left // 29
left_knuts = left % 29
print(galleons, "Galleons,", sickles, "Sickles,", left_knuts, "Knuts")
