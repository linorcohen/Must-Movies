import path from "path";
import fs from "fs";
import https from "https";
import http from "http";
import dotenv from "dotenv";
import { Pool } from "pg";
import csv from "csv-parser";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const DATA_DIR = path.join(__dirname, "..", "fallback", "data");
const POSTER_DIR = path.join(__dirname, "..", "fallback", "MoviePoster");

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

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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

function getMimeType(urlOrFile: string): string {
  const lower = urlOrFile.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function readLocalFile(filePath: string): Buffer | null {
  try {
    return fs.readFileSync(filePath);
  } catch {
    return null;
  }
}

function downloadImage(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          downloadImage(res.headers.location).then(resolve);
          return;
        }
        if (res.statusCode !== 200) {
          console.warn(`  Download failed (HTTP ${res.statusCode}): ${url}`);
          resolve(null);
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", () => resolve(null));
      })
      .on("error", (err) => {
        console.warn(`  Download error: ${err.message}`);
        resolve(null);
      });
  });
}

interface CsvRow {
  [key: string]: string;
}

function loadWallpapers(): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    const wallpapers: Record<string, string> = {};
    fs.createReadStream(path.join(DATA_DIR, "moviesListWallpaper.csv"))
      .pipe(csv())
      .on("data", (row: CsvRow) => {
        const key = Object.keys(row)[0];
        wallpapers[row[key]] = row["movie wallpaper"];
      })
      .on("end", () => resolve(wallpapers))
      .on("error", reject);
  });
}

interface MovieRow {
  id: string;
  title: string;
  year: number;
  synopsis: string;
  genres: string[];
  posterFile: string;
  wallpaperKey: string;
  trailerId: string;
}

function loadMovies(): Promise<MovieRow[]> {
  return new Promise((resolve, reject) => {
    const movies: MovieRow[] = [];
    fs.createReadStream(path.join(DATA_DIR, "moviesListData.csv"))
      .pipe(csv())
      .on("data", (row: CsvRow) => {
        const title = row["movie title"];
        if (!title) return;
        const key = Object.keys(row)[0];
        movies.push({
          id: toSlug(title),
          title,
          year: parseInt(row["movie year"], 10) || 0,
          synopsis: row["movie storyline"] || "",
          genres: parseGenres(row["movie genres list"] || ""),
          posterFile: POSTER_MAP[title] || "",
          wallpaperKey: row[key],
          trailerId: TRAILER_MAP[title] || "",
        });
      })
      .on("end", () => resolve(movies))
      .on("error", reject);
  });
}

async function main() {
  console.log("=== Must Movies Migration (PostgreSQL with image storage) ===\n");

  const schemaPath = path.join(__dirname, "..", "src", "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  await pool.query(schema);
  console.log("Table created.\n");

  const wallpapers = await loadWallpapers();
  const movies = await loadMovies();

  for (const movie of movies) {
    let posterData: Buffer | null = null;
    let posterMime = "image/jpeg";
    if (movie.posterFile) {
      const posterPath = path.join(POSTER_DIR, movie.posterFile);
      posterData = readLocalFile(posterPath);
      if (posterData) {
        posterMime = getMimeType(movie.posterFile);
        console.log(`  Poster loaded from file: ${movie.posterFile} (${posterData.length} bytes)`);
      } else {
        console.warn(`  Poster file not found: ${posterPath}`);
      }
    }

    let wallpaperData: Buffer | null = null;
    let wallpaperMime = "image/jpeg";
    const wallpaperUrl = wallpapers[movie.wallpaperKey] || "";
    if (wallpaperUrl) {
      console.log(`  Downloading wallpaper for ${movie.title}...`);
      wallpaperData = await downloadImage(wallpaperUrl);
      if (wallpaperData) {
        wallpaperMime = getMimeType(wallpaperUrl);
        console.log(`  Wallpaper downloaded: ${wallpaperData.length} bytes`);
      } else {
        console.warn(`  Failed to download wallpaper for ${movie.title}`);
      }
    }

    await pool.query(
      `INSERT INTO movies (id, title, year, synopsis, genres, poster_url, wallpaper_url, trailer_id,
                           poster_data, poster_mime, wallpaper_data, wallpaper_mime)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         year = EXCLUDED.year,
         synopsis = EXCLUDED.synopsis,
         genres = EXCLUDED.genres,
         poster_url = EXCLUDED.poster_url,
         wallpaper_url = EXCLUDED.wallpaper_url,
         trailer_id = EXCLUDED.trailer_id,
         poster_data = EXCLUDED.poster_data,
         poster_mime = EXCLUDED.poster_mime,
         wallpaper_data = EXCLUDED.wallpaper_data,
         wallpaper_mime = EXCLUDED.wallpaper_mime`,
      [
        movie.id,
        movie.title,
        movie.year,
        movie.synopsis,
        movie.genres,
        "",
        wallpaperUrl,
        movie.trailerId,
        posterData,
        posterMime,
        wallpaperData,
        wallpaperMime,
      ]
    );

    console.log(`Inserted: ${movie.title} (${movie.id})\n`);
  }

  console.log(`Migration complete. ${movies.length} movies inserted with image data.`);
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
