import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  CircleAlert,
  CreditCard,
  Landmark,
  LoaderCircle,
  QrCode,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { API_BASE_URL } from '../constants';
import './checkout-payment.css';

const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

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

type InvoiceCreateResponse = {
  maDon?: string;
};

type CheckoutState = {
  selectedSeatIds?: string[];
  movieId?: string;
  movieTitle?: string;
};

type FlashMessage =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

type PaymentOption = {
  id: string;
  backendCode: string;
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
};

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'credit-card',
    backendCode: 'THE_NGAN_HANG',
    title: 'The tin dung',
    subtitle: 'Mastercard, Visa, JCB',
    icon: CreditCard,
  },
  {
    id: 'atm-card',
    backendCode: 'THE_NGAN_HANG',
    title: 'The noi dia (ATM)',
    subtitle: 'Quet QR code',
    icon: Landmark,
  },
  {
    id: 'counter-wallet',
    backendCode: 'TIEN_MAT',
    title: 'Vi tra sau',
    subtitle: 'Lotte Flex, Home PayLater',
    icon: Wallet,
  },
  {
    id: 'ewallet',
    backendCode: 'MOMO',
    title: 'Vi dien tu',
    subtitle: 'MoMo, ZaloPay, ShopeePay',
    icon: Smartphone,
  },
  {
    id: 'vietqr',
    backendCode: 'VNPAY',
    title: 'Chuyen khoan VietQR',
    subtitle: 'OnePay, VNPay',
    icon: QrCode,
  },
];

export default function CheckoutPaymentPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const showtimeId = searchParams.get('showtimeId');
  const checkoutState = (location.state || {}) as CheckoutState;

  const [showtime, setShowtime] = useState<ShowtimeDetail | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<FlashMessage>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(PAYMENT_OPTIONS[0].id);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [openDiscountPanel, setOpenDiscountPanel] = useState<'voucher' | 'points' | null>(null);

  const selectionStorageKey = getSeatSelectionStorageKey(showtimeId || undefined);
  const selectedPayment = useMemo(
    () => PAYMENT_OPTIONS.find((option) => option.id === selectedPaymentId) || PAYMENT_OPTIONS[0],
    [selectedPaymentId],
  );

  useEffect(() => {
    document.title = 'UTC Cinema - Thanh toan';
  }, []);

  useEffect(() => {
    if (!showtimeId) {
      setLoading(false);
      setError('Khong tim thay ma suat chieu.');
      return;
    }

    const token = localStorage.getItem('token');
    const maKhachHang = localStorage.getItem('maKhachHang');

    if (!token || !maKhachHang) {
      sessionStorage.setItem('utc_redirect', `/checkout?showtimeId=${encodeURIComponent(showtimeId)}`);
      navigate('/login');
      return;
    }

    void loadCheckoutData(showtimeId);
  }, [navigate, showtimeId]);

  async function loadCheckoutData(targetShowtimeId: string) {
    setLoading(true);
    setError(null);
    setFlashMessage(null);

    try {
      const candidateSeatIds = getCandidateSeatIds(targetShowtimeId, checkoutState.selectedSeatIds);

      if (!candidateSeatIds.length) {
        throw new Error('Khong co ghe nao duoc chon de thanh toan.');
      }

      const [loadedShowtime, loadedSeats] = await Promise.all([
        apiFetch<ShowtimeDetail>(`/suat-chieu/${encodeURIComponent(targetShowtimeId)}`),
        apiFetch<SeatDetail[]>(`/ghe/theo-suat/${encodeURIComponent(targetShowtimeId)}`),
      ]);

      const normalizedSeats = Array.isArray(loadedSeats) ? loadedSeats : [];
      const mappedSelectedSeats = normalizedSeats
        .filter((seat) => candidateSeatIds.includes(seat.maGhe))
        .map(mapSeatSelection);

      if (!mappedSelectedSeats.length) {
        throw new Error('Khong the khoi phuc danh sach ghe da chon.');
      }

      setShowtime(loadedShowtime);
      setSelectedSeats(mappedSelectedSeats);
    } catch (loadError) {
      console.error('checkout load error:', loadError);
      setShowtime(null);
      setSelectedSeats([]);
      setError(getErrorMessage(loadError, 'Khong tai duoc thong tin thanh toan.'));
    } finally {
      setLoading(false);
    }
  }

  async function handlePay() {
    if (!showtime?.maSuat || !selectedSeats.length) {
      return;
    }

    if (!acceptedTerms) {
      setFlashMessage({ type: 'error', text: 'Ban can dong y dieu kien va dieu khoan truoc khi thanh toan.' });
      return;
    }

    const token = localStorage.getItem('token');
    const maKhachHang = localStorage.getItem('maKhachHang');

    if (!token || !maKhachHang) {
      sessionStorage.setItem('utc_redirect', `/checkout?showtimeId=${encodeURIComponent(showtime.maSuat)}`);
      navigate('/login');
      return;
    }

    setPaying(true);
    setFlashMessage(null);

    try {
      const createdInvoice = await apiFetch<InvoiceCreateResponse>('/hoa-don', {
        method: 'POST',
        body: JSON.stringify({
          maSuat: showtime.maSuat,
          maKhachHang,
          dsGhe: selectedSeats.map((seat) => seat.maGhe),
        }),
      });

      if (!createdInvoice?.maDon) {
        throw new Error('Backend khong tra ve ma hoa don.');
      }

      if (selectionStorageKey) {
        sessionStorage.removeItem(selectionStorageKey);
      }

      try {
        await apiFetch(
          `/hoa-don/${encodeURIComponent(createdInvoice.maDon)}/thanh-toan`,
          {
            method: 'POST',
            body: JSON.stringify({ phuongThucThanhToan: selectedPayment.backendCode }),
          },
        );

        sessionStorage.setItem(
          'utc_invoice_flash',
          JSON.stringify({ type: 'success', text: 'Thanh toan thanh cong.' }),
        );
      } catch (payError) {
        sessionStorage.setItem(
          'utc_invoice_flash',
          JSON.stringify({
            type: 'error',
            text: `Hoa don da duoc tao, nhung thanh toan chua thanh cong: ${getErrorMessage(payError, 'Loi khong xac dinh')}`,
          }),
        );
      }

      navigate(`/invoice?maDon=${encodeURIComponent(createdInvoice.maDon)}`);
    } catch (submitError) {
      console.error('checkout submit error:', submitError);
      setFlashMessage({
        type: 'error',
        text: `Khong the tao hoa don: ${getErrorMessage(submitError, 'Loi khong xac dinh')}`,
      });

      if (showtime.maSuat) {
        await loadCheckoutData(showtime.maSuat);
      }
    } finally {
      setPaying(false);
    }
  }

  const posterSrc = getPosterUrlSafe(showtime?.poster);
  const movieTitle = showtime?.tenPhim || checkoutState.movieTitle || 'Phim';
  const basePrice = Number(showtime?.gia || 0);
  const baseTotal = basePrice * selectedSeats.length;
  const extraTotal = selectedSeats.reduce((sum, seat) => sum + Number(seat.giaPhuThu || 0), 0);
  const discountTotal = 0;
  const totalAmount = baseTotal + extraTotal - discountTotal;
  const seatLabel = selectedSeats.map((seat) => seat.tenGhe).join(', ');

  return (
    <div className="checkout-page">
      <div className="checkout-shell">
        <div className="checkout-breadcrumb">
          <Link to="/">Trang chu</Link>
          <span>/</span>
          <Link to="/booking">Dat ve</Link>
          <span>/</span>
          {showtimeId ? <Link to={`/booking/${encodeURIComponent(showtimeId)}`}>Chon ghe</Link> : <span>Chon ghe</span>}
          <span>/</span>
          <span>Thanh toan</span>
        </div>

        {flashMessage ? (
          <div className={`checkout-flash ${flashMessage.type}`}>
            {flashMessage.text}
          </div>
        ) : null}

        {loading ? (
          <div className="checkout-loading">
            <div className="checkout-spinner" />
          </div>
        ) : !showtimeId || error || !showtime || !selectedSeats.length ? (
          <div className="checkout-card checkout-error-card">
            <CircleAlert className="checkout-error-icon" />
            <h1>Khong tai duoc buoc thanh toan</h1>
            <p>{error || 'Thong tin ghe hoac suat chieu hien khong kha dung.'}</p>
            <Link to={showtimeId ? `/booking/${encodeURIComponent(showtimeId)}` : '/booking'} className="checkout-back-link">
              Quay lai chon ghe
            </Link>
          </div>
        ) : (
          <>
            <div className="checkout-top-actions">
              <Link to={showtimeId ? `/booking/${encodeURIComponent(showtimeId)}` : '/booking'} className="checkout-return-link">
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lai chon ghe</span>
              </Link>
            </div>

            <section className="checkout-card checkout-order-card">
              <div className="checkout-order-left">
                <img
                  src={posterSrc}
                  alt={movieTitle}
                  className="checkout-poster"
                  referrerPolicy="no-referrer"
                />
                <div className="checkout-order-meta">
                  <h1>{movieTitle}</h1>
                  <div className="checkout-order-lines">
                    <span>Ngay chieu {formatDate(showtime.ngayChieu)}</span>
                    <span>Lich chieu {formatTime(showtime.gioChieu)}</span>
                    <span>Rap chieu {showtime.tenRap || '-'}</span>
                    <span>Phong {showtime.tenPhong || '-'}</span>
                    <span>Loai ghe {getSeatTypeSummary(selectedSeats)}</span>
                    <span>Ghe ngoi {seatLabel}</span>
                  </div>
                </div>
              </div>
              <div className="checkout-order-price">{formatCurrency(totalAmount)}</div>
            </section>

            <section className="checkout-card checkout-total-card">
              <span>Tong so tien dat hang</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </section>

            <section className="checkout-card">
              <div className="checkout-section-header">
                <h2>Giam gia</h2>
                <div className="checkout-section-actions">
                  <button type="button" className="checkout-dark-chip">Cac hinh thuc giam gia</button>
                  <button type="button" className="checkout-light-chip">Quay lai buoc dau</button>
                </div>
              </div>

              <div className="checkout-accordion-list">
                <button
                  type="button"
                  className="checkout-accordion-item"
                  onClick={() => setOpenDiscountPanel((current) => (current === 'voucher' ? null : 'voucher'))}
                >
                  <span>Ve/phieu giam gia/phieu giam gia</span>
                  <ChevronDown className={`h-5 w-5 transition ${openDiscountPanel === 'voucher' ? 'rotate-180' : ''}`} />
                </button>
                {openDiscountPanel === 'voucher' ? (
                  <div className="checkout-accordion-content">
                    Khong co voucher duoc ap dung trong phien dat ve nay.
                  </div>
                ) : null}

                <button
                  type="button"
                  className="checkout-accordion-item"
                  onClick={() => setOpenDiscountPanel((current) => (current === 'points' ? null : 'points'))}
                >
                  <span>Diem</span>
                  <ChevronDown className={`h-5 w-5 transition ${openDiscountPanel === 'points' ? 'rotate-180' : ''}`} />
                </button>
                {openDiscountPanel === 'points' ? (
                  <div className="checkout-accordion-content">
                    Chuc nang diem thuong se duoc bo sung sau.
                  </div>
                ) : null}
              </div>
            </section>

            <section className="checkout-card">
              <div className="checkout-payment-header">Thanh toan</div>

              <div className="checkout-promo-banner">
                <div className="checkout-promo-badge">SHOPEEPAY30</div>
                <div className="checkout-promo-copy">
                  Uu dai mo phong cho buoc thanh toan. Ban co the tiep tuc chon hinh thuc thanh toan ben duoi.
                </div>
              </div>

              <div className="checkout-methods-panel">
                <div className="checkout-methods-grid">
                  {PAYMENT_OPTIONS.map((option) => {
                    const isActive = option.id === selectedPaymentId;
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`checkout-method-card ${isActive ? 'active' : ''}`}
                        onClick={() => setSelectedPaymentId(option.id)}
                      >
                        <Icon className="checkout-method-icon" />
                        <div className="checkout-method-title">{option.title}</div>
                        <div className="checkout-method-subtitle">{option.subtitle}</div>
                      </button>
                    );
                  })}
                </div>

                <label className="checkout-method-radio">
                  <input
                    type="radio"
                    checked
                    readOnly
                  />
                  <span>{selectedPayment.title}</span>
                </label>
              </div>
            </section>

            <section className="checkout-card">
              <div className="checkout-terms-title">DIEU KIEN VA DIEU KHOAN KHI DAT VE</div>
              <div className="checkout-terms-box">
                Xin vui long doc cac dieu khoan sau can than truoc khi su dung dich vu thanh toan truc tuyen.
                Viec tiep tuc voi phan nay dong nghia voi viec ban da dong y voi cac dieu khoan su dung,
                chinh sach hoan tien va quy dinh ve ve xem phim cua UTC Cinema.
                Neu thanh toan thanh cong, hoa don se duoc luu vao he thong va hien thi day du thong tin suat chieu, rap,
                phong va ghe da dat.
              </div>
              <label className="checkout-terms-check">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                />
                <span>
                  Cam ket mua ve xem phim nay cho nguoi xem o do tuoi quy dinh va toi da doc, dong y voi Dieu Kien va Dieu Khoan.
                </span>
              </label>
            </section>
          </>
        )}
      </div>

      {!loading && !error && showtime && selectedSeats.length ? (
        <div className="checkout-footer-bar">
          <div className="checkout-footer-back">
            <Link to={`/booking/${encodeURIComponent(showtime.maSuat)}`}>
              <ArrowLeft className="h-4 w-4" />
              <span>Tro lai</span>
            </Link>
          </div>
          <div className="checkout-footer-metric">
            <span className="label">Thanh tien</span>
            <span className="sub">Dat truoc phim</span>
            <strong>{formatCurrency(baseTotal + extraTotal)}</strong>
          </div>
          <div className="checkout-footer-metric">
            <span className="label">So tien duoc giam</span>
            <span className="sub">Khuyen mai</span>
            <strong>{formatCurrency(discountTotal)}</strong>
          </div>
          <div className="checkout-footer-total">
            <span className="label">Tong tien don hang</span>
            <strong>{formatCurrency(totalAmount)}</strong>
            <button
              type="button"
              onClick={handlePay}
              disabled={!acceptedTerms || paying}
              className="checkout-pay-button"
            >
              {paying ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Dang thanh toan...
                </>
              ) : (
                'Thanh toan'
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getCandidateSeatIds(showtimeId: string, incomingSeatIds?: string[]) {
  if (incomingSeatIds && incomingSeatIds.length) {
    sessionStorage.setItem(
      getSeatSelectionStorageKey(showtimeId),
      JSON.stringify(incomingSeatIds),
    );
    return incomingSeatIds;
  }

  return getSavedSeatIds(showtimeId);
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

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const { headers: optionHeaders, ...restOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(optionHeaders || {}),
    },
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
    return '--/--/----';
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

function getSeatTypeSummary(seats: SelectedSeat[]) {
  const labels = new Set(seats.map((seat) => seat.tenLoaiGhe || 'Thuong'));
  return [...labels].join(', ');
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}
