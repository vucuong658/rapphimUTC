import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { API_BASE_URL } from '../constants';

const Home = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/phim`);

        // CÁCH ĐỌC AN TOÀN: Lấy nội dung dạng chữ gốc ra trước
        const text = await res.text();

        try {
          // Cố gắng ép thành JSON
          const data = JSON.parse(text);

          if (res.ok) {
            const formattedMovies = data.map((item: any) => ({
              id: item.id || item.maPhim,
              title: item.tenPhim || 'Chưa có tên',
              genre: item.theLoai || 'Hành động',
              description: item.moTa || 'Chưa có mô tả',
              posterUrl: item.poster || item.Poster || 'https://picsum.photos/seed/poster/400/600',
              backdropUrl: item.banner || 'https://picsum.photos/seed/bg/1920/1080',
              status: item.trangThai || 'Now Showing',
            }));
            setMovies(formattedMovies);
          }
        } catch (e) {
          // Nếu Backend không trả JSON (mà trả HTML báo lỗi 403, 404, 500...)
          console.error("Backend không trả về JSON hợp lệ. Nội dung trả về là:", text.substring(0, 100) + "...");
        }

      } catch (error) {
        console.error("Lỗi không thể kết nối tới Backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const featuredMovies = movies.filter(
    m => m.status === 'Now Showing' || m.status === 'Đang chiếu'
  ).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-gold text-xl animate-pulse">Đang tải dữ liệu phim từ máy chủ...</div>
      </div>
    );
  }

  if (movies.length === 0 || featuredMovies.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] text-white/50">
        <p className="text-xl mb-4">Hiện chưa có bộ phim nào trên hệ thống.</p>
        <Link to="/admin" className="text-gold font-bold hover:underline">Vào trang Quản trị để thêm phim</Link>
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
            key={activeSlide}
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
              <button className="btn-outline flex items-center gap-2 px-8 py-3">
                Watch Trailer
              </button>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4">
          {featuredMovies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === idx ? "w-12 bg-gold" : "w-4 bg-white/20"}`}
            />
          ))}
        </div>
      </section>

      <div className="px-6 lg:px-12 mt-12 space-y-16">
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold border-l-4 border-gold pl-4 text-white">Now Showing</h2>
            <Link to="/movies" className="text-gold text-sm hover:underline">See All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.filter(m => m.status === 'Now Showing' || m.status === 'Đang chiếu').map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold border-l-4 border-gold pl-4 text-white/60">Coming Soon</h2>
            <Link to="/movies" className="text-gold text-sm hover:underline">See All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 opacity-80">
            {movies.filter(m => m.status === 'Coming Soon' || m.status === 'Sắp chiếu').map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const MovieCard = ({ movie }: { movie: any, key?: any }) => (
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

export default Home;