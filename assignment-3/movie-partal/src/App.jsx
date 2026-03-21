import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import MovieDetailPage from "./pages/MovieDetailPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/movies" element={<HomePage />} />
      <Route path="/movie/:id" element={<MovieDetailPage />} />
    </Routes>
  );
}

export default App;
