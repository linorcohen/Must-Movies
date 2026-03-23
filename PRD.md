# Must Movies - Product Requirements Document

## 1. Overview

**Must Movies** is a full-stack web application that presents a curated list of must-watch movies. Users browse a responsive grid of movie posters, filter by title or genre, and click through to individual detail pages with the synopsis, release year, genres, and an embedded YouTube trailer.

## 2. Problem Statement

Movie enthusiasts need a simple, visually appealing way to discover a curated list of essential films. Must Movies provides a focused, opinionated collection with a clean browsing experience, backed by a real API and a PostgreSQL database.

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
| PostgreSQL | 18 | Database for movie data and image assets |
| pg | 8.20 | PostgreSQL client for Node.js |
| csv-parser | 3.0 | Parse movie data from CSV (migration only) |
| cors | 2.8 | Cross-origin support |
| ts-node | 10.9 | Dev-time TypeScript execution |

### Fonts

| Font | Usage |
|------|-------|
| Oswald (200, 400) | Display headings on main page |
| Bebas Neue | Display headings on detail pages |
| Poppins (400) | Body text on detail pages |

## 5. Project Structure

```
Must-Movies/
├── .gitignore
├── PRD.md
├── README.md
├── client/                              # React + Vite frontend
│   ├── index.html                       # Entry HTML with Google Fonts
│   ├── package.json
│   ├── vite.config.ts                   # Dev proxy /api -> localhost:3001
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── eslint.config.js
│   ├── public/
│   │   └── assets/
│   │       └── main/                    # Logo, hero image, favicon, icons, background
│   └── src/
│       ├── main.tsx                     # React root, imports global CSS
│       ├── App.tsx                      # BrowserRouter with Routes
│       ├── types/
│       │   └── movie.ts                 # Movie interface
│       ├── hooks/
│       │   └── useMovies.ts             # useMovies() and useMovie(id) fetch hooks
│       ├── styles/
│       │   └── variables.css            # CSS custom properties (design tokens)
│       ├── components/
│       │   ├── Navbar/                  # Navbar.tsx + Navbar.module.css
│       │   ├── Hero/                    # Hero.tsx + Hero.module.css
│       │   ├── MovieCard/               # MovieCard.tsx + MovieCard.module.css
│       │   ├── MovieGrid/               # MovieGrid.tsx + MovieGrid.module.css
│       │   └── Footer/                  # Footer.tsx + Footer.module.css
│       └── pages/
│           ├── MainPage.tsx             # Composes Navbar, Hero, MovieGrid, Footer
│           ├── MovieDetail.tsx          # Dynamic /movie/:id page
│           └── MovieDetail.module.css
└── server/                              # Express + TypeScript backend
    ├── .env                             # DATABASE_URL
    ├── .env.example
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── index.ts                     # Express app setup, CORS, port 3001
    │   ├── db/
    │   │   ├── index.ts                 # PostgreSQL connection pool
    │   │   └── schema.sql               # Movies table with BYTEA image columns
    │   ├── types/
    │   │   └── movie.ts                 # Movie interface (mirrors client)
    │   └── routes/
    │       └── movies.ts                # Movie API endpoints + image serving
    ├── scripts/
    │   └── migrate-to-pg.ts             # Migration: CSV + local files -> PostgreSQL
    └── fallback/                        # Original source assets (gitignored)
        ├── data/
        │   ├── moviesListData.csv       # Movie metadata (title, year, synopsis, genres)
        │   └── moviesListWallpaper.csv  # Wallpaper URLs per movie
        └── MoviePoster/                 # 20 local movie poster JPGs
```

## 6. Database

### Schema

All movie data and image assets are stored in a single `movies` table in PostgreSQL:

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

### Image Storage

Poster and wallpaper images are stored as binary data (`BYTEA`) directly in PostgreSQL. The server serves them through dedicated API endpoints with proper `Content-Type` headers and 24-hour cache control. If binary data is not available for a movie, the API falls back to the text URL columns (`poster_url`, `wallpaper_url`).

### Migration

The `npm run migrate` script reads movie metadata from CSV files in `server/fallback/data/`, loads poster images from `server/fallback/MoviePoster/`, downloads wallpaper images from their original URLs, and inserts everything into PostgreSQL.

## 7. API Endpoints

| Method | Endpoint | Response | Description |
|--------|----------|----------|-------------|
| GET | `/api/movies` | `Movie[]` | All movies ordered by title |
| GET | `/api/movies/:id` | `Movie` | Single movie by slug ID |
| GET | `/api/movies/:id/poster` | Binary image | Poster image served from PostgreSQL |
| GET | `/api/movies/:id/wallpaper` | Binary image | Wallpaper image served from PostgreSQL |

### Movie Interface

```typescript
interface Movie {
  id: string;           // URL-safe slug (e.g. "jurassic-park")
  title: string;
  year: number;
  synopsis: string;
  genres: string[];
  posterUrl: string;    // API endpoint: /api/movies/:id/poster
  wallpaperUrl: string; // API endpoint: /api/movies/:id/wallpaper
  trailerId: string;    // YouTube video ID
}
```

### Data Flow

```
Client                            Server                          PostgreSQL
──────                            ──────                          ──────────
MainPage
  └─ useMovies()
       GET /api/movies ─────────→ moviesRouter ──── query ──────→ movies table
  └─ MovieCard
       GET /api/movies/:id/poster → serves BYTEA ←──────────────┘

MovieDetail
  └─ useMovie(id)
       GET /api/movies/:id ─────→ moviesRouter ──── query ──────→ movies table
  └─ wallpaper (CSS bg)
       GET /api/movies/:id/wallpaper → serves BYTEA ←───────────┘
  └─ YouTube iframe (trailerId)
```

## 8. Features

### 8.1 Main Page (`/`)

| Component | Feature |
|-----------|---------|
| `<Navbar />` | Fixed top nav with logo and anchor links (ABOUT, CONTACT). Auto-hides on scroll down, reappears on scroll up. Background transitions from transparent to black. |
| `<Hero />` | Full-viewport hero image with title, tagline, and animated CTA button that scrolls to the movie grid. |
| `<MovieGrid />` | Search input + genre dropdown filter. Responsive CSS Grid. Genres populated dynamically from API data via `useMemo`. Real-time filtering on input/change. Empty state message when no matches. |
| `<MovieCard />` | Poster image with `loading="lazy"`. Hover overlay with gradient, title, and "See More" link. On mobile (<=768px), overlay is permanently visible. |
| `<Footer />` | Three-column flex layout: branding/attribution, About section, Contact section. Wraps to single column on mobile. |

### 8.2 Movie Detail Page (`/movie/:id`)

| Element | Description |
|---------|-------------|
| Background | Full-screen wallpaper served from PostgreSQL with dark overlay and 0.8s fade-in animation. |
| Back Navigation | Fixed "MAIN PAGE" link in top-right, routes back to `/`. |
| Movie Title | Large Bebas Neue heading with `clamp()` responsive sizing. |
| Year Badge | Bordered badge below title. |
| Storyline | Poppins body text, max-width 800px. |
| Genres | Horizontal flex list of genre tags. |
| Trailer | Responsive YouTube iframe (16:9 aspect ratio). |

## 9. Current Movie Catalog (21 films)

Jurassic Park, The Hobbit: An Unexpected Journey, The Lord of the Rings (Fellowship, Two Towers, Return of the King), Big Hero 6, The Hitchhiker's Guide to the Galaxy, Men in Black (1, II, 3), Up, Aladdin, Avengers: Endgame, Avengers: Infinity War, The Butterfly Effect, Transformers, X-Men Origins: Wolverine, American Psycho, Meet the Parents, The Lion King, The Chronicles of Narnia.

## 10. Design Specifications

### Color Palette (CSS Custom Properties)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#ffffff` | Page background |
| `--color-dark` | `#111111` | Dark backgrounds, button fills |
| `--color-cream` | `#f4f1de` | Nav links, button text |
| `--color-gold` | `#f2cc8f` | Headings, hero text |
| `--color-sand` | `#d9cfb8` | Footer text |
| `--color-accent` | `#00b4d8` | Movie card buttons |
| `--color-accent-hover` | `#0096c7` | Button hover state |
| `--color-nav-hover` | `#e28065` | Nav link hover |
| `--color-link-hover` | `#892b46` | Footer link hover |

### Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| > 768px | Full desktop layout, 3-4 column grid, hover overlays |
| <= 768px | Reduced nav, tighter grid, stacked footer, always-visible card overlays |
| <= 480px | 2-column grid, smaller text and buttons |

## 11. User Flows

### Browse and Discover

1. User lands on `/` and sees the hero section.
2. User clicks "THE LIST" CTA or scrolls down to the movie grid.
3. User types in the search box or selects a genre to filter cards.
4. User hovers (desktop) or sees (mobile) the movie title overlay.
5. User clicks "See More" to navigate to `/movie/:id`.

### View Movie Details

1. Page loads with fade-in animation over the wallpaper.
2. User reads the synopsis, sees the year and genres.
3. User watches the embedded YouTube trailer.
4. User clicks "MAIN PAGE" to return to `/`.

## 12. Running the Application

### Prerequisites

- Node.js 18+
- PostgreSQL 18 running locally

### Setup

```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE must_movies;"

# 2. Install dependencies
cd server && npm install
cd ../client && npm install

# 3. Configure environment
# Copy server/.env.example to server/.env and set your DATABASE_URL

# 4. Run migration (creates table and imports data + images)
cd server && npm run migrate
```

### Development

```bash
# Terminal 1 - Backend (port 3001)
cd server
npm run dev

# Terminal 2 - Frontend (port 5173)
cd client
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` requests to the Express backend.

### Production Build

```bash
# Server
cd server && npm run build && npm start

# Client
cd client && npm run build && npm run preview
```

## 13. Non-Functional Requirements

| Requirement | Details |
|-------------|---------|
| **Performance** | Lazy-loaded poster images. 24-hour cache headers on image endpoints. Vite production build with tree-shaking. |
| **Type Safety** | Full TypeScript across client and server. Shared `Movie` interface. |
| **Browser Support** | Modern browsers (Chrome, Firefox, Safari, Edge). Responsive down to 320px. |
| **Accessibility** | Semantic HTML, alt text on images, keyboard-navigable links. |
| **Security** | No user input persisted. No personal data stored. Placeholder contact info only. CORS enabled for dev. Database credentials in `.env` (gitignored). |

## 14. Known Limitations

- YouTube trailer IDs and poster filenames are hardcoded in the migration script.
- Some wallpaper images may fail to download during migration (404 from alphacoders.com); those movies fall back to the original URL.
- No authentication or user accounts.
- No server-side rendering (client is a SPA).
- Serving large images from PostgreSQL BYTEA is less efficient than a dedicated CDN for high-traffic scenarios.

## 15. Future Considerations

- Add an admin UI to manage the movie catalog.
- Integrate a public movie API (e.g., TMDB) for live data and poster images.
- Add server-side rendering or static generation for SEO.
- Move image storage to a file system or object storage (S3) if scaling becomes necessary.
- Containerize with Docker for simplified deployment.
