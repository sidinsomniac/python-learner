# Revision III: functions, scope, modules, parsing and searching

Three mixed challenges. Remember: **return** your answers, and watch out for
shared lists.

```checkpoint
q: 'What does `def f(x, seen=set()):` risk?'
options: ["Nothing - sets are safe", "Every call shares the same set", "A SyntaxError"]
answer: 1
why: A set can change, so a set default is shared between calls - the Cabinet's bug.
```

```checkpoint
q: 'What is `"b-a-c".split("-")` sorted and joined with ""?'
options: ["'abc'", "'bac'", "'a-b-c'"]
answer: 0
why: Split gives ['b', 'a', 'c']; sorted gives ['a', 'b', 'c']; joining with "" gives 'abc'.
```

```checkpoint
q: Searching a list of 10,000 items for each of 10,000 names - about how many steps?
options: ["20,000", "100,000,000", "10,000"]
answer: 1
why: Up to 10,000 steps for each of 10,000 searches. A set would make each search one step.
```
