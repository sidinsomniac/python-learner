# The Trial: Messages of the Chamber

The Cabinet is sealed. Six coded notes are stuck to Myrtle's pipes, each
encrypted with a **different, unknown** Caesar shift. Decode them all, and
the first letter of each message spells the password.

You'll build a cipher toolkit in **four stages**. Each stage is a complete
spell of its own: when a stage needs an earlier function, paste your working
version into it.

| Stage | Spell | Job |
|---|---|---|
| 1 | `caesar_shift(text, k)` | shift letters, keep case, leave the rest |
| 2 | `letter_frequencies(text)` | count each letter, ignoring case |
| 3 | `crack(text)` | find the most English-looking shift |
| 4 | `open_cabinet(messages)` | crack every note and read the password |

## Scoring "Englishness"

The E-trick from Lesson 13 fails on short messages. A better idea: every
letter gets a score from how common it is in English (E is 12.7, Z is
0.074...). Try **all 26 shifts**; for each, decode the message and add up
the scores of its letters. Real English, full of E, T, A and O, scores far
higher than gibberish full of Q, X and Z.

```checkpoint
q: 'Which decoded attempt would score higher: "THE CAT" or "QEB ZXQ"?'
options: ["THE CAT", "QEB ZXQ", "They score the same"]
answer: 0
why: T, H, E, C, A are common English letters; Q, Z and X are the rarest.
```

**Tip:** test each stage on the Cabinet's own messages from Lesson 13 -
`AOL JHIPULA OBUNLYZ.` (shift 7) and the feast message
`FKDPEHU RI FROOHFWLRQV LV RSHQ` (shift 3).
