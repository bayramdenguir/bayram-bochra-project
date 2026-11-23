# PixelPulse — Steam Games Intelligence BI

A two-person React + Vite business-intelligence web app built around the cleaned Steam catalogue supplied with the project.

## Dataset actually included

- Source archive: `steam_games_clean.zip` (10 cleaned CSV parts).
- Rows loaded: **92,237 unique AppIDs** after de-duplicating on `AppID`.
- Fields used: AppID, name, release date, owner estimates, peak CCU, price, discount, DLC count, Metacritic score, positive/negative/total reviews, achievements, recommendations, average playtime, developers, publishers, categories, genres, tags, header image and OS support.
- Runtime data: `public/data/games.json.gz` is a compact, preprocessed representation of those fields. The original CSVs are not needed at runtime.
- Important: owner values are the dataset's estimates (`Owners min` / `Owners max`), not exact sales. Positive rating is computed as `Positive / Total reviews`. Averages in dashboards are unweighted game-level averages unless stated otherwise.

## Requirements

- Node.js 20+ (18.18+ should also work with current Vite)
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

Build and preview:

```bash
npm run build
npm run preview
```

## Pages / utilities

1. **Overview** — KPI cards, release trend, genre distribution, pricing bands, most-reviewed games.
2. **Explorer** — name/developer/publisher search, tag/category text filter, global genre/year filters, platform, price band, minimum positive rating, sorting, card/table views, pagination, Steam links, two-game selection, CSV export.
3. **Leaderboards** — most reviewed, best rated (minimum 100 reviews), most played, peak players, biggest audience, hidden gems and fresh hits.
4. **Pricing Lab** — free share, average paid price, paid/discounted counts, price bands and sentiment by price band.
5. **Genres** — top genres, catalogue size and positive sentiment; click a genre tile to open Explorer scoped to it.
6. **Studios** — developer ranking by total reviews, games count, estimated owners and average positive rating.
7. **Versus** — choose two games and compare review volume, rating, CCU, owners, price, playtime, achievements and recommendations.

Global genre and year filters affect the analytics pages and leaderboards. Explorer has additional local filters.

## Suggested two-person Git workflow

Agree on the `main` branch as the stable branch. Each person works on their own feature branch and opens a pull request. Avoid both editing `src/App.jsx` at the same time; keep ownership split by file/module where possible.

### Person A — Data & analytics owner

Own:
- `src/data/` (create if needed): data helpers, metric calculations, parsing and validation.
- `src/pages/Overview.jsx`, `src/pages/PricingLab.jsx`, `src/pages/Genres.jsx`, `src/pages/Studios.jsx` (extract from the starter `App.jsx` as a follow-up refactor).
- `scripts/preprocess_data.py` and dataset documentation.
- Data quality checks, metric definitions, chart correctness and CSV data integrity.

First branch and commits:
```bash
git switch -c feature/data-analytics
# 1. Add dataset loader, parsing and validation
git add scripts public/data README.md
git commit -m "feat(data): add cleaned Steam catalogue and preprocessing"
# 2. Add dashboard and market analytics
git add src
git commit -m "feat(analytics): add market, pricing, genre and studio insights"
git push -u origin feature/data-analytics
```

### Person B — Product & interaction owner

Own:
- `src/components/` (create if needed): reusable cards, filters, tables, navigation and layout.
- `src/pages/Explorer.jsx`, `src/pages/Leaderboards.jsx`, `src/pages/Versus.jsx` (extract from starter `App.jsx` as a follow-up refactor).
- `src/styles.css`, responsive layout, accessibility and interaction polish.
- Search, sorting, pagination, compare flow and export UX.

First branch and commits:
```bash
git switch -c feature/ui-experience
# 1. Add navigation, theme and responsive shell
git add src/styles.css src/main.jsx index.html
git commit -m "feat(ui): add PixelPulse gaming dashboard shell"
# 2. Add explorer, leaderboard and comparison interactions
git add src
git commit -m "feat(explorer): add filters rankings and game comparison"
git push -u origin feature/ui-experience
```

### Integration owner (take turns)

One person should act as integrator for each milestone:
```bash
git switch main
git pull origin main
git merge --no-ff feature/data-analytics
git merge --no-ff feature/ui-experience
npm install
npm run build
git push origin main
```
If both branches touch the same file, resolve conflicts together. Prefer splitting the starter `App.jsx` into page/component modules before parallel feature work. Never commit `node_modules/` or `.env`.

### Recommended milestone order

1. Both clone the repo and verify `npm install && npm run dev`.
2. Person A validates dataset fields, missing values, duplicates and KPI definitions.
3. Person B refines responsive shell, navigation and component styles.
4. Person A adds/validates dashboard analytics and chart calculations.
5. Person B adds Explorer filters, leaderboard modes and comparison UX.
6. Integrate, test with multiple filter combinations and verify CSV exports.
7. Both review the README, take screenshots and merge the release branch into `main`.

## GitHub setup

One person creates an empty GitHub repository, then:
```bash
git init
git add .
git commit -m "chore: initialize PixelPulse Steam BI"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```
Invite the second person as a collaborator. The second person clones:
```bash
git clone https://github.com/USERNAME/REPOSITORY.git
cd REPOSITORY
npm install
```

## Notes / limitations

- This is a frontend BI prototype; it does not connect to Steam APIs or a live database.
- Charts and filters are computed from the included cleaned snapshot.
- “Fresh hits” uses 2025–2026 release years, based on the provided data's release-date field.
- “Hidden gems” is an explicitly defined heuristic: 20–3,000 reviews and at least 90% positive, not an official Steam label.
- Steam header images are loaded from their original image URLs and need internet access. The app itself works without them.
- Dataset date range and field coverage are inherited from the supplied CSV parts; no additional records have been fabricated.
