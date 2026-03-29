# Must Movies - Product Requirements Document

## 1. Overview

**Must Movies** is a full-stack web application that presents a curated list of must-watch movies. Users browse a responsive horizontal carousel of posters, use live search with quick-result suggestions, filter by genre and sort by title or year, and open detail pages with synopsis, poster, wallpaper, and an embedded YouTube trailer. The UI is fixed to the viewport (no document scroll on main routes).

## 2. Problem Statement

Movie enthusiasts need a simple, visually appealing way to discover a curated list of essential films. Must Movies provides a focused collection with a cinematic browsing experience, backed by an Express API and a PostgreSQL database.

## 3. Target Audience

- Casual movie watchers looking for recommendations.
- Friends of the curator who want a shared reference list.

## 4. Tech Stack

### Frontend (`client/`)

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3 | UI framework |
| TypeScript | 5.6 | Type safety |
| Vite | 5.4 | Build tool and dev server |
| react-router-dom | 7.x | Client-side routing |
| CSS Modules | -- | Component-scoped styles |
| ESLint | 9.x | Linting |

### Backend (`server/`)

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 4.18 | HTTP server |
| TypeScript | 5.3 | Type safety |
| PostgreSQL | 14+ recommended | Database for movie data and image assets |
| pg | 8.20 | PostgreSQL client for Node.js |
| csv-parser | 3.0 | Parse movie data from CSV (migration only) |
| dotenv | 17.x | Load `DATABASE_URL` from `.env` |
| cors | 2.8 | Cross-origin support |
| ts-node | 10.9 | Dev-time TypeScript execution |

### Fonts

| Font | Usage |
|------|-------|
| Oswald (200, 400) | Display headings on main page |
| Bebas Neue | Display headings on detail pages |
| Poppins (400) | Body text, UI controls, synopsis |

## 5. Project Structure

```
Must-Movies/
├── .gitignore
├── PRD.md
├── README.md
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts                 # Dev proxy /api -> localhost:3001
│   ├── public/assets/main/            # Logo, hero, favicon, backgrounds
│   └── src/
│       ├── main.tsx                   # Root; imports variables.css
│       ├── App.tsx                    # BrowserRouter + route shell (App.module.css)
│       ├── App.module.css             # Flex shell: no viewport overflow on body
│       ├── types/movie.ts
│       ├── hooks/useMovies.ts         # useMovies(), useMovie(id)
│       ├── styles/variables.css       # Design tokens; html/body/#root overflow hidden
│       ├── components/
│       │   ├── Navbar/                # Fixed transparent nav; ABOUT/CONTACT modals
│       │   ├── Hero/                  # Full-height hero; CTA reveals movie list
│       │   ├── MovieCard/             # Whole card links to /movie/:id
│       │   ├── MovieGrid/             # Search, suggestions, filters, carousel
│       │   └── PopupModal/
│       └── pages/
│           ├── MainPage.tsx           # Navbar, Hero ↔ MovieGrid transition
│           ├── MainPage.module.css
│           ├── MovieDetail.tsx        # Two-column detail: copy + poster/trailer
│           └── MovieDetail.module.css
└── server/
    ├── .env                           # DATABASE_URL (gitignored; never commit)
    ├── .env.example                   # Template only (no secrets)
    ├── package.json
    ├── src/
    │   ├── index.ts
    │   ├── db/index.ts, schema.sql
    │   ├── types/movie.ts
    │   └── routes/movies.ts
    ├── scripts/migrate-to-pg.ts
    └── fallback/                      # CSV + posters for migration (gitignored)
```

## 6. Database

### Schema

All movie data and image assets are stored in a single `movies` table:

```sql
CREATE TABLE IF NOT EXISTS movies (
  id             VARCHAR(255) PRIMARY KEY,
  title          VARCHAR(255) NOT NULL,
  year           INTEGER NOT NULL,
  synopsis       TEXT NOT NULL DEFAULT '',
  genres         TEXT[] NOT NULL DEFAULT '{}',
  poster_url     TEXT NOT NULL DEFAULT '',
  wallpaper_url  TEXT NOT NULL DEFAULT '',
  trailer_id     VARCHAR(50) NOT NULL DEFAULT '',
  poster_data    BYTEA,
  poster_mime    VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
  wallpaper_data BYTEA,
  wallpaper_mime VARCHAR(50) NOT NULL DEFAULT 'image/jpeg'
);
```

There is **no** `rating` field today; sort/filter by rating would require a schema and API change.

### Image Storage

Posters and wallpapers are stored as `BYTEA` when migrated. The API serves them with `Content-Type` and cache headers; otherwise URLs in `poster_url` / `wallpaper_url` are used.

### Migration

`npm run migrate` reads CSVs and local poster files under `server/fallback/` (ignored by git), applies `schema.sql`, and upserts rows.

## 7. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movies` | All movies, ordered by title |
| GET | `/api/movies/:id` | Single movie |
| GET | `/api/movies/:id/poster` | Poster bytes |
| GET | `/api/movies/:id/wallpaper` | Wallpaper bytes |

### Movie interface (client/server)

```typescript
interface Movie {
  id: string;
  title: string;
  year: number;
  synopsis: string;
  genres: string[];
  posterUrl: string;
  wallpaperUrl: string;
  trailerId: string;   // YouTube video ID
}
```

Optional client env: `VITE_API_URL` for production when the API is not same-origin.

## 8. Features

### 8.1 Main Page (`/`)

| Area | Behavior |
|------|----------|
| Viewport | `html`/`body`/`#root` overflow hidden; MainPage fills height with hero ↔ grid transition. |
| **Navbar** | Fixed, **transparent** over content. Logo (and logo action when grid is open) return to hero. ABOUT / CONTACT open `PopupModal`. Optional auto-hide still tied to `window` scroll (minimal effect when body does not scroll). |
| **Hero** | Full-height image; **THE LIST** reveals the movie carousel. |
| **MovieGrid** | Iron Man–style background with dark overlay; top padding clears nav. **Search**: live filter; **dropdown** of quick results (poster thumb + title + year/genres) navigates to detail on pick. **Filter** control: genre `<select>`, sort by title A–Z / Z–A / year newest / oldest. Horizontal **carousel** with arrow buttons (subtle until hover); **touch**: `pan-x`, momentum-friendly scrolling. **Responsive** card widths (~2 posters visible on small phones). |
| **MovieCard** | Entire card is a **`Link`**; **poster click** opens detail. Hover/touch overlay shows title only (no separate “See More” control). |

### 8.2 Movie Detail (`/movie/:id`)

| Area | Behavior |
|------|----------|
| Layout | Centered **`--detail-max`** shell (~1120px): **text column** (kicker, title, year, genre pills, synopsis with line clamp) + **media column** (poster + trailer). **No vertical page scroll**; synopsis truncated with native `title` tooltip for full text on hover. |
| Background | Wallpaper from API + gradient overlay. |
| Navigation | **Main page** pill control aligned to content width. |

## 9. Current Movie Catalog

Curated list imported via migration (titles include Jurassic Park, LOTR trilogy, MCU entries, animation, etc.). Exact count depends on CSV data in `server/fallback/` (gitignored).

## 10. Design Notes

- **Tokens** in `variables.css` (`--color-gold`, `--color-cream`, `--nav-height`, etc.). App chrome uses dark **`body`** background so transparent UI does not flash white.
- Breakpoints: MovieGrid and MovieDetail use multiple steps (e.g. 900px, 768px, 600px, 480px, short viewport height).

## 11. User Flows

### Browse

1. Land on hero → **THE LIST** → carousel.
2. Type to search and optionally pick from **quick results**, or open **filters** for genre/sort.
3. Swipe/scroll carousel or use arrows.
4. **Click poster** (anywhere on card) → `/movie/:id`.

### Detail

1. Read truncated synopsis; hover for full text tooltip if needed.
2. Watch trailer; use **Main page** to return.

## 12. Running the Application

### Prerequisites

- Node.js 18+
- PostgreSQL instance and `DATABASE_URL`

### Setup

```bash
cd server && npm install
cp .env.example .env   # edit DATABASE_URL (local only; do not commit .env)
npm run migrate
cd ../client && npm install
```

### Development

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open `http://localhost:5173`; Vite proxies `/api` to the backend (default port 3001).

## 13. Security (safe to publish)

| Topic | Practice |
|--------|----------|
| Secrets | `server/.env` is **gitignored**; only `.env.example` documents variable names. **Never** commit real `DATABASE_URL` or API keys. |
| This document | Contains **no** credentials, tokens, or private URLs. |
| Data | Curated catalog only; no user accounts or PII persistence. |
| CORS | Enabled for API; tighten origins in production as needed. |
| Dependencies | Keep `npm audit` clean in CI where possible. |

## 14. Known Limitations

- Trailer IDs and poster filenames are partially hardcoded in the migration script maps.
- Wallaper downloads during migration may fail for dead links; fallbacks apply where implemented.
- No auth, no SSR, no rating in schema.
- Large BYTEA payloads in PostgreSQL are fine for small catalogs; scale-out may want object storage.

## 15. Future Considerations

- Admin UI for catalog; optional TMDB (or similar) integration.
- Ratings in DB + sort/filter by rating.
- SSR/SSG for SEO; Docker for deploy.
