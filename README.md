# Grand Line Guess

A daily and unlimited One Piece guessing game built with React, TypeScript, and Vite. Choose Classic character clues, identify the character who ate a Devil Fruit from its romanized Japanese name, or identify a character from a wanted-poster portrait and bounty. Each mode has its own daily answer and guess history. Classic guesses compare gender, affiliation, Devil Fruit type, Haki, last bounty, height, age, origin, and first arc.

## Run locally

```sh
npm install
npm run dev
```

Run `npm run build` for a production build and `npm run lint` for lint checks.

## Data

The game loads character and Devil Fruit records from OPArchive and filters the character roster to records with no more than one unavailable clue. Devil Fruit clues use romanized Japanese names and the archive-listed eater. The curated roster in `src/characters.ts` is used when the archive cannot be reached. OPArchive does not provide a gender field, so gender is inferred from profile wording and a curated list; treat those labels as best-effort.
