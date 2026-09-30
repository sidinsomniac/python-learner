export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  secret?: boolean;
}

export const BADGES: Badge[] = [
  { id: "dobbys-sock", name: "Dobby's Sock", icon: "🧦", description: "Complete your first quest. Dobby is free - and so is your first spell!" },
  { id: "no-hint-hex", name: "No-Hint Hex", icon: "🧠", description: "Complete a quest without unlocking any hints." },
  { id: "first-try", name: "First-Try Wizard", icon: "⚡", description: "Pass a quest on your very first cast." },
  { id: "bug-tamer", name: "Bug Tamer", icon: "🐛", description: "Repair a broken potion (fix buggy code)." },
  { id: "seer", name: "The Inner Eye", icon: "🔮", description: "Make a correct prophecy in Divination." },
  { id: "outstanding", name: "Outstanding!", icon: "🅾️", description: "Earn your first O grade (no hints, and Snape had nothing to say)." },
  { id: "star-student", name: "Star Student", icon: "⭐", description: "Complete an optional Outstanding challenge." },
  { id: "pensieve", name: "Pensieve Diver", icon: "🌀", description: "Replay a spell line by line in the Pensieve." },
  { id: "detective", name: "Ledger Detective", icon: "🔍", description: "Uncover every clue of the Jinxed Ledger." },
  { id: "year-1", name: "First Year Complete", icon: "🎓", description: "Pass the First Year Trial and solve the mystery." },
  { id: "patronus", name: "Expecto Patronum", icon: "🦌", description: "Cast a Patronus with print().", secret: true },
  { id: "leviosa", name: "It's Levi-O-sa", icon: "🪶", description: "Pronounce the levitation charm... creatively.", secret: true },
  { id: "marauder", name: "Marauder", icon: "🗺️", description: "Solemnly swear you are up to no good.", secret: true },
  { id: "zen", name: "The Hat's Secret Song", icon: "🎩", description: "import this - discover the Zen of Python.", secret: true },
  { id: "platform", name: "Platform 9¾", icon: "🚂", description: "Find the hidden platform.", secret: true },
  { id: "page-394", name: "Turn to Page 394", icon: "📖", description: "Find the page Professor Snape assigned.", secret: true },
  { id: "wheezes", name: "Weasleys' Wizard Wheezes", icon: "🎆", description: "Enter the secret code of the Weasley twins.", secret: true },
  { id: "riddikulus", name: "Riddikulus!", icon: "🦆", description: "Turn a boggart-bug into a rubber duck.", secret: true },
];

export const badgeById = (id: string) => BADGES.find((b) => b.id === id);
