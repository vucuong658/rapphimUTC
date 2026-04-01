import { useState } from 'react';
import { Save, Bell, Shield, Globe, Database, Mail, Smartphone, User, Lock, Eye, EyeOff, Layout, Palette, Zap } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [showApiKey, setShowApiKey] = useState(false);

  const tabs = [
    { name: 'General', icon: Layout },
    { name: 'Branding', icon: Palette },
    { name: 'Notifications', icon: Bell },
    { name: 'Security', icon: Shield },
    { name: 'Integrations', icon: Zap },
    { name: 'Backup', icon: Database },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Settings</h1>
          <p className="text-sm text-white/40">Configure application behavior, security, and branding.</p>
        </div>
        <button className="btn-gold flex items-center gap-2 text-xs">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button 
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-xl text-sm font-medium transition-all group",
                activeTab === tab.name ? "bg-gold text-black shadow-lg" : "text-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              <tab.icon className={cn("w-5 h-5 transition-colors", activeTab === tab.name ? "text-black" : "text-white/20 group-hover:text-gold")} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {activeTab === 'General' && (
            <div className="space-y-8">
              <div className="glass-card p-8 space-y-8">
                <h2 className="text-xl font-bold border-b border-white/5 pb-4">Application Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">App Name</label>
                    <input type="text" defaultValue="UTCCINEMA" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Support Email</label>
                    <input type="email" defaultValue="support@utccinema.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Timezone</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50">
                      <option>UTC+7 (Bangkok, Hanoi, Jakarta)</option>
                      <option>UTC+0 (Greenwich Mean Time)</option>
                      <option>UTC-5 (Eastern Standard Time)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Default Language</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50">
                      <option>Vietnamese</option>
                      <option>English</option>
                      <option>French</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 space-y-8">
                <h2 className="text-xl font-bold border-b border-white/5 pb-4">Booking Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Booking Fee ($)</label>
                    <input type="number" defaultValue="2.50" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Max Tickets Per User</label>
                    <input type="number" defaultValue="6" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <div className="text-sm font-bold">Allow Guest Checkout</div>
                      <div className="text-xs text-white/40">Users can book without an account</div>
                    </div>
                    <div className="w-12 h-6 bg-gold rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <div className="text-sm font-bold">Auto-Release Seats</div>
                      <div className="text-xs text-white/40">Release unpaid seats after 15 mins</div>
                    </div>
                    <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white/40 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="space-y-8">
              <div className="glass-card p-8 space-y-8">
                <h2 className="text-xl font-bold border-b border-white/5 pb-4">API & Keys</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Public API Key</label>
                    <div className="relative">
                      <input 
                        type={showApiKey ? "text" : "password"} 
                        readOnly 
                        value="pk_live_51Mv9X6L2h8G4j7K1m9n0p3q5r7s9t1u3v5w7x9y0z2" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none" 
                      />
                      <button 
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button className="btn-outline text-xs py-2 px-6">Regenerate Keys</button>
                </div>
              </div>

              <div className="glass-card p-8 space-y-8">
                <h2 className="text-xl font-bold border-b border-white/5 pb-4">Two-Factor Authentication</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gold/10 border border-gold/20">
                      <Smartphone className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">SMS Authentication</div>
                      <div className="text-xs text-white/40">Receive a code via SMS to log in.</div>
                    </div>
                  </div>
                  <button className="btn-outline text-xs py-2 px-6">Enable</button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <Mail className="w-6 h-6 text-white/40" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Email Authentication</div>
                      <div className="text-xs text-white/40">Receive a code via email to log in.</div>
                    </div>
                  </div>
                  <button className="btn-outline text-xs py-2 px-6">Enable</button>
                </div>
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

export default Settings;
