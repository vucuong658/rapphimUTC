import { useState } from 'react';
import { Search, Filter, MoreVertical, UserPlus, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { USERS } from '../../constants';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-sm text-white/40">Manage your cinema members and their membership tiers.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="btn-outline flex items-center gap-2 text-xs">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="btn-gold flex items-center gap-2 text-xs">
            <UserPlus className="w-4 h-4" />
            Add New User
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text" 
            placeholder="Search users by name, ID, or email..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-gold/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Filter by Tier</label>
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
            {['All', 'Gold', 'Silver', 'Bronze'].map(tier => (
              <button 
                key={tier}
                onClick={() => setActiveFilter(tier)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-xs font-medium transition-all",
                  activeFilter === tier ? "bg-gold text-black" : "text-white/60 hover:text-white"
                )}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Filter by Status</label>
          <select className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50">
            <option>Active</option>
            <option>Inactive</option>
            <option>Pending</option>
            <option>Deactivated</option>
            <option>All</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] uppercase tracking-widest font-bold text-white/40 border-b border-white/5">
              <th className="px-6 py-4">User ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Contact (Email/Phone)</th>
              <th className="px-6 py-4">Membership Tier</th>
              <th className="px-6 py-4">Total Lifetime Value (LTV)</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {USERS.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 text-xs font-mono text-white/40">{user.id}</td>
                <td className="px-6 py-4 font-bold text-sm">{user.name}</td>
                <td className="px-6 py-4">
                  <div className="text-xs text-white/60">{user.email}</div>
                  <div className="text-[10px] text-white/40">{user.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold border",
                    user.membershipTier === 'Gold' ? "bg-gold/20 text-gold border-gold/30" :
                    user.membershipTier === 'Silver' ? "bg-slate-400/20 text-slate-400 border-slate-400/30" :
                    "bg-orange-800/20 text-orange-800 border-orange-800/30"
                  )}>
                    {user.membershipTier}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-sm">${user.ltv.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold border",
                    user.status === 'Active' ? "bg-green-500/20 text-green-500 border-green-500/30" :
                    user.status === 'Inactive' ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" :
                    "bg-red-500/20 text-red-500 border-red-500/30"
                  )}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          <div className="text-xs text-white/40">Showing 1 to 10 of 1,250 users</div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 disabled:opacity-20"><ChevronLeft className="w-4 h-4" /></button>
            {[1, 2, 3, '...', 125].map((page, idx) => (
              <button 
                key={idx}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                  page === 1 ? "bg-gold text-black" : "hover:bg-white/5 text-white/40 hover:text-white"
                )}
              >
                {page}
              </button>
            ))}
            <button className="p-2 hover:bg-white/10 rounded-lg text-white/40"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default UserManagement;
