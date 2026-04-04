import { useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  Clock3,
  Film,
  Globe,
  MapPin,
  MonitorPlay,
  Play,
  Ticket,
  type LucideIcon,
} from 'lucide-react';
import { API_BASE_URL } from '../constants';

const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

type ApiMovie = {
  id?: string;
  maPhim?: string;
  tenPhim?: string;
  moTa?: string;
  poster?: string;
  Poster?: string;
  banner?: string;
  trailerUrl?: string;
  trailer?: string;
  theLoais?: string[];
  theLoai?: string | string[];
  thoiLuong?: number | string;
  ngayKhoiChieu?: string;
  doTuoiPhuHop?: string;
  ngonNgu?: string;
  trangThai?: string;
};

type ApiShowtime = {
  maSuat: string;
  maPhim?: string;
  ngayChieu: string;
  gioChieu: string;
  maRap: string;
  tenRap?: string;
  tenPhong?: string;
  gia?: number;
};

type ApiShowtimeDetail = ApiShowtime & {
  tongGhe?: number | null;
  soGheTrong?: number | null;
  tenLoaiPhong?: string | null;
};

type ShowtimeGroup = {
  ngayChieu: string;
  maRap: string;
  tenRap: string;
  details: ApiShowtimeDetail[];
};

type MovieViewModel = {
  id: string;
  title: string;
  summary: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string | null;
  genres: string[];
  durationText: string;
  releaseText: string;
  ageText: string;
  basicInfo: string;
  extraInfo: string;
  language: string;
  status: string;
};

type BookingLinkState = {
  movie: {
    id: string;
    title: string;
    posterUrl: string;
    backdropUrl: string;
  };
  showtime: {
    id: string;
    cinema: string;
    room: string;
    dateLabel: string;
    timeLabel: string;
    format: string;
    seatsText: string;
    price: number;
  };
};

export default function ChiTietPhimPage() {
  const { id } = useParams<{ id: string }>();

  const [movie, setMovie] = useState<MovieViewModel | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [showtimeLoading, setShowtimeLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [showtimeError, setShowtimeError] = useState<string | null>(null);
  const [showtimeGroups, setShowtimeGroups] = useState<ShowtimeGroup[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadPage = async () => {
      if (!id) {
        setPageError('Không tìm thấy mã phim trên URL.');
        setPageLoading(false);
        setShowtimeLoading(false);
        return;
      }

      setPageLoading(true);
      setShowtimeLoading(true);
      setPageError(null);
      setShowtimeError(null);
      setShowtimeGroups([]);

      try {
        const movieData = await apiFetch<ApiMovie>(`/phim/${id}`);
        if (cancelled) {
          return;
        }

        const normalizedMovie = normalizeMovie(movieData, id);
        setMovie(normalizedMovie);
        document.title = `UTC Cinema - ${normalizedMovie.title}`;
        setPageLoading(false);

        try {
          const allShowtimes = await apiFetch<ApiShowtime[]>('/suat-chieu');
          const grouped = await buildShowtimeGroups(id, allShowtimes ?? []);

          if (cancelled) {
            return;
          }

          setShowtimeGroups(grouped);
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.error(error);
          setShowtimeError('Không thể tải lịch chiếu lúc này.');
        } finally {
          if (!cancelled) {
            setShowtimeLoading(false);
          }
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);
        setMovie(null);
        setPageError(getErrorMessage(error, 'Không thể tải dữ liệu phim.'));
        setPageLoading(false);
        setShowtimeLoading(false);
      }
    };

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!movie) {
      document.title = 'UTC Cinema - Chi tiết phim';
    }
  }, [movie]);

  const trailerEmbedUrl = movie ? buildYoutubeEmbedUrl(movie.trailerUrl) : null;

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#050505] px-6 pt-28 text-white">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div className="h-5 w-40 rounded-full bg-white/10" />
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="aspect-[2/3] rounded-[2rem] bg-white/10" />
            <div className="space-y-5">
              <div className="h-6 w-28 rounded-full bg-gold/20" />
              <div className="h-16 w-full max-w-3xl rounded-3xl bg-white/10" />
              <div className="flex flex-wrap gap-3">
                <div className="h-10 w-36 rounded-full bg-white/10" />
                <div className="h-10 w-40 rounded-full bg-white/10" />
                <div className="h-10 w-28 rounded-full bg-white/10" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full rounded-full bg-white/10" />
                <div className="h-4 w-full rounded-full bg-white/10" />
                <div className="h-4 w-4/5 rounded-full bg-white/10" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-28 rounded-3xl bg-white/10" />
                <div className="h-28 rounded-3xl bg-white/10" />
                <div className="h-28 rounded-3xl bg-white/10" />
                <div className="h-28 rounded-3xl bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie || pageError) {
    return (
      <div className="min-h-screen bg-[#050505] px-6 pt-28 text-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center rounded-[2rem] border border-red-500/20 bg-white/5 px-8 py-16 text-center shadow-[0_0_60px_rgba(0,0,0,0.35)]">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-300">
            <CircleAlert className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-white">Không tải được phim</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/65">
            {pageError || 'Dữ liệu phim hiện không khả dụng. Vui lòng thử lại sau.'}
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold px-6 py-3 font-semibold text-black transition hover:bg-gold-light"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className="h-full w-full scale-105 object-cover opacity-25 blur-sm"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_28%),linear-gradient(180deg,rgba(5,5,5,0.3)_0%,rgba(5,5,5,0.88)_45%,#050505_100%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-28 lg:px-12">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách phim
          </Link>

          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="mx-auto w-full max-w-[320px]">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="aspect-[2/3] w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={scrollToShowtimes}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gold px-5 py-4 text-base font-semibold text-black transition hover:bg-gold-light"
                >
                  <Ticket className="h-5 w-5" />
                  Đặt vé ngay
                </button>

                <button
                  type="button"
                  onClick={scrollToTrailer}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-base font-semibold text-white transition hover:border-gold/40 hover:bg-white/10"
                >
                  <Play className="h-5 w-5 text-gold" />
                  Xem trailer
                </button>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-gold">
                  {movie.status}
                </span>

                {movie.ageText !== 'Đang cập nhật' && (
                  <span className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white/75">
                    {movie.ageText}
                  </span>
                )}
              </div>

              <h1 className="max-w-4xl font-serif text-4xl font-bold italic leading-tight text-white md:text-5xl xl:text-6xl">
                {movie.title}
              </h1>

              <div className="mt-6 flex flex-wrap gap-3">
                <MetaPill icon={Clock3} value={movie.durationText} />
                <MetaPill icon={CalendarDays} value={movie.releaseText} />
                <MetaPill icon={Globe} value={movie.language} />
                {movie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-sm font-medium text-gold"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <p className="mt-8 max-w-4xl text-base leading-8 text-white/72 md:text-lg">
                {movie.summary}
              </p>

              <div className="mt-10 grid gap-4 md:grid-cols-2">
                <InfoCard icon={Film} label="Thông tin cơ bản" value={movie.basicInfo} />
                <InfoCard icon={Globe} label="Chi tiết" value={movie.extraInfo} />
                <InfoCard icon={CalendarDays} label="Ngày phát hành" value={movie.releaseText} />
                <InfoCard icon={MonitorPlay} label="Tình trạng" value={movie.status} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="trailerSection" className="mx-auto max-w-7xl px-6 py-14 lg:px-12">
        <SectionHeading
          eyebrow="Trailer"
          title="Xem trước bộ phim"
          description="Giữ nguyên trải nghiệm trailer như trang cũ, nhưng giao diện được đồng bộ theo tông tối và điểm nhấn vàng của project TSX."
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="glass-card overflow-hidden border-white/10 bg-[#111111] shadow-[0_22px_80px_rgba(0,0,0,0.35)]">
            <div className="aspect-video w-full">
              {trailerEmbedUrl ? (
                <iframe
                  src={trailerEmbedUrl}
                  title={`Trailer ${movie.title}`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  loading="lazy"
                  allowFullScreen
                />
              ) : (
                <TrailerFallback movie={movie} />
              )}
            </div>
          </div>

          <aside className="glass-card flex flex-col gap-4 border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <img
                src={movie.posterUrl}
                alt={`${movie.title} trailer`}
                className="aspect-video w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gold/70">Preview Card</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{movie.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/60">
                {trailerEmbedUrl
                  ? 'Trailer được nhúng trực tiếp để người dùng không phải rời khỏi trang.'
                  : movie.trailerUrl
                    ? 'Nguồn trailer hiện không hỗ trợ nhúng. Bạn vẫn có thể mở liên kết gốc.'
                    : 'Bộ phim này hiện chưa có trailer công khai.'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/60">
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="h-4 w-4 text-gold" />
                <span>Đi tới phần lịch chiếu để chọn rạp và suất phù hợp.</span>
              </div>
            </div>

            {movie.trailerUrl && !trailerEmbedUrl && (
              <a
                href={movie.trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold transition hover:bg-gold hover:text-black"
              >
                <Play className="h-4 w-4" />
                Mở trailer gốc
              </a>
            )}
          </aside>
        </div>
      </section>

      <section
        id="showtimeSection"
        className="border-t border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] py-14"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeading
            eyebrow="Lịch chiếu"
            title="Chọn rạp và suất chiếu"
            description="Nhóm theo ngày và rạp giống trang cũ. Mỗi suất vẫn dẫn thẳng sang luồng đặt vé."
          />

          {showtimeLoading ? (
            <div className="grid gap-5">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="glass-card animate-pulse border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]"
                >
                  <div className="mb-5 h-6 w-56 rounded-full bg-white/10" />
                  <div className="mb-8 h-4 w-80 max-w-full rounded-full bg-white/10" />
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((__, cardIndex) => (
                      <div key={cardIndex} className="h-32 rounded-3xl bg-white/10" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : showtimeError ? (
            <EmptyState
              title="Không thể tải lịch chiếu"
              message={showtimeError}
              icon={<CircleAlert className="h-7 w-7" />}
            />
          ) : showtimeGroups.length === 0 ? (
            <EmptyState
              title="Hiện chưa có suất chiếu khả dụng"
              message="Bộ phim này chưa có lịch chiếu mở bán hoặc các suất trong ngày đã hết hạn."
              icon={<Ticket className="h-7 w-7" />}
            />
          ) : (
            <div className="space-y-6">
              {showtimeGroups.map((group) => (
                <div
                  key={`${group.ngayChieu}-${group.maRap}`}
                  className="glass-card border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]"
                >
                  <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-gold/65">Cinema</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{group.tenRap}</h3>
                      <p className="mt-2 text-sm text-white/55">{formatDate(group.ngayChieu)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm text-white/55">
                      {buildMetaParts(group.details, movie).map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {group.details.map((detail) => {
                      const seatsText = getSeatsText(detail);
                      const bookingState: BookingLinkState = {
                        movie: {
                          id: movie.id,
                          title: movie.title,
                          posterUrl: movie.posterUrl,
                          backdropUrl: movie.backdropUrl,
                        },
                        showtime: {
                          id: detail.maSuat,
                          cinema: group.tenRap,
                          room: detail.tenPhong || 'Phòng chiếu',
                          dateLabel: formatDate(group.ngayChieu),
                          timeLabel: formatTime(detail.gioChieu),
                          format: detail.tenLoaiPhong || '2D',
                          seatsText,
                          price: Number(detail.gia || 0),
                        },
                      };

                      return (
                        <Link
                          key={detail.maSuat}
                          to={`/booking/${encodeURIComponent(detail.maSuat)}`}
                          state={bookingState}
                          className="group rounded-[1.5rem] border border-white/10 bg-black/25 p-4 transition hover:border-gold/35 hover:bg-black/40"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-white/35">Phòng</p>
                              <h4 className="mt-2 text-lg font-semibold text-white group-hover:text-gold">
                                {detail.tenPhong || 'Phòng chiếu'}
                              </h4>
                            </div>
                            <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                              {detail.tenLoaiPhong || '2D'}
                            </span>
                          </div>

                          <div className="mt-6 flex items-end justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-white/35">Giờ chiếu</p>
                              <div className="mt-2 text-3xl font-bold text-white">{formatTime(detail.gioChieu)}</div>
                            </div>

                            {detail.gia ? (
                              <div className="text-right">
                                <p className="text-xs uppercase tracking-[0.18em] text-white/35">Giá từ</p>
                                <div className="mt-2 text-sm font-semibold text-gold">{formatCurrency(detail.gia)}</div>
                              </div>
                            ) : null}
                          </div>

                          <div className="mt-5 grid gap-2 text-sm text-white/60">
                            <div className="flex items-center gap-2">
                              <MonitorPlay className="h-4 w-4 text-gold" />
                              <span>{group.tenRap}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Ticket className="h-4 w-4 text-gold" />
                              <span>{seatsText}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MetaPill({
  icon: Icon,
  value,
}: {
  icon: LucideIcon;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white/75">
      <Icon className="h-4 w-4 text-gold" />
      {value}
    </span>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-card rounded-[1.5rem] border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/10 text-gold">
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-xs uppercase tracking-[0.22em] text-white/45">{label}</p>
      </div>
      <p className="mt-4 text-base leading-7 text-white/75">{value}</p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="text-xs uppercase tracking-[0.28em] text-gold/65">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-3xl font-bold text-white md:text-4xl">{title}</h2>
      <p className="mt-3 text-base leading-7 text-white/55">{description}</p>
    </div>
  );
}

function TrailerFallback({ movie }: { movie: MovieViewModel }) {
  return (
    <div className="relative flex h-full min-h-[280px] items-center justify-center overflow-hidden bg-[#101010]">
      <img
        src={movie.posterUrl}
        alt={movie.title}
        className="absolute inset-0 h-full w-full object-cover opacity-30"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.35)_0%,rgba(5,5,5,0.88)_100%)]" />
      <div className="relative z-10 flex max-w-md flex-col items-center px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-gold">
          <Play className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-semibold text-white">
          {movie.trailerUrl ? 'Không thể nhúng trailer' : 'Trailer đang được cập nhật'}
        </h3>
        <p className="mt-3 text-sm leading-7 text-white/60">
          {movie.trailerUrl
            ? 'Nguồn video hiện không hỗ trợ xem trực tiếp trong khung nhúng.'
            : 'Hiện chưa có đường dẫn trailer khả dụng cho bộ phim này.'}
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  message,
  icon,
}: {
  title: string;
  message: string;
  icon: ReactNode;
}) {
  return (
    <div className="glass-card flex flex-col items-center rounded-[2rem] border-white/10 bg-white/5 px-8 py-16 text-center shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-3 max-w-xl text-sm leading-7 text-white/55">{message}</p>
    </div>
  );
}

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    if (contentType.includes('application/json')) {
      const payload = await response.json();
      throw new Error(payload?.message || payload?.error || `Lỗi ${response.status}`);
    }

    const text = await response.text();
    throw new Error(text || `Lỗi ${response.status}`);
  }

  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return null as T;
}

function normalizeMovie(movie: ApiMovie, fallbackId: string): MovieViewModel {
  const genres = getGenres(movie);
  const poster = movie.poster || movie.Poster || '';
  const posterUrl = getPosterUrlSafe(poster);
  const durationText = movie.thoiLuong ? `${movie.thoiLuong} phút` : 'Đang cập nhật';
  const releaseText = movie.ngayKhoiChieu ? formatDate(movie.ngayKhoiChieu) : 'Đang cập nhật';
  const ageText = movie.doTuoiPhuHop ? `[Trong nước] (${movie.doTuoiPhuHop})` : 'Đang cập nhật';
  const basicInfo = `${genres.length ? genres.join(', ') : 'Đang cập nhật'} (${durationText})`;
  const language = movie.ngonNgu || 'Đang cập nhật';
  const extraInfo = [
    movie.ngonNgu ? `Ngôn ngữ: ${movie.ngonNgu}` : null,
    genres.length ? `Thể loại: ${genres.join(' | ')}` : null,
  ]
    .filter(Boolean)
    .join(' | ') || 'Đang cập nhật';

  return {
    id: movie.id || movie.maPhim || fallbackId,
    title: movie.tenPhim || 'Đang cập nhật',
    summary: movie.moTa || 'Chưa có mô tả phim.',
    posterUrl,
    backdropUrl: getPosterUrlSafe(movie.banner || poster),
    trailerUrl: movie.trailerUrl || movie.trailer || null,
    genres: genres.length ? genres : ['Đang cập nhật'],
    durationText,
    releaseText,
    ageText,
    basicInfo,
    extraInfo,
    language,
    status: movie.trangThai || 'Đang chiếu',
  };
}

function getGenres(movie: ApiMovie): string[] {
  if (Array.isArray(movie.theLoais)) {
    return movie.theLoais.filter(Boolean);
  }

  if (Array.isArray(movie.theLoai)) {
    return movie.theLoai.filter(Boolean);
  }

  if (typeof movie.theLoai === 'string' && movie.theLoai.trim()) {
    return movie.theLoai
      .split(/[,|]/)
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return [];
}

async function buildShowtimeGroups(
  movieId: string,
  allShowtimes: ApiShowtime[],
): Promise<ShowtimeGroup[]> {
  const movieShowtimes = Array.isArray(allShowtimes)
    ? allShowtimes
        .filter((showtime) => String(showtime.maPhim || '') === String(movieId) && !isExpiredShowtime(showtime))
        .sort(compareShowtimes)
    : [];

  if (!movieShowtimes.length) {
    return [];
  }

  const grouped = groupShowtimes(movieShowtimes);
  const resolvedGroups = await Promise.all(
    grouped.map(async (group) => ({
      ...group,
      details: await fetchShowtimeDetails(movieId, group),
    })),
  );

  return resolvedGroups.map((group) => ({
    ...group,
    details: [...group.details].sort((left, right) =>
      String(left.gioChieu || '').localeCompare(String(right.gioChieu || '')),
    ),
  }));
}

function groupShowtimes(showtimes: ApiShowtime[]) {
  const groups = new Map<string, Omit<ShowtimeGroup, 'details'> & { items: ApiShowtime[] }>();

  showtimes.forEach((showtime) => {
    const key = `${showtime.ngayChieu}|${showtime.maRap}|${showtime.tenRap || 'Rạp chiếu'}`;

    if (!groups.has(key)) {
      groups.set(key, {
        ngayChieu: showtime.ngayChieu,
        maRap: showtime.maRap,
        tenRap: showtime.tenRap || 'Rạp chiếu',
        items: [],
      });
    }

    groups.get(key)?.items.push(showtime);
  });

  return [...groups.values()].sort((left, right) => compareShowtimes(left.items[0], right.items[0]));
}

async function fetchShowtimeDetails(
  movieId: string,
  group: ReturnType<typeof groupShowtimes>[number],
): Promise<ApiShowtimeDetail[]> {
  try {
    const result = await apiFetch<ApiShowtimeDetail[] | ApiShowtimeDetail>(
      `/suat-chieu/tim-suat?maPhim=${encodeURIComponent(movieId)}&maRap=${encodeURIComponent(group.maRap)}&ngay=${encodeURIComponent(group.ngayChieu)}`,
    );

    if (Array.isArray(result)) {
      return result;
    }

    return result ? [result] : [];
  } catch (error) {
    console.error(error);
    return group.items.map((item) => ({
      ...item,
      tongGhe: null,
      soGheTrong: null,
      tenLoaiPhong: null,
    }));
  }
}

function buildMetaParts(details: ApiShowtimeDetail[], movie: MovieViewModel) {
  const formats = [...new Set(details.map((detail) => detail.tenLoaiPhong).filter(Boolean))];

  return [
    formats.length ? formats.join(' | ') : '2D',
    movie.language,
    movie.genres.join(' | '),
  ];
}

function getSeatsText(detail: ApiShowtimeDetail) {
  if (detail.tongGhe != null && detail.soGheTrong != null) {
    return `${detail.soGheTrong} / ${detail.tongGhe} ghế trống`;
  }

  return 'Còn vé';
}

function getPosterUrlSafe(poster?: string | null) {
  const cleanPoster = String(poster || '').trim();

  if (!cleanPoster) {
    return `${BACKEND_BASE_URL}/poster/default.jpg`;
  }

  if (cleanPoster.startsWith('http://') || cleanPoster.startsWith('https://')) {
    return cleanPoster;
  }

  if (cleanPoster.startsWith('/')) {
    return `${BACKEND_BASE_URL}${cleanPoster}`;
  }

  return `${BACKEND_BASE_URL}/poster/${cleanPoster}`;
}

function buildYoutubeEmbedUrl(url?: string | null) {
  const rawUrl = String(url || '').trim();

  if (!rawUrl) {
    return null;
  }

  if (rawUrl.includes('youtube-nocookie.com/embed/')) {
    return appendYoutubeParams(rawUrl);
  }

  if (rawUrl.includes('youtube.com/embed/')) {
    return appendYoutubeParams(rawUrl.replace('youtube.com/embed/', 'youtube-nocookie.com/embed/'));
  }

  const videoId = getYoutubeId(rawUrl);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1` : null;
}

function getYoutubeId(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const shortId = parsed.pathname.replaceAll('/', '');
      return shortId.length === 11 ? shortId : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const watchId = parsed.searchParams.get('v');
      if (watchId && watchId.length === 11) {
        return watchId;
      }

      const pathParts = parsed.pathname.split('/').filter(Boolean);
      const embedIndex = pathParts.findIndex((part) => part === 'embed' || part === 'v');
      if (embedIndex >= 0 && pathParts[embedIndex + 1]?.length === 11) {
        return pathParts[embedIndex + 1];
      }
    }
  } catch {
    const match = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return match && match[2].length === 11 ? match[2] : null;
  }

  return null;
}

function appendYoutubeParams(url: string) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}rel=0&modestbranding=1`;
}

function compareShowtimes(
  left: Pick<ApiShowtime, 'ngayChieu' | 'gioChieu'>,
  right: Pick<ApiShowtime, 'ngayChieu' | 'gioChieu'>,
) {
  return buildShowtimeDate(left).getTime() - buildShowtimeDate(right).getTime();
}

function isExpiredShowtime(showtime: Pick<ApiShowtime, 'ngayChieu' | 'gioChieu'>) {
  return buildShowtimeDate(showtime).getTime() < Date.now();
}

function buildShowtimeDate(showtime: Pick<ApiShowtime, 'ngayChieu' | 'gioChieu'>) {
  return new Date(`${showtime.ngayChieu}T${normalizeTimeValue(showtime.gioChieu)}`);
}

function normalizeTimeValue(value?: string | null) {
  const raw = String(value || '').trim();

  if (/^\d{2}:\d{2}:\d{2}$/.test(raw)) {
    return raw;
  }

  if (/^\d{2}:\d{2}$/.test(raw)) {
    return `${raw}:00`;
  }

  return '00:00:00';
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Đang cập nhật';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('vi-VN');
}

function formatTime(value?: string | null) {
  return value ? String(value).slice(0, 5) : '--:--';
}

function formatCurrency(value: number) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function scrollToShowtimes() {
  document.getElementById('showtimeSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scrollToTrailer() {
  document.getElementById('trailerSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
