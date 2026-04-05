import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Star, Film } from "lucide-react";
import styles from "./HomePage.module.css";

const API_KEY = import.meta.env.VITE_TMDB_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p/w500";
const HOLES = Array(50).fill(0);

// Memoized so it only re-renders when its own movie prop changes,
// not when unrelated HomePage state (like query) updates.
const MovieCard = memo(function MovieCard({ movie, onCardClick }) {
  return (
    <div
      className={styles.card}
      onClick={() => onCardClick(movie.id)}
      onKeyDown={(e) => e.key === "Enter" && onCardClick(movie.id)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${movie.title}`}
    >
      <div className={styles.posterWrap}>
        {movie.poster_path ? (
          <img
            className={styles.posterImg}
            src={`${TMDB_IMAGE}${movie.poster_path}`}
            alt={movie.title}
          />
        ) : (
          <div className={styles.posterFallback}>
            <Film size={30} style={{ color: "rgba(201,168,76,0.25)" }} />
          </div>
        )}
        <div className={styles.vignette} />
        <div className={styles.ratingBadge}>
          <Star size={10} fill="#c9a84c" color="#c9a84c" />
          <span className={styles.ratingValue}>{movie.vote_average?.toFixed(1)}</span>
        </div>
        <span className={styles.year}>{movie.release_date?.slice(0, 4)}</span>
      </div>
      <h3 className={styles.cardTitle}>{movie.title}</h3>
    </div>
  );
});

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Scroll to top whenever the page number changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  // Fetch genre list once on mount
  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
        if (!res.ok) throw new Error("Failed to fetch genres.");
        const data = await res.json();
        setGenres(data.genres);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchGenres();
  }, []);

  // Re-fetch movies when query, genre, or page changes
  // Debounce the query so we don't fire on every keystroke
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        let url;

        if (query.trim()) {
          url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
        } else if (selectedGenre) {
          url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=vote_average.desc&vote_count.gte=1000&with_genres=${selectedGenre}&page=${page}`;
        } else {
          url = `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch movies.");

        const data = await res.json();

        // If searching with a genre selected, filter client-side
        // (TMDB search endpoint doesn't support genre filtering)
        const results = query.trim() && selectedGenre
          ? data.results.filter((m) => m.genre_ids.includes(selectedGenre))
          : data.results;

        setMovies(results);
        setTotalPages(data.total_pages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, selectedGenre, page]);

  const handleQueryChange = useCallback((e) => {
    setQuery(e.target.value);
    setPage(1);
  }, []);

  // Uses the functional form of setSelectedGenre so we don't need selectedGenre
  // in the dependency array — the callback stays stable across renders.
  const handleGenreClick = useCallback((genreId) => {
    setSelectedGenre((prev) => (prev === genreId ? null : genreId));
    setPage(1);
    setQuery("");
  }, []);

  const handleCardClick = useCallback((id) => {
    navigate(`/movie/${id}`);
  }, [navigate]);

  return (
    <div className={styles.page}>
      {/* Radial glows */}
      <div className={styles.glow} style={{ width: 800, height: 800, background: "radial-gradient(circle, rgba(139,26,42,0.16) 0%, transparent 70%)", top: "-20%", left: "-18%" }} />
      <div className={styles.glow} style={{ width: 650, height: 650, background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)", top: "35%", right: "-12%" }} />
      <div className={styles.glow} style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(139,26,42,0.1) 0%, transparent 70%)", bottom: 0, left: "30%" }} />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.strip} style={{ paddingTop: 10 }}>
          {HOLES.map((_, i) => <div key={i} className={styles.hole} />)}
        </div>

        <div className={styles.headerInner}>
          <div className={styles.wordmark}>
            <div className={styles.wordmarkSub}>The Grand</div>
            <h1 className={styles.wordmarkTitle}>Cinémathèque</h1>
          </div>

          <div className={styles.searchWrapper}>
            <Search size={15} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search films…"
              value={query}
              onChange={handleQueryChange}
              aria-label="Search films"
            />
            {query && (
              <button className={styles.clearBtn} onClick={() => { setQuery(""); setPage(1); }} aria-label="Clear search">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Genre pills */}
        <div className={styles.genreFilters}>
          {genres.map((g) => (
            <button
              key={g.id}
              className={`${styles.pill} ${selectedGenre === g.id ? styles.pillActive : ""}`}
              onClick={() => handleGenreClick(g.id)}
              aria-pressed={selectedGenre === g.id}
            >
              {g.name}
            </button>
          ))}
        </div>

        <div className={styles.strip} style={{ paddingBottom: 10 }}>
          {HOLES.map((_, i) => <div key={i} className={styles.hole} />)}
        </div>
      </header>

      {/* Main */}
      <main className={styles.main}>
        {error && <p className={styles.errorText}>{error}</p>}

        {loading ? (
          <div className={styles.loadingState}>
            <Film size={36} style={{ color: "#c9a84c", opacity: 0.5 }} />
            <p className={styles.loadingText}>Loading the reel…</p>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Prev
                </button>
                <span className={styles.pageCount}>{page} / {totalPages}</span>
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default HomePage;
