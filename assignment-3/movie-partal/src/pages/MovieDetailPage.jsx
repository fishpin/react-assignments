import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { Star, Calendar, Clock, X, Film } from "lucide-react";
import styles from "./MovieDetailPage.module.css";

const API_KEY = import.meta.env.VITE_TMDB_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP = "https://image.tmdb.org/t/p/w1280";

function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Use append_to_response to fetch movie + credits in a single call
  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(
          `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits`
        );
        if (!res.ok) throw new Error("Failed to load movie details.");
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  const director = movie?.credits?.crew?.find((c) => c.job === "Director");
  const cast = movie?.credits?.cast?.slice(0, 7) ?? [];

  const content = (
    <div className={styles.overlay} onClick={() => navigate("/movies")}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>

        {/* Backdrop */}
        {movie?.backdrop_path && (
          <div className={styles.backdropWrap}>
            <img
              src={`${TMDB_BACKDROP}${movie.backdrop_path}`}
              alt=""
              className={styles.backdropImg}
            />
            <div className={styles.backdropGradient} />
          </div>
        )}

        {/* Close button */}
        <button className={styles.closeBtn} onClick={() => navigate("/movies")}>
          <X size={15} />
        </button>

        {loading && (
          <div className={styles.loadingState}>
            <Film size={36} style={{ color: "#c9a84c", opacity: 0.5 }} />
            <p className={styles.loadingText}>Loading the reel…</p>
          </div>
        )}

        {error && <p className={styles.errorText}>{error}</p>}

        {movie && (
          <div
            className={styles.body}
            style={{ marginTop: movie.backdrop_path ? -72 : 0 }}
          >
            {/* Poster */}
            {movie.poster_path && (
              <img
                src={`${TMDB_IMAGE}${movie.poster_path}`}
                alt={movie.title}
                className={styles.poster}
              />
            )}

            {/* Info */}
            <div className={styles.info}>
              <h2 className={styles.title}>{movie.title}</h2>

              {movie.tagline && (
                <p className={styles.tagline}>"{movie.tagline}"</p>
              )}

              <div className={styles.metaRow}>
                <span className={styles.metaItem}>
                  <Star size={13} fill="#c9a84c" color="#c9a84c" />
                  {movie.vote_average?.toFixed(1)} / 10
                </span>
                <span className={styles.metaItem}>
                  <Calendar size={13} color="#c9a84c" />
                  {movie.release_date?.slice(0, 4)}
                </span>
                {movie.runtime && (
                  <span className={styles.metaItem}>
                    <Clock size={13} color="#c9a84c" />
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </span>
                )}
              </div>

              {movie.genres?.length > 0 && (
                <div className={styles.genreTags}>
                  {movie.genres.map((g) => (
                    <span key={g.id} className={styles.genreTag}>{g.name}</span>
                  ))}
                </div>
              )}

              <p className={styles.overview}>
                {movie.overview || "No overview available."}
              </p>

              {cast.length > 0 && (
                <>
                  <div className={styles.sectionLabel}>Featuring</div>
                  <div className={styles.castList}>
                    {cast.map((a, i) => (
                      <span
                        key={a.id}
                        className={styles.castMember}
                        style={{
                          borderRight: i < cast.length - 1 ? "1px solid rgba(201,168,76,0.18)" : "none",
                          paddingRight: i < cast.length - 1 ? 10 : 0,
                        }}
                      >
                        {a.name}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {director && (
                <>
                  <div className={styles.sectionLabel}>Directed by</div>
                  <span className={styles.directorName}>{director.name}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render into document.body via a Portal
  return createPortal(content, document.body);
}

export default MovieDetailPage;
