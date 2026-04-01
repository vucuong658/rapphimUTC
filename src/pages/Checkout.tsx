import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, CreditCard, Wallet, Smartphone, Landmark, CheckCircle2 } from 'lucide-react';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSeats, totalAmount, showtime, movie } = location.state || {};
  
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentOptions = [
    { id: 'momo', label: 'MoMo E-Wallet', description: 'MoMo E-Wallet with a million cash back', icon: Wallet, color: 'bg-pink-500' },
    { id: 'zalopay', label: 'ZaloPay', description: 'ZaloPay with bingo coin to ZaloPay', icon: Wallet, color: 'bg-blue-500' },
    { id: 'shopeepay', label: 'ShopeePay', description: 'ShopeePay methods to ShopeePay', icon: Smartphone, color: 'bg-orange-500' },
    { id: 'atm', label: 'ATM Card / Internet Banking', description: 'ATM card • ATM card / Internet Banking', icon: Landmark, color: 'bg-gray-500' },
    { id: 'credit', label: 'International Credit Cards (Visa/Mastercard/JCB)', description: 'International credit card (Visa/Mastercard/JCB)', icon: CreditCard, color: 'bg-red-500' },
  ];

  const handleCompletePurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/ticket/UTC-856291', { state: { selectedSeats, totalAmount, showtime, movie } });
    }, 2000);
  };

  if (!movie) return <div>No booking data found</div>;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 lg:px-12 flex flex-col lg:flex-row gap-12">
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Payment Checkout</h1>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-[10px] uppercase tracking-widest text-white/40 mb-4 font-bold">PAYMENT OPTIONS</h2>
            <div className="space-y-3">
              {paymentOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setPaymentMethod(option.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 group",
                    paymentMethod === option.id 
                      ? "bg-white/10 border-gold/50 shadow-[0_0_20px_rgba(212,175,55,0.1)]" 
                      : "bg-white/5 border-white/5 hover:border-white/20"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                    paymentMethod === option.id ? "border-gold bg-gold" : "border-white/20"
                  )}>
                    {paymentMethod === option.id && <div className="w-2 h-2 bg-black rounded-full" />}
                  </div>
                  
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0", option.color)}>
                    <option.icon className="text-white w-6 h-6" />
                  </div>

                  <div className="flex-1 text-left">
                    <div className="font-bold text-sm">{option.label}</div>
                    <div className="text-[10px] text-white/40">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="glass-card p-6 flex items-center justify-between border-green-500/20">
            <div className="flex items-center gap-4">
              <ShieldCheck className="text-green-500 w-8 h-8" />
              <div>
                <div className="font-bold text-sm">SECURE CHECKOUT</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">Securitied & Encrypted</div>
              </div>
            </div>
            <div className="flex gap-4 grayscale opacity-50">
              <div className="w-10 h-6 bg-white/20 rounded" />
              <div className="w-10 h-6 bg-white/20 rounded" />
              <div className="w-10 h-6 bg-white/20 rounded" />
            </div>
          </section>
        </div>
      </div>

      <div className="w-full lg:w-96">
        <div className="glass-card p-8 sticky top-24 border-gold/20">
          <h2 className="text-[10px] uppercase tracking-widest text-white/40 mb-6 font-bold">BOOKING SUMMARY</h2>
          
          <div className="flex gap-4 mb-8">
            <div className="w-24 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0">
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm mb-2">{movie.title}</h3>
              <div className="space-y-1 text-[10px] text-white/60">
                <div className="flex items-center gap-1">📍 {showtime.cinema}</div>
                <div className="flex items-center gap-1">📅 {showtime.date}</div>
                <div className="flex items-center gap-1">🕒 {showtime.time}</div>
              </div>
              <div className="mt-3">
                <div className="text-[10px] text-white/40 mb-1">Seat No.</div>
                <div className="flex flex-wrap gap-1">
                  {selectedSeats.map((seat: string) => (
                    <span key={seat} className="bg-gold/20 text-gold px-2 py-0.5 rounded text-[10px] font-bold border border-gold/30">
                      {seat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs mb-8">
            <div className="flex justify-between">
              <span className="text-white/40">Movie Tickets ({selectedSeats.length} x 180.000đ)</span>
              <span>{(selectedSeats.length * 180).toFixed(3)}đ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Convenience Fee</span>
              <span>20.000đ</span>
            </div>
            <div className="flex justify-between font-bold pt-3 border-t border-white/10">
              <span>Subtotal</span>
              <span>{totalAmount.toFixed(3)}đ</span>
            </div>
          </div>

          <div className="mb-8">
            <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block font-bold">DISCOUNT CODE</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter code" 
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold/50"
              />
              <button className="btn-outline text-xs px-4">APPLY</button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8">
            <span className="text-lg font-bold">TOTAL PAYABLE</span>
            <span className="text-2xl font-bold text-gold">{totalAmount.toFixed(3)}đ</span>
          </div>

          <button 
            disabled={isProcessing}
            onClick={handleCompletePurchase}
            className="w-full btn-gold py-4 flex items-center justify-center gap-2 relative overflow-hidden"
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>COMPLETE PURCHASE</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default Checkout;
