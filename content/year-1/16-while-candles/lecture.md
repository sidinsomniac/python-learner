# Lesson 11: While the Candles Burn

A **loop** repeats lines. A `while` loop repeats them **as long as** its
condition is True:

```python
candles = 3
while candles > 0:
    print("A candle burns...")
    candles = candles - 1
print("Darkness.")
```

Each time round (each **pass**), Python checks the condition. When it
becomes False, the loop ends and the spell carries on after it.

```checkpoint
q: 'How many times does "A candle burns..." print above?'
options: ["2", "3", "4"]
answer: 1
why: candles goes 3, 2, 1 (three passes). When it reaches 0, `candles > 0` is False and the loop stops.
```

## ⚠️ Loops that never end

If nothing inside the loop ever makes the condition False, it runs forever:

```python
torches = 5
while torches > 0:
    print("Still burning")
```

Forgot to change `torches`! (Don't worry - the castle stops spells that run
too long.) Every `while` loop needs something inside that moves it towards
stopping.

## Asking until you get a good answer

A classic pattern: keep asking **while** the answer is wrong:

```python
answer = input("What's 6 x 7? ")
while answer != "42":
    answer = input("Try again: ")
print("Correct!")
```

Try it in the sandbox - put a few answers in the input box, one per line.

## Counting passes

To count how many times something happens, keep a counter and add 1 each
pass:

```python
laps = 0
while laps < 3:
    laps = laps + 1
    print("Lap", laps)
```
