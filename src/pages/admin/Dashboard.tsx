import { 
  TrendingUp, 
  Ticket, 
  Users, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Radio
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const data = [
  { name: '1', revenue: 4000, bookings: 2400 },
  { name: '5', revenue: 3000, bookings: 1398 },
  { name: '10', revenue: 2000, bookings: 9800 },
  { name: '15', revenue: 2780, bookings: 3908 },
  { name: '20', revenue: 1890, bookings: 4800 },
  { name: '25', revenue: 2390, bookings: 3800 },
  { name: '30', revenue: 3490, bookings: 4300 },
];

const topMovies = [
  { name: 'Oppenheimer', sales: '$125k', color: '#D4AF37' },
  { name: 'Barbie', sales: '$118k', color: '#D4AF37' },
  { name: 'Mission: Impossible', sales: '$95k', color: '#D4AF37' },
  { name: 'Spider-Man: Across the Spider-Verse', sales: '$88k', color: '#D4AF37' },
  { name: 'Guardians of the Galaxy Vol. 3', sales: '$75k', color: '#D4AF37' },
];

const Dashboard = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome, Admin</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-white/40 uppercase tracking-widest font-bold">Last updated</div>
            <div className="text-sm font-medium">Oct 26, 2024 • 14:30</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Daily Revenue" 
          value="$25,400" 
          trend="+12%" 
          isUp={true} 
          icon={TrendingUp}
          chartData={data}
        />
        <StatCard 
          label="Total Tickets Sold (Today)" 
          value="1,250" 
          trend="+5%" 
          isUp={true} 
          icon={Ticket}
        />
        <StatCard 
          label="Active Users (Online Now)" 
          value="342" 
          badge="LIVE" 
          icon={Users}
          isLive={true}
        />
        <StatCard 
          label="Avg. Occupancy" 
          value="78%" 
          progress={78}
          icon={Percent}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold mb-1">Revenue vs. Bookings (Last 30 Days)</h2>
              <p className="text-xs text-white/40">Comparison of daily revenue and booking volume</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gold" />
                <span className="text-white/60">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-white/60">Bookings</span>
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff20" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff20" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#D4AF37' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#D4AF37" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                <Bar dataKey="bookings" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Movies */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-bold mb-8">Top Performing Movies</h2>
          <div className="space-y-8">
            {topMovies.map((movie, idx) => (
              <div key={idx} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-white/10 group-hover:text-gold transition-colors">{idx + 1}.</div>
                  <div>
                    <div className="font-bold text-sm mb-1">{movie.name}</div>
                    <div className="text-xs text-white/40">{movie.sales} Sales</div>
                  </div>
                </div>
                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gold" 
                    style={{ width: `${100 - idx * 15}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, trend, isUp, icon: Icon, badge, isLive, progress, chartData }: any) => (
  <div className="glass-card p-6 flex flex-col justify-between group hover:border-gold/30 transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className="text-xs text-white/40 uppercase tracking-widest font-bold">{label}</div>
      {badge && (
        <div className={cn(
          "px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1",
          isLive ? "bg-orange-500/20 text-orange-500 border border-orange-500/30" : "bg-gold/20 text-gold border border-gold/30"
        )}>
          {isLive && <Radio className="w-2.5 h-2.5 animate-pulse" />}
          {badge}
        </div>
      )}
    </div>
    
    <div className="flex items-end justify-between">
      <div>
        <div className="text-3xl font-bold mb-2">{value}</div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold",
            isUp ? "text-green-500" : "text-red-500"
          )}>
            {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div className="p-3 bg-white/5 rounded-xl group-hover:bg-gold/10 transition-colors">
        <Icon className={cn("w-6 h-6", isLive ? "text-orange-500" : "text-gold")} />
      </div>
    </div>

    {progress && (
      <div className="mt-6">
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gold" style={{ width: `${progress}%` }} />
        </div>
      </div>
    )}
  </div>
);

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default Dashboard;
