# Lesson 5: Nested Data

Real data is rarely one flat list. Most often it's a **list of
dictionaries** - one dictionary per record, all with the same kinds of keys:

```python
deliveries = [
    {"from": "Diagon Alley", "items": ["quills", "ink"], "signed": "M.M."},
    {"from": "Hogsmeade", "items": ["sweets"]},
]
print(deliveries[0]["items"][1])
print(len(deliveries))
```

Read `deliveries[0]["items"][1]` step by step:

1. `deliveries[0]` - the first record (a dictionary);
2. `["items"]` - its list of items;
3. `[1]` - the second item in that list.

```checkpoint
q: 'In the example, what is `deliveries[1]["items"][0]`?'
options: ["'sweets'", "'quills'", "An IndexError"]
answer: 0
why: The second record's items list is ['sweets'], and [0] is its first item.
```

## Walking the records

Loop over the list, and each pass hands you one whole record:

```python
post = [
    {"to": "Hogwarts", "weight": 3},
    {"to": "The Burrow", "weight": 1},
]
for parcel in post:
    print(f"{parcel['to']}: {parcel['weight']} kg")
```

(Inside an f-string with double quotes, use single quotes for the keys.)

## Missing fields

Records aren't always complete - the second delivery above has no
`"signed"` key. Use `.get` with a sensible default rather than crashing:

```python
parcel = {"from": "Hogsmeade", "items": ["sweets"]}
print(parcel.get("signed", "unsigned"))
```

```checkpoint
q: 'Which is safest when a record might not have a "signed" key?'
options: ["record['signed']", "record.get('signed', 'unsigned')", "record.signed"]
answer: 1
why: get gives the default instead of raising a KeyError.
```

## Building an index

A common job is to turn a list of records into a dictionary for quick
lookups - an **index**. For example, from origin to the list of items sent:

```python
post = [{"from": "Hogsmeade", "items": ["sweets"]}, {"from": "Hogsmeade", "items": ["jokes"]}]
by_origin = {}
for parcel in post:
    by_origin.setdefault(parcel["from"], []).extend(parcel["items"])
print(by_origin)
```

`extend` adds every item of a list; `append` would add the whole list as one
item.

## Drawing it out

When nested data confuses you, **draw it**: boxes for dictionaries, rows for
lists, arrows for lookups. Or open the Pensieve and watch the values as they
change. Nobody reads a three-level structure in their head on the first try.
