import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainPage } from "./pages/MainPage";
import { MovieDetail } from "./pages/MovieDetail";
import styles from "./App.module.css";

function App() {
  return (
    <BrowserRouter>
      <div className={styles.shell}>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
