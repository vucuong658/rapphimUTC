
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Film,
  User as UserIcon,
  LayoutDashboard,
  Ticket,
  CreditCard,
  History,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Bell,
  MessageSquare,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Pages
import ShowtimeManagement from './pages/admin/ShowtimeManagement';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import ETicket from './pages/ETicket';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Cinemas from './pages/Cinemas';
import Experiences from './pages/Experiences';
import Promotions from './pages/Promotions';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import MovieManagement from './pages/admin/MovieManagement';
import PricingAndSeating from './pages/admin/Pricing';
import FinancialLedger from './pages/admin/FinancialLedger';
import Settings from './pages/admin/Settings';
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAdmin) return null;

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 flex items-center justify-between",
      isScrolled ? "bg-black/80 backdrop-blur-lg border-b border-white/10" : "bg-transparent"
    )}>
      <Link to="/" className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
          <Film className="text-black" />
        </div>
        <span className="text-2xl font-bold tracking-tighter text-gold">UTCCINEMA</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
        <Link to="/" className="hover:text-gold transition-colors">Movies</Link>
        <Link to="/cinemas" className="hover:text-gold transition-colors">Cinemas</Link>
        <Link to="/experiences" className="hover:text-gold transition-colors">Experiences</Link>
        <Link to="/promotions" className="hover:text-gold transition-colors">Promotions</Link>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search movies..."
            className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-gold/50 w-64"
          />
        </div>
        <Link to="/login" className="btn-gold text-xs px-4 py-2">Login / Sign Up</Link>
        <Link to="/profile" className="flex items-center gap-2 text-white/70 hover:text-white">
          <UserIcon className="w-5 h-5" />
          <span className="hidden sm:inline text-sm">My Profile</span>
        </Link>
      </div>
    </nav>
  );
};

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Analytics', path: '/admin' },
    { icon: UserIcon, label: 'User Management', path: '/admin/users' },
    { icon: Film, label: 'Movie & Ticket Mgmt', path: '/admin/movies' },
    { icon: Ticket, label: 'Showtimes', path: '/admin/showtimes' },
    { icon: CreditCard, label: 'Cash Flow', path: '/admin/finance' },
    { icon: SettingsIcon, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="w-64 h-screen bg-[#0F0F0F] border-r border-white/5 flex flex-col p-6 fixed left-0 top-0">
      <div className="flex items-center gap-2 mb-10">
        <Film className="text-gold w-8 h-8" />
        <span className="text-xl font-bold text-white">UTCCINEMA <span className="text-xs text-white/40 font-normal">Admin</span></span>
      </div>

      <div className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              location.pathname === item.path
                ? "bg-gold text-black font-semibold"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-black" : "text-white/40 group-hover:text-white")} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <button className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-red-400 transition-colors mt-auto">
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* User Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/booking/:showtimeId" element={<SeatSelection />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/ticket/:id" element={<ETicket />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cinemas" element={<Cinemas />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/promotions" element={<Promotions />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <div className="pl-64 min-h-screen bg-[#050505]">
                <AdminSidebar />
                <AdminDashboard />
              </div>
            } />
            <Route path="/admin/users" element={
              <div className="pl-64 min-h-screen bg-[#050505]">
                <AdminSidebar />
                <UserManagement />
              </div>
            } />
            <Route path="/admin/movies" element={
              <div className="pl-64 min-h-screen bg-[#050505]">
                <AdminSidebar />
                <MovieManagement />
              </div>
            } />
            <Route path="/admin/showtimes" element={
              <div className="pl-64 min-h-screen bg-[#050505]">
                <AdminSidebar />
                <ShowtimeManagement />
              </div>
            } />
            <Route path="/admin/pricing" element={
              <div className="pl-64 min-h-screen bg-[#050505]">
                <AdminSidebar />
                <PricingAndSeating />
              </div>
            } />
            <Route path="/admin/finance" element={
              <div className="pl-64 min-h-screen bg-[#050505]">
                <AdminSidebar />
                <FinancialLedger />
              </div>
            } />
            <Route path="/admin/settings" element={
              <div className="pl-64 min-h-screen bg-[#050505]">
                <AdminSidebar />
                <Settings />
              </div>
            } />
          </Routes>
        </main>

        {/* Support Chat Widget */}
        <ChatWidget />
      </div>
    </Router>
  );
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="glass-card w-80 h-[450px] mb-4 flex flex-col overflow-hidden shadow-2xl border-white/20"
          >
            <div className="bg-gold p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <Film className="text-gold w-4 h-4" />
                </div>
                <span className="text-black font-bold">Support Chat</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-black/60 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-full flex-shrink-0" />
                <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-sm">
                  Welcome to UTCCINEMA Support! How can I help you today?
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Check my ticket', 'Refund policy', 'Promotion info'].map(btn => (
                  <button key={btn} className="text-xs border border-gold/30 text-gold px-3 py-1.5 rounded-full hover:bg-gold/10">
                    {btn}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-white/10 flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
              <button className="bg-gold p-2 rounded-lg text-black">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gold rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        <MessageSquare className="text-black w-6 h-6" />
      </button>
    </div>
  );
};

