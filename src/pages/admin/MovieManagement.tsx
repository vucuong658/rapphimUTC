import { useState } from 'react';
import { Search, Plus, Filter, LayoutGrid, List, Edit2, Trash2, Eye, Calendar, Clock, MapPin } from 'lucide-react';
import { MOVIES, SHOWTIMES } from '../../constants';

const MovieManagement = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMovie, setSelectedMovie] = useState<string | null>(MOVIES[0].id);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Movie & Ticket Catalog</h1>
          <p className="text-sm text-white/40">Manage your movie library, showtimes, and ticket availability.</p>
        </div>
        <button className="btn-gold flex items-center gap-2 text-xs">
          <Plus className="w-4 h-4" />
          Add New Movie
        </button>
      </div>

      {/* Filters & View Toggle */}
      <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text" 
              placeholder="Search movies..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-gold/50"
            />
          </div>
          <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50">
            <option>Status: All</option>
            <option>Showing</option>
            <option>Upcoming</option>
            <option>Ended</option>
          </select>
          <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50">
            <option>Genre</option>
            <option>Sci-Fi</option>
            <option>Action</option>
            <option>Drama</option>
          </select>
        </div>

        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
          <button 
            onClick={() => setViewMode('grid')}
            className={cn("p-2 rounded-md transition-all", viewMode === 'grid' ? "bg-gold text-black shadow-lg" : "text-white/40 hover:text-white")}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={cn("p-2 rounded-md transition-all", viewMode === 'list' ? "bg-gold text-black shadow-lg" : "text-white/40 hover:text-white")}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Movie Grid/List */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {MOVIES.map((movie) => (
            <div 
              key={movie.id}
              onClick={() => setSelectedMovie(movie.id)}
              className={cn(
                "glass-card overflow-hidden group cursor-pointer transition-all duration-300",
                selectedMovie === movie.id ? "border-gold/50 ring-1 ring-gold/20" : "hover:border-white/20"
              )}
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold border",
                    movie.status === 'Now Showing' ? "bg-green-500/20 text-green-500 border-green-500/30" :
                    movie.status === 'Coming Soon' ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" :
                    "bg-red-500/20 text-red-500 border-red-500/30"
                  )}>
                    {movie.status}
                  </div>
                  <div className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Total Shows: 45</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 group-hover:text-gold transition-colors truncate">{movie.title}</h3>
                <p className="text-xs text-white/40 mb-4">{movie.genre}</p>
                <div className="flex items-center justify-between gap-4">
                  <button className="flex-1 btn-outline text-[10px] py-2 flex items-center justify-center gap-2">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button className="flex-1 btn-outline text-[10px] py-2 flex items-center justify-center gap-2 text-red-400 hover:bg-red-400/10 hover:border-red-400/30">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Showtime Details for Selected Movie */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-gold/20 sticky top-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="text-gold w-5 h-5" />
              Showtimes
            </h2>

            <div className="space-y-4">
              {SHOWTIMES.filter(s => s.movieId === selectedMovie).map((showtime) => (
                <div key={showtime.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-gold/30 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-bold text-gold">{showtime.time}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{showtime.format}</div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-[10px] text-white/60">
                      <MapPin className="w-3 h-3 text-white/20" /> {showtime.cinema}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/60">
                      <Clock className="w-3 h-3 text-white/20" /> Tickets Available: 120/200
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 btn-outline text-[10px] py-1.5">Edit</button>
                    <button className="flex-1 btn-outline text-[10px] py-1.5">Assign Hall</button>
                    <button className="flex-1 btn-gold text-[10px] py-1.5">View Tickets</button>
                  </div>
                </div>
              ))}
              
              <button className="w-full border-2 border-dashed border-white/10 rounded-xl py-4 text-xs text-white/40 hover:border-gold/30 hover:text-gold transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Showtime
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default MovieManagement;
