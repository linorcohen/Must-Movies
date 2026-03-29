import { Link } from "react-router-dom";
import type { Movie } from "../../types/movie";
import styles from "./MovieCard.module.css";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link
      to={`/movie/${movie.id}`}
      className={styles.box}
      aria-label={`Open ${movie.title}`}
    >
      <div className={styles.front}>
        <img
          src={movie.posterUrl}
          alt=""
          loading="lazy"
        />
      </div>
      <div className={styles.back}>
        <h4 className={styles.title}>{movie.title}</h4>
      </div>
    </Link>
  );
}
