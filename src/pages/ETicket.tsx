import { useLocation, useParams, Link } from 'react-router-dom';
import { Download, Share2, CheckCircle2, QrCode, Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import { motion } from 'motion/react';

const ETicket = () => {
  const { id } = useParams();
  const location = useLocation();
  const { selectedSeats, totalAmount, showtime, movie } = location.state || {};

  if (!movie) return <div>No ticket data found</div>;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center bg-gradient-to-b from-[#0A0A0A] to-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
            <CheckCircle2 className="text-green-500 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Booking Successful!</h1>
          <p className="text-white/40 text-sm">Your ticket has been confirmed and sent to your email.</p>
        </div>

        <div className="glass-card overflow-hidden border-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
          <div className="relative h-48 overflow-hidden">
            <img src={movie.backdropUrl} alt={movie.title} className="w-full h-full object-cover blur-sm opacity-50" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h2 className="text-4xl font-bold tracking-tighter text-white drop-shadow-lg">UTCCINEMA E-TICKET</h2>
              <p className="text-gold text-xs font-bold tracking-[0.3em] mt-2">BOOKING ID: {id}</p>
            </div>
          </div>

          <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gold font-bold mb-2 block">MOVIE:</label>
                <div className="text-2xl font-serif italic font-bold">{movie.title}</div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gold font-bold mb-1 block">DATE:</label>
                  <div className="text-sm font-medium">{showtime.date}</div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gold font-bold mb-1 block">TIME:</label>
                  <div className="text-sm font-medium">{showtime.time}</div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-gold font-bold mb-1 block">CINEMA:</label>
                <div className="text-sm font-medium">{showtime.cinema}</div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gold font-bold mb-1 block">HALL:</label>
                  <div className="text-sm font-medium">{showtime.hall}</div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gold font-bold mb-1 block">SEATS:</label>
                  <div className="text-sm font-bold text-gold">{selectedSeats.join(', ')}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-6 rounded-3xl shadow-2xl mb-6">
                <div className="w-48 h-48 bg-black rounded-2xl flex items-center justify-center">
                  <QrCode className="text-white w-40 h-40" />
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Scan at entrance</p>

              <div className="mt-8 w-full space-y-3 border-t border-white/5 pt-8">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Booking:</span>
                  <span>25.000đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Total Paid:</span>
                  <span>{totalAmount.toFixed(3)}đ</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-3 border-t border-white/10">
                  <span>Total Paid:</span>
                  <span className="text-gold">{totalAmount.toFixed(3)}đ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
          <button className="btn-gold flex items-center gap-2 px-10 py-4">
            <Download className="w-5 h-5" />
            Download Ticket
          </button>
          <button className="btn-outline flex items-center gap-2 px-10 py-4">
            <Share2 className="w-5 h-5" />
            Share Ticket
          </button>
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="text-white/40 hover:text-gold transition-colors text-sm">Back to Home</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ETicket;
