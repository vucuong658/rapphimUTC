import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, User, Lock, Eye, EyeOff, Facebook, Chrome, CheckCircle2, CircleAlert } from 'lucide-react';
import { API_BASE_URL } from '../constants';
import CenteredNoticeModal from '../components/CenteredNoticeModal';

type LoginNotice =
  | {
      title: string;
      message: string;
      icon: 'success' | 'error';
    }
  | null;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<LoginNotice>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedUsername = username.trim();

    if (!normalizedUsername || !password.trim()) {
      setError('Vui long nhap day du ten dang nhap va mat khau.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: normalizedUsername, password }),
      });

      const data = await parseApiResponse(res);

      if (!res.ok) {
        setError(data.message || 'Sai ten dang nhap hoac mat khau');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);

      if (data.maKhachHang) {
        localStorage.setItem('maKhachHang', data.maKhachHang);
      } else {
        localStorage.removeItem('maKhachHang');
      }

      const redirectPath = sessionStorage.getItem('utc_redirect');
      if (redirectPath) {
        sessionStorage.removeItem('utc_redirect');
      }

      navigate(redirectPath || '/');
    } catch (err) {
      console.error(err);
      setError('Khong the ket noi den may chu Backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#050505]">
        <div className="absolute inset-0">
          <img
            src="https://picsum.photos/seed/cinema-bg/1920/1080"
            alt="Cinema"
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center shadow-2xl">
              <Film className="text-black w-8 h-8" />
            </div>
            <h1 className="text-5xl font-bold text-gold tracking-tighter">UTCCINEMA</h1>
          </div>
          <h2 className="text-4xl font-bold mb-6 font-serif italic text-white drop-shadow-lg">EXPERIENCE THE MAGIC OF MOVIES</h2>
          <p className="text-white/60 text-lg max-w-md leading-relaxed">
            Join our community of movie lovers and enjoy exclusive benefits, early bookings, and personalized recommendations.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 bg-[#0A0A0A]">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
            <p className="text-white/40 text-sm">Please enter your details to login.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2 block">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">Password</label>
                <Link to="/forgot-password" id="forgot-password-link" className="text-xs text-gold hover:underline">Forgot Password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-lg shadow-2xl transition-all ${
                loading ? 'bg-gold/50 text-black/50 cursor-not-allowed' : 'btn-gold shadow-gold/10'
              }`}
            >
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </form>

            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await fetch(`${API_BASE_URL}/phim`);
                  if (res.ok || res.status) {
                    setNotice({
                      title: 'Ket noi thanh cong',
                      message: 'Frontend hien dang ket noi duoc den backend. Ban co the tiep tuc dang nhap hoac dang ky.',
                      icon: 'success',
                    });
                  }
                } catch (err) {
                  console.error('Loi goi API:', err);
                  setNotice({
                    title: 'Khong ket noi duoc backend',
                    message: 'Hay kiem tra lai server Spring tren cong 8080 truoc khi dang nhap.',
                    icon: 'error',
                  });
                }
              }}
              className="w-full mt-4 bg-green-500/10 text-green-500 border border-green-500/30 py-3 rounded-xl hover:bg-green-500/20 transition-colors font-bold flex items-center justify-center gap-2"
          >
            Kiem tra ket noi API
          </button>

          <div className="mt-12">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative z-10 bg-[#0A0A0A] px-4 text-xs text-white/40 uppercase tracking-widest font-bold">Or login with</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-white/90 transition-colors">
                <Chrome className="w-5 h-5" />
                Google
              </button>
              <button className="flex items-center justify-center gap-3 bg-[#1877F2] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#1877F2]/90 transition-colors">
                <Facebook className="w-5 h-5 fill-current" />
                Facebook
              </button>
            </div>
          </div>

          <div className="mt-12 text-center text-sm text-white/40">
            Don't have an account? <Link to="/register" id="register-link" className="text-gold font-bold hover:underline">Sign Up</Link>
          </div>
        </div>
      </div>

      <CenteredNoticeModal
        open={Boolean(notice)}
        eyebrow="UTC Cinema"
        title={notice?.title || ''}
        message={notice?.message || ''}
        icon={
          notice?.icon === 'error'
            ? <CircleAlert className="h-7 w-7" />
            : <CheckCircle2 className="h-7 w-7" />
        }
        confirmLabel="Dong"
        onConfirm={() => setNotice(null)}
      />
    </div>
  );
}

async function parseApiResponse(response: Response): Promise<Record<string, any>> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await response.json();
  }

  const text = await response.text();
  return { message: text };
}
