import { motion } from 'motion/react';
import { Sparkles, Maximize, Volume2, Gamepad2 } from 'lucide-react';

const experiences = [
  {
    id: 'imax',
    title: 'IMAX',
    subtitle: 'The Ultimate Movie Experience',
    description: 'Immersive yourself in the worlds most innovative cinematic experience. IMAX features crystal-clear images, heart-pounding audio, and dual proprietary 4K laser projectors.',
    icon: Maximize,
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80',
    features: ['Expanded Aspect Ratio', 'Custom theater geometry', 'Heart-Pounding Audio']
  },
  {
    id: '4dx',
    title: '4DX',
    subtitle: 'Absolute Cinema Experience',
    description: 'A revolutionary cinematic experience that stimulates all five senses with high-tech motion seats and special environmental effects including wind, fog, lightning, and scents.',
    icon: Gamepad2,
    image: 'https://images.unsplash.com/photo-1574267432553-4b4628081524?w=1200&q=80',
    features: ['Motion Seats', 'Environmental Effects', 'Multi-sensory']
  },
  {
    id: 'gold-class',
    title: 'Gold Class',
    subtitle: 'VIP Luxury Seating',
    description: 'Experience movies in absolute comfort with fully reclining leather seats, personalized call-button service, and a gourmet menu delivered right to your seat.',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80',
    features: ['Reclining Seats', 'In-seat Dining', 'Private Lounge']
  }
];

export default function Experiences() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 uppercase tracking-tighter">
            Elevate Your <span className="text-gold">Experience</span>
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto text-lg hover:text-white/80 transition-colors">
            Discover a new way to watch movies. From immersive IMAX screens to luxurious Gold Class seating, find the perfect way to enjoy your next film.
          </p>
        </motion.div>

        <div className="space-y-24">
          {experiences.map((exp, index) => (
            <div key={exp.id} className={`flex flex-col lg:flex-row gap-12 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              <motion.div 
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/2"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,215,0,0.1)] group">
                  <div className="absolute inset-0 bg-gold/10 group-hover:bg-transparent transition-colors z-10" />
                  <img src={exp.image} alt={exp.title} className="w-full h-[400px] object-cover" />
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/2 space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/20">
                  <exp.icon className="w-4 h-4" />
                  <span className="text-sm font-semibold uppercase tracking-wider">{exp.id}</span>
                </div>
                
                <h2 className="text-4xl font-bold text-white">{exp.title}</h2>
                <h3 className="text-xl text-white/50">{exp.subtitle}</h3>
                <p className="text-white/70 leading-relaxed text-lg">{exp.description}</p>
                
                <ul className="space-y-3 pt-4">
                  {exp.features.map(feature => (
                    <li key={feature} className="flex items-center gap-3 text-white">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="pt-6">
                  <button className="btn-gold px-8 py-3">Explore {exp.title}</button>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
