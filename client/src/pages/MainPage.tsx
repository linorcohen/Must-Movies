import { useState } from "react";
import { Navbar } from "../components/Navbar/Navbar";
import { Hero } from "../components/Hero/Hero";
import { MovieGrid } from "../components/MovieGrid/MovieGrid";
import { useMovies } from "../hooks/useMovies";
import styles from "./MainPage.module.css";

export function MainPage() {
  const { movies, loading, error } = useMovies();
  const [showGrid, setShowGrid] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleShowList = () => {
    setIsTransitioning(true);
    setShowGrid(true);
    // Remove transitioning state after animation completes
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const handleBackToHero = () => {
    setIsTransitioning(true);
    setShowGrid(false);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  return (
    <div className={styles.pageRoot}>
      <Navbar onLogoClick={showGrid ? handleBackToHero : undefined} />
      <div className={styles.container}>
        <div className={styles.viewContainer}>
          {/* Hero View */}
          <div 
            className={`${styles.heroView} ${
              showGrid ? (isTransitioning ? styles.exiting : styles.hidden) : ""
            }`}
          >
            <Hero onShowList={handleShowList} />
          </div>

          {/* Grid View */}
          <div 
            className={`${styles.gridView} ${
              showGrid ? (isTransitioning ? styles.entering : styles.active) : ""
            }`}
          >
            {loading && <p className={styles.statusMessage}>Loading movies...</p>}
            {error && <p className={`${styles.statusMessage} ${styles.errorMessage}`}>Error: {error}</p>}
            {!loading && !error && <MovieGrid movies={movies} />}
          </div>
        </div>
      </div>
    </div>
  );
}
