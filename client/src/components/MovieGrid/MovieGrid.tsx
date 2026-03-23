import { useState, useMemo } from "react";
import type { Movie } from "../../types/movie";
import { MovieCard } from "../MovieCard/MovieCard";
import styles from "./MovieGrid.module.css";

interface MovieGridProps {
  movies: Movie[];
  isSticky?: boolean;
}

export function MovieGrid({ movies, isSticky = false }: MovieGridProps) {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.genres.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [movies]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return movies.filter((m) => {
      const matchesSearch = !q || m.title.toLowerCase().includes(q);
      const matchesGenre = !genre || m.genres.includes(genre);
      return matchesSearch && matchesGenre;
    });
  }, [movies, search, genre]);

  return (
    <>
      <div className={`${styles.filterBar} ${isSticky ? styles.stickyFilterBar : ""}`}>
        <input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className={styles.genreSelect}
        >
          <option value="">All Genres</option>
          {allGenres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div id="movie-grid" className={styles.grid}>
        {filtered.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
        {filtered.length === 0 && (
          <p className={styles.empty}>No movies match your filters.</p>
        )}
      </div>
    </>
  );
}
