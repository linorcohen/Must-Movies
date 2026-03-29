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
        <nav className={styles.backNav}>
          <Link to="/" className={styles.backLink}>
            MAIN PAGE
          </Link>
        </nav>

        <div className={styles.content}>
          <h1 className={styles.title}>{movie.title}</h1>

          <div className={styles.yearBox}>
            <span>{movie.year}</span>
          </div>

          <p className={styles.storyline}>{movie.synopsis}</p>

          <ul className={styles.genres}>
            {movie.genres.map((g) => (
              <li key={g} className={styles.genre}>
                {g}
              </li>
            ))}
          </ul>

          {movie.trailerId && (
            <div className={styles.trailerSection}>
              <h2 className={styles.trailerHeading}>WATCH THE TRAILER</h2>
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
        </div>
      </div>
    </div>
  );
}
