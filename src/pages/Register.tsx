import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
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
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  type="text" 
                  placeholder="Enter your full name" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  type="tel" 
                  placeholder="Enter your phone number" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  type={showPassword ? "text" : "password"} 
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

            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Confirm your password" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 accent-gold" />
              <p className="text-xs text-white/40 leading-relaxed">
                I agree to the <Link to="/terms" className="text-gold hover:underline">Terms and Conditions</Link> and <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link>.
              </p>
            </div>

            <button type="submit" className="w-full btn-gold py-4 text-lg shadow-2xl shadow-gold/10">
              Create Account
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-white/40">
            Already have an account? <Link to="/login" id="login-link" className="text-gold font-bold hover:underline">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
