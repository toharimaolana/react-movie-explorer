import { useState, useEffect, useRef } from "react";
import { getMovieList, searchMovie } from "./api";

const MovieCard = ({ movie }) => {
  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  return (
    <article className="relative bg-gradient-to-b from-gray-800/60 to-gray-900 rounded-2xl overflow-hidden shadow-xl transform transition duration-300 hover:-translate-y-1 hover:scale-[1.02]">
      <div className="relative w-full h-80 bg-gray-700">
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Poster
          </div>
        )}

        {/* gradient overlay for readable text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {/* rating badge */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-300 text-sm font-semibold backdrop-blur">
          ⭐ {movie.vote_average ?? "—"}
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-base sm:text-lg font-semibold text-white truncate">
          {movie.title}
        </h3>
        <p className="text-xs text-gray-400 mt-1">{movie.release_date || "—"}</p>
        <p className="mt-3 text-sm text-gray-300 line-clamp-3">
          {movie.overview || "No description available."}
        </p>
      </div>
    </article>
  );
};

const SkeletonCard = () => (
  <div className="animate-pulse bg-gray-800 rounded-2xl overflow-hidden">
    <div className="h-72 bg-gray-700" />
    <div className="p-4">
      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-700 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-700 rounded w-full" />
    </div>
  </div>
);

export default function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchTimer = useRef(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getMovieList()
      .then((res) => {
        if (!mounted) return;
        setMovies(res || []);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setError("Failed to load movies. Try again later.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const onSearchChange = (q) => {
    setError("");
    // debounce 500ms
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      if (!q || q.trim().length < 3) {
        // if search cleared or too short, reload popular (or keep current)
        setLoading(true);
        try {
          const res = await getMovieList();
          setMovies(res || []);
        } catch {
          setError("Failed to load movies.");
        } finally {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const res = await searchMovie(q.trim());
        setMovies(res || []);
      } catch {
        setError("Search failed. Try again.");
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-900 text-white">
      <header className="max-w-6xl mx-auto px-6 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-yellow-400">
              🎬 Movie Kesayangan Ku
            </h1>
            <p className="text-sm md:text-base text-gray-400 mt-1">
              Explore popular movies from TMDb — dark modern UI
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs text-gray-400">Sort</span>
            <select className="bg-gray-800 text-sm text-gray-200 px-3 py-2 rounded-md border border-gray-700 focus:outline-none">
              <option value="popular">Most Popular</option>
              <option value="top_rated">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="mt-6 max-w-xl">
          <label className="relative block">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              🔎
            </span>
            <input
              type="text"
              onChange={({ target }) => onSearchChange(target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-800 border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
              placeholder="Search movies (type 3+ chars)..."
            />
          </label>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 rounded-lg p-4 bg-red-900/60 text-red-300 border border-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-2xl text-gray-400 mb-4">No movies found</div>
            <p className="text-sm text-gray-500 max-w-xl text-center">
              Try another search term or refresh the page to see popular movies.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-gray-500 text-sm">
        Built with ❤ •  sitohari
      </footer>
    </div>
  );
}
