import { useState } from "react";
import { Navbar } from "../components/Navbar/Navbar";
import { MovieGrid } from "../components/MovieGrid/MovieGrid";
import { Footer } from "../components/Footer/Footer";
import { useMovies } from "../hooks/useMovies";
import styles from "./MainPage.module.css";

export function MainPage() {
  const { movies, loading, error } = useMovies();
  const [isGridRevealed, setIsGridRevealed] = useState(false);

  return (
    <>
      <Navbar />
      <div className={`${styles.mainContainer} ${isGridRevealed ? styles.gridRevealed : styles.gridHidden}`}>
        <div className={styles.curatorPanel}>
          <div className={styles.curatorContent}>
            <h1 className={styles.curatorTitle}>MUST WATCH MOVIES</h1>
            <p className={styles.curatorSubtitle}>
              Presenting you a list of movies you must watch at least once in your life
            </p>
            {!isGridRevealed && (
              <button 
                onClick={() => setIsGridRevealed(true)} 
                className={styles.revealButton}
              >
                THE LIST
              </button>
            )}
          </div>
        </div>

        <div className={styles.contentArea}>
          {!isGridRevealed && (
            <div className={styles.previewMessage}>
              <h2>THE COLLECTION</h2>
              <p>Click "THE LIST" to explore our curated selection</p>
            </div>
          )}
          
          {isGridRevealed && (
            <>
              {loading && <p style={{ textAlign: "center", padding: "4rem" }}>Loading movies...</p>}
              {error && <p style={{ textAlign: "center", padding: "4rem", color: "red" }}>Error: {error}</p>}
              {!loading && !error && <MovieGrid movies={movies} isSticky={true} />}
              <Footer />
            </>
          )}
        </div>
      </div>
    </>
  );
}
