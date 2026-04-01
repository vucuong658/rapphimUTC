import { useState } from 'react';
import { Search, Download, Filter, TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, Landmark, ChevronLeft, ChevronRight } from 'lucide-react';

const FinancialLedger = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('Last 30 Days');

  const transactions = [
    { id: 'TXN-123456', date: 'Oct 25, 2024, 10:15 AM', type: 'Sale', description: 'Online Ticket Sale - Movie X', method: 'Credit Card (Visa)', status: 'Completed', amount: 45.00, isPositive: true },
    { id: 'TXN-123457', date: 'Oct 25, 2024, 11:00 AM', type: 'Sale', description: 'Concession Stand - Popcorn & Drink', method: 'Cash', status: 'Completed', amount: 18.50, isPositive: true },
    { id: 'TXN-123458', date: 'Oct 24, 2024, 09:30 AM', type: 'Refund', description: 'Ticket Refund - Movie Y', method: 'Credit Card (Mastercard)', status: 'Refunded', amount: -22.00, isPositive: false },
    { id: 'TXN-123459', date: 'Oct 24, 2024, 02:45 PM', type: 'Sale', description: 'Online Ticket Sale - Movie Z', method: 'Digital Wallet (Apple Pay)', status: 'Completed', amount: 36.00, isPositive: true },
    { id: 'TXN-123460', date: 'Oct 24, 2024, 09:30 AM', type: 'Sale', description: 'Online Ticket Sale - Movie X', method: 'Digital Wallet (Apple Pay)', status: 'Completed', amount: 29.00, isPositive: true },
    { id: 'TXN-123461', date: 'Oct 23, 2024, 09:00 AM', type: 'Sale', description: 'Concession Stand - Popcorn & Drink', method: 'Digital Wallet (Apple Pay)', status: 'Completed', amount: -19.00, isPositive: false },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Financial Ledger & Cash Flow</h1>
          <p className="text-sm text-white/40">Track all transactions, revenue, and processing fees.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
            {['Excel', 'PDF'].map(format => (
              <button key={format} className="px-4 py-1.5 rounded-md text-xs font-medium text-white/60 hover:text-white transition-all">
                {format}
              </button>
            ))}
          </div>
          <button className="btn-gold flex items-center gap-2 text-xs">
            <Download className="w-4 h-4" />
            Download Financial Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="text-xs text-white/40 uppercase tracking-widest font-bold mb-4">Gross Revenue</div>
          <div className="text-3xl font-bold mb-2">$52,450.00</div>
          <div className="flex items-center gap-1 text-xs font-bold text-green-500">
            <TrendingUp className="w-3 h-3" /> 10% increase
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="text-xs text-white/40 uppercase tracking-widest font-bold mb-4">Processing Fees</div>
          <div className="text-3xl font-bold mb-2">$1,250.80</div>
          <div className="flex items-center gap-1 text-xs font-bold text-red-500">
            <TrendingDown className="w-3 h-3" /> 2% decrease
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="text-xs text-white/40 uppercase tracking-widest font-bold mb-4">Net Income</div>
          <div className="text-3xl font-bold mb-2">$51,199.20</div>
          <div className="flex items-center gap-1 text-xs font-bold text-green-500">
            <TrendingUp className="w-3 h-3" /> 9% increase
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-gold/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block font-bold">Date Range</label>
          <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last 24 Hours</option>
            <option>Custom Range</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block font-bold">Payment Method</label>
          <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50">
            <option>All</option>
            <option>Credit Card</option>
            <option>Digital Wallet</option>
            <option>Cash</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block font-bold">Transaction Type</label>
          <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50">
            <option>All (Sale/Refund)</option>
            <option>Sale</option>
            <option>Refund</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] uppercase tracking-widest font-bold text-white/40 border-b border-white/5">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Transaction ID</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Payment Method</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 text-xs text-white/60">{txn.date}</td>
                <td className="px-6 py-4 text-xs font-mono text-white/40">{txn.id}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold border",
                    txn.type === 'Sale' ? "bg-green-500/20 text-green-500 border-green-500/30" : "bg-red-500/20 text-red-500 border-red-500/30"
                  )}>
                    {txn.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">{txn.description}</td>
                <td className="px-6 py-4 text-xs text-white/60">{txn.method}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold border",
                    txn.status === 'Completed' ? "bg-green-500/20 text-green-500 border-green-500/30" : "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                  )}>
                    {txn.status}
                  </span>
                </td>
                <td className={cn(
                  "px-6 py-4 text-right font-bold text-sm",
                  txn.isPositive ? "text-green-500" : "text-red-500"
                )}>
                  {txn.isPositive ? '+' : ''}${Math.abs(txn.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          <div className="text-xs text-white/40">Showing 1 to 10 of 450 transactions</div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 disabled:opacity-20"><ChevronLeft className="w-4 h-4" /></button>
            {[1, 2, 3, '...', 45].map((page, idx) => (
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

export default FinancialLedger;
