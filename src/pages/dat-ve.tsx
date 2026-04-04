import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Film,
  MapPin,
  SlidersHorizontal,
  Ticket,
} from 'lucide-react';
import { API_BASE_URL } from '../constants';

const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

type City = {
  maThanhPho: string;
  tenThanhPho: string;
};

type Cinema = {
  maRap: string;
  tenRap: string;
};

type ApiMovie = {
  id?: string;
  maPhim?: string;
  tenPhim?: string;
  poster?: string;
  Poster?: string;
  doTuoiPhuHop?: string;
  danhGia?: number;
};

type MovieListItem = {
  maPhim: string;
  tenPhim: string;
  posterUrl: string;
  doTuoiPhuHop?: string;
  active: boolean;
};

type ShowtimeDetail = {
  maSuat: string;
  maPhim?: string;
  gioChieu: string;
  ngayChieu: string;
  maPhong?: string;
  tenPhong?: string;
  tenLoaiPhong?: string | null;
  tongGhe?: number | null;
  soGheTrong?: number | null;
  gia?: number;
};

type ShowtimeRoomGroup = {
  key: string;
  tenPhong: string;
  tenLoaiPhong: string;
  items: ShowtimeDetail[];
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

export default function DatVePage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialDate = normalizeInitialDate(query.get('ngay'));
  const initialRap = query.get('rap');

  const [cities, setCities] = useState<City[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [allMovies, setAllMovies] = useState<ApiMovie[]>([]);
  const [movieItems, setMovieItems] = useState<MovieListItem[]>([]);
  const [showtimeGroups, setShowtimeGroups] = useState<ShowtimeRoomGroup[]>([]);

  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedRap, setSelectedRap] = useState<Cinema | null>(null);
  const [selectedPhim, setSelectedPhim] = useState<MovieListItem | null>(null);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [calendarStart, setCalendarStart] = useState(() => new Date(initialDate));
  const [rapType, setRapType] = useState<'all' | 'special'>('all');
  const [phimTab, setPhimTab] = useState<'popular' | 'rated'>('popular');

  const [citiesLoading, setCitiesLoading] = useState(true);
  const [cinemasLoading, setCinemasLoading] = useState(false);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [showtimesLoading, setShowtimesLoading] = useState(false);

  const [citiesError, setCitiesError] = useState<string | null>(null);
  const [moviesError, setMoviesError] = useState<string | null>(null);
  const [showtimesError, setShowtimesError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'UTC Cinema - Đặt Vé';
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      setCitiesLoading(true);
      setCitiesError(null);

      try {
        const [loadedCities, loadedMovies] = await Promise.all([
          apiGetArray<City>('/thanh-pho'),
          apiGetArray<ApiMovie>('/phim'),
        ]);

        if (cancelled) {
          return;
        }

        setCities(loadedCities);
        setAllMovies(loadedMovies);

        if (initialRap && loadedCities.length) {
          await autoSelectRap(initialRap, loadedCities, cancelled);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);
        setCitiesError(getErrorMessage(error, 'Không tải được dữ liệu đặt vé.'));
      } finally {
        if (!cancelled) {
          setCitiesLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedRap) {
      setMovieItems([]);
      setShowtimeGroups([]);
      setMoviesError(null);
      return;
    }

    let cancelled = false;

    const loadMoviesForRap = async () => {
      setMoviesLoading(true);
      setMoviesError(null);

      try {
        const activeMovies = await apiGetArray<ApiMovie>(
          `/suat-chieu/tim-phim?maRap=${encodeURIComponent(selectedRap.maRap)}&ngay=${encodeURIComponent(selectedDate)}`,
        );

        if (cancelled) {
          return;
        }

        const activeIds = new Set(activeMovies.map((movie) => String(movie.maPhim || movie.id || '')));
        const mapped = allMovies
          .map((movie) => ({
            maPhim: String(movie.maPhim || movie.id || ''),
            tenPhim: movie.tenPhim || 'Đang cập nhật',
            posterUrl: getPosterUrlSafe(movie.poster || movie.Poster),
            doTuoiPhuHop: movie.doTuoiPhuHop,
            active: activeIds.has(String(movie.maPhim || movie.id || '')),
          }))
          .filter((movie) => movie.maPhim);

        const ordered = [
          ...mapped.filter((movie) => movie.active),
          ...mapped.filter((movie) => !movie.active),
        ];

        setMovieItems(phimTab === 'rated' ? [...ordered].sort((a, b) => a.tenPhim.localeCompare(b.tenPhim, 'vi')) : ordered);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);
        setMoviesError(getErrorMessage(error, 'Không tải được danh sách phim.'));
      } finally {
        if (!cancelled) {
          setMoviesLoading(false);
        }
      }
    };

    loadMoviesForRap();

    return () => {
      cancelled = true;
    };
  }, [selectedRap, selectedDate, phimTab, rapType, allMovies]);

  useEffect(() => {
    if (!selectedRap || !selectedPhim) {
      setShowtimeGroups([]);
      setShowtimesError(null);
      return;
    }

    let cancelled = false;

    const loadShowtimes = async () => {
      setShowtimesLoading(true);
      setShowtimesError(null);

      try {
        const suats = await apiGetArray<ShowtimeDetail>(
          `/suat-chieu/tim-suat?maPhim=${encodeURIComponent(selectedPhim.maPhim)}&maRap=${encodeURIComponent(selectedRap.maRap)}&ngay=${encodeURIComponent(selectedDate)}`,
        );

        if (cancelled) {
          return;
        }

        setShowtimeGroups(groupShowtimesByRoom(suats));
        requestAnimationFrame(() => {
          document.getElementById('bookingShowtimeSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);
        setShowtimesError(getErrorMessage(error, 'Không tải được suất chiếu.'));
      } finally {
        if (!cancelled) {
          setShowtimesLoading(false);
        }
      }
    };

    loadShowtimes();

    return () => {
      cancelled = true;
    };
  }, [selectedRap, selectedPhim, selectedDate]);

  async function autoSelectRap(maRap: string, loadedCities: City[], cancelled: boolean) {
    for (const city of loadedCities) {
      const cityCinemas = await apiGetArray<Cinema>(`/rap?maThanhPho=${encodeURIComponent(city.maThanhPho)}`);

      if (cancelled) {
        return;
      }

      const found = cityCinemas.find((rap) => rap.maRap === maRap);
      if (found) {
        setSelectedCity(city.maThanhPho);
        setCinemas(cityCinemas);
        setSelectedRap(found);
        return;
      }
    }
  }

  async function handleSelectCity(maThanhPho: string) {
    setSelectedCity(maThanhPho);
    setSelectedRap(null);
    setSelectedPhim(null);
    setMovieItems([]);
    setShowtimeGroups([]);
    setShowtimesError(null);
    setMoviesError(null);
    setCinemasLoading(true);

    try {
      const loadedCinemas = await apiGetArray<Cinema>(`/rap?maThanhPho=${encodeURIComponent(maThanhPho)}`);
      setCinemas(loadedCinemas);
    } catch (error) {
      console.error(error);
      setCinemas([]);
    } finally {
      setCinemasLoading(false);
    }
  }

  function handleSelectRap(cinema: Cinema) {
    setSelectedRap(cinema);
    setSelectedPhim(null);
    setShowtimeGroups([]);
    setShowtimesError(null);
  }

  function handleSelectMovie(movie: MovieListItem) {
    if (!movie.active) {
      return;
    }

    setSelectedPhim(movie);
    setShowtimesError(null);
  }

  function clearRap() {
    setSelectedRap(null);
    setSelectedPhim(null);
    setMovieItems([]);
    setShowtimeGroups([]);
    setShowtimesError(null);
  }

  function clearPhim() {
    setSelectedPhim(null);
    setShowtimeGroups([]);
    setShowtimesError(null);
  }

  function shiftCalendar(days: number) {
    const next = new Date(calendarStart);
    next.setDate(next.getDate() + days);
    setCalendarStart(next);
  }

  const calendarDays = buildCalendarDays(calendarStart, selectedDate);

  return (
    <div className="min-h-screen bg-[#050505] pb-32 pt-24 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-white/55">
          <Link to="/" className="transition hover:text-gold">Trang chủ</Link>
          <span>/</span>
          <span className="text-white/85">Đặt vé</span>
        </div>

        <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.28em] text-gold/65">Booking Flow</p>
              <h1 className="mt-3 font-serif text-4xl font-bold text-white md:text-5xl">
                Mua vé xem phim theo ngày, rạp và suất chiếu
              </h1>
              <p className="mt-4 text-base leading-7 text-white/60">
                Giữ nguyên luồng cũ của trang đặt vé: chọn ngày, chọn khu vực, chọn rạp, chọn phim rồi vào thẳng suất chiếu phù hợp.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-white/70 sm:grid-cols-2">
              <TopMetric icon={CalendarDays} label="Ngày đang chọn" value={formatDate(selectedDate)} />
              <TopMetric icon={Ticket} label="Rạp đang chọn" value={selectedRap?.tenRap || 'Chưa chọn'} />
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => shiftCalendar(-7)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-white/70 transition hover:border-gold/35 hover:text-gold"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7 xl:grid-cols-14">
              {calendarDays.map((day) => (
                <button
                  key={day.iso}
                  type="button"
                  onClick={() => setSelectedDate(day.iso)}
                  className={[
                    'rounded-2xl border px-3 py-4 text-center transition',
                    day.iso === selectedDate
                      ? 'border-gold bg-gold text-black shadow-[0_0_24px_rgba(212,175,55,0.18)]'
                      : 'border-white/10 bg-black/25 text-white/70 hover:border-gold/25 hover:text-white',
                    day.isSunday ? 'text-red-300' : '',
                    day.isSaturday ? 'text-sky-300' : '',
                    day.iso === selectedDate ? '!text-black' : '',
                  ].join(' ')}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em]">{day.dayName}</div>
                  <div className="mt-2 text-2xl font-bold">{day.dayNumber}</div>
                  <div className="mt-1 text-[11px] opacity-70">{day.monthLabel}</div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => shiftCalendar(7)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-white/70 transition hover:border-gold/35 hover:text-gold"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="glass-card overflow-hidden border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
            <div className="border-b border-white/10 px-6 py-5">
              <p className="text-xs uppercase tracking-[0.22em] text-gold/65">Rạp</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Chọn khu vực và rạp chiếu</h2>
            </div>

            <div className="border-b border-white/10 px-6 py-4">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">Rạp chiếu phim của tôi</p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {selectedRap?.tenRap || 'Chưa có rạp yêu thích được chọn'}
                  </p>
                </div>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 transition hover:border-gold/30 hover:text-gold"
                  title="Cài đặt rạp yêu thích"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="border-b border-white/10 px-6 py-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all' as const, label: 'Tất cả' },
                  { key: 'special' as const, label: 'Phòng chiếu đặc biệt' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setRapType(tab.key)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      rapType === tab.key
                        ? 'bg-gold text-black'
                        : 'border border-white/10 bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-[180px_minmax(0,1fr)]">
              <div className="border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
                <div className="px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/35">Khu vực</p>
                </div>
                {citiesLoading ? (
                  <div className="px-4 pb-4">
                    <SkeletonList lines={5} />
                  </div>
                ) : citiesError ? (
                  <InlineError message={citiesError} />
                ) : (
                  <div className="max-h-[380px] overflow-y-auto">
                    {cities.map((city) => (
                      <button
                        key={city.maThanhPho}
                        type="button"
                        onClick={() => handleSelectCity(city.maThanhPho)}
                        className={`flex w-full items-center justify-between border-b border-white/5 px-4 py-3 text-left text-sm transition ${
                          selectedCity === city.maThanhPho
                            ? 'bg-gold text-black'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span>{city.tenThanhPho}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/35">Rạp trong khu vực</p>
                </div>
                <div className="min-h-[220px] px-4 pb-5">
                  {selectedCity === null ? (
                    <EmptyBlock
                      title="Chưa chọn khu vực"
                      message="Chọn khu vực ở cột trái để xem các rạp đang hoạt động."
                    />
                  ) : cinemasLoading ? (
                    <SkeletonList lines={4} />
                  ) : cinemas.length === 0 ? (
                    <EmptyBlock
                      title="Không có rạp khả dụng"
                      message="Khu vực này hiện chưa có rạp hoặc dữ liệu chưa sẵn sàng."
                    />
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {cinemas.map((cinema) => (
                        <button
                          key={cinema.maRap}
                          type="button"
                          onClick={() => handleSelectRap(cinema)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                            selectedRap?.maRap === cinema.maRap
                              ? 'border-gold bg-gold text-black'
                              : 'border-white/10 bg-black/25 text-white/70 hover:border-gold/30 hover:text-white'
                          }`}
                        >
                          {cinema.tenRap}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card overflow-hidden border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
            <div className="border-b border-white/10 px-6 py-5">
              <p className="text-xs uppercase tracking-[0.22em] text-gold/65">Phim</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Chọn phim đang chiếu tại rạp</h2>
            </div>

            <div className="border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3 text-sm">
                {[
                  { key: 'popular' as const, label: 'Xem nhiều nhất' },
                  { key: 'rated' as const, label: 'Đánh giá tốt nhất' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setPhimTab(tab.key)}
                    className={`transition ${
                      phimTab === tab.key ? 'font-semibold text-gold' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[520px] px-6 py-5">
              {!selectedRap ? (
                <EmptyBlock
                  title="Chọn rạp để xem phim"
                  message="Danh sách phim sẽ xuất hiện sau khi bạn chọn một rạp cụ thể."
                />
              ) : moviesLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-28 rounded-[1.5rem] bg-white/10 animate-pulse" />
                  ))}
                </div>
              ) : moviesError ? (
                <InlineError message={moviesError} />
              ) : movieItems.length === 0 ? (
                <EmptyBlock
                  title="Không có phim khả dụng"
                  message="Rạp này chưa có phim mở bán cho ngày bạn đang chọn."
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {movieItems.map((movie) => (
                    <button
                      key={movie.maPhim}
                      type="button"
                      disabled={!movie.active}
                      onClick={() => handleSelectMovie(movie)}
                      className={`group flex items-center gap-4 rounded-[1.5rem] border p-4 text-left transition ${
                        selectedPhim?.maPhim === movie.maPhim
                          ? 'border-gold bg-gold/10 shadow-[0_0_24px_rgba(212,175,55,0.14)]'
                          : movie.active
                            ? 'border-white/10 bg-black/25 hover:border-gold/25 hover:bg-black/35'
                            : 'cursor-not-allowed border-white/8 bg-black/15 opacity-45'
                      }`}
                    >
                      <img
                        src={movie.posterUrl}
                        alt={movie.tenPhim}
                        className="h-24 w-16 rounded-xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <AgeBadge age={movie.doTuoiPhuHop} />
                          {!movie.active && (
                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white/45">
                              Hết suất
                            </span>
                          )}
                        </div>
                        <h3 className="line-clamp-2 text-base font-semibold text-white group-hover:text-gold">
                          {movie.tenPhim}
                        </h3>
                        <p className="mt-2 text-sm text-white/45">
                          {movie.active ? 'Có thể chọn để xem suất chiếu' : 'Không có suất chiếu trong ngày này'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {selectedPhim ? (
          <section
            id="bookingShowtimeSection"
            className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]"
          >
            <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-gold/65">Giờ chiếu</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">{selectedPhim.tenPhim}</h2>
                <p className="mt-3 text-sm leading-7 text-white/55">
                  Thời gian chiếu phim có thể chênh lệch 15 phút do quảng cáo và phần giới thiệu phim sắp ra rạp.
                </p>
              </div>

              <Link
                to={`/movie/${selectedPhim.maPhim}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-gold transition hover:text-white"
              >
                <Film className="h-4 w-4" />
                Xem chi tiết phim
              </Link>
            </div>

            {showtimesLoading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-44 rounded-[1.5rem] bg-white/10 animate-pulse" />
                ))}
              </div>
            ) : showtimesError ? (
              <InlineError message={showtimesError} />
            ) : showtimeGroups.length === 0 ? (
              <EmptyBlock
                title="Không có suất chiếu cho ngày này"
                message="Bạn có thể đổi ngày hoặc chọn phim khác để tiếp tục."
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {showtimeGroups.map((group) => (
                  <div
                    key={group.key}
                    className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5"
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/35">Phòng chiếu</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">{group.tenPhong}</h3>
                      </div>
                      <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                        {group.tenLoaiPhong}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {group.items.map((item) => {
                        const bookingState: BookingLinkState = {
                          movie: {
                            id: selectedPhim.maPhim,
                            title: selectedPhim.tenPhim,
                            posterUrl: selectedPhim.posterUrl,
                            backdropUrl: selectedPhim.posterUrl,
                          },
                          showtime: {
                            id: item.maSuat,
                            cinema: selectedRap?.tenRap || 'Rạp chiếu',
                            room: item.tenPhong || group.tenPhong,
                            dateLabel: formatDate(selectedDate),
                            timeLabel: formatTime(item.gioChieu),
                            format: item.tenLoaiPhong || group.tenLoaiPhong,
                            seatsText: getSeatLabel(item),
                            price: Number(item.gia || 0),
                          },
                        };

                        return (
                          <Link
                            key={item.maSuat}
                            to={`/booking/${encodeURIComponent(item.maSuat)}`}
                            state={bookingState}
                            className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 transition hover:border-gold/30 hover:bg-white/10"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-white/35">Suất chiếu</p>
                                <div className="mt-2 text-3xl font-bold text-white">{formatTime(item.gioChieu)}</div>
                              </div>
                              {item.gia ? (
                                <div className="text-right">
                                  <p className="text-xs uppercase tracking-[0.16em] text-white/35">Giá</p>
                                  <div className="mt-2 text-sm font-semibold text-gold">{formatCurrency(item.gia)}</div>
                                </div>
                              ) : null}
                            </div>

                            <div className="mt-4 space-y-2 text-sm text-white/60">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gold" />
                                <span>{selectedRap?.tenRap || 'Rạp chiếu'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock3 className="h-4 w-4 text-gold" />
                                <span>{getSeatLabel(item)}</span>
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
          </section>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0b0b0b]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-4 lg:px-12">
          <StatusItem label="Ngày" value={formatDate(selectedDate)} />
          <StatusChip
            label="Rạp"
            value={selectedRap?.tenRap}
            onClear={clearRap}
          />
          <StatusChip
            label="Phim"
            value={selectedPhim?.tenPhim}
            onClear={clearPhim}
          />
        </div>
      </div>
    </div>
  );
}

function TopMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-black/25 px-4 py-3">
      <div className="flex items-center gap-2 text-white/45">
        <Icon className="h-4 w-4 text-gold" />
        <span className="text-xs uppercase tracking-[0.18em]">{label}</span>
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function SkeletonList({ lines }: { lines: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="h-11 rounded-xl bg-white/10 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyBlock({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold">
        <Ticket className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-7 text-white/55">{message}</p>
    </div>
  );
}

function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[1.25rem] border border-red-500/20 bg-red-500/8 px-4 py-4 text-sm text-red-200">
      <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
      <span className="text-white/40">{label}</span>
      <strong className="text-white">{value}</strong>
    </div>
  );
}

function StatusChip({
  label,
  value,
  onClear,
}: {
  label: string;
  value?: string;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
      <span className="text-white/40">{label}</span>
      {value ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 font-medium text-gold">
          {value}
          <button
            type="button"
            onClick={onClear}
            className="text-gold/70 transition hover:text-white"
          >
            ×
          </button>
        </span>
      ) : (
        <span className="font-semibold text-white">-</span>
      )}
    </div>
  );
}

function AgeBadge({ age }: { age?: string }) {
  if (!age) {
    return null;
  }

  const normalized = String(age).trim().toUpperCase();
  let className = 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20';

  if (normalized.includes('18')) className = 'bg-red-500/15 text-red-300 border-red-400/20';
  else if (normalized.includes('16')) className = 'bg-orange-500/15 text-orange-300 border-orange-400/20';
  else if (normalized.includes('13')) className = 'bg-amber-500/15 text-amber-300 border-amber-400/20';

  return (
    <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${className}`}>
      {normalized}
    </span>
  );
}

async function apiGetArray<T>(path: string): Promise<T[]> {
  try {
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

    if (!contentType.includes('application/json')) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data ? [data] : [];
  } catch (error) {
    throw error;
  }
}

function groupShowtimesByRoom(showtimes: ShowtimeDetail[]) {
  const groups = new Map<string, ShowtimeRoomGroup>();

  showtimes.forEach((showtime) => {
    const key = String(showtime.maPhong || showtime.tenPhong || 'default');

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        tenPhong: showtime.tenPhong || showtime.maPhong || 'Phòng chiếu',
        tenLoaiPhong: showtime.tenLoaiPhong || '2D',
        items: [],
      });
    }

    groups.get(key)?.items.push(showtime);
  });

  return [...groups.values()]
    .map((group) => ({
      ...group,
      items: [...group.items].sort((left, right) => formatTime(left.gioChieu).localeCompare(formatTime(right.gioChieu))),
    }))
    .sort((left, right) => left.tenPhong.localeCompare(right.tenPhong, 'vi'));
}

function buildCalendarDays(baseDate: Date, selectedDate: string) {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 14 }).map((_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      iso: formatISODate(date),
      dayName: getDayName(date),
      dayNumber: date.getDate(),
      monthLabel: `T${date.getMonth() + 1}`,
      isSaturday: date.getDay() === 6,
      isSunday: date.getDay() === 0,
      isSelected: formatISODate(date) === selectedDate,
    };
  });
}

function normalizeInitialDate(value: string | null) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return formatISODate(new Date());
}

function formatISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDayName(date: Date) {
  return ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()];
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

function getSeatLabel(showtime: ShowtimeDetail) {
  if (showtime.soGheTrong != null && showtime.tongGhe != null) {
    return `${showtime.soGheTrong} / ${showtime.tongGhe} ghế trống`;
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

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}
