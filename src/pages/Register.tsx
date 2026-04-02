import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, User, Lock, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '../constants';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        setError(data.message || 'Tên đăng nhập đã tồn tại hoặc có lỗi xảy ra.');
      }
    } catch (err) {
      console.error(err);
      setError('Không thể kết nối đến máy chủ Backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 lg:p-24 bg-[#0A0A0A] relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://picsum.photos/seed/cinema-bg/1920/1080"
          alt="Cinema"
          className="w-full h-full object-cover opacity-10"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center shadow-2xl">
              <Film className="text-black w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gold tracking-tighter">UTCCINEMA</h1>
          </div>
          <h2 className="text-3xl font-bold mb-2">CREATE YOUR ACCOUNT</h2>
          <p className="text-white/40 text-sm">Join the magic of movies today.</p>
        </div>

        <div className="glass-card p-10 border-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
          <form onSubmit={handleRegister} className="space-y-6">
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
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all"
                  required
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

            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 accent-gold" required />
              <p className="text-xs text-white/40 leading-relaxed">
                I agree to the <Link to="/terms" className="text-gold hover:underline">Terms and Conditions</Link> and <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link>.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-lg shadow-2xl transition-all ${loading ? 'bg-gold/50 text-black/50 cursor-not-allowed' : 'btn-gold shadow-gold/10'}`}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-white/40">
            Already have an account? <Link to="/login" className="text-gold font-bold hover:underline">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;