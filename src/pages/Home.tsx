import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { motion } from 'motion/react';
import { API_BASE_URL } from '../constants';

type MovieItem = {
  id: string;
  title: string;
  genre: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  status: string;
};

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const featuredMovies = useMemo(
    () => movies.filter((movie) => movie.status === 'Now Showing' || movie.status === 'Dang chieu').slice(0, 3),
    [movies],
  );

  useEffect(() => {
    void loadMovies();
  }, []);

  async function loadMovies() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/phim`);
      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || `Loi ${response.status}`);
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error('Backend khong tra ve danh sach phim hop le.');
      }

      const source = Array.isArray(parsed) ? parsed : [];
      const formattedMovies = source.map((item: any) => ({
        id: String(item.id || item.maPhim || ''),
        title: item.tenPhim || 'Chua co ten',
        genre: Array.isArray(item.theLoais) ? item.theLoais.join(' | ') : item.theLoai || 'Dang cap nhat',
        description: item.moTa || 'Chua co mo ta',
        posterUrl: item.poster || item.Poster || 'https://picsum.photos/seed/poster/400/600',
        backdropUrl: item.banner || item.poster || 'https://picsum.photos/seed/bg/1920/1080',
        status: normalizeStatus(item.trangThai),
      }));

      setMovies(formattedMovies.filter((movie) => movie.id));
    } catch (loadError) {
      console.error('Khong the tai danh sach phim:', loadError);
      setMovies([]);
      setError(getErrorMessage(loadError, 'Khong the ket noi den may chu Backend.'));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-gold text-xl animate-pulse">Dang tai du lieu phim tu may chu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] px-6 text-center text-white/70">
        <p className="text-2xl font-semibold text-white">Khong the tai du lieu trang chu</p>
        <p className="mt-4 max-w-xl text-base text-white/50">{error}</p>
        <button type="button" onClick={() => void loadMovies()} className="btn-gold mt-8 px-6 py-3 text-sm">
          Thu lai
        </button>
      </div>
    );
  }

  if (movies.length === 0 || featuredMovies.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] text-white/50">
        <p className="text-xl mb-4">Hien chua co bo phim nao tren he thong.</p>
        <Link to="/admin" className="text-gold font-bold hover:underline">
          Vao trang Quan tri de them phim
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <section className="relative h-[85vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={featuredMovies[activeSlide]?.backdropUrl}
            alt={featuredMovies[activeSlide]?.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/40 to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-center px-12 lg:px-24">
          <motion.div
            key={featuredMovies[activeSlide]?.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl"
          >
            <h1 className="text-6xl font-bold mb-4 font-serif italic text-white drop-shadow-lg">
              {featuredMovies[activeSlide]?.title}
            </h1>
            <p className="text-white/80 text-lg mb-8 line-clamp-3">
              {featuredMovies[activeSlide]?.description}
            </p>
            <div className="flex items-center gap-4">
              <Link to={`/movie/${featuredMovies[activeSlide]?.id}`} className="btn-gold flex items-center gap-2 px-8 py-3">
                <Play className="w-5 h-5 fill-current" />
                Book Now
              </Link>
              <Link to="/booking" className="btn-outline flex items-center gap-2 px-8 py-3">
                Chon lich chieu
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4">
          {featuredMovies.map((movie, idx) => (
            <button
              key={movie.id}
              type="button"
              onClick={() => setActiveSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === idx ? 'w-12 bg-gold' : 'w-4 bg-white/20'}`}
            />
          ))}
        </div>
      </section>

      <div className="px-6 lg:px-12 mt-12 space-y-16">
        <MovieSection
          title="Now Showing"
          titleClassName="text-white"
          items={movies.filter((movie) => movie.status === 'Now Showing' || movie.status === 'Dang chieu')}
        />

        <MovieSection
          title="Coming Soon"
          titleClassName="text-white/60"
          sectionClassName="opacity-80"
          items={movies.filter((movie) => movie.status === 'Coming Soon' || movie.status === 'Sap chieu')}
        />
      </div>
    </div>
  );
}

function MovieSection({
  title,
  titleClassName,
  items,
  sectionClassName,
}: {
  title: string;
  titleClassName?: string;
  items: MovieItem[];
  sectionClassName?: string;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className={`text-2xl font-bold border-l-4 border-gold pl-4 ${titleClassName || ''}`}>{title}</h2>
        <Link to="/booking" className="text-gold text-sm hover:underline">
          See All
        </Link>
      </div>
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 ${sectionClassName || ''}`}>
        {items.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}

function MovieCard({ movie }: { movie: MovieItem }) {
  return (
    <Link to={`/movie/${movie.id}`} className="group">
      <div className="relative aspect-2/3 rounded-xl overflow-hidden mb-4 border border-white/5 group-hover:border-gold/50 transition-all duration-300">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
          <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mb-4">
            <Play className="text-black w-6 h-6 fill-current" />
          </div>
          <span className="text-sm font-semibold text-white">Book Now</span>
        </div>
      </div>
      <h3 className="font-bold text-lg group-hover:text-gold transition-colors truncate text-white">{movie.title}</h3>
      <p className="text-xs text-white/40">{movie.genre}</p>
    </Link>
  );
}

function normalizeStatus(value?: string) {
  if (!value) {
    return 'Now Showing';
  }

  const trimmed = String(value).trim().toLowerCase();
  if (trimmed === 'đang chiếu' || trimmed === 'dang chieu') {
    return 'Dang chieu';
  }
  if (trimmed === 'sắp chiếu' || trimmed === 'sap chieu') {
    return 'Sap chieu';
  }
  return value;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    if (error.message.includes('Failed to fetch')) {
      return 'Khong the ket noi den may chu Backend. Hay kiem tra backend localhost:8080.';
    }
    return error.message;
  }

  return fallback;
}
