# Must Movies

A curated catalog of must-watch films: browse a responsive grid, open each title for synopsis, genres, trailer, and full-screen wallpaper. Movie data is served from a PostgreSQL database via a small Express API; the UI is a React (Vite) single-page app.

<img width="1911" height="906" alt="image" src="https://github.com/user-attachments/assets/e5c80e4f-4ea1-4605-97a6-4e3c967ade81" />


## Repository layout

| Directory | Role |
|-----------|------|
| `client/` | React + TypeScript + Vite front end |
| `server/` | Express API, PostgreSQL access, and migration tooling |

## Features

- **Home** — Hero section and transition into a searchable movie grid.
- **Detail pages** — Route `/movie/:id` with plot, cast-style metadata (via synopsis and genres), embedded trailer (YouTube by ID), and wallpaper imagery.
- **Images** — Posters and wallpapers can be stored in the database and exposed at `/api/movies/:id/poster` and `/api/movies/:id/wallpaper`, with sensible caching headers.
- **Responsive UI** — Layout and components tuned for different screen sizes.

## Tech stack

- **Client:** React 18, React Router, TypeScript, Vite, CSS modules.
- **Server:** Node.js, Express, `pg` (PostgreSQL), CORS.
- **Data:** PostgreSQL (`DATABASE_URL` connection string).

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- A running [PostgreSQL](https://www.postgresql.org/) instance and a database URL

## Configuration

### Server (`server/.env`)

Create `server/.env` in the server folder:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
PORT=3001
```

`PORT` is optional; it defaults to `3001`.

### Client (optional)

For **local development**, the Vite dev server proxies `/api` to `http://localhost:3001`, so you usually do not need a client env file.

For **production builds** (or when the API is on another origin), set the API base URL:

```env
VITE_API_URL=https://your-api.example.com
```

The client fetches `${VITE_API_URL}/api/movies` and `/api/movies/:id`. If `VITE_API_URL` is unset, requests use a relative `/api/...` path (same origin as the static site).

## Local development

1. **Database** — Create an empty database and note its connection string for `DATABASE_URL`.

2. **Migrate seed data** (from CSV + local poster files under `server/fallback/`):

   ```bash
   cd server
   npm install
   npm run migrate
   ```

   This applies `server/src/db/schema.sql`, reads `server/fallback/data/` CSVs, loads posters from `server/fallback/MoviePoster/`, downloads wallpapers where URLs are provided, and upserts rows into `movies`.

3. **API:**

   ```bash
   cd server
   npm run dev
   ```

   The server listens on `http://localhost:3001` (or your `PORT`).

4. **Client:**

   ```bash
   cd client
   npm install
   npm run dev
   ```

   Open the URL Vite prints (default port **5173**). API calls go through the dev proxy to the Express app.

## Production-style run

```bash
cd server && npm install && npm run build && npm start
cd client && npm install && npm run build
```

Serve the contents of `client/dist/` with any static host. Point `VITE_API_URL` at the public API origin if the API is not same-origin.

## API overview

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/movies` | All movies, ordered by title |
| `GET` | `/api/movies/:id` | One movie |
| `GET` | `/api/movies/:id/poster` | Poster bytes (`Content-Type` from DB) |
| `GET` | `/api/movies/:id/wallpaper` | Wallpaper bytes |

## License / attribution

Design inspiration is credited in the app footer; movie metadata is attributed to [IMDb](https://www.imdb.com/). See the project footer for links.
