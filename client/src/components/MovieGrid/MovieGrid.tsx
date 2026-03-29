import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Movie } from "../../types/movie";
import { MovieCard } from "../MovieCard/MovieCard";
import styles from "./MovieGrid.module.css";

type SortKey = "title-asc" | "title-desc" | "year-desc" | "year-asc";

interface MovieGridProps {
  movies: Movie[];
}

const SUGGESTION_LIMIT = 8;

function uniqueGenres(movies: Movie[]): string[] {
  const set = new Set<string>();
  for (const m of movies) {
    for (const g of m.genres) {
      const t = g.trim();
      if (t) set.add(t);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

function applySort(list: Movie[], sortBy: SortKey): Movie[] {
  const sorted = [...list];
  switch (sortBy) {
    case "year-desc":
      sorted.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
      break;
    case "year-asc":
      sorted.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
      break;
    case "title-desc":
      sorted.sort((a, b) => b.title.localeCompare(a.title));
      break;
    default:
      sorted.sort((a, b) => a.title.localeCompare(b.title));
  }
  return sorted;
}

export function MovieGrid({ movies }: MovieGridProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("title-asc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const rowRef = useRef<HTMLDivElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const genres = useMemo(() => uniqueGenres(movies), [movies]);

  const trimmedSearch = search.trim().toLowerCase();

  const processedMovies = useMemo(() => {
    let list = movies;
    if (genreFilter !== "all") {
      const gLow = genreFilter.toLowerCase();
      list = list.filter((m) =>
        m.genres.some((g) => g.toLowerCase() === gLow)
      );
    }
    if (trimmedSearch) {
      list = list.filter((m) =>
        m.title.toLowerCase().includes(trimmedSearch)
      );
    }
    return applySort(list, sortBy);
  }, [movies, genreFilter, trimmedSearch, sortBy]);

  const suggestions = useMemo(() => {
    if (!trimmedSearch) return [];
    return movies
      .filter((m) => m.title.toLowerCase().includes(trimmedSearch))
      .slice(0, SUGGESTION_LIMIT);
  }, [movies, trimmedSearch]);

  const scrollRow = (direction: "left" | "right") => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.8;
      rowRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
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

  const goToMovie = (id: string) => {
    navigate(`/movie/${id}`);
    setSearch("");
    setSuggestionsOpen(false);
  };

  useEffect(() => {
    handleScroll();
  }, [processedMovies.length]);

  useEffect(() => {
    if (!filterOpen) return;
    const onDown = (e: MouseEvent) => {
      if (
        filterBarRef.current &&
        !filterBarRef.current.contains(e.target as Node)
      ) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [filterOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFilterOpen(false);
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={styles.netflixContainer}>
      <div className={styles.filterBar} ref={filterBarRef}>
        <div className={styles.filterControlsRow}>
          <div className={styles.searchWrap}>
            <input
              type="search"
              placeholder="Search movies..."
              value={search}
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls="movie-search-suggestions"
              aria-expanded={suggestionsOpen && suggestions.length > 0}
              onChange={(e) => {
                setSearch(e.target.value);
                setSuggestionsOpen(true);
              }}
              onFocus={() => setSuggestionsOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setSuggestionsOpen(false), 180);
              }}
              className={styles.searchInput}
            />
            {suggestionsOpen &&
              trimmedSearch.length > 0 &&
              suggestions.length > 0 && (
                <ul
                  id="movie-search-suggestions"
                  className={styles.suggestions}
                  role="listbox"
                  aria-label="Quick results"
                >
                  {suggestions.map((m) => (
                    <li key={m.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        className={styles.suggestionItem}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => goToMovie(m.id)}
                      >
                        <img
                          src={m.posterUrl}
                          alt=""
                          className={styles.suggestionThumb}
                          width={36}
                          height={54}
                        />
                        <span className={styles.suggestionText}>
                          <span className={styles.suggestionTitle}>
                            {m.title}
                          </span>
                          <span className={styles.suggestionMeta}>
                            {m.year}
                            {m.genres.length > 0
                              ? ` · ${m.genres.slice(0, 2).join(", ")}`
                              : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
          </div>

          <button
            type="button"
            className={`${styles.filterToggle} ${
              filterOpen ? styles.filterToggleActive : ""
            }`}
            onClick={() => setFilterOpen((o) => !o)}
            aria-expanded={filterOpen}
            aria-controls="movie-filter-panel"
            aria-label="Open filters and sort options"
          >
            <svg
              className={styles.filterIcon}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M4 5h16v2H4V5zm3 5h10v2H7v-2zm-2 5h14v2H5v-2z"
              />
            </svg>
          </button>
        </div>

        {filterOpen && (
          <div
            id="movie-filter-panel"
            className={styles.filterPanel}
            role="region"
            aria-label="Filters and sort"
          >
            <div className={styles.filterField}>
              <label className={styles.filterLabel} htmlFor="genre-filter">
                Genre
              </label>
              <select
                id="genre-filter"
                className={styles.filterSelect}
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
              >
                <option value="all">All genres</option>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel} htmlFor="sort-filter">
                Sort by
              </label>
              <select
                id="sort-filter"
                className={styles.filterSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
              >
                <option value="title-asc">Title (A–Z)</option>
                <option value="title-desc">Title (Z–A)</option>
                <option value="year-desc">Release year (newest)</option>
                <option value="year-asc">Release year (oldest)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className={styles.carouselContainer}>
        {processedMovies.length === 0 && (
          <p className={styles.empty}>No movies match your filters.</p>
        )}

        {processedMovies.length > 0 && (
          <div className={styles.singleRow}>
            <h2 className={styles.mainTitle}>Must Watch Movies</h2>
            <div className={styles.rowWrapper}>
              {showLeftArrow && (
                <button
                  type="button"
                  className={`${styles.scrollButton} ${styles.scrollButtonLeft}`}
                  onClick={() => scrollRow("left")}
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
                {processedMovies.map((movie) => (
                  <div key={movie.id} className={styles.movieCard}>
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
              {showRightArrow && (
                <button
                  type="button"
                  className={`${styles.scrollButton} ${styles.scrollButtonRight}`}
                  onClick={() => scrollRow("right")}
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
