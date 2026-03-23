import { Link } from "react-router-dom";
import type { Movie } from "../../types/movie";
import styles from "./MovieCard.module.css";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className={styles.box}>
      <div className={styles.front}>
        <img
          src={`/assets/MoviePoster/${movie.posterImage}`}
          alt={`${movie.title} poster`}
          loading="lazy"
        />
      </div>
      <div className={styles.back}>
        <h4 className={styles.title}>{movie.title}</h4>
        <Link to={`/movie/${movie.id}`} className={styles.button}>
          See More
        </Link>
      </div>
    </div>
  );
}
