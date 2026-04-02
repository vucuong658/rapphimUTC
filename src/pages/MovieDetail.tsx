import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Clock, Calendar, Ticket, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../constants';

const MovieDetail = () => {
  // Lấy ID bộ phim từ thanh địa chỉ URL (ví dụ: /movie/P001 thì id = 'P001')
  const { id } = useParams();

  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/phim/${id}`);
        if (res.ok) {
          const data = await res.json();
          // Map dữ liệu từ SQL Server sang Frontend
          setMovie({
            id: data.id || data.maPhim,
            title: data.tenPhim || 'Đang cập nhật',
            genre: data.theLoai || data.NgonNgu || 'Hành động', // Tạm dùng ngôn ngữ nếu thiếu thể loại
            description: data.moTa || 'Chưa có thông tin mô tả chi tiết cho bộ phim này.',
            posterUrl: data.poster || data.Poster || 'https://picsum.photos/seed/poster/400/600',
            // Dùng tạm poster làm ảnh bìa nếu DB không có cột Banner
            backdropUrl: data.poster || data.Poster || 'https://picsum.photos/seed/bg/1920/1080',
            duration: data.thoiLuong || 120, // Mặc định 120 phút nếu thiếu
            releaseDate: data.ngayKhoiChieu || 'Sắp chiếu',
            status: data.trangThai || 'Đang chiếu',
          });
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết phim:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMovieDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-gold text-xl animate-pulse">Đang tải thông tin phim...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] text-white">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy bộ phim này!</h2>
        <Link to="/" className="text-gold hover:underline flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
      {/* Ảnh bìa to (Backdrop) */}
      <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0">
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover opacity-40 blur-sm"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
        </div>
      </div>

      {/* Nội dung chi tiết phim */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-64 relative z-10">
        <div className="flex flex-col md:flex-row gap-12">

          {/* Cột trái: Ảnh Poster */}
          <div className="w-64 md:w-80 flex-shrink-0 mx-auto md:mx-0">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-gold/20 border border-white/10">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Cột phải: Thông tin */}
          <div className="flex-1 pt-8 md:pt-16">
            <h1 className="text-5xl font-bold font-serif italic mb-4 drop-shadow-lg text-white">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-white/70 mb-8">
              <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <Clock className="w-4 h-4 text-gold" /> {movie.duration} Phút
              </span>
              <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <Calendar className="w-4 h-4 text-gold" /> {movie.releaseDate}
              </span>
              <span className="bg-gold/20 text-gold font-semibold px-3 py-1.5 rounded-full border border-gold/30">
                {movie.genre}
              </span>
            </div>

            <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-3xl">
              {movie.description}
            </p>

            <div className="flex items-center gap-6">
              {/* Nút Đặt Vé - Sẽ dẫn sang trang chọn suất chiếu */}
              <Link
                to={`/booking/${movie.id}`}
                className="bg-gold text-black font-bold flex items-center gap-2 px-10 py-4 rounded-lg hover:bg-white transition-all transform hover:scale-105"
              >
                <Ticket className="w-6 h-6" />
                Mua Vé Ngay
              </Link>

              <button className="flex items-center gap-2 px-8 py-4 rounded-lg border-2 border-white/20 hover:border-white hover:bg-white/10 transition-all text-white font-semibold">
                <Play className="w-5 h-5" />
                Xem Trailer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;