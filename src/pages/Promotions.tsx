import { motion } from 'motion/react';
import { Tag, Calendar, ChevronRight } from 'lucide-react';

const promotions = [
  {
    id: 1,
    title: 'Student Special Discount',
    type: 'Tickets',
    description: 'Show your valid student ID and get 20% off on all 2D movie tickets from Monday to Thursday.',
    validUntil: 'Dec 31, 2026',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
    color: 'from-blue-500/20 to-purple-500/20'
  },
  {
    id: 2,
    title: 'Couple Combo Pack',
    type: 'Food & Beverage',
    description: 'Get 2 large drinks and 1 large popcorn mixed flavor at a special price of only $15.',
    validUntil: 'Nov 30, 2026',
    image: 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?w=800&q=80',
    color: 'from-gold/20 to-orange-500/20'
  },
  {
    id: 3,
    title: 'Midnight Screening Treat',
    type: 'Events',
    description: 'Book tickets for any showtime after 10 PM and receive a complimentary small popcorn.',
    validUntil: 'Oct 31, 2026',
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80',
    color: 'from-red-500/20 to-pink-500/20'
  },
  {
    id: 4,
    title: 'VIP Member Exclusive',
    type: 'Members',
    description: 'Double reward points on all purchases this weekend for Gold and Platinum members.',
    validUntil: 'This Weekend',
    image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&q=80',
    color: 'from-emerald-500/20 to-teal-500/20'
  }
];

export default function Promotions() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Promotions & Offers</h1>
            <p className="text-white/60 max-w-2xl text-lg">Never miss a great deal! Check out our latest promotions and special offers to elevate your movie-going experience.</p>
          </div>
          <div className="flex gap-2 pb-2">
            {['All', 'Tickets', 'Food & Beverage', 'Members'].map((filter, i) => (
              <button 
                key={filter} 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${i === 0 ? 'bg-white text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {promotions.map((promo, i) => (
            <motion.div 
              key={promo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br ${promo.color} group`}
            >
              <div className="absolute inset-0 bg-[#050505]/60 backdrop-blur-[2px] z-0" />
              
              <div className="relative z-10 flex flex-col sm:flex-row h-full">
                <div className="w-full sm:w-2/5 h-48 sm:h-auto overflow-hidden">
                  <img 
                    src={promo.image} 
                    alt={promo.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                <div className="w-full sm:w-3/5 p-6 flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white text-xs font-medium mb-4 backdrop-blur-md border border-white/10">
                      <Tag className="w-3 h-3 text-gold" />
                      {promo.type}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">{promo.title}</h3>
                    <p className="text-white/60 text-sm line-clamp-3 mb-6">{promo.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-white/50 text-xs font-medium">
                      <Calendar className="w-4 h-4" />
                      Valid until: <span className="text-white">{promo.validUntil}</span>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-gold group-hover:text-black transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
