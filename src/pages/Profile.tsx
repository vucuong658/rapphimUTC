import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  CreditCard,
  LogOut,
  MapPin,
  ReceiptText,
  RefreshCw,
  Settings,
  Ticket,
  User,
  XCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { API_BASE_URL } from '../constants';

type ProfileTab = 'Bookings' | 'Settings';

type BookingTicket = {
  maVe?: string;
  tenGhe?: string;
  tenLoaiGhe?: string;
  giaVeCoBan?: number;
  phuThu?: number;
  thanhTien?: number;
  trangThaiVe?: string;
};

type BookingInvoice = {
  maDon?: string;
  maKhachHang?: string;
  tongTien?: number;
  thoiGianDat?: string;
  thoiGianThanhToan?: string;
  hanThanhToan?: string;
  trangThai?: string;
  phuongThucThanhToan?: string;
  maSuat?: string;
  ngayChieu?: string;
  gioChieu?: string;
  maPhim?: string;
  tenPhim?: string;
  poster?: string;
  maPhong?: string;
  tenPhong?: string;
  maRap?: string;
  tenRap?: string;
  soVe?: number;
  coTheThanhToan?: boolean;
  dsVe?: BookingTicket[];
};

type FlashMessage =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

type StatusConfig = {
  label: string;
  cardClass: string;
  badgeClass: string;
  icon: typeof CheckCircle2;
};

const TABS: ProfileTab[] = ['Bookings', 'Settings'];
const CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN');

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>('Bookings');
  const [invoices, setInvoices] = useState<BookingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<FlashMessage>(null);
  const [cancelingInvoiceId, setCancelingInvoiceId] = useState<string | null>(null);

  const token = localStorage.getItem('token') || '';
  const maKhachHang = localStorage.getItem('maKhachHang') || '';
  const paidInvoices = invoices.filter((invoice) => invoice.trangThai === 'DA_THANH_TOAN');
  const pendingInvoices = invoices.filter((invoice) => invoice.trangThai === 'CHUA_THANH_TOAN');
  const cancelledInvoices = invoices.filter((invoice) => invoice.trangThai === 'DA_HUY');

  useEffect(() => {
    document.title = 'UTC Cinema - Profile';
  }, []);

  useEffect(() => {
    if (!token || !maKhachHang) {
      sessionStorage.setItem('utc_redirect', '/profile');
      navigate('/login');
      return;
    }

    void loadInvoices(maKhachHang, token);
  }, [maKhachHang, navigate, token]);

  async function loadInvoices(customerId: string, authToken: string) {
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<BookingInvoice[]>(
        `/hoa-don/khach-hang/${encodeURIComponent(customerId)}`,
        authToken,
      );
      setInvoices(Array.isArray(data) ? data : []);
    } catch (loadError) {
      console.error('profile bookings load error:', loadError);
      setInvoices([]);
      setError(getErrorMessage(loadError, 'Khong tai duoc danh sach ve da dat.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(invoice: BookingInvoice) {
    if (!token || !maKhachHang) {
      sessionStorage.setItem('utc_redirect', '/profile');
      navigate('/login');
      return;
    }

    if (!invoice.maDon) {
      return;
    }

    if (!canCancelInvoice(invoice)) {
      setFlashMessage({
        type: 'error',
        text: 'Hoa don nay khong con du dieu kien de huy.',
      });
      return;
    }

    const isPaidInvoice = invoice.trangThai === 'DA_THANH_TOAN';
    const confirmText = isPaidInvoice
      ? 'Ban co chac muon huy ve cua hoa don nay?'
      : 'Ban co chac muon huy giu cho cua hoa don nay?';

    if (!window.confirm(confirmText)) {
      return;
    }

    setCancelingInvoiceId(invoice.maDon);
    setFlashMessage(null);

    try {
      await apiFetch<BookingInvoice>(
        `/hoa-don/${encodeURIComponent(invoice.maDon)}/${isPaidInvoice ? 'huy-ve' : 'huy'}`,
        token,
        { method: 'POST' },
      );

      setFlashMessage({
        type: 'success',
        text: isPaidInvoice
          ? `Da huy ve cho hoa don ${invoice.maDon}.`
          : `Da huy giu cho cho hoa don ${invoice.maDon}.`,
      });
      await loadInvoices(maKhachHang, token);
    } catch (cancelError) {
      setFlashMessage({
        type: 'error',
        text: `Khong the huy hoa don: ${getErrorMessage(cancelError, 'Loi khong xac dinh')}`,
      });
    } finally {
      setCancelingInvoiceId(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('maKhachHang');
    sessionStorage.removeItem('utc_redirect');
    navigate('/');
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-8">
        <aside className="space-y-6">
          <div className="glass-card p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(217,179,58,0.14),_transparent_60%)] pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full border-2 border-gold/70 bg-black/60 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(217,179,58,0.16)]">
                <User className="w-11 h-11 text-gold" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold/80 mb-3">Customer Profile</p>
              <h1 className="text-3xl font-bold leading-tight">Khach hang {maKhachHang || 'UTC'}</h1>
              <p className="mt-2 text-sm text-white/50">Noi luu tat ca hoa don da dat, trang thai giu ghe va thao tac huy khi can.</p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-xs font-semibold text-gold">
                <Ticket className="w-4 h-4" />
                {invoices.length} hoa don
              </div>
            </div>
          </div>

          <div className="glass-card p-5 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/40">Da thanh toan</p>
              <div className="mt-2 text-3xl font-bold text-white">{paidInvoices.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/40">Dang giu cho</p>
              <div className="mt-2 text-3xl font-bold text-gold">{pendingInvoices.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/40">Da huy</p>
              <div className="mt-2 text-3xl font-bold text-white/60">{cancelledInvoices.length}</div>
            </div>
          </div>

          <div className="glass-card p-4 space-y-2">
            <button
              type="button"
              onClick={() => setActiveTab('Settings')}
              className={cn(
                'w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                activeTab === 'Settings'
                  ? 'bg-gold text-black'
                  : 'text-white/70 hover:bg-white/5 hover:text-white',
              )}
            >
              <Settings className="w-4 h-4" />
              Cai dat tai khoan
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              Dang xuat
            </button>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-2">
            <div className="flex gap-8">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'relative pb-4 text-sm font-bold uppercase tracking-[0.3em] transition-colors',
                    activeTab === tab ? 'text-gold' : 'text-white/40 hover:text-white',
                  )}
                >
                  {tab}
                  {activeTab === tab ? (
                    <motion.div layoutId="profile-active-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                  ) : null}
                </button>
              ))}
            </div>

            {activeTab === 'Bookings' ? (
              <button
                type="button"
                onClick={() => void loadInvoices(maKhachHang, token)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition-all hover:border-gold/30 hover:text-gold"
              >
                <RefreshCw className="w-4 h-4" />
                Tai lai
              </button>
            ) : null}
          </div>

          {flashMessage ? (
            <div
              className={cn(
                'flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm',
                flashMessage.type === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-red-500/30 bg-red-500/10 text-red-200',
              )}
            >
              {flashMessage.type === 'success' ? (
                <CheckCircle2 className="mt-0.5 w-5 h-5 shrink-0" />
              ) : (
                <CircleAlert className="mt-0.5 w-5 h-5 shrink-0" />
              )}
              <span>{flashMessage.text}</span>
            </div>
          ) : null}

          {activeTab === 'Bookings' ? (
            <div className="space-y-6">
              {loading ? (
                <div className="grid gap-5">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="glass-card overflow-hidden border-white/10 p-6 animate-pulse"
                    >
                      <div className="flex flex-col gap-6 md:flex-row">
                        <div className="h-44 w-full rounded-2xl bg-white/5 md:w-32" />
                        <div className="flex-1 space-y-4">
                          <div className="h-6 w-56 rounded-full bg-white/5" />
                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="h-16 rounded-2xl bg-white/5" />
                            <div className="h-16 rounded-2xl bg-white/5" />
                            <div className="h-16 rounded-2xl bg-white/5" />
                          </div>
                          <div className="h-12 rounded-2xl bg-white/5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {!loading && error ? (
                <div className="glass-card border border-red-500/20 bg-red-500/10 p-8 text-red-200">
                  <div className="flex items-start gap-3">
                    <CircleAlert className="mt-0.5 w-5 h-5 shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold">Khong tai duoc danh sach dat ve</h3>
                      <p className="mt-2 text-sm text-red-200/80">{error}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {!loading && !error && invoices.length === 0 ? (
                <div className="glass-card p-10 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                    <Ticket className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold">Chua co ve nao trong tai khoan</h3>
                  <p className="mt-3 text-sm text-white/50">
                    Khi ban dat ve thanh cong, hoa don va danh sach ghe se xuat hien tai day.
                  </p>
                  <Link to="/booking" className="btn-gold mt-6 inline-flex items-center justify-center px-6 py-3 text-sm">
                    Dat ve ngay
                  </Link>
                </div>
              ) : null}

              {!loading && !error
                ? invoices.map((invoice, index) => {
                    const statusConfig = getStatusConfig(invoice.trangThai);
                    const StatusIcon = statusConfig.icon;
                    const seatSummary = getSeatSummary(invoice.dsVe);
                    const pendingCountdown = getPendingCountdown(invoice.hanThanhToan, invoice.coTheThanhToan);
                    const canCancel = canCancelInvoice(invoice);
                    const cancelLabel = getCancelLabel(invoice);
                    const cancelHelperText = getCancelHelperText(invoice);

                    return (
                      <motion.div
                        key={invoice.maDon || index}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.28, delay: index * 0.04 }}
                        className={cn(
                          'glass-card overflow-hidden border p-6 transition-all',
                          statusConfig.cardClass,
                        )}
                      >
                        <div className="flex flex-col gap-6 md:flex-row">
                          <div className="w-full md:w-36 shrink-0">
                            <div className="aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                              {invoice.poster ? (
                                <img
                                  src={invoice.poster}
                                  alt={invoice.tenPhim || 'Poster phim'}
                                  className="h-full w-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(217,179,58,0.24),_transparent_65%)]">
                                  <Ticket className="w-10 h-10 text-gold" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 space-y-5">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold/80">Booking</p>
                                <h2 className="mt-2 text-2xl font-bold">{invoice.tenPhim || 'Hoa don phim'}</h2>
                                <p className="mt-2 text-sm text-white/40">Ma don {invoice.maDon || '---'}</p>
                              </div>

                              <div className={cn('inline-flex items-center gap-2 self-start rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.2em]', statusConfig.badgeClass)}>
                                <StatusIcon className="w-4 h-4" />
                                {statusConfig.label}
                              </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                              <InfoTile
                                icon={CalendarDays}
                                label="Ngay chieu"
                                value={formatDate(invoice.ngayChieu)}
                              />
                              <InfoTile
                                icon={Clock3}
                                label="Gio chieu"
                                value={formatTime(invoice.gioChieu)}
                              />
                              <InfoTile
                                icon={MapPin}
                                label="Rap / Phong"
                                value={joinText(invoice.tenRap, invoice.tenPhong)}
                              />
                              <InfoTile
                                icon={Ticket}
                                label="So ghe"
                                value={seatSummary}
                              />
                            </div>

                            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px]">
                              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                                <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                                  <span className="inline-flex items-center gap-2">
                                    <ReceiptText className="w-4 h-4 text-gold" />
                                    Dat luc {formatDateTime(invoice.thoiGianDat)}
                                  </span>
                                  <span className="inline-flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-gold" />
                                    {formatPaymentMethod(invoice.phuongThucThanhToan)}
                                  </span>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                  {(invoice.dsVe || []).map((ticket) => (
                                    <span
                                      key={ticket.maVe || ticket.tenGhe}
                                      className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-medium text-white/75"
                                    >
                                      {ticket.tenGhe || 'Ghe'} {ticket.tenLoaiGhe ? `• ${ticket.tenLoaiGhe}` : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="rounded-2xl border border-gold/15 bg-black/40 px-5 py-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/40">Tong tien</p>
                                <div className="mt-3 text-3xl font-bold text-gold">{formatCurrency(invoice.tongTien)}</div>
                                {pendingCountdown ? (
                                  <p className="mt-3 text-xs text-gold/80">{pendingCountdown}</p>
                                ) : invoice.thoiGianThanhToan ? (
                                  <p className="mt-3 text-xs text-white/45">Thanh toan luc {formatDateTime(invoice.thoiGianThanhToan)}</p>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3 border-t border-white/5 pt-5">
                              <Link
                                to={invoice.maDon ? `/invoice?maDon=${encodeURIComponent(invoice.maDon)}` : '/invoice'}
                                className="btn-outline inline-flex items-center justify-center px-5 py-3 text-xs uppercase tracking-[0.2em]"
                              >
                                Xem hoa don
                              </Link>
                              <div className="flex flex-col gap-2">
                                <button
                                  type="button"
                                  onClick={() => void handleCancel(invoice)}
                                  disabled={!canCancel || cancelingInvoiceId === invoice.maDon}
                                  className={cn(
                                    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-all disabled:cursor-not-allowed disabled:opacity-60',
                                    canCancel
                                      ? 'border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/15'
                                      : 'border border-white/10 bg-white/[0.03] text-white/40',
                                  )}
                                >
                                  {cancelingInvoiceId === invoice.maDon ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <XCircle className="w-4 h-4" />
                                  )}
                                  {cancelLabel}
                                </button>
                                {cancelHelperText ? (
                                  <p className="text-xs text-white/40">{cancelHelperText}</p>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                : null}
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="glass-card p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold/80">Tai khoan</p>
                <h2 className="mt-3 text-3xl font-bold">Thong tin dang nhap hien tai</h2>
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <SettingCard label="Ma khach hang" value={maKhachHang || 'Chua co'} />
                  <SettingCard label="Vai tro" value={localStorage.getItem('role') || 'USER'} />
                  <SettingCard label="Trang thai" value={token ? 'Da dang nhap' : 'Chua dang nhap'} />
                  <SettingCard label="Tong hoa don" value={String(invoices.length)} />
                </div>
                <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/55">
                  Tab nay giu lai cac thong tin co ban cua tai khoan. Toan bo ve da dat va thao tac huy duoc dua sang tab Bookings de su dung nhanh hon.
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-xl font-bold">Tac vu nhanh</h3>
                <div className="mt-5 space-y-3">
                  <Link
                    to="/booking"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/80 transition-all hover:border-gold/25 hover:text-white"
                  >
                    Dat them ve moi
                    <Ticket className="w-4 h-4 text-gold" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('Bookings');
                      void loadInvoices(maKhachHang, token);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/80 transition-all hover:border-gold/25 hover:text-white"
                  >
                    Tai lai danh sach hoa don
                    <RefreshCw className="w-4 h-4 text-gold" />
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-200 transition-all hover:bg-red-500/15"
                  >
                    Dang xuat khoi tai khoan
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Ticket;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">{label}</p>
      <div className="mt-3 flex items-start gap-3 text-sm font-medium text-white/85">
        <Icon className="mt-0.5 w-4 h-4 shrink-0 text-gold" />
        <span>{value}</span>
      </div>
    </div>
  );
}

function SettingCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">{label}</p>
      <div className="mt-3 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function getStatusConfig(status?: string): StatusConfig {
  switch (status) {
    case 'DA_THANH_TOAN':
      return {
        label: 'Da thanh toan',
        cardClass: 'border-emerald-500/20',
        badgeClass: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200',
        icon: CheckCircle2,
      };
    case 'DA_HUY':
      return {
        label: 'Da huy',
        cardClass: 'border-white/10',
        badgeClass: 'border-white/10 bg-white/[0.03] text-white/60',
        icon: XCircle,
      };
    default:
      return {
        label: 'Dang giu cho',
        cardClass: 'border-gold/20',
        badgeClass: 'border-gold/25 bg-gold/10 text-gold',
        icon: Clock3,
      };
  }
}

async function apiFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload, response.statusText || 'Loi may chu'));
  }

  return payload as T;
}

function extractErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const candidate = ['message', 'error', 'detail']
      .map((key) => (payload as Record<string, unknown>)[key])
      .find((value) => typeof value === 'string' && value.trim());

    if (typeof candidate === 'string') {
      return candidate;
    }
  }

  return fallback;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function getSeatSummary(tickets?: BookingTicket[]) {
  if (!tickets?.length) {
    return 'Chua co du lieu ghe';
  }

  return tickets
    .map((ticket) => ticket.tenGhe)
    .filter(Boolean)
    .join(', ');
}

function formatDate(value?: string) {
  if (!value) {
    return 'Dang cap nhat';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(value?: string) {
  if (!value) {
    return 'Dang cap nhat';
  }

  if (/^\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 5);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(value?: string) {
  if (!value) {
    return 'Dang cap nhat';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(value?: number) {
  return `${CURRENCY_FORMATTER.format(value || 0)}d`;
}

function joinText(...parts: Array<string | undefined>) {
  const availableParts = parts.filter(Boolean);
  return availableParts.length ? availableParts.join(' • ') : 'Dang cap nhat';
}

function formatPaymentMethod(value?: string) {
  switch (value) {
    case 'THE_NGAN_HANG':
      return 'The ngan hang';
    case 'TIEN_MAT':
      return 'Tien mat';
    case 'MOMO':
      return 'MoMo';
    case 'VNPAY':
      return 'VNPay';
    case 'ZALOPAY':
      return 'ZaloPay';
    default:
      return value || 'Chua thanh toan';
  }
}

function getPendingCountdown(deadline?: string, payable?: boolean) {
  if (!deadline || !payable) {
    return '';
  }

  const diff = new Date(deadline).getTime() - Date.now();
  if (!Number.isFinite(diff) || diff <= 0) {
    return 'Hoa don da het thoi gian giu cho.';
  }

  const totalSeconds = Math.floor(diff / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `Con giu cho ${minutes}:${seconds}`;
}

function canCancelInvoice(invoice: BookingInvoice) {
  if (!invoice.maDon || invoice.trangThai === 'DA_HUY') {
    return false;
  }

  return !hasShowtimeStarted(invoice.ngayChieu, invoice.gioChieu);
}

function getCancelLabel(invoice: BookingInvoice) {
  if (invoice.trangThai === 'DA_HUY') {
    return 'Da huy';
  }

  if (invoice.trangThai === 'DA_THANH_TOAN') {
    return 'Huy ve';
  }

  return 'Huy giu cho';
}

function getCancelHelperText(invoice: BookingInvoice) {
  if (invoice.trangThai === 'DA_HUY') {
    return 'Hoa don nay da duoc huy truoc do.';
  }

  if (hasShowtimeStarted(invoice.ngayChieu, invoice.gioChieu)) {
    return 'Khong the huy khi suat chieu da bat dau.';
  }

  if (invoice.trangThai === 'DA_THANH_TOAN') {
    return 'Nut nay se huy ve da thanh toan cho hoa don nay.';
  }

  return 'Nut nay se huy giu cho cua hoa don chua thanh toan.';
}

function hasShowtimeStarted(date?: string, time?: string) {
  if (!date || !time) {
    return false;
  }

  const normalizedTime = /^\d{2}:\d{2}/.test(time) ? `${time.slice(0, 5)}:00` : time;
  const showtimeStart = new Date(`${date}T${normalizedTime}`);
  if (Number.isNaN(showtimeStart.getTime())) {
    return false;
  }

  return showtimeStart.getTime() <= Date.now();
}

function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(' ');
}
