import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  CreditCard,
  Landmark,
  LoaderCircle,
  MapPin,
  QrCode,
  ShieldCheck,
  Smartphone,
  Ticket,
  Wallet,
} from 'lucide-react';
import { API_BASE_URL } from '../constants';

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
  badge: string;
};

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'credit-card',
    backendCode: 'THE_NGAN_HANG',
    title: 'The Quoc Te',
    subtitle: 'Visa, Mastercard, JCB',
    icon: CreditCard,
    badge: 'Bank Card',
  },
  {
    id: 'atm-card',
    backendCode: 'THE_NGAN_HANG',
    title: 'ATM / QR',
    subtitle: 'The noi dia va internet banking',
    icon: Landmark,
    badge: 'ATM',
  },
  {
    id: 'ewallet',
    backendCode: 'MOMO',
    title: 'Vi Dien Tu',
    subtitle: 'MoMo, ZaloPay, ShopeePay',
    icon: Smartphone,
    badge: 'Wallet',
  },
  {
    id: 'vietqr',
    backendCode: 'VNPAY',
    title: 'VietQR / VNPay',
    subtitle: 'Chuyen khoan nhanh va OnePay',
    icon: QrCode,
    badge: 'QR Pay',
  },
  {
    id: 'counter-wallet',
    backendCode: 'TIEN_MAT',
    title: 'Tien Mat',
    subtitle: 'Thanh toan tai quay',
    icon: Wallet,
    badge: 'Cash',
  },
];

export default function CheckoutStyledPage() {
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
  const [openDiscountPanel, setOpenDiscountPanel] = useState<'voucher' | 'points' | null>('voucher');

  const selectionStorageKey = getSeatSelectionStorageKey(showtimeId || undefined);
  const selectedPayment = useMemo(
    () => PAYMENT_OPTIONS.find((option) => option.id === selectedPaymentId) || PAYMENT_OPTIONS[0],
    [selectedPaymentId],
  );

  useEffect(() => {
    document.title = 'UTC Cinema - Thanh Toan';
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

  async function loadCheckoutData(
    targetShowtimeId: string,
    options: {
      preserveFlash?: boolean;
    } = {},
  ) {
    setLoading(true);
    setError(null);

    if (!options.preserveFlash) {
      setFlashMessage(null);
    }

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
      const restoredSeats = normalizedSeats
        .filter((seat) => candidateSeatIds.includes(seat.maGhe))
        .map(mapSeatSelection);

      if (!restoredSeats.length) {
        throw new Error('Khong the khoi phuc danh sach ghe da chon.');
      }

      setShowtime(loadedShowtime);
      setSelectedSeats(restoredSeats);
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
        await apiFetch(`/hoa-don/${encodeURIComponent(createdInvoice.maDon)}/thanh-toan`, {
          method: 'POST',
          body: JSON.stringify({ phuongThucThanhToan: selectedPayment.backendCode }),
        });

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
      const errorText = `Khong the tao hoa don: ${getErrorMessage(submitError, 'Loi khong xac dinh')}`;

      setFlashMessage({
        type: 'error',
        text: errorText,
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (showtime.maSuat) {
        await loadCheckoutData(showtime.maSuat, { preserveFlash: true });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] px-6 pb-20 pt-28 text-white">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6 lg:px-6">
          <div className="h-5 w-72 rounded-full bg-white/10" />
          <div className="h-48 rounded-[2rem] bg-white/10" />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <div className="h-56 rounded-[2rem] bg-white/10" />
              <div className="h-72 rounded-[2rem] bg-white/10" />
              <div className="h-52 rounded-[2rem] bg-white/10" />
            </div>
            <div className="h-[540px] rounded-[2rem] bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (!showtimeId || error || !showtime || !selectedSeats.length) {
    return (
      <div className="min-h-screen bg-[#050505] px-6 pb-20 pt-28 text-white">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-500/20 bg-white/5 px-8 py-16 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-300">
            <CircleAlert className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-white">Khong tai duoc buoc thanh toan</h1>
          <p className="mt-4 text-base leading-7 text-white/60">
            {error || 'Thong tin ghe hoac suat chieu hien khong kha dung.'}
          </p>
          <Link
            to={showtimeId ? `/booking/${encodeURIComponent(showtimeId)}` : '/booking'}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold px-6 py-3 font-semibold text-black transition hover:bg-gold-light"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lai chon ghe
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-16 pt-28 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <nav className="mb-8 flex flex-wrap items-center gap-3 text-sm text-white/50">
          <Link to="/" className="transition hover:text-gold">Trang chu</Link>
          <span>/</span>
          <Link to="/booking" className="transition hover:text-gold">Dat ve</Link>
          <span>/</span>
          <Link to={`/booking/${encodeURIComponent(showtime.maSuat)}`} className="transition hover:text-gold">Chon ghe</Link>
          <span>/</span>
          <span className="text-white/85">Thanh toan</span>
        </nav>

        {flashMessage ? (
          <div
            className={`mb-6 flex items-start gap-3 rounded-[1.5rem] border px-5 py-4 text-sm ${
              flashMessage.type === 'success'
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
                : 'border-red-500/20 bg-red-500/10 text-red-200'
            }`}
          >
            {flashMessage.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <CircleAlert className="h-5 w-5 shrink-0" />}
            <span>{flashMessage.text}</span>
          </div>
        ) : null}

        <section className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-6 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.28)] lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)_220px] lg:items-center">
            <img
              src={posterSrc}
              alt={movieTitle}
              className="h-[240px] w-[170px] rounded-[1.5rem] object-cover"
              referrerPolicy="no-referrer"
            />

            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gold/65">Checkout</p>
              <h1 className="mt-3 font-serif text-4xl font-bold text-white">{movieTitle}</h1>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/60">
                <InfoBadge label="Ngay chieu" value={formatDate(showtime.ngayChieu)} />
                <InfoBadge label="Gio chieu" value={formatTime(showtime.gioChieu)} />
                <InfoBadge label="Rap" value={showtime.tenRap || '-'} />
                <InfoBadge label="Phong" value={showtime.tenPhong || '-'} />
              </div>
              <div className="mt-5 flex items-start gap-3 text-sm text-white/60">
                <MapPin className="mt-0.5 h-4 w-4 text-gold" />
                <div>
                  <div>{getSeatTypeSummary(selectedSeats)}</div>
                  <div className="mt-1 text-white/85">{seatLabel}</div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-gold/20 bg-black/30 p-5 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">Tong thanh toan</p>
              <div className="mt-3 text-4xl font-bold text-gold">{formatCurrency(totalAmount)}</div>
              <p className="mt-3 text-sm text-white/45">{selectedSeats.length} ghe da chon</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="glass-card overflow-hidden border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
              <div className="border-b border-white/10 px-6 py-5">
                <p className="text-xs uppercase tracking-[0.22em] text-gold/65">Discount</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Khuyen mai va giam gia</h2>
              </div>

              <div className="space-y-3 px-6 py-5">
                <AccordionButton
                  active={openDiscountPanel === 'voucher'}
                  label="Ve / voucher / phieu giam gia"
                  onClick={() => setOpenDiscountPanel((current) => (current === 'voucher' ? null : 'voucher'))}
                />
                {openDiscountPanel === 'voucher' ? (
                  <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-black/20 px-5 py-4 text-sm leading-7 text-white/55">
                    Chua co voucher kha dung trong phien dat ve nay. Neu backend bo sung ma khuyen mai, phan nay co the noi tiep vao API.
                  </div>
                ) : null}

                <AccordionButton
                  active={openDiscountPanel === 'points'}
                  label="Diem thanh vien"
                  onClick={() => setOpenDiscountPanel((current) => (current === 'points' ? null : 'points'))}
                />
                {openDiscountPanel === 'points' ? (
                  <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-black/20 px-5 py-4 text-sm leading-7 text-white/55">
                    Tinh nang diem thuong chua duoc backend cung cap, nen tam thoi hien thong bao placeholder.
                  </div>
                ) : null}
              </div>
            </section>

            <section className="glass-card overflow-hidden border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
              <div className="border-b border-white/10 px-6 py-5">
                <p className="text-xs uppercase tracking-[0.22em] text-gold/65">Payment</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Chon phuong thuc thanh toan</h2>
              </div>

              <div className="p-6">
                <div className="mb-5 rounded-[1.5rem] bg-[linear-gradient(135deg,#5d2f16,#c86424_55%,#ee9d42)] p-5">
                  <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
                    Fast Checkout
                  </div>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85">
                    Hoan tat thanh toan de he thong tao hoa don, luu ve vao database va chuyen sang man hinh hoa don chi tiet.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {PAYMENT_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const active = option.id === selectedPaymentId;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedPaymentId(option.id)}
                        className={`rounded-[1.5rem] border p-5 text-left transition ${
                          active
                            ? 'border-gold bg-gold/10 shadow-[0_0_24px_rgba(212,175,55,0.12)]'
                            : 'border-white/10 bg-black/25 hover:border-gold/25 hover:bg-black/35'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${active ? 'bg-gold text-black' : 'bg-white/10 text-gold'}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${active ? 'bg-gold text-black' : 'border border-white/10 bg-white/5 text-white/50'}`}>
                            {option.badge}
                          </span>
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-white">{option.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-white/55">{option.subtitle}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="glass-card overflow-hidden border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
              <div className="border-b border-white/10 px-6 py-5">
                <p className="text-xs uppercase tracking-[0.22em] text-gold/65">Terms</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Dieu kien va dieu khoan</h2>
              </div>

              <div className="p-6">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-5 py-5 text-sm leading-7 text-white/60">
                  Xin vui long doc ky dieu khoan truoc khi thanh toan. Khi tiep tuc, he thong se tao hoa don, luu thong tin ghe,
                  suat chieu, phong, rap va cap nhat trang thai thanh toan theo du lieu backend hien co.
                </div>

                <label className="mt-5 flex items-start gap-3 text-sm leading-7 text-white/70">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-black/30 text-gold focus:ring-gold"
                  />
                  <span>
                    Toi da doc va dong y voi dieu kien su dung, quy dinh do tuoi va chinh sach thanh toan cua UTC Cinema.
                  </span>
                </label>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="glass-card sticky top-24 border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gold/65">Summary</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">Thong tin don hang</h2>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <SummaryRow label="Suat chieu" value={`${formatDate(showtime.ngayChieu)} · ${formatTime(showtime.gioChieu)}`} />
                <SummaryRow label="Rap / Phong" value={`${showtime.tenRap || '-'} · ${showtime.tenPhong || '-'}`} />
                <SummaryRow label="Loai ghe" value={getSeatTypeSummary(selectedSeats)} />
                <SummaryRow label="Ghe da chon" value={seatLabel} emphasize />
                <SummaryRow label={`Gia ve (${selectedSeats.length})`} value={formatCurrency(baseTotal)} />
                <SummaryRow label="Phu thu ghe" value={formatCurrency(extraTotal)} />
                <SummaryRow label="Giam gia" value={formatCurrency(discountTotal)} />
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-gold/15 bg-black/35 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">Tong cong</p>
                    <p className="mt-1 text-sm text-white/55">{selectedPayment.title}</p>
                  </div>
                  <div className="text-right text-3xl font-bold text-gold">{formatCurrency(totalAmount)}</div>
                </div>
              </div>

              {flashMessage ? (
                <div className="mt-4">
                  <FlashNotice message={flashMessage} />
                </div>
              ) : null}

              <button
                type="button"
                onClick={handlePay}
                disabled={!acceptedTerms || paying}
                className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gold px-4 py-4 text-base font-semibold text-black transition hover:bg-gold-light disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
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

              <Link
                to={`/booking/${encodeURIComponent(showtime.maSuat)}`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-gold/25 hover:text-gold"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lai chon ghe
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-black/25 px-4 py-2">
      <span className="text-white/40">{label}</span>
      <span className="ml-2 font-semibold text-white">{value}</span>
    </div>
  );
}

function FlashNotice({ message }: { message: NonNullable<FlashMessage> }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-[1.5rem] border px-5 py-4 text-sm ${
        message.type === 'success'
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
          : 'border-red-500/20 bg-red-500/10 text-red-200'
      }`}
    >
      {message.type === 'success' ? (
        <CheckCircle2 className="h-5 w-5 shrink-0" />
      ) : (
        <CircleAlert className="h-5 w-5 shrink-0" />
      )}
      <span>{message.text}</span>
    </div>
  );
}

function AccordionButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-[1.25rem] border px-5 py-4 text-left transition ${
        active
          ? 'border-gold/30 bg-gold/10 text-white'
          : 'border-white/10 bg-black/25 text-white/75 hover:border-gold/20 hover:text-white'
      }`}
    >
      <span className="font-medium">{label}</span>
      <ChevronDown className={`h-5 w-5 transition ${active ? 'rotate-180 text-gold' : ''}`} />
    </button>
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

function getCandidateSeatIds(showtimeId: string, incomingSeatIds?: string[]) {
  if (incomingSeatIds && incomingSeatIds.length) {
    sessionStorage.setItem(getSeatSelectionStorageKey(showtimeId), JSON.stringify(incomingSeatIds));
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
