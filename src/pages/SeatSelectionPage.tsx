import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CircleAlert,
  Clock3,
  DoorOpen,
  Info,
  MapPin,
  Monitor,
  Ticket,
  Wallet,
} from 'lucide-react';
import { API_BASE_URL } from '../constants';

const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

type BookingState = {
  movie?: {
    id?: string;
    title?: string;
    posterUrl?: string;
  };
  showtime?: {
    cinema?: string;
    room?: string;
    dateLabel?: string;
    timeLabel?: string;
    price?: number;
  };
};

type ShowtimeDetail = {
  maSuat: string;
  maPhim?: string;
  tenPhim?: string;
  poster?: string;
  tenRap?: string;
  tenPhong?: string;
  gioChieu?: string;
  ngayChieu?: string;
  gia?: number;
  tongGhe?: number | null;
  soGheTrong?: number | null;
};

type SeatDetail = {
  maGhe: string;
  tenGhe?: string;
  tenLoaiGhe?: string;
  giaPhuThu?: number;
  trangThai?: string;
  coTheDat?: boolean;
};

type SelectedSeat = {
  maGhe: string;
  tenGhe: string;
  tenLoaiGhe: string;
  giaPhuThu: number;
};

type FlashMessage =
  | {
      type: 'error' | 'info';
      text: string;
    }
  | null;

export default function SeatSelectionPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const bookingState = (location.state || {}) as BookingState;

  const [showtime, setShowtime] = useState<ShowtimeDetail | null>(null);
  const [seats, setSeats] = useState<SeatDetail[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<FlashMessage>(null);
  const selectionStorageKey = getSeatSelectionStorageKey(showtimeId);

  useEffect(() => {
    document.title = 'UTC Cinema - Chon ghe';
  }, []);

  useEffect(() => {
    if (!showtimeId) {
      setLoading(false);
      setError('Khong tim thay ma suat chieu.');
      return;
    }

    void loadBookingData(showtimeId, true);
  }, [showtimeId]);

  useEffect(() => {
    if (!selectionStorageKey) {
      return;
    }

    if (!selectedSeats.length) {
      sessionStorage.removeItem(selectionStorageKey);
      return;
    }

    sessionStorage.setItem(
      selectionStorageKey,
      JSON.stringify(selectedSeats.map((seat) => seat.maGhe)),
    );
  }, [selectionStorageKey, selectedSeats]);

  const groupedSeats = useMemo(() => groupSeatsByRow(seats), [seats]);

  const movieId = showtime?.maPhim || bookingState.movie?.id;
  const movieTitle = showtime?.tenPhim || bookingState.movie?.title || 'Phim';
  const posterUrl = getPosterUrlSafe(showtime?.poster || bookingState.movie?.posterUrl);
  const cinemaName = showtime?.tenRap || bookingState.showtime?.cinema || 'Rap chieu';
  const roomName = showtime?.tenPhong || bookingState.showtime?.room || 'Phong chieu';
  const timeLabel = showtime?.gioChieu ? formatTime(showtime.gioChieu) : bookingState.showtime?.timeLabel || '--:--';
  const dateLabel = showtime?.ngayChieu ? formatDate(showtime.ngayChieu) : bookingState.showtime?.dateLabel || 'Dang cap nhat';
  const basePrice = Number(showtime?.gia || bookingState.showtime?.price || 0);
  const selectedSeatNames = selectedSeats.map((seat) => seat.tenGhe).join(', ');
  const baseTotal = basePrice * selectedSeats.length;
  const extraTotal = selectedSeats.reduce((sum, seat) => sum + Number(seat.giaPhuThu || 0), 0);
  const grandTotal = baseTotal + extraTotal;

  async function loadBookingData(targetShowtimeId: string, showSkeleton: boolean) {
    if (showSkeleton) {
      setLoading(true);
    }

    setError(null);
    setFlashMessage(null);

    try {
      const [loadedShowtime, loadedSeats] = await Promise.all([
        apiFetch<ShowtimeDetail>(`/suat-chieu/${encodeURIComponent(targetShowtimeId)}`),
        apiFetch<SeatDetail[]>(`/ghe/theo-suat/${encodeURIComponent(targetShowtimeId)}`),
      ]);

      const normalizedSeats = Array.isArray(loadedSeats) ? loadedSeats : [];

      const savedSeatIds = getSavedSeatIds(targetShowtimeId);

      setShowtime(loadedShowtime);
      setSeats(normalizedSeats);
      setSelectedSeats((current) => {
        const currentIds = current.map((seat) => seat.maGhe);
        const preferredIds = currentIds.length ? currentIds : savedSeatIds;

        return normalizedSeats
          .filter((seat) => preferredIds.includes(seat.maGhe) && isSeatAvailable(seat))
          .map(mapSeatSelection);
      });
    } catch (loadError) {
      console.error('seat selection load error:', loadError);
      setShowtime(null);
      setSeats([]);
      setSelectedSeats([]);
      setError(getErrorMessage(loadError, 'Khong tai duoc du lieu suat chieu.'));
    } finally {
      setLoading(false);
    }
  }

  function toggleSeat(seat: SeatDetail) {
    if (!isSeatAvailable(seat)) {
      return;
    }

    setFlashMessage(null);

    const isSelected = selectedSeats.some((item) => item.maGhe === seat.maGhe);
    if (isSelected) {
      setSelectedSeats((current) => current.filter((item) => item.maGhe !== seat.maGhe));
      return;
    }

    if (selectedSeats.length >= 8) {
      setFlashMessage({ type: 'error', text: 'Toi da 8 ghe cho moi lan dat.' });
      return;
    }

    setSelectedSeats((current) => [
      ...current,
      mapSeatSelection(seat),
    ]);
  }

  function handleContinueToPayment() {
    if (!showtime?.maSuat || !selectedSeats.length) {
      return;
    }

    const token = localStorage.getItem('token');
    const maKhachHang = localStorage.getItem('maKhachHang');
    const checkoutPath = `/checkout?showtimeId=${encodeURIComponent(showtime.maSuat)}`;

    if (!token || !maKhachHang) {
      sessionStorage.setItem('utc_redirect', checkoutPath);
      navigate('/login');
      return;
    }

    navigate(checkoutPath, {
      state: {
        movieId,
        movieTitle,
        selectedSeatIds: selectedSeats.map((seat) => seat.maGhe),
      },
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] px-6 pb-20 pt-28 text-white">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6 lg:px-6">
          <div className="h-5 w-72 rounded-full bg-white/10" />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="h-[760px] rounded-[2rem] bg-white/10" />
            <div className="h-[520px] rounded-[2rem] bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (!showtimeId || error || !showtime) {
    return (
      <div className="min-h-screen bg-[#050505] px-6 pb-20 pt-28 text-white">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-500/20 bg-white/5 px-8 py-16 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-300">
            <CircleAlert className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-white">Khong tai duoc suat chieu</h1>
          <p className="mt-4 text-base leading-7 text-white/60">
            {error || 'Du lieu suat chieu hien khong kha dung.'}
          </p>
          <Link
            to="/booking"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold px-6 py-3 font-semibold text-black transition hover:bg-gold-light"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lai dat ve
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20 pt-28 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <nav className="mb-8 flex flex-wrap items-center gap-3 text-sm text-white/50">
          <Link to="/" className="transition hover:text-gold">Trang chu</Link>
          <span>/</span>
          <Link to="/booking" className="transition hover:text-gold">Dat ve</Link>
          <span>/</span>
          <span className="text-white/85">Chon ghe</span>
        </nav>

        {flashMessage ? (
          <div
            className={`mb-6 flex items-start gap-3 rounded-[1.5rem] border px-5 py-4 text-sm ${
              flashMessage.type === 'error'
                ? 'border-red-500/20 bg-red-500/10 text-red-200'
                : 'border-amber-400/20 bg-amber-400/10 text-amber-100'
            }`}
          >
            <CircleAlert className="h-5 w-5 shrink-0" />
            <span>{flashMessage.text}</span>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.12),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] lg:p-8">
            <div className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/booking"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:border-gold/30 hover:text-gold"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lai trang dat ve
                  </Link>
                  {movieId ? (
                    <Link
                      to={`/movie/${encodeURIComponent(movieId)}`}
                      className="text-sm text-white/55 transition hover:text-gold"
                    >
                      Xem lai thong tin phim
                    </Link>
                  ) : null}
                </div>
                <h1 className="mt-4 font-serif text-4xl font-bold text-white">{movieTitle}</h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-white/60">
                  Chon ghe truoc khi sang buoc thanh toan. He thong ho tro toi da 8 vi tri cho moi lan dat.
                </p>
              </div>

              <div className="grid gap-3 text-sm text-white/70 sm:grid-cols-2">
                <InfoChip icon={MapPin} label="Rap" value={cinemaName} />
                <InfoChip icon={DoorOpen} label="Phong" value={roomName} />
                <InfoChip icon={Clock3} label="Gio chieu" value={timeLabel} />
                <InfoChip icon={Ticket} label="Ngay chieu" value={dateLabel} />
              </div>
            </div>

            <div className="relative mb-14 mt-10">
              <div className="mx-auto h-14 w-full max-w-4xl rounded-t-[100%] border-t-4 border-gold/70 bg-gradient-to-b from-gold/20 to-transparent blur-[0.5px]" />
              <div className="absolute inset-x-0 top-3 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-gold/70">
                <Monitor className="h-4 w-4" />
                <span>Man hinh</span>
              </div>
            </div>

            {groupedSeats.length ? (
              <div className="space-y-4 overflow-x-auto pb-6">
                {groupedSeats.map((row) => (
                  <div key={row.rowKey} className="flex min-w-max items-center gap-3">
                    <div className="w-7 text-center text-sm font-bold text-white/35">{row.rowKey}</div>
                    <div className="flex items-center gap-2">
                      {row.seats.map((seat) => {
                        const isSelected = selectedSeats.some((item) => item.maGhe === seat.maGhe);
                        const isBooked = !isSeatAvailable(seat);

                        return (
                          <button
                            key={seat.maGhe}
                            type="button"
                            onClick={() => toggleSeat(seat)}
                            disabled={isBooked}
                            title={`${seat.tenGhe || seat.maGhe} - ${seat.tenLoaiGhe || 'Thuong'}`}
                            className={getSeatClassName(seat, isSelected, isBooked)}
                          >
                            {getSeatDisplayLabel(seat.tenGhe)}
                          </button>
                        );
                      })}
                    </div>
                    <div className="w-7 text-center text-sm font-bold text-white/35">{row.rowKey}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 px-6 py-12 text-center">
                <p className="text-sm leading-7 text-white/55">
                  Chua co so do ghe cho suat chieu nay.
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-white/10 pt-6 text-sm text-white/60">
              <LegendBox className="bg-white/20" label="Thuong" />
              <LegendBox className="border border-sky-400/40 bg-sky-400/15" label="VIP" />
              <LegendBox className="border border-pink-400/40 bg-pink-400/15" label="Sweetbox" />
              <LegendBox className="bg-gold" label="Dang chon" />
              <LegendBox className="border border-red-500/40 bg-red-500/20" label="Da dat" />
            </div>
          </section>

          <aside className="space-y-6">
            <section className="glass-card sticky top-24 rounded-[2rem] border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
              <div className="flex items-start gap-4">
                <img
                  src={posterUrl}
                  alt={movieTitle}
                  className="h-28 w-20 rounded-[1.25rem] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold/65">Booking</p>
                  <h2 className="mt-2 line-clamp-2 text-2xl font-semibold text-white">{movieTitle}</h2>
                  <div className="mt-3 space-y-2 text-sm text-white/60">
                    <SummaryInfo icon={MapPin} text={cinemaName} />
                    <SummaryInfo icon={DoorOpen} text={roomName} />
                    <SummaryInfo icon={Clock3} text={`${timeLabel} · ${dateLabel}`} />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <SummaryRow label="Ghe da chon" value={selectedSeatNames || '-'} emphasize />
                <SummaryRow label="Gia ve co ban" value={formatCurrency(baseTotal)} />
                <SummaryRow label="Phu thu ghe" value={formatCurrency(extraTotal)} />
                <SummaryRow label="Con trong" value={getSeatAvailabilityText(showtime)} />
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-gold/15 bg-black/35 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/35">Tong cong</p>
                      <p className="mt-1 text-sm text-white/55">Bao gom gia co ban va phu thu ghe</p>
                    </div>
                  </div>
                  <div className="text-right text-3xl font-bold text-gold">{formatCurrency(grandTotal)}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleContinueToPayment}
                disabled={!selectedSeats.length}
                className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gold px-4 py-4 text-base font-semibold text-black transition hover:bg-gold-light disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
              >
                Tiep tuc thanh toan
              </button>

              {!selectedSeats.length ? (
                <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-white/40">
                  <Info className="h-4 w-4" />
                  Vui long chon it nhat 1 ghe de tiep tuc.
                </p>
              ) : null}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
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

function LegendBox({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-5 w-5 rounded-t-md rounded-b-sm ${className}`} />
      <span>{label}</span>
    </div>
  );
}

function SummaryInfo({
  icon: Icon,
  text,
}: {
  icon: typeof MapPin;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-gold" />
      <span>{text}</span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-4 text-sm last:border-b-0 last:pb-0">
      <span className="text-white/45">{label}</span>
      <strong className={`text-right ${emphasize ? 'text-gold' : 'text-white'}`}>{value}</strong>
    </div>
  );
}

function groupSeatsByRow(seats: SeatDetail[]) {
  const rows = new Map<string, SeatDetail[]>();

  seats.forEach((seat) => {
    const rowKey = getSeatRowKey(seat.tenGhe);
    const current = rows.get(rowKey) || [];
    current.push(seat);
    rows.set(rowKey, current);
  });

  return [...rows.entries()]
    .map(([rowKey, rowSeats]) => ({
      rowKey,
      seats: [...rowSeats].sort((left, right) => compareSeatLabels(left.tenGhe, right.tenGhe)),
    }))
    .sort((left, right) => left.rowKey.localeCompare(right.rowKey, 'en'));
}

function getSeatSelectionStorageKey(showtimeId?: string) {
  return showtimeId ? `utc-seat-selection:${showtimeId}` : '';
}

function getSavedSeatIds(showtimeId: string) {
  const raw = sessionStorage.getItem(getSeatSelectionStorageKey(showtimeId));

  if (!raw) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
  } catch {
    return [];
  }
}

function mapSeatSelection(seat: SeatDetail): SelectedSeat {
  return {
    maGhe: seat.maGhe,
    tenGhe: seat.tenGhe || seat.maGhe,
    tenLoaiGhe: seat.tenLoaiGhe || 'Thuong',
    giaPhuThu: Number(seat.giaPhuThu || 0),
  };
}

function getSeatRowKey(label?: string | null) {
  const normalized = String(label || '').trim();
  const letters = normalized.replace(/[0-9]/g, '').trim();
  return letters || '?';
}

function compareSeatLabels(left?: string | null, right?: string | null) {
  const leftNumber = extractSeatNumber(left);
  const rightNumber = extractSeatNumber(right);

  if (leftNumber !== rightNumber) {
    return leftNumber - rightNumber;
  }

  return String(left || '').localeCompare(String(right || ''), 'en');
}

function extractSeatNumber(label?: string | null) {
  const match = String(label || '').match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function getSeatDisplayLabel(label?: string | null) {
  const number = extractSeatNumber(label);
  return number ? String(number) : String(label || '?');
}

function getSeatClassName(seat: SeatDetail, isSelected: boolean, isBooked: boolean) {
  const baseClassName =
    'flex h-11 w-11 items-center justify-center rounded-t-md rounded-b-sm text-xs font-bold transition focus:outline-none';

  const seatType = String(seat.tenLoaiGhe || '').toLowerCase();

  if (isBooked) {
    return `${baseClassName} cursor-not-allowed border border-red-500/40 bg-red-500/20 text-red-200/70`;
  }

  if (isSelected) {
    return `${baseClassName} border border-gold bg-gold text-black shadow-[0_0_18px_rgba(212,175,55,0.35)]`;
  }

  if (seatType.includes('sweet') || seatType.includes('doi')) {
    return `${baseClassName} border border-pink-400/40 bg-pink-400/15 text-pink-100 hover:bg-pink-400/25`;
  }

  if (seatType.includes('vip')) {
    return `${baseClassName} border border-sky-400/40 bg-sky-400/15 text-sky-100 hover:bg-sky-400/25`;
  }

  return `${baseClassName} bg-white/20 text-white hover:bg-white/30`;
}

function getSeatAvailabilityText(showtime: ShowtimeDetail) {
  if (showtime.soGheTrong != null && showtime.tongGhe != null) {
    return `${showtime.soGheTrong} / ${showtime.tongGhe} ghe trong`;
  }

  return 'Dang cap nhat';
}

function isSeatAvailable(seat: SeatDetail) {
  return seat.coTheDat !== false && String(seat.trangThai || '').toUpperCase() !== 'BOOKED';
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    if (contentType.includes('application/json')) {
      const payload = await response.json();
      throw new Error(payload?.message || payload?.error || `Loi ${response.status}`);
    }

    const text = await response.text();
    throw new Error(text || `Loi ${response.status}`);
  }

  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return null as T;
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Dang cap nhat';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('vi-VN');
}

function formatTime(value?: string | null) {
  return value ? String(value).slice(0, 5) : '--:--';
}

function formatCurrency(value: number) {
  return `${Number(value || 0).toLocaleString('vi-VN')}d`;
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
