# Lesson 3, Part 3: Dictionaries Inside Dictionaries

A dictionary's values can be anything - including more dictionaries or lists.
That's how Python holds real records:

```python
report = {
    "Monday": {"bathroom": 3, "corridor": 1},
    "Tuesday": {"bathroom": 2},
}
print(report["Monday"]["bathroom"])
print(len(report["Tuesday"]))
```

Read `report["Monday"]["bathroom"]` from left to right: first get Monday's
dictionary, then look up `"bathroom"` **inside it**.

```checkpoint
q: 'What is `report["Tuesday"]` in the example above?'
options: ["2", "{'bathroom': 2}", "A KeyError"]
answer: 1
why: The first lookup gives Tuesday's whole inner dictionary.
```

## Adding to the inside

To add to an inner dictionary, make sure it exists first:

```python
report = {"Monday": {"bathroom": 3}}
report.setdefault("Wednesday", {})
report["Wednesday"]["tower"] = 1
report["Monday"]["bathroom"] += 1
print(report)
```

## Safe lookups, two levels deep

`report["Friday"]["bathroom"]` crashes if Friday is missing. Chain `get`s,
with an **empty dictionary** as the first default so the second `get` still
has something to ask:

```python
report = {"Monday": {"bathroom": 3}}
print(report.get("Friday", {}).get("bathroom", 0))
```

## Walking the whole thing

Two loops, one inside the other - just like the grids last lesson:

```python
report = {"Mon": {"bathroom": 3, "hall": 1}, "Tue": {"hall": 2}}
for night, places in report.items():
    for place, noises in places.items():
        print(night, place, noises)
```

The outer loop unpacks a night and its inner dictionary; the inner loop walks
that inner dictionary.

```checkpoint
q: 'How many times does the inner print run for `{"a": {"x": 1, "y": 2}, "b": {}}`?'
options: ["2", "3", "1"]
answer: 0
why: Night a has two places; night b has none.
```

## Dictionaries of lists

Values can be lists, too - a very common shape:

```python
sightings = {"Myrtle": ["bathroom", "pipes"], "Nick": ["hall"]}
sightings["Nick"].append("tower")
print(sightings["Nick"][-1])
```
