passwords = {"Fat Lady": "Caput Draconis", "Gargoyle": "Sherbet Lemon", "Sir Cadogan": "Caput Draconis"}
spoken = "Caput Draconis"
opens = {}
for portrait, password in passwords.items():
    if password in opens:
        print(f"Clash: {opens[password]} and {portrait} share {password}")
    else:
        opens[password] = portrait
if spoken in opens:
    print(f"The {opens[spoken]} swings open!")
else:
    print("Nothing happens.")
