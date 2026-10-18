# pD-Day 2026

An explore-the-school game for the AISA AI PD days (19–20 October 2026), in **English and Arabic**.

Teachers walk around a school with Leo the lion. Each room holds a quest that matches a real station table in the PD room:

1. Read the briefing. It sends the teacher to that station's table so colleagues on the same quest can help each other.
2. Tick off the missions. Each one has step-by-step help and screenshots from the station guide.
3. Pass Leo's quiz to earn the badge.

Earning all seven station badges unlocks *Leader of the Pride*, and the badge case prints a certificate.

| Room | Station | Guide |
|------|---------|-------|
| The Level-Up Library | 1 · Differentiation & Scaffolding | `Station-1-Differentiation/` |
| The Deck Studio | 2 · Polished Lesson Decks, Fast | `Station-2-Lesson-Decks/` |
| The Hook Arena | 3 · Engagement & Active Participation | `Station-3-Engagement/` |
| The Screening Room | 4 · Turn Your Slides into a Video | `Station-4-Lesson-Video/` |
| The Code Arcade | 5 · Code Your Own Class Activities | `Station-5-Coding-Activities/` |
| The Data Vault | 6 · Student Data Anonymizer | [aisa-ai-web.github.io/data-anonymizer](https://aisa-ai-web.github.io/data-anonymizer/) |
| The Myth Court | 7 · AI & Assessment: Bust the Detector Myth | [AI & Assessment module](https://aisa-ai-web.github.io/The-Learning-Hub/PD%20Modules/ai-and-assessment.html) (Learning Hub, AISA sign-in) |

The game also has a staff lounge, wandering colleagues and eight secret achievements. They're there for fun, so go and find them.

**Dr. Torris**, the AISA director, patrols the lobby, corridor and staff lounge. Now and then he tells passers-by to get back to work ("Less talky talky, more worky worky!"). He walks over if someone lingers in the lounge, and eases off once a teacher has every station badge. He never blocks anyone. His lines, look and timings are under `PD.director` in `game/content.js`; set `enabled: false` there to remove him.

## Playing

- **Move:** arrow keys or WASD, or click where you want to go.
- **Talk / interact:** E, Space or Enter, or click on the thing.
- **Panels:** Q opens Quests, B opens Badges, M opens the Map. Esc closes a window.
- **Language:** use the globe button (top right), the title screen switch, or open `index.html?lang=ar`.
- **Station guides:** they open in the game's language. Each guide also has its own *English / العربية* button.
- **Shortcuts:** the quest log can open any quest directly, or *walk me there*.

Progress (first name, look, badges) is saved in the browser on that laptop only. Nothing is sent anywhere. The only outside request is for the Google Fonts.

## Files

```
index.html          the game
stations.html       the plain list of station guides (was index.html); its Arabic is at the bottom of the file
Station-*/          the station guides and screenshots
Station-*/ar.js     ← the Arabic for that station's guide
shared/             guide-lang.js and guide-lang.css: language choice, right-to-left layout and the
                    language button for the station guides and stations.html
game/content.js     ← all quest text, quizzes, badges, jokes and UI text (English + Arabic)
game/world.js       builds the school map and draws the rooms and furniture
game/game.js        movement, Leo, quests, badges, sound, panels, language switching
game/art.js         Leo's portraits, the badge emblems and the UI icons (SVG)
game/styles.css     the interface (AISA brand: DM Sans / Cairo, #21076C, #D8B664)
```

No build step and no libraries. It's static files, so GitHub Pages (or any web server) can host it as-is.

The game's files, `shared/` and each `ar.js` are loaded with `?v=…` after their name. When you change one of them, change that `v=` value where the file is loaded, so browsers don't mix old and new copies.

## Editing the content

Everything a teacher reads is in **`game/content.js`**.

- Each piece of text is `{ en: '…', ar: '…' }`. If `ar` is missing, the English is shown.
- Wrap a button or menu name in `**double stars**`, e.g. `'Click **Generate**'`. It shows as a highlighted label and keeps the right direction inside Arabic sentences.
- `{name}` becomes the player's first name.

### Editing a station guide

Each guide is `Station-*/index.html` (in English) plus `Station-*/ar.js` (its Arabic).

- `ar.js` pairs each piece of English, exactly as it appears inside one heading, paragraph, list item, tip or button, with its Arabic: `'Click <span class="ui">Generate</span>.': 'انقر <span class="ui">Generate</span>.'`. Picture descriptions (`alt`) and flipbook captions (`data-cap`) are paired the same way.
- When you change English in `index.html`, change the same line in `ar.js`. Until you do, that text shows in English on the Arabic page, and the browser console (F12) lists it.
- Button and menu names stay in English inside `<span class="ui">…</span>`, because that's what teachers see on screen.
- Text written by a script (the step counter, the Back / Next buttons, the demos) uses `GL.t('English', 'العربية')`.
- A guide picks its language from `?lang=ar` or `?lang=en` in the address first, then the language last used in the game on that browser, then the browser's own language.
- A new guide needs the same three lines as the others: `shared/guide-lang.css` and `shared/guide-lang.js` near the top, and `ar.js` just before the scripts at the bottom.

### Adding a station

Copy one quest object in `PD.quests`, then:

1. Give it a new `id` and `station` number.
2. Choose a `color`, a `theme` (`library`, `studio`, `arena`, `cinema`, `lab`, `vault` or `court`) and a badge `icon` (`levels`, `slides`, `hook`, `clapper`, `code`, `vault`, `gavel`, `paw`, `crown`, `coffee`, `paper`, `fridge`, `heart`, `compass`, `wall`, `bell`, `clipboard`).
3. Point `dir` / `guide` at the station's folder, or set `guide` to a full URL.
   If that site is on aisa-ai-web.github.io and remembers its language in the browser (the Learning Hub uses `aisa-newsletter-lang`), set `guideLangKey` to that key so it opens in the game's language.

Leo's welcome (`PD.leo.intro` in `content.js`) says how many quests there are, in both languages, so update that number too.

The school grows a new room automatically. Rooms fill the top row first, then the bottom row, so a 7th or 8th station adds a column.

## Publishing on GitHub Pages

In the repository, open **Settings → Pages** and set **Source** to *Deploy from a branch* with branch `main` and folder `/ (root)`. The game is then at `https://aisa-ai-web.github.io/arcade/`.
