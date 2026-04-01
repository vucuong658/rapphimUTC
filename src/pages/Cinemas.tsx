import { motion } from 'motion/react';
import { MapPin, Phone, Clock, Video, Coffee, Car } from 'lucide-react';
import { useState } from 'react';

const cinemas = [
  {
    id: 1,
    name: "UTCCinema Center",
    address: "123 Main St, Downtown, Metropolis",
    phone: "1-800-UTC-CINE",
    hours: "09:00 AM - 11:30 PM",
    facilities: [Video, Coffee, Car],
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80"
  },
  {
    id: 2,
    name: "UTCCinema South",
    address: "456 South Avenue, Metropolis",
    phone: "1-800-UTC-SOUT",
    hours: "10:00 AM - 10:30 PM",
    facilities: [Video, Car],
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80"
  },
  {
    id: 3,
    name: "UTCCinema Premium",
    address: "789 Elite Road, Uptown, Metropolis",
    phone: "1-800-UTC-PREM",
    hours: "11:00 AM - 01:00 AM",
    facilities: [Video, Coffee, Car],
    image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&q=80"
  }
];

export default function Cinemas() {
  const [selectedCity, setSelectedCity] = useState('All');

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Cinemas</h1>
          <p className="text-white/60 max-w-2xl mx-auto">Find an UTCCinema near you and enjoy the ultimate movie experience with state-of-the-art facilities.</p>
        </motion.div>

        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 hide-scrollbar">
          {['All', 'Metropolis', 'Gotham', 'Star City'].map(city => (
            <button 
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${selectedCity === city ? 'bg-gold text-black font-semibold' : 'bg-white/5 text-white/60 hover:text-white'}`}
            >
              {city}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cinemas.map((cinema, i) => (
            <motion.div 
              key={cinema.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl overflow-hidden group border border-white/10 hover:border-gold/30 transition-colors"
            >
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors z-10" />
                <img 
                  src={cinema.image} 
                  alt={cinema.name} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-gold transition-colors">{cinema.name}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 text-white/60 text-sm">
                    <MapPin className="w-5 h-5 text-gold shrink-0" />
                    <span>{cinema.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/60 text-sm">
                    <Phone className="w-5 h-5 text-gold shrink-0" />
                    <span>{cinema.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/60 text-sm">
                    <Clock className="w-5 h-5 text-gold shrink-0" />
                    <span>{cinema.hours}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <div className="flex gap-2">
                    {cinema.facilities.map((Icon, idx) => (
                      <div key={idx} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-white/70" />
                      </div>
                    ))}
                  </div>
                  <button className="text-sm text-gold hover:text-white transition-colors font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
