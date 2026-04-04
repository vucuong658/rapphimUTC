import { useEffect, useState, type ComponentType } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  DoorOpen,
  MapPin,
  Ticket,
  XCircle,
} from 'lucide-react';
import { API_BASE_URL } from '../constants';
import './hoa-don-classic.css';

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

type FlashMessage =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

type StatusConfig = {
  label: string;
  className: string;
  icon: ComponentType<{ className?: string }>;
};

const PAYMENT_METHODS = [
  { value: 'MOMO', label: 'MoMo' },
  { value: 'ZALOPAY', label: 'ZaloPay' },
  { value: 'TIEN_MAT', label: 'Tien mat' },
];

export default function HoaDonClassicPage() {
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
    document.title = 'UTC Cinema - Hoa Don';
  }, []);

  useEffect(() => {
    const rawFlash = sessionStorage.getItem('utc_invoice_flash');

    if (!rawFlash) {
      return;
    }

    sessionStorage.removeItem('utc_invoice_flash');

    try {
      const parsed = JSON.parse(rawFlash);
      if (parsed?.type && parsed?.text) {
        setFlashMessage({
          type: parsed.type === 'success' ? 'success' : 'error',
          text: String(parsed.text),
        });
      }
    } catch {
      // Ignore malformed flash payloads.
    }
  }, []);

  useEffect(() => {
    if (!maDon) {
      setLoading(false);
      setError('Khong tim thay ma hoa don.');
      return;
    }

    void loadInvoice(maDon, true);
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
        setCountdownText('Hoa don da het han, dang cap nhat...');
        await loadInvoice(invoiceDetail.maDon, false);
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
      const seconds = String(totalSeconds % 60).padStart(2, '0');
      setCountdownText(`Giu ghe toi: ${minutes}:${seconds}`);
    };

    void updateCountdown();
    const timer = window.setInterval(() => {
      void updateCountdown();
    }, 1000);

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
      setError(getErrorMessage(loadError, 'Khong tai duoc hoa don.'));
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
      setFlashMessage({ type: 'success', text: 'Thanh toan thanh cong.' });
    } catch (payError) {
      setFlashMessage({
        type: 'error',
        text: `Thanh toan that bai: ${getErrorMessage(payError, 'Loi khong xac dinh')}`,
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function cancelInvoice() {
    if (!invoiceDetail?.maDon) {
      return;
    }

    if (!window.confirm('Ban co chac muon huy hoa don nay?')) {
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
      setFlashMessage({ type: 'success', text: 'Da huy hoa don.' });
    } catch (cancelError) {
      setFlashMessage({
        type: 'error',
        text: `Khong the huy hoa don: ${getErrorMessage(cancelError, 'Loi khong xac dinh')}`,
      });
    } finally {
      setActionLoading(null);
    }
  }

  const posterSrc = getPosterUrlSafe(invoiceDetail?.poster);
  const statusConfig = getStatusConfig(invoiceDetail?.trangThai);

  return (
    <div className="hd-page">
      <div className="hd-gold-bar" />
      <section className="hd-section">
        <div className="hd-container">
          <nav className="hd-breadcrumb">
            <Link to="/">Trang chu</Link>
            <span>/</span>
            <Link to="/booking">Dat ve</Link>
            <span>/</span>
            <Link to="/booking">Chon ghe</Link>
            <span>/</span>
            <span>Hoa don</span>
          </nav>

          {flashMessage ? (
            <div className={`hd-flash ${flashMessage.type}`}>
              <span>{flashMessage.text}</span>
            </div>
          ) : null}

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner" />
            </div>
          ) : !maDon || error || !invoiceDetail ? (
            <div className="hd-card hd-error-card">
              <div className="hd-error-icon">
                <CircleAlert className="h-8 w-8" />
              </div>
              <h1 className="hd-title">Khong tai duoc hoa don</h1>
              <p className="hd-subtitle">{error || 'Du lieu hoa don hien khong kha dung.'}</p>
              <Link to="/booking" className="hd-link-btn">
                Quay lai dat ve
              </Link>
            </div>
          ) : (
            <div className="hd-layout">
              <div className="hd-main">
                <div className="hd-card">
                  <div className="hd-header">
                    <div>
                      <h1 className="hd-title">Hoa don {invoiceDetail.maDon || ''}</h1>
                      <div className="hd-subtitle">Thong tin chi tiet don dat ve va thanh toan</div>
                    </div>
                    <div className={`hd-status ${statusConfig.className}`}>
                      <statusConfig.icon className="h-4 w-4" />
                      <span>{statusConfig.label}</span>
                    </div>
                  </div>

                  <div className="hd-grid">
                    <div className="hd-card hd-card-inner">
                      <h3 className="hd-panel-title">Thong tin hoa don</h3>
                      <div className="hd-meta">
                        <MetaRow label="Ma khach hang" value={invoiceDetail.maKhachHang || '-'} />
                        <MetaRow label="Thoi gian tao" value={formatDateTime(invoiceDetail.thoiGianDat)} />
                        <MetaRow label="Han thanh toan" value={formatDateTime(invoiceDetail.hanThanhToan)} />
                        <MetaRow label="Thanh toan luc" value={formatDateTime(invoiceDetail.thoiGianThanhToan)} />
                        <MetaRow label="Phuong thuc" value={invoiceDetail.phuongThucThanhToan || '-'} />
                      </div>
                    </div>

                    <div className="hd-card hd-card-inner">
                      <h3 className="hd-panel-title">Thong tin suat chieu</h3>
                      <div className="hd-movie">
                        <img
                          className="hd-poster"
                          src={posterSrc}
                          alt={invoiceDetail.tenPhim || 'Poster phim'}
                          referrerPolicy="no-referrer"
                        />
                        <div className="hd-movie-info">
                          <h3>{invoiceDetail.tenPhim || '-'}</h3>
                          <MovieLine icon={MapPin} text={invoiceDetail.tenRap || '-'} />
                          <MovieLine icon={DoorOpen} text={invoiceDetail.tenPhong || '-'} />
                          <MovieLine icon={Clock3} text={`${formatTime(invoiceDetail.gioChieu)} · ${formatDate(invoiceDetail.ngayChieu)}`} />
                          <MovieLine icon={Ticket} text={`${invoiceDetail.soVe || 0} ghe / ${invoiceDetail.tongGhe || 0} ghe`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hd-card hd-card-inner hd-table-card">
                    <h3 className="hd-panel-title">Danh sach ve</h3>
                    {invoiceDetail.dsVe && invoiceDetail.dsVe.length ? (
                      <div className="hd-table-wrap">
                        <table className="hd-table">
                          <thead>
                            <tr>
                              <th>Ghe</th>
                              <th>Loai ghe</th>
                              <th>Gia co ban</th>
                              <th>Phu thu</th>
                              <th>Thanh tien</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoiceDetail.dsVe.map((ticket, index) => (
                              <tr key={`${ticket.tenGhe || 've'}-${index}`}>
                                <td>{ticket.tenGhe || '-'}</td>
                                <td>{ticket.tenLoaiGhe || '-'}</td>
                                <td>{formatCurrency(ticket.giaVeCoBan || 0)}</td>
                                <td>{formatCurrency(ticket.phuThu || 0)}</td>
                                <td>{formatCurrency(ticket.thanhTien || 0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="hd-empty">Hoa don hien khong con ve nao.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="hd-sidebar">
                <div className="hd-card">
                  <h3 className="hd-panel-title">Tong ket thanh toan</h3>
                  <div className="hd-meta">
                    <MetaRow label="Gia ve co ban" value={formatCurrency(invoiceDetail.giaVeCoBan || 0)} />
                    <MetaRow label="So luong ghe" value={String(invoiceDetail.soVe || 0)} />
                    <MetaRow label="Tong thanh toan" value={formatCurrency(invoiceDetail.tongTien || 0)} />
                  </div>
                  <div className="hd-total">
                    <span>Tong cong</span>
                    <span>{formatCurrency(invoiceDetail.tongTien || 0)}</span>
                  </div>
                </div>

                <div className="hd-card">
                  <h3 className="hd-panel-title">Thao tac</h3>

                  {invoiceDetail.trangThai === 'DA_THANH_TOAN' ? (
                    <>
                      <p className="hd-helper-text">Hoa don da duoc thanh toan thanh cong.</p>
                      <div className="hd-actions">
                        <Link to="/" className="hd-btn secondary">
                          Ve trang chu
                        </Link>
                      </div>
                    </>
                  ) : invoiceDetail.trangThai === 'DA_HUY' || !invoiceDetail.coTheThanhToan ? (
                    <>
                      <p className="hd-helper-text">Hoa don nay khong con hieu luc thanh toan.</p>
                      <div className="hd-actions">
                        <Link to="/booking" className="hd-btn secondary">
                          Dat ve moi
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <label htmlFor="paymentMethod" className="hd-action-label">
                        Phuong thuc thanh toan
                      </label>
                      <select
                        id="paymentMethod"
                        value={paymentMethod}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                        className="hd-payment-select"
                      >
                        {PAYMENT_METHODS.map((method) => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>

                      {countdownText ? <div className="hd-countdown">{countdownText}</div> : null}

                      <div className="hd-actions">
                        <button
                          type="button"
                          className="hd-btn primary"
                          onClick={payInvoice}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === 'pay' ? 'Dang thanh toan...' : 'Thanh toan ngay'}
                        </button>
                        <button
                          type="button"
                          className="hd-btn secondary"
                          onClick={cancelInvoice}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === 'cancel' ? 'Dang huy...' : 'Huy hoa don'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="hd-meta-row">
      <span className="label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MovieLine({
  icon: Icon,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <p>
      <Icon className="hd-inline-icon" />
      <span>{text}</span>
    </p>
  );
}

function getStatusConfig(status?: string): StatusConfig {
  switch (status) {
    case 'DA_THANH_TOAN':
      return {
        label: 'Da thanh toan',
        className: 'paid',
        icon: CheckCircle2,
      };
    case 'DA_HUY':
      return {
        label: 'Da huy',
        className: 'cancelled',
        icon: XCircle,
      };
    default:
      return {
        label: 'Cho thanh toan',
        className: 'pending',
        icon: Clock3,
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
