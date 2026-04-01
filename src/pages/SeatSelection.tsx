import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Info } from 'lucide-react';
import { SHOWTIMES, MOVIES } from '../constants';

const SeatSelection = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const showtime = SHOWTIMES.find(s => s.id === showtimeId);
  const movie = MOVIES.find(m => m.id === showtime?.movieId);
  
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
  const cols = Array.from({ length: 20 }, (_, i) => i + 1);

  const getSeatType = (row: string, col: number) => {
    if (row === 'H' || row === 'J') return 'VIP';
    if (row === 'K') return 'Couple';
    return 'Regular';
  };

  const getSeatPrice = (type: string) => {
    switch (type) {
      case 'VIP': return 300;
      case 'Couple': return 600;
      default: return 200;
    }
  };

  const toggleSeat = (seatId: string) => {
    setSelectedSeats(prev => 
      prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]
    );
  };

  const totalAmount = selectedSeats.reduce((sum, seatId) => {
    const [row, col] = [seatId[0], parseInt(seatId.slice(1))];
    return sum + getSeatPrice(getSeatType(row, col));
  }, 0);

  if (!showtime || !movie) return <div>Showtime not found</div>;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 lg:px-12 flex flex-col lg:flex-row gap-12">
      {/* Left: Seat Map */}
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Select Seats</h1>
            <p className="text-white/40 text-sm">{movie.title} • {showtime.time}</p>
          </div>
        </div>

        <div className="glass-card p-12 flex flex-col items-center">
          {/* Screen */}
          <div className="w-full max-w-2xl mb-20 relative">
            <div className="h-2 bg-gradient-to-r from-transparent via-gold/50 to-transparent rounded-full shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
            <div className="text-center mt-4 text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold">SCREEN</div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-8 mb-16 text-xs text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white/10 border border-white/20" /> Available
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gold" /> Selected
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white/20" /> Sold
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500/50 border border-purple-500" /> VIP
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-pink-500/50 border border-pink-500" /> Couple
            </div>
          </div>

          {/* Grid */}
          <div className="space-y-3">
            {rows.map(row => (
              <div key={row} className="flex items-center gap-4">
                <span className="w-4 text-center text-[10px] font-bold text-white/20">{row}</span>
                <div className="flex gap-2">
                  {cols.map(col => {
                    const seatId = `${row}${col}`;
                    const type = getSeatType(row, col);
                    const isSelected = selectedSeats.includes(seatId);
                    const isSold = Math.random() < 0.1; // Randomly mark some as sold for demo

                    return (
                      <button
                        key={seatId}
                        disabled={isSold}
                        onClick={() => toggleSeat(seatId)}
                        className={cn(
                          "w-6 h-6 rounded transition-all duration-200 text-[8px] font-bold flex items-center justify-center",
                          isSold ? "bg-white/10 text-transparent cursor-not-allowed" :
                          isSelected ? "bg-gold text-black shadow-[0_0_10px_rgba(212,175,55,0.5)]" :
                          type === 'VIP' ? "bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/40" :
                          type === 'Couple' ? "bg-pink-500/20 border border-pink-500/40 hover:bg-pink-500/40" :
                          "bg-white/5 border border-white/10 hover:bg-white/20"
                        )}
                      >
                        {isSelected ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>
                <span className="w-4 text-center text-[10px] font-bold text-white/20">{row}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Summary */}
      <div className="w-full lg:w-96">
        <div className="glass-card p-8 sticky top-24 border-gold/20">
          <h2 className="text-xl font-bold mb-6 font-serif italic">{movie.title}</h2>
          
          <div className="space-y-4 mb-8 text-sm">
            <div className="flex justify-between">
              <span className="text-white/40">Cinema:</span>
              <span className="font-medium">{showtime.cinema}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Date:</span>
              <span className="font-medium">{showtime.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Time:</span>
              <span className="font-medium">{showtime.time}</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/40 text-sm">Selected Seats:</span>
              <span className="font-bold text-gold">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span>
            </div>
            <div className="space-y-2">
              {selectedSeats.map(seatId => {
                const type = getSeatType(seatId[0], parseInt(seatId.slice(1)));
                return (
                  <div key={seatId} className="flex justify-between text-xs">
                    <span className="text-white/60">Seat {seatId} ({type})</span>
                    <span>{getSeatPrice(type)}.000đ</span>
                  </div>
                );
              })}
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Booking Fee</span>
                <span>20.000đ</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8">
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-bold text-gold">{selectedSeats.length > 0 ? (totalAmount + 20) : 0}.000đ</span>
          </div>

          <button 
            disabled={selectedSeats.length === 0}
            onClick={() => navigate('/checkout', { state: { selectedSeats, totalAmount: totalAmount + 20, showtime, movie } })}
            className="w-full btn-gold py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Proceed to Payment
          </button>
          
          <div className="mt-6 flex items-start gap-2 text-[10px] text-white/40 leading-relaxed">
            <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <p>Tickets are non-refundable once purchased. Please double-check your selection before proceeding.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default SeatSelection;
