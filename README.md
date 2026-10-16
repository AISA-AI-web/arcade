# pD-Day 2026

An explore-the-school game for the AISA AI PD days (19–20 October 2026), in **English and Arabic**.

Teachers walk around a school with Leo the lion. Each room holds a quest that matches a real station table in the PD room:

1. Read the briefing. It sends the teacher to that station's table so colleagues on the same quest can help each other.
2. Tick off the missions. Each one has step-by-step help and screenshots from the station guide.
3. Pass Leo's quiz to earn the badge.

Earning all six station badges unlocks *Leader of the Pride*, and the badge case prints a certificate.

| Room | Station | Guide |
|------|---------|-------|
| The Level-Up Library | 1 · Differentiation & Scaffolding | `Station-1-Differentiation/` |
| The Deck Studio | 2 · Polished Lesson Decks, Fast | `Station-2-Lesson-Decks/` |
| The Hook Arena | 3 · Engagement & Active Participation | `Station-3-Engagement/` |
| The Screening Room | 4 · Turn Your Slides into a Video | `Station-4-Lesson-Video/` |
| The Code Arcade | 5 · Code Your Own Class Activities | `Station-5-Coding-Activities/` |
| The Data Vault | 6 · Student Data Anonymizer | [aisa-ai-web.github.io/data-anonymizer](https://aisa-ai-web.github.io/data-anonymizer/) |

The game also has a staff lounge, wandering colleagues and seven secret achievements. They're there for fun, so go and find them.

## Playing

- **Move:** arrow keys or WASD, or click where you want to go.
- **Talk / interact:** E, Space or Enter, or click on the thing.
- **Panels:** Q opens Quests, B opens Badges, M opens the Map. Esc closes a window.
- **Language:** use the globe button (top right), the title screen switch, or open `index.html?lang=ar`.
- **Shortcuts:** the quest log can open any quest directly, or *walk me there*.

Progress (first name, look, badges) is saved in the browser on that laptop only. Nothing is sent anywhere. The only outside request is for the Google Fonts.

## Files

```
index.html          the game
stations.html       the plain list of station guides (was index.html)
Station-*/          the station guides and screenshots
game/content.js     ← all quest text, quizzes, badges, jokes and UI text (English + Arabic)
game/world.js       builds the school map and draws the rooms and furniture
game/game.js        movement, Leo, quests, badges, sound, panels, language switching
game/art.js         Leo's portraits, the badge emblems and the UI icons (SVG)
game/styles.css     the interface (AISA brand: DM Sans / Cairo, #21076C, #D8B664)
```

No build step and no libraries. It's static files, so GitHub Pages (or any web server) can host it as-is.

## Editing the content

Everything a teacher reads is in **`game/content.js`**.

- Each piece of text is `{ en: '…', ar: '…' }`. If `ar` is missing, the English is shown.
- Wrap a button or menu name in `**double stars**`, e.g. `'Click **Generate**'`. It shows as a highlighted label and keeps the right direction inside Arabic sentences.
- `{name}` becomes the player's first name.

### Adding a station

Copy one quest object in `PD.quests`, then:

1. Give it a new `id` and `station` number.
2. Choose a `color`, a `theme` (`library`, `studio`, `arena`, `cinema`, `lab` or `vault`) and a badge `icon` (`levels`, `slides`, `hook`, `clapper`, `code`, `vault`, `paw`, `crown`, `coffee`, `paper`, `fridge`, `heart`, `compass`, `wall`, `bell`).
3. Point `dir` / `guide` at the station's folder, or set `guide` to a full URL.

The school grows a new room automatically. Rooms fill the top row first, then the bottom row, so a 7th or 8th station adds a column.

## Publishing on GitHub Pages

In the repository, open **Settings → Pages** and set **Source** to *Deploy from a branch* with branch `main` and folder `/ (root)`. The game is then at `https://aisa-ai-web.github.io/arcade/`.
