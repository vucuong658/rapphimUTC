import { motion } from 'motion/react';
import { Ticket, Search, Plus, CreditCard, Percent, Settings, CalendarDays } from 'lucide-react';
import { useState } from 'react';

const priceRules = [
  { id: 1, name: 'Standard 2D Base', type: 'Base', price: '$12.00', status: 'Active' },
  { id: 2, name: '3D Surcharge', type: 'Add-on', price: '+$3.00', status: 'Active' },
  { id: 3, name: 'IMAX Surcharge', type: 'Add-on', price: '+$6.00', status: 'Active' },
  { id: 4, name: 'VIP Seat Premium', type: 'Seating', price: '+$5.00', status: 'Active' },
  { id: 5, name: 'Sweetbox (Twin)', type: 'Seating', price: '$28.00', status: 'Active' },
  { id: 6, name: 'Weekend Bump', type: 'Modifiers', price: '+$2.00', status: 'Active' },
  { id: 7, name: 'Early Bird (Mornings)', type: 'Modifiers', price: '-$2.00', status: 'Inactive' },
];

export default function PricingAndSeating() {
  const [activeTab, setActiveTab] = useState('rules');

  return (
    <div className="p-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Pricing & Seating</h1>
          <p className="text-white/60">Configure ticket prices, seat tiers, and dynamic modifiers.</p>
        </div>
        <button className="btn-gold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Price Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Avg Ticket Price', value: '$14.50', up: true, icon: Ticket },
          { label: 'Weekend Premium', value: '$16.50', up: true, icon: CalendarDays },
          { label: 'VIP Uptake', value: '28%', up: true, icon: Percent },
          { label: 'Active Rules', value: '6', up: false, icon: Settings },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 border-white/5 rounded-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/5 rounded-xl">
                <stat.icon className="w-5 h-5 text-gold" />
              </div>
            </div>
            <p className="text-white/40 text-sm mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-8">
        {['rules', 'seating_map', 'modifiers'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-sm font-medium capitalize transition-colors relative ${activeTab === tab ? 'text-gold' : 'text-white/40 hover:text-white'}`}
          >
            {tab.replace('_', ' ')}
            {activeTab === tab && (
              <motion.div layoutId="pricingTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
            )}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-2xl border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Pricing Rules</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Search rules..." 
              className="bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-gold/50 text-white"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Rule Name</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Type</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Price/Modifier</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Status</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-white/40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {priceRules.map((rule) => (
                <tr key={rule.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-medium text-white">{rule.name}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-white/10 text-white/80">
                      {rule.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`font-semibold ${rule.price.includes('+') ? 'text-green-400' : rule.price.includes('-') ? 'text-red-400' : 'text-white'}`}>
                      {rule.price}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${rule.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm text-white/80">{rule.status}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-sm text-gold hover:text-white transition-colors">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
