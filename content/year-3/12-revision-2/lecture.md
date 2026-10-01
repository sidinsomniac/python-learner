# Revision II: recursion, speed and searching

Three mixed challenges on Lessons 4-7.

```checkpoint
q: 'With `def f(*items, sep="-")`, what is `items` in the call `f()`?'
options: ["None", "An empty tuple ()", "An error"]
answer: 1
why: A starred parameter always gives you a tuple - empty if nothing was passed.
```

```checkpoint
q: A recursive spell crashes with RecursionError. Which is NOT a likely cause?
options: ["There's no base case", "The calls skip past the base case", "The base case returns the wrong value"]
answer: 2
why: A wrong value from the base case gives wrong answers, not endless calls.
```

```checkpoint
q: Which is fastest for checking 100,000 names, one by one, against a register of 100,000 names?
options: ["`name in register_list` each time", "`name in register_set` each time", "They're the same"]
answer: 1
why: Each set lookup is one step; each list lookup can be 100,000 steps.
```

**Tip:** for a binary search, always test the edges by hand: an empty list,
one item, the first item, the last item, and a missing item.
