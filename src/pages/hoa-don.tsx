import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  CreditCard,
  DoorOpen,
  Film,
  MapPin,
  ReceiptText,
  Ticket,
  Wallet,
  XCircle,
} from 'lucide-react';
import { API_BASE_URL } from '../constants';

const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

type InvoiceTicket = {
  tenGhe?: string;
  tenLoaiGhe?: string;
  giaVeCoBan?: number;
  phuThu?: number;
  thanhTien?: number;
};

type InvoiceDetail = {
  maDon?: string;
  maKhachHang?: string;
  trangThai?: string;
  thoiGianDat?: string;
  hanThanhToan?: string;
  thoiGianThanhToan?: string;
  phuongThucThanhToan?: string;
  poster?: string;
  tenPhim?: string;
  tenRap?: string;
  tenPhong?: string;
  gioChieu?: string;
  ngayChieu?: string;
  soVe?: number;
  tongGhe?: number;
  giaVeCoBan?: number;
  tongTien?: number;
  coTheThanhToan?: boolean;
  dsVe?: InvoiceTicket[];
};

type FlashMessage = {
  type: 'success' | 'error';
  text: string;
} | null;

const PAYMENT_METHODS = [
  { value: 'MOMO', label: 'MoMo' },
  { value: 'ZALOPAY', label: 'ZaloPay' },
  { value: 'TIEN_MAT', label: 'Tiền mặt' },
];

export default function HoaDonPage() {
  const [searchParams] = useSearchParams();
  const maDon = searchParams.get('maDon');

  const [invoiceDetail, setInvoiceDetail] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'pay' | 'cancel' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdownText, setCountdownText] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MOMO');
  const [flashMessage, setFlashMessage] = useState<FlashMessage>(null);

  useEffect(() => {
    document.title = 'UTC Cinema - Hóa Đơn';
  }, []);

  useEffect(() => {
    if (!maDon) {
      setLoading(false);
      setError('Không tìm thấy mã hóa đơn.');
      return;
    }

    loadInvoice(maDon, true);
  }, [maDon]);

  useEffect(() => {
    if (!invoiceDetail?.phuongThucThanhToan) {
      return;
    }

    setPaymentMethod(invoiceDetail.phuongThucThanhToan);
  }, [invoiceDetail?.phuongThucThanhToan]);

  useEffect(() => {
    if (!invoiceDetail?.coTheThanhToan || !invoiceDetail.hanThanhToan || !invoiceDetail.maDon) {
      setCountdownText('');
      return;
    }

    let active = true;

    const updateCountdown = async () => {
      const diff = new Date(invoiceDetail.hanThanhToan || '').getTime() - Date.now();

      if (!active) {
        return;
      }

      if (!Number.isFinite(diff) || diff <= 0) {
        setCountdownText('Hóa đơn đã hết hạn, đang cập nhật...');
        await loadInvoice(invoiceDetail.maDon, false);
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
      const seconds = String(totalSeconds % 60).padStart(2, '0');
      setCountdownText(`Giữ ghế tới: ${minutes}:${seconds}`);
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [invoiceDetail?.coTheThanhToan, invoiceDetail?.hanThanhToan, invoiceDetail?.maDon, invoiceDetail?.trangThai]);

  async function loadInvoice(invoiceId: string, showSkeleton = false) {
    if (showSkeleton) {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await apiFetch<InvoiceDetail>(`/hoa-don/${encodeURIComponent(invoiceId)}`);
      setInvoiceDetail(data);
    } catch (loadError) {
      console.error('load invoice error:', loadError);
      setInvoiceDetail(null);
      setError(getErrorMessage(loadError, 'Không tải được hóa đơn.'));
    } finally {
      setLoading(false);
    }
  }

  async function payInvoice() {
    if (!invoiceDetail?.maDon) {
      return;
    }

    setActionLoading('pay');
    setFlashMessage(null);

    try {
      const updated = await apiFetch<InvoiceDetail>(
        `/hoa-don/${encodeURIComponent(invoiceDetail.maDon)}/thanh-toan`,
        {
          method: 'POST',
          body: JSON.stringify({ phuongThucThanhToan: paymentMethod }),
        },
      );

      setInvoiceDetail(updated);
      setFlashMessage({ type: 'success', text: 'Thanh toán thành công.' });
    } catch (payError) {
      setFlashMessage({ type: 'error', text: `Thanh toán thất bại: ${getErrorMessage(payError, 'Lỗi không xác định')}` });
    } finally {
      setActionLoading(null);
    }
  }

  async function cancelInvoice() {
    if (!invoiceDetail?.maDon) {
      return;
    }

    if (!window.confirm('Bạn có chắc muốn hủy hóa đơn này?')) {
      return;
    }

    setActionLoading('cancel');
    setFlashMessage(null);

    try {
      const updated = await apiFetch<InvoiceDetail>(
        `/hoa-don/${encodeURIComponent(invoiceDetail.maDon)}/huy`,
        { method: 'POST' },
      );

      setInvoiceDetail(updated);
      setFlashMessage({ type: 'success', text: 'Đã hủy hóa đơn.' });
    } catch (cancelError) {
      setFlashMessage({ type: 'error', text: `Không thể hủy hóa đơn: ${getErrorMessage(cancelError, 'Lỗi không xác định')}` });
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] px-6 pt-28 text-white">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6 lg:px-6">
          <div className="h-5 w-72 rounded-full bg-white/10" />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <div className="h-40 rounded-[2rem] bg-white/10" />
              <div className="grid gap-6 md:grid-cols-2">
                <div className="h-72 rounded-[2rem] bg-white/10" />
                <div className="h-72 rounded-[2rem] bg-white/10" />
              </div>
              <div className="h-72 rounded-[2rem] bg-white/10" />
            </div>
            <div className="space-y-6">
              <div className="h-64 rounded-[2rem] bg-white/10" />
              <div className="h-56 rounded-[2rem] bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!maDon || error || !invoiceDetail) {
    return (
      <div className="min-h-screen bg-[#050505] px-6 pt-28 text-white">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-500/20 bg-white/5 px-8 py-16 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-300">
            <CircleAlert className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-white">Không tải được hóa đơn</h1>
          <p className="mt-4 text-base leading-7 text-white/60">
            {error || 'Dữ liệu hóa đơn hiện không khả dụng.'}
          </p>
          <Link
            to="/booking"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold px-6 py-3 font-semibold text-black transition hover:bg-gold-light"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đặt vé
          </Link>
        </div>
      </div>
    );
  }

  const posterSrc = getPosterUrlSafe(invoiceDetail.poster);
  const statusConfig = getStatusConfig(invoiceDetail.trangThai);
  const isPending = invoiceDetail.trangThai !== 'DA_THANH_TOAN' && invoiceDetail.trangThai !== 'DA_HUY' && invoiceDetail.coTheThanhToan;

  return (
    <div className="min-h-screen bg-[#050505] pb-16 pt-28 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <nav className="mb-8 flex flex-wrap items-center gap-3 text-sm text-white/50">
          <Link to="/" className="transition hover:text-gold">Trang chủ</Link>
          <span>/</span>
          <Link to="/booking" className="transition hover:text-gold">Đặt vé</Link>
          <span>/</span>
          <span className="text-white/85">Hóa đơn</span>
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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-6 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.28)] lg:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-gold/65">Invoice</p>
                  <h1 className="mt-3 font-serif text-4xl font-bold text-white">
                    Hóa đơn {invoiceDetail.maDon || ''}
                  </h1>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-white/60">
                    Thông tin chi tiết đơn đặt vé, tình trạng thanh toán và danh sách vé được giữ trong hóa đơn này.
                  </p>
                </div>

                <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${statusConfig.className}`}>
                  <statusConfig.icon className="h-4 w-4" />
                  <span>{statusConfig.label}</span>
                </div>
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <div className="glass-card rounded-[2rem] border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
                <SectionTitle icon={ReceiptText} title="Thông tin hóa đơn" />
                <div className="mt-5 space-y-4">
                  <MetaRow label="Mã khách hàng" value={invoiceDetail.maKhachHang || '-'} />
                  <MetaRow label="Thời gian tạo" value={formatDateTime(invoiceDetail.thoiGianDat)} />
                  <MetaRow label="Hạn thanh toán" value={formatDateTime(invoiceDetail.hanThanhToan)} />
                  <MetaRow label="Thanh toán lúc" value={formatDateTime(invoiceDetail.thoiGianThanhToan)} />
                  <MetaRow label="Phương thức" value={invoiceDetail.phuongThucThanhToan || '-'} />
                </div>
              </div>

              <div className="glass-card rounded-[2rem] border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
                <SectionTitle icon={Film} title="Thông tin suất chiếu" />
                <div className="mt-5 flex flex-col gap-5 sm:flex-row">
                  <img
                    className="h-[220px] w-[156px] rounded-[1.5rem] object-cover"
                    src={posterSrc}
                    alt={invoiceDetail.tenPhim || 'Poster phim'}
                    referrerPolicy="no-referrer"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="text-2xl font-semibold text-white">{invoiceDetail.tenPhim || '-'}</h3>
                    <div className="mt-4 space-y-3 text-sm text-white/65">
                      <InfoLine icon={MapPin} text={invoiceDetail.tenRap || '-'} />
                      <InfoLine icon={DoorOpen} text={invoiceDetail.tenPhong || '-'} />
                      <InfoLine icon={Clock3} text={`${formatTime(invoiceDetail.gioChieu)} · ${formatDate(invoiceDetail.ngayChieu)}`} />
                      <InfoLine icon={Ticket} text={`${invoiceDetail.soVe || 0} ghế / ${invoiceDetail.tongGhe || 0} ghế`} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="glass-card rounded-[2rem] border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
              <SectionTitle icon={Ticket} title="Danh sách vé" />
              {invoiceDetail.dsVe && invoiceDetail.dsVe.length ? (
                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-[0.18em] text-white/35">
                        <th className="px-4">Ghế</th>
                        <th className="px-4">Loại ghế</th>
                        <th className="px-4">Giá cơ bản</th>
                        <th className="px-4">Phụ thu</th>
                        <th className="px-4 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceDetail.dsVe.map((ticket, index) => (
                        <tr key={`${ticket.tenGhe || 've'}-${index}`} className="bg-black/25">
                          <td className="rounded-l-2xl px-4 py-4 font-semibold text-white">{ticket.tenGhe || '-'}</td>
                          <td className="px-4 py-4 text-white/70">{ticket.tenLoaiGhe || '-'}</td>
                          <td className="px-4 py-4 text-white/70">{formatCurrency(ticket.giaVeCoBan || 0)}</td>
                          <td className="px-4 py-4 text-white/70">{formatCurrency(ticket.phuThu || 0)}</td>
                          <td className="rounded-r-2xl px-4 py-4 text-right font-semibold text-gold">{formatCurrency(ticket.thanhTien || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyNote message="Hóa đơn hiện không còn vé nào." />
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="glass-card rounded-[2rem] border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
              <SectionTitle icon={Wallet} title="Tổng kết thanh toán" />
              <div className="mt-5 space-y-4">
                <MetaRow label="Giá vé cơ bản" value={formatCurrency(invoiceDetail.giaVeCoBan || 0)} />
                <MetaRow label="Số lượng ghế" value={String(invoiceDetail.soVe || 0)} />
                <MetaRow label="Tổng thanh toán" value={formatCurrency(invoiceDetail.tongTien || 0)} />
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5 text-lg font-bold">
                <span className="text-white">Tổng cộng</span>
                <span className="text-gold">{formatCurrency(invoiceDetail.tongTien || 0)}</span>
              </div>
            </section>

            <section className="glass-card rounded-[2rem] border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
              <SectionTitle icon={CreditCard} title="Thao tác" />
              <div className="mt-5 space-y-4">
                {invoiceDetail.trangThai === 'DA_THANH_TOAN' ? (
                  <>
                    <p className="text-sm leading-7 text-white/60">Hóa đơn đã được thanh toán thành công.</p>
                    <Link
                      to="/"
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:border-gold/30 hover:text-gold"
                    >
                      Về trang chủ
                    </Link>
                  </>
                ) : invoiceDetail.trangThai === 'DA_HUY' || !invoiceDetail.coTheThanhToan ? (
                  <>
                    <p className="text-sm leading-7 text-white/60">Hóa đơn này không còn hiệu lực thanh toán.</p>
                    <Link
                      to="/booking"
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-gold px-4 py-3 font-semibold text-black transition hover:bg-gold-light"
                    >
                      Đặt vé mới
                    </Link>
                  </>
                ) : (
                  <>
                    <label className="text-xs uppercase tracking-[0.18em] text-white/40">Phương thức thanh toán</label>
                    <select
                      value={paymentMethod}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-gold/40"
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method.value} value={method.value} className="bg-[#111111]">
                          {method.label}
                        </option>
                      ))}
                    </select>

                    {countdownText ? (
                      <div className="rounded-2xl border border-amber-400/15 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                        {countdownText}
                      </div>
                    ) : null}

                    <div className="grid gap-3">
                      <button
                        type="button"
                        onClick={payInvoice}
                        disabled={actionLoading !== null}
                        className="inline-flex items-center justify-center rounded-2xl bg-gold px-4 py-3 font-semibold text-black transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionLoading === 'pay' ? 'Đang thanh toán...' : 'Thanh toán ngay'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelInvoice}
                        disabled={actionLoading !== null}
                        className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:border-red-400/30 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionLoading === 'cancel' ? 'Đang hủy...' : 'Hủy hóa đơn'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: typeof ReceiptText;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/10 text-gold">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-gold/65">Panel</p>
        <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4 text-sm last:border-b-0 last:pb-0">
      <span className="text-white/45">{label}</span>
      <strong className="text-right text-white">{value || '-'}</strong>
    </div>
  );
}

function InfoLine({
  icon: Icon,
  text,
}: {
  icon: typeof MapPin;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-gold" />
      <span>{text}</span>
    </div>
  );
}

function EmptyNote({ message }: { message: string }) {
  return (
    <div className="mt-5 flex min-h-[160px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center">
      <Ticket className="h-7 w-7 text-gold" />
      <p className="mt-4 text-sm leading-7 text-white/55">{message}</p>
    </div>
  );
}

function getStatusConfig(status?: string) {
  switch (status) {
    case 'DA_THANH_TOAN':
      return {
        label: 'Đã thanh toán',
        icon: CheckCircle2,
        className: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300',
      };
    case 'DA_HUY':
      return {
        label: 'Đã hủy',
        icon: XCircle,
        className: 'border-red-400/20 bg-red-500/10 text-red-300',
      };
    default:
      return {
        label: 'Chờ thanh toán',
        icon: Clock3,
        className: 'border-amber-400/20 bg-amber-500/10 text-amber-200',
      };
  }
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

function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('vi-VN');
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTime(value?: string | null) {
  return value ? String(value).slice(0, 5) : '--:--';
}

function formatCurrency(value: number) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
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
