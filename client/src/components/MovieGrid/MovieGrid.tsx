import { useState, useMemo, useRef } from "react";
import type { Movie } from "../../types/movie";
import { MovieCard } from "../MovieCard/MovieCard";
import styles from "./MovieGrid.module.css";

interface MovieGridProps {
  movies: Movie[];
}

export function MovieGrid({ movies }: MovieGridProps) {
  const [search, setSearch] = useState("");
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const filtered = useMemo(() => {
    return search
      ? movies.filter((m) => m.title.toLowerCase().includes(search.toLowerCase().trim()))
      : movies;
  }, [movies, search]);

  const scrollRow = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.8;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
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
        {filtered.length === 0 && (
          <p className={styles.empty}>No movies match your search.</p>
        )}
        
        {filtered.length > 0 && (
          <div className={styles.singleRow}>
            <h2 className={styles.mainTitle}>Must Watch Movies</h2>
            <div className={styles.rowWrapper}>
              {showLeftArrow && (
                <button
                  className={`${styles.scrollButton} ${styles.scrollButtonLeft}`}
                  onClick={() => scrollRow('left')}
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
                {filtered.map((movie) => (
                  <div key={movie.id} className={styles.movieCard}>
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
              {showRightArrow && (
                <button
                  className={`${styles.scrollButton} ${styles.scrollButtonRight}`}
                  onClick={() => scrollRow('right')}
                  aria-label="Scroll right"
                >
                  ›
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
