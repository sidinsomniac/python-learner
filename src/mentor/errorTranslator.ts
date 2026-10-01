import type { PyError } from "../runtime/types";

export interface Translation {
  creature: string;
  question: string;
}

const where = (e: PyError) => (e.line ? `line ${e.line}` : "your spell");

/** Turn a Python error into a friendly guiding question - never a fix. */
export function translateError(e: PyError): Translation {
  const msg = e.message ?? "";
  switch (e.type) {
    case "SyntaxError":
      if (/unterminated string|EOL while scanning|unterminated triple/i.test(msg))
        return { creature: "A Cornish pixie ran off with a quote mark!", question: `On ${where(e)}, a string opens with a quote... does it ever close with a matching one?` };
      if (/was never closed|unexpected EOF|'\(' was never closed/i.test(msg))
        return { creature: "A bracket has gone missing!", question: `Count the brackets on ${where(e)}. Does every ( have a partner )?` };
      if (/missing parentheses in call to 'print'/i.test(msg))
        return { creature: "An old-fashioned spell!", question: "In Python 3, print is a spell that needs round brackets. How did the lesson write it?" };
      if (/invalid syntax\. Perhaps you forgot a comma/i.test(msg))
        return { creature: "Words are bumping into each other!", question: `On ${where(e)}, two things sit side by side. Were they meant to be text inside quotes, joined together, or separated by something?` };
      return { creature: "The spell's grammar is tangled.", question: `Python couldn't understand ${where(e)}. Compare it slowly with an example from the lesson: brackets, quotes, colons, spelling?` };
    case "IndentationError":
    case "TabError":
      return { creature: "The lines aren't standing in a straight row!", question: `Look at the spaces at the start of ${where(e)}. Should this line be indented, or line up with the others?` };
    case "NameError": {
      const name = msg.match(/name '(.+?)' is not defined/)?.[1];
      return {
        creature: "Python has never heard of that name!",
        question: name
          ? `On ${where(e)} you used \`${name}\`. Where did you create it? Is it spelled (and capitalised) exactly the same? Or should it be text, in quotes?`
          : `Which name on ${where(e)} hasn't been created yet?`,
      };
    }
    case "TypeError":
      if (/can only concatenate str|unsupported operand|must be str, not int|can't multiply/i.test(msg))
        return { creature: "Mixing two kinds of things that don't mix!", question: `On ${where(e)} you're combining a number with text. What type is each side? Which transfiguration spell (int, str) could make them match?` };
      if (/not callable/i.test(msg))
        return { creature: "You tried to cast something that isn't a spell!", question: `On ${where(e)}, something is followed by ( ). Is it really a spell, or did a variable take over its name?` };
      return { creature: "A type mix-up!", question: `What type of value does each part of ${where(e)} hold? Try printing type(...) of each.` };
    case "ValueError":
      if (/invalid literal for int/i.test(msg))
        return { creature: "Transfiguration failed!", question: "int() can only turn text that looks like a whole number into a number. What text did it receive?" };
      return { creature: "The right kind of value, but a wrong one.", question: `What value reached ${where(e)}, and what was Python expecting?` };
    case "ZeroDivisionError":
      return { creature: "Dividing by zero - even magic can't!", question: `On ${where(e)}, what is the number you divide by? How could it end up as 0?` };
    case "EOFError":
      return { creature: "Your spell asked for more answers than it got!", question: "How many times does your spell call input()? How many answers does the task give it?" };
    case "IndexError":
      return { creature: "Reaching past the end of the shelf!", question: `On ${where(e)}, how many items are there, and which position are you asking for? (Counting starts at 0!)` };
    case "KeyError":
      return { creature: "That key isn't in the dictionary!", question: `What keys actually exist when ${where(e)} runs?` };
    case "RecursionError":
      return { creature: "The Time-Turner won't stop turning!", question: `The spell kept calling itself until Python gave up. When should it stop? Is there a base case that is always reached, and does every call move closer to it?` };
    case "FileNotFoundError": {
      const file = msg.match(/'(.+?)'/)?.[1];
      return {
        creature: "That scroll isn't on the desk!",
        question: file
          ? `Python looked for \`${file}\` and found nothing. What files are on the desk? Is the name spelled exactly the same, with its ending?`
          : `Which file did ${where(e)} try to open? Is it on the desk, spelled exactly the same?`,
      };
    }
    case "IsADirectoryError":
    case "PermissionError":
    case "UnsupportedOperation":
      return { creature: "The scroll refuses!", question: `On ${where(e)}, which mode did you open the file in? Can you read from a scroll opened for writing, or write to one opened for reading?` };
    case "AttributeError":
      return { creature: "That thing doesn't know that spell!", question: `On ${where(e)}, what type of value is before the dot, and does that type have the method you're calling?` };
    default:
      return { creature: `A wild ${e.type} appeared!`, question: `Read the message carefully: "${msg}". What is it telling you about ${where(e)}?` };
  }
}
