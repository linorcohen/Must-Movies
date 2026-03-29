import { useParams, Link } from "react-router-dom";
import { useMovie } from "../hooks/useMovies";
import styles from "./MovieDetail.module.css";

export function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const { movie, loading, error } = useMovie(id);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Movie not found.</div>
      </div>
    );
  }

  return (
    <div
      className={styles.page}
      style={{ backgroundImage: `url('${movie.wallpaperUrl}')` }}
    >
      <div className={styles.overlay}>
        <header className={styles.topBar}>
          <Link to="/" className={styles.backLink}>
            ← Main page
          </Link>
        </header>

        <div className={styles.content}>
          <div className={styles.mainGrid}>
            <div className={styles.textColumn}>
              <p className={styles.kicker}>Featured title</p>
              <h1 className={styles.title}>{movie.title}</h1>

              <div className={styles.metaRow}>
                <div className={styles.yearBox}>
                  <span>{movie.year}</span>
                </div>
                <ul className={styles.genres}>
                  {movie.genres.map((g) => (
                    <li key={g} className={styles.genre}>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.storyBlock}>
                <h2 className={styles.storyLabel}>Synopsis</h2>
                <p className={styles.storyline} title={movie.synopsis}>
                  {movie.synopsis}
                </p>
              </div>
            </div>

            <aside className={styles.mediaColumn} aria-label="Poster and trailer">
              <div className={styles.posterCard}>
                <img
                  src={movie.posterUrl}
                  alt={`Poster for ${movie.title}`}
                  className={styles.poster}
                  loading="eager"
                />
              </div>

              {movie.trailerId && (
                <div className={styles.trailerSection}>
                  <h2 className={styles.trailerHeading}>Watch the trailer</h2>
                  <div className={styles.videoBox}>
                    <iframe
                      src={`https://www.youtube.com/embed/${movie.trailerId}?autoplay=0&mute=1`}
                      title={`${movie.title} trailer`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
