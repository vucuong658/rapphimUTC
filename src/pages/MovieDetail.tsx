import { useParams, Link } from 'react-router-dom';
import { Star, Clock, Calendar, Play, ChevronRight } from 'lucide-react';
import { MOVIES, SHOWTIMES } from '../constants';

const MovieDetail = () => {
  const { id } = useParams();
  const movie = MOVIES.find(m => m.id === id);

  if (!movie) return <div>Movie not found</div>;

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img 
          src={movie.backdropUrl} 
          alt={movie.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/60 to-transparent" />
        
        <div className="absolute bottom-12 left-12 lg:left-24 flex items-end gap-12">
          <div className="hidden md:block w-64 aspect-[2/3] rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl">
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-gold/20 text-gold px-3 py-1 rounded-full text-xs font-bold border border-gold/30">
                {movie.status}
              </span>
              <div className="flex items-center gap-1 text-gold">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold">{movie.rating}</span>
                <span className="text-white/40 text-xs">/ 5</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 font-serif italic">{movie.title}</h1>
            <div className="flex items-center gap-6 text-white/60 text-sm mb-6">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {movie.duration}</span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {movie.releaseDate}</span>
              <span>{movie.genre}</span>
            </div>
            <p className="text-white/80 leading-relaxed mb-8">{movie.description}</p>
          </div>
        </div>
      </div>

      <div className="px-12 lg:px-24 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Cast & Reviews */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-xl font-bold mb-6 border-l-4 border-gold pl-4">Cast</h2>
            <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
              {movie.cast.map((person, idx) => (
                <div key={idx} className="flex-shrink-0 text-center group">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-white/10 group-hover:border-gold transition-colors">
                    <img src={person.photoUrl} alt={person.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <h4 className="text-sm font-bold truncate w-24">{person.name}</h4>
                  <p className="text-[10px] text-white/40 truncate w-24">{person.role}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-6 border-l-4 border-gold pl-4">User Reviews</h2>
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-gold">4.8</div>
                  <div>
                    <div className="flex text-gold mb-1">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                    </div>
                    <div className="text-xs text-white/40">Based on 1,250 reviews</div>
                  </div>
                </div>
                <button className="btn-outline text-xs">Write a Review</button>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">Alex Chen</span>
                      <div className="flex text-gold">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-2 h-2 fill-current" />)}
                      </div>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">
                      Absolutely breathtaking! The visuals and sound design are on another level. A must-watch in IMAX.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Booking */}
        <div className="space-y-8">
          <section className="glass-card p-6 border-gold/20">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Ticket className="text-gold w-5 h-5" />
              Book Showtimes
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Select Cinema</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50">
                  <option>UTCCINEMA Central Plaza</option>
                  <option>UTCCINEMA Grand Hall</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Select Date</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {['Today, Oct 26', 'Sun, Oct 27', 'Mon, Oct 28'].map((date, idx) => (
                    <button key={idx} className={cn(
                      "flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all",
                      idx === 0 ? "bg-gold text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
                    )}>
                      {date}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4">
                {SHOWTIMES.filter(s => s.movieId === movie.id).map(showtime => (
                  <Link 
                    key={showtime.id}
                    to={`/booking/${showtime.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-white/10 transition-all group"
                  >
                    <div>
                      <div className="font-bold text-sm group-hover:text-gold transition-colors">{showtime.time}</div>
                      <div className="text-[10px] text-white/40">{showtime.format} • {showtime.hall}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-gold" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// Helper components that were missing in App.tsx imports but used here
const Ticket = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
  </svg>
);

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default MovieDetail;
