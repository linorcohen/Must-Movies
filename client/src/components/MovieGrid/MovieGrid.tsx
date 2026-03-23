import { useState, useMemo, useRef } from "react";
import type { Movie } from "../../types/movie";
import { MovieCard } from "../MovieCard/MovieCard";
import styles from "./MovieGrid.module.css";

interface MovieGridProps {
  movies: Movie[];
}

export function MovieGrid({ movies }: MovieGridProps) {
  const [search, setSearch] = useState("");

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.genres.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [movies]);

  const moviesByGenre = useMemo(() => {
    const filtered = search
      ? movies.filter((m) => m.title.toLowerCase().includes(search.toLowerCase().trim()))
      : movies;

    const grouped = new Map<string, Movie[]>();
    
    filtered.forEach((movie) => {
      movie.genres.forEach((genre) => {
        if (!grouped.has(genre)) {
          grouped.set(genre, []);
        }
        grouped.get(genre)!.push(movie);
      });
    });

    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [movies, search]);

  const scrollRow = (rowRef: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.8;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={styles.netflixContainer}>
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.carouselContainer}>
        {moviesByGenre.length === 0 && (
          <p className={styles.empty}>No movies match your search.</p>
        )}
        
        {moviesByGenre.map(([genre, genreMovies]) => (
          <GenreRow
            key={genre}
            genre={genre}
            movies={genreMovies}
            onScroll={scrollRow}
          />
        ))}
      </div>
    </div>
  );
}

interface GenreRowProps {
  genre: string;
  movies: Movie[];
  onScroll: (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => void;
}

function GenreRow({ genre, movies, onScroll }: GenreRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <div className={styles.genreSection}>
      <h2 className={styles.genreTitle}>{genre}</h2>
      <div className={styles.rowWrapper}>
        {showLeftArrow && (
          <button
            className={`${styles.scrollButton} ${styles.scrollButtonLeft}`}
            onClick={() => onScroll(rowRef, 'left')}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}
        <div
          ref={rowRef}
          className={styles.movieRow}
          onScroll={handleScroll}
        >
          {movies.map((movie) => (
            <div key={movie.id} className={styles.movieCard}>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        {showRightArrow && (
          <button
            className={`${styles.scrollButton} ${styles.scrollButtonRight}`}
            onClick={() => onScroll(rowRef, 'right')}
            aria-label="Scroll right"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
