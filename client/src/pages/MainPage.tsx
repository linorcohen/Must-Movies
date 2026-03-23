import { Navbar } from "../components/Navbar/Navbar";
import { Hero } from "../components/Hero/Hero";
import { MovieGrid } from "../components/MovieGrid/MovieGrid";
import { Footer } from "../components/Footer/Footer";
import { useMovies } from "../hooks/useMovies";

export function MainPage() {
  const { movies, loading, error } = useMovies();

  return (
    <>
      <Navbar />
      <Hero />
      {loading && <p style={{ textAlign: "center", padding: "4rem" }}>Loading movies...</p>}
      {error && <p style={{ textAlign: "center", padding: "4rem", color: "red" }}>Error: {error}</p>}
      {!loading && !error && <MovieGrid movies={movies} />}
      <Footer />
    </>
  );
}
