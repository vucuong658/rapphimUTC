import { useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Ticket, CreditCard, ChevronRight, LogOut, Settings, Bell, Shield, Star } from 'lucide-react';
import { motion } from 'motion/react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('Bookings');

  const bookings = [
    { id: 'BK-987654', movie: 'Dune: Part Two', date: 'Oct 28, 2024', time: '19:30', cinema: 'UTCCINEMA - Hall 1', seats: 'B12, B13', status: 'Upcoming', amount: 32.50, poster: 'https://picsum.photos/seed/dune/200/300' },
    { id: 'BK-987653', movie: 'Oppenheimer', date: 'Oct 15, 2024', time: '20:00', cinema: 'UTCCINEMA - Hall 4', seats: 'F05', status: 'Completed', amount: 18.00, poster: 'https://picsum.photos/seed/oppenheimer/200/300' },
    { id: 'BK-987652', movie: 'Spider-Man: Across the Spider-Verse', date: 'Sep 30, 2024', time: '14:15', cinema: 'UTCCINEMA - Hall 2', seats: 'D08, D09, D10', status: 'Completed', amount: 45.00, poster: 'https://picsum.photos/seed/spiderman/200/300' },
  ];

  const tabs = ['Bookings', 'Rewards', 'Settings'];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto rounded-full border-2 border-gold p-1 mb-4">
                <img src="https://picsum.photos/seed/user/200/200" alt="User" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <h2 className="text-xl font-bold mb-1">Alex Johnson</h2>
              <p className="text-xs text-white/40 mb-4">Member since Oct 2023</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-[10px] font-bold text-gold uppercase tracking-widest">
                <Star className="w-3 h-3 fill-gold" /> Gold Member
              </div>
            </div>
          </div>

          <div className="glass-card p-4 space-y-2">
            {[
              { label: 'Profile Settings', icon: User },
              { label: 'Notifications', icon: Bell },
              { label: 'Security', icon: Shield },
              { label: 'Payment Methods', icon: CreditCard },
              { label: 'Logout', icon: LogOut, danger: true },
            ].map((item) => (
              <button 
                key={item.label}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  item.danger ? "text-red-400 hover:bg-red-400/10" : "text-white/40 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Tabs */}
          <div className="flex gap-8 border-b border-white/5">
            {tabs.map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-4 text-sm font-bold tracking-widest uppercase transition-all relative",
                  activeTab === tab ? "text-gold" : "text-white/40 hover:text-white"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                )}
              </button>
            ))}
          </div>

          {activeTab === 'Bookings' && (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={booking.id} 
                  className="glass-card p-6 flex flex-col md:flex-row gap-6 group hover:border-gold/30 transition-all"
                >
                  <div className="w-full md:w-32 aspect-[2/3] rounded-xl overflow-hidden shrink-0">
                    <img src={booking.poster} alt={booking.movie} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold group-hover:text-gold transition-colors">{booking.movie}</h3>
                        <p className="text-xs text-white/40 font-mono">{booking.id}</p>
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold border",
                        booking.status === 'Upcoming' ? "bg-gold/10 text-gold border-gold/20" : "bg-white/5 text-white/40 border-white/10"
                      )}>
                        {booking.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Date</div>
                        <div className="text-sm flex items-center gap-2"><Calendar className="w-3 h-3 text-gold" /> {booking.date}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Time</div>
                        <div className="text-sm flex items-center gap-2"><Clock className="w-3 h-3 text-gold" /> {booking.time}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Seats</div>
                        <div className="text-sm flex items-center gap-2"><Ticket className="w-3 h-3 text-gold" /> {booking.seats}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Location</div>
                        <div className="text-sm flex items-center gap-2"><MapPin className="w-3 h-3 text-gold" /> {booking.cinema}</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="text-lg font-bold">${booking.amount.toFixed(2)}</div>
                      <button className="btn-outline text-xs py-2 px-6 flex items-center gap-2">
                        View Details <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'Rewards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-8 space-y-6 bg-gradient-to-br from-gold/20 to-transparent border-gold/30">
                <div className="flex items-center justify-between">
                  <Star className="w-10 h-10 text-gold fill-gold" />
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Available Points</div>
                    <div className="text-3xl font-bold text-gold">2,450</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Next Tier: Platinum</span>
                    <span>550 points to go</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gold w-[80%]" />
                  </div>
                </div>
                <button className="w-full btn-gold py-3 text-xs">Redeem Points</button>
              </div>

              <div className="glass-card p-8 flex flex-col justify-center items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Star className="w-8 h-8 text-white/20" />
                </div>
                <div>
                  <h3 className="font-bold">Refer a Friend</h3>
                  <p className="text-xs text-white/40">Get 500 points for every friend who books their first movie.</p>
                </div>
                <button className="btn-outline text-xs py-2 px-6">Share Referral Code</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

function Clock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default Profile;
