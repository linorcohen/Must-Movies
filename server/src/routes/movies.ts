import { Router, Request, Response } from "express";
import { pool } from "../db";
import { Movie } from "../types/movie";

export const moviesRouter = Router();

function toMovie(row: Record<string, unknown>, baseUrl: string): Movie {
  const id = row.id as string;
  const hasPoster = row.poster_data !== null;
  const hasWallpaper = row.wallpaper_data !== null;

  return {
    id,
    title: row.title as string,
    year: row.year as number,
    synopsis: row.synopsis as string,
    genres: row.genres as string[],
    posterUrl: hasPoster ? `${baseUrl}/api/movies/${id}/poster` : (row.poster_url as string),
    wallpaperUrl: hasWallpaper ? `${baseUrl}/api/movies/${id}/wallpaper` : (row.wallpaper_url as string),
    trailerId: row.trailer_id as string,
  };
}

function getBaseUrl(req: Request): string {
  return `${req.protocol}://${req.get("host")}`;
}

moviesRouter.get("/movies", async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, year, synopsis, genres, poster_url, wallpaper_url, trailer_id,
              (poster_data IS NOT NULL) AS poster_data,
              (wallpaper_data IS NOT NULL) AS wallpaper_data
       FROM movies ORDER BY title`
    );
    const baseUrl = getBaseUrl(req);
    res.json(rows.map((r) => toMovie(r, baseUrl)));
  } catch (err) {
    console.error("Failed to load movies:", err);
    res.status(500).json({ error: "Failed to load movie data" });
  }
});

moviesRouter.get("/movies/:id", async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, year, synopsis, genres, poster_url, wallpaper_url, trailer_id,
              (poster_data IS NOT NULL) AS poster_data,
              (wallpaper_data IS NOT NULL) AS wallpaper_data
       FROM movies WHERE id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "Movie not found" });
      return;
    }
    res.json(toMovie(rows[0], getBaseUrl(req)));
  } catch (err) {
    console.error("Failed to load movie:", err);
    res.status(500).json({ error: "Failed to load movie data" });
  }
});

moviesRouter.get("/movies/:id/poster", async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      "SELECT poster_data, poster_mime FROM movies WHERE id = $1",
      [req.params.id]
    );
    if (rows.length === 0 || !rows[0].poster_data) {
      res.status(404).json({ error: "Poster not found" });
      return;
    }
    res.set("Content-Type", rows[0].poster_mime);
    res.set("Cache-Control", "public, max-age=86400");
    res.send(rows[0].poster_data);
  } catch (err) {
    console.error("Failed to load poster:", err);
    res.status(500).json({ error: "Failed to load poster" });
  }
});

moviesRouter.get("/movies/:id/wallpaper", async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      "SELECT wallpaper_data, wallpaper_mime FROM movies WHERE id = $1",
      [req.params.id]
    );
    if (rows.length === 0 || !rows[0].wallpaper_data) {
      res.status(404).json({ error: "Wallpaper not found" });
      return;
    }
    res.set("Content-Type", rows[0].wallpaper_mime);
    res.set("Cache-Control", "public, max-age=86400");
    res.send(rows[0].wallpaper_data);
  } catch (err) {
    console.error("Failed to load wallpaper:", err);
    res.status(500).json({ error: "Failed to load wallpaper" });
  }
});
