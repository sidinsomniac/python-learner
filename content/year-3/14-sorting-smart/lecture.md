# ★ Lesson 9: Sorting Smart

Back to Python's own `sorted`, which is fast (O(n log n)) and **stable**.
Today's question is how to describe *exactly* the order you want.

## Your own order: rank with a dictionary

Some things have an order that isn't alphabetical or numerical, like the
days of the week, or the order houses are seated in. Give each one a rank,
and sort by the rank:

```python
COURSES = {"soup": 0, "roast": 1, "pudding": 2}
dishes = ["pudding", "soup", "roast", "soup"]
print(sorted(dishes, key=COURSES.get))
print(sorted(dishes, key=lambda d: COURSES[d]))
```

`COURSES.get` is itself a spell (a method) that turns a dish into its rank,
so it can be passed straight in as the key.

## Several rules: a tuple key

The first item of the tuple decides; the next only breaks ties:

```python
owls = [("Errol", 3, "grey"), ("Hedwig", 9, "white"), ("Pig", 9, "grey")]
print(sorted(owls, key=lambda o: (-o[1], o[0])))
```

The minus sign flips a **number**, so bigger comes first. But you can't put
a minus sign in front of a **string**: `-"Errol"` is a `TypeError`.

```checkpoint
q: 'Why does `key=lambda s: (-s["year"], -s["name"])` crash?'
options: ["Tuples can't be keys", "You can't negate a string", "year must come second"]
answer: 1
why: The minus trick only works on numbers. Strings need another way to go backwards.
```

## Several passes, and why stability matters

Because `sorted` is stable, you can sort in **several passes**: first by the
**least** important rule, last by the **most** important. Each later pass
keeps the earlier order among its ties.

```python
students = [("Ron", 3), ("Cho", 4), ("Harry", 3), ("Cedric", 4)]
by_name_backwards = sorted(students, key=lambda s: s[0], reverse=True)
print(by_name_backwards)
final = sorted(by_name_backwards, key=lambda s: s[1])
print(final)
```

The year is the main rule, and within each year the names are Z to A. Each
pass can choose its own `reverse=`, which is how to sort strings backwards
inside a bigger order. `reverse=True` keeps the sort stable too.

```checkpoint
q: To sort by house, and within each house by name, using two passes, which pass comes first?
options: ["By house", "By name", "It doesn't matter"]
answer: 1
why: The LAST pass is the most important. Sort by name first, then by house; stability keeps the names in order within each house.
```

## Choosing a tool

| You want | Use |
|---|---|
| one rule | `key=` |
| several rules, numbers flipped | a tuple key, with `-` on numbers |
| a string rule backwards, among others | several stable passes |
| a made-up order | a rank dictionary |
