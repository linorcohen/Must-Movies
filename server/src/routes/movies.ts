import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { Movie } from "../types/movie";

export const moviesRouter = Router();

const DATA_DIR = path.join(__dirname, "..", "..", "data");

const TRAILER_MAP: Record<string, string> = {
  "Jurassic Park": "lc0UehYemQA",
  "The Hobbit: An Unexpected Journey": "SDnYMbYB-nU",
  "The Lord of the Rings: The Fellowship of the Ring": "V75dMMIW2B4",
  "The Lord of the Rings: The Two Towers": "hYcw5ksV8YQ",
  "The Lord of the Rings: The Return of the King": "r5X-hFf6Bwo",
  "Big Hero 6": "z3biFxZIJOQ",
  "The Hitchhiker's Guide to the Galaxy": "1PaPp9MJm-I",
  "Men in Black": "UxUTTrU6PA4",
  "Men in Black II": "DMHlNR6x2Sw",
  "Men in Black 3": "IyaFEBI_L24",
  "Up": "kBBsE4TK06U",
  "Aladdin": "VcBllhVj1eA",
  "Avengers: Endgame": "TcMBFSGVi1c",
  "Avengers: Infinity War": "6ZfuNTqbHE8",
  "Transformers": "v8ItGrI-Ou0",
  "X-Men Origins: Wolverine": "8IxT7WFL6Ec",
  "American Psycho": "Q_jaJR_cNFU",
  "Meet the Parents": "2djcavCEajA",
  "The Lion King": "eHcZlPpNt0Q",
  "The Chronicles of Narnia: The Lion, the Witch and the Wardrobe": "usEkWtuNn-w",
};

const POSTER_MAP: Record<string, string> = {
  "Jurassic Park": "JurassicPark.jpg",
  "The Hobbit: An Unexpected Journey": "Hobbit.jpg",
  "The Lord of the Rings: The Fellowship of the Ring": "TLTR1.jpg",
  "The Lord of the Rings: The Two Towers": "TLTR2.jpg",
  "The Lord of the Rings: The Return of the King": "TLTR3.jpg",
  "Big Hero 6": "BigHero.jpg",
  "The Hitchhiker's Guide to the Galaxy": "Hitchhikers.jpg",
  "Men in Black": "MIB1.jpg",
  "Men in Black II": "MIB2.jpg",
  "Men in Black 3": "MIB3.jpg",
  "Up": "Up.jpg",
  "Aladdin": "Aladdin.jpg",
  "Avengers: Endgame": "AvengersEnd.jpg",
  "Avengers: Infinity War": "AvengersInf.jpg",
  "Transformers": "Transformers.jpg",
  "X-Men Origins: Wolverine": "Xmen.jpg",
  "American Psycho": "americanPsycho.jpg",
  "Meet the Parents": "meetTheParents.jpg",
  "The Lion King": "lionKing.jpg",
  "The Chronicles of Narnia: The Lion, the Witch and the Wardrobe": "narnia.jpg",
};

function parseGenres(raw: string): string[] {
  try {
    return raw
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((g) => g.trim().replace(/^'|'$/g, ""));
  } catch {
    return [];
  }
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function loadMovies(): Promise<Movie[]> {
  return new Promise((resolve, reject) => {
    const wallpapers: Record<string, string> = {};
    const movies: Movie[] = [];

    const wallpaperStream = fs
      .createReadStream(path.join(DATA_DIR, "moviesListWallpaper.csv"))
      .pipe(csv());

    wallpaperStream.on("data", (row: Record<string, string>) => {
      const key = Object.keys(row)[0];
      wallpapers[row[key]] = row["movie wallpaper"];
    });

    wallpaperStream.on("end", () => {
      const dataStream = fs
        .createReadStream(path.join(DATA_DIR, "moviesListData.csv"))
        .pipe(csv());

      dataStream.on("data", (row: Record<string, string>) => {
        const title = row["movie title"];
        if (!title) return;

        const id = toSlug(title);
        const key = Object.keys(row)[0];
        const wallpaperKey = row[key];

        movies.push({
          id,
          title,
          year: parseInt(row["movie year"], 10) || 0,
          storyline: row["movie storyline"] || "",
          genres: parseGenres(row["movie genres list"] || ""),
          trailerYoutubeId: TRAILER_MAP[title] || "",
          posterImage: POSTER_MAP[title] || "",
          wallpaperUrl: wallpapers[wallpaperKey] || "",
        });
      });

      dataStream.on("end", () => resolve(movies));
      dataStream.on("error", reject);
    });

    wallpaperStream.on("error", reject);
  });
}

let cachedMovies: Movie[] | null = null;

async function getMovies(): Promise<Movie[]> {
  if (!cachedMovies) {
    cachedMovies = await loadMovies();
  }
  return cachedMovies;
}

moviesRouter.get("/movies", async (_req: Request, res: Response) => {
  try {
    const movies = await getMovies();
    res.json(movies);
  } catch (err) {
    console.error("Failed to load movies:", err);
    res.status(500).json({ error: "Failed to load movie data" });
  }
});

moviesRouter.get("/movies/:id", async (req: Request, res: Response) => {
  try {
    const movies = await getMovies();
    const movie = movies.find((m) => m.id === req.params.id);
    if (!movie) {
      res.status(404).json({ error: "Movie not found" });
      return;
    }
    res.json(movie);
  } catch (err) {
    console.error("Failed to load movie:", err);
    res.status(500).json({ error: "Failed to load movie data" });
  }
});
