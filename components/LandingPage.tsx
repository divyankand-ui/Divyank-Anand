import React, { useEffect, useRef, useState } from 'react';
import { ViewState } from '../types';
import { Button } from './Button';

interface LandingPageProps {
  onNavigate: (view: ViewState) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black text-slate-50 overflow-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => onNavigate('LANDING')}>
            <div className="border-2 border-white w-10 h-10 flex items-center justify-center relative overflow-hidden group-hover:border-brand-400 transition-colors">
               <span className="font-serif font-black text-xl italic relative z-10 group-hover:text-brand-400">MET</span>
               <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0"></div>
            </div>
            <span className="font-bold tracking-widest text-sm uppercase hidden sm:block">My Expense<span className="font-normal opacity-50">Tracker</span></span>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('LOGIN')} className="text-sm font-medium tracking-wide hover:text-brand-400 transition-colors hidden sm:block">sign in</button>
            <div className="relative group">
                <button onClick={() => onNavigate('SIGNUP')} className="border border-white/20 px-6 py-3 bg-black/50 backdrop-blur-sm hover:bg-white hover:text-black transition-all duration-300 text-sm tracking-widest font-bold">
                GET STARTED
                </button>
                <div className="absolute -bottom-2 -right-2 w-full h-full border border-brand-400/50 -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20">
        
        {/* Architectural Pillars Effect (CSS simulated) */}
        <div className="absolute inset-0 pointer-events-none flex justify-between z-0">
            {/* Left Pillars */}
            <div className="flex gap-2 sm:gap-4 lg:gap-8 h-full opacity-30 transform -skew-y-6 scale-110 origin-top-left">
                {[...Array(5)].map((_, i) => (
                    <div key={`l-${i}`} className="w-8 sm:w-16 lg:w-24 bg-gradient-to-b from-gray-900 via-gray-800 to-black h-[150vh] transform translate-y-[-20%]" 
                         style={{ marginTop: `${i * 40}px`, opacity: 1 - (i * 0.15) }}></div>
                ))}
            </div>
             {/* Right Pillars */}
            <div className="flex gap-2 sm:gap-4 lg:gap-8 h-full opacity-30 transform skew-y-6 scale-110 origin-top-right flex-row-reverse">
                {[...Array(5)].map((_, i) => (
                    <div key={`r-${i}`} className="w-8 sm:w-16 lg:w-24 bg-gradient-to-b from-gray-900 via-gray-800 to-black h-[150vh] transform translate-y-[-20%]" 
                         style={{ marginTop: `${i * 40}px`, opacity: 1 - (i * 0.15) }}></div>
                ))}
            </div>
        </div>

        {/* Floating Money Particles (Subtle) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            <div className="absolute top-[20%] left-[15%] text-brand-400/20 text-6xl font-serif italic animate-float">₹</div>
            <div className="absolute bottom-[30%] right-[15%] text-brand-400/20 text-8xl font-serif italic animate-float-delayed">₹</div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center max-w-6xl mx-auto px-4">
            <h1 className="font-serif font-black text-5xl sm:text-7xl lg:text-8xl leading-[1.0] tracking-tighter text-white mb-8 animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
                crafted for <br />
                <span className="italic text-brand-400 text-glow">money makers</span> <br/>
                <span className="text-3xl sm:text-5xl lg:text-6xl font-light text-slate-300 tracking-normal">& money savers</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-400 font-light tracking-wide max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up opacity-0" style={{ animationDelay: '0.4s' }}>
                The members-only club that enables the financially savvy to track expenses and split costs with elegance.
            </p>

            <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.6s' }}>
                <div className="inline-block relative group cursor-pointer" onClick={() => onNavigate('SIGNUP')}>
                    <div className="bg-white text-black pl-4 pr-16 py-6 text-left relative z-10 w-80 hover:translate-y-1 transition-transform duration-200">
                        <div className="text-xs font-bold tracking-widest uppercase mb-1 opacity-60">Become a member</div>
                        <div className="text-2xl font-bold tracking-tight">Download Experience</div>
                        
                        {/* QR Code / Arrow substitute */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black text-white flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </div>
                    </div>
                    {/* Shadow block */}
                    <div className="absolute top-3 left-3 w-full h-full bg-brand-400 -z-0"></div>
                </div>
            </div>
        </div>
      </main>

      {/* Parallax Section */}
      <section className="relative py-32 bg-zinc-900 z-20 overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 relative">
            <div className="grid md:grid-cols-2 gap-20 items-center">
                <div className="space-y-8">
                    <h2 className="font-serif text-5xl md:text-7xl font-bold leading-none">
                        we take your money <br/> 
                        <span className="text-brand-400 italic">seriously.</span>
                    </h2>
                    <p className="text-xl text-gray-400 font-light leading-relaxed">
                        experience a tracking system that feels like a luxury. 
                        AI-powered insights, splitwise-style group management, 
                        and analytics that look as good as they function.
                    </p>
                    <Button onClick={() => onNavigate('SIGNUP')} className="rounded-none px-8 py-4 bg-brand-400 text-black hover:bg-white transition-colors uppercase tracking-widest text-xs font-bold">
                        Explore Dashboard
                    </Button>
                </div>
                
                {/* Graphics / Cards */}
                <div className="relative h-[600px] w-full perspective-1000">
                    <div className="absolute top-0 right-0 w-80 h-96 bg-black border border-gray-800 p-6 shadow-2xl transform rotate-6 hover:rotate-0 transition-all duration-700 ease-out z-10 group">
                         <div className="flex justify-between items-center mb-8">
                             <div className="w-8 h-8 rounded-full bg-brand-400"></div>
                             <div className="font-mono text-xs text-gray-500">NOW</div>
                         </div>
                         <div className="text-4xl font-mono text-white mb-2">₹4,250</div>
                         <div className="text-sm text-gray-400 uppercase tracking-wider">Dinner at Oberoi</div>
                         <div className="mt-12 space-y-2">
                             <div className="h-1 w-full bg-gray-800 rounded overflow-hidden">
                                 <div className="h-full w-3/4 bg-brand-400"></div>
                             </div>
                             <div className="flex justify-between text-xs text-gray-500 font-mono">
                                 <span>BUDGET</span>
                                 <span>75%</span>
                             </div>
                         </div>
                    </div>
                    
                    <div className="absolute top-20 right-20 w-80 h-96 bg-zinc-800 border border-gray-700 p-6 shadow-2xl transform -rotate-3 hover:rotate-0 transition-all duration-700 ease-out z-0 opacity-60 hover:opacity-100">
                         <div className="flex justify-between items-center mb-8">
                             <div className="w-8 h-8 rounded-full bg-blue-500"></div>
                             <div className="font-mono text-xs text-gray-400">YESTERDAY</div>
                         </div>
                         <div className="text-4xl font-mono text-white mb-2">₹1,200</div>
                         <div className="text-sm text-gray-400 uppercase tracking-wider">Fuel Refill</div>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* Feature Strip */}
      <section className="bg-black py-40 relative">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/10 pt-20">
                  {[
                      { title: 'AI ADVISOR', desc: 'Gemini-powered financial wisdom at your fingertips.' },
                      { title: 'GROUP SPLITS', desc: 'Seamlessly divide expenses with friends without the awkwardness.' },
                      { title: 'VISUAL WEALTH', desc: 'Beautiful charts that make you want to save more.' }
                  ].map((item, idx) => (
                      <div key={idx} className="group cursor-pointer">
                          <h3 className="font-serif text-3xl font-bold mb-4 group-hover:text-brand-400 transition-colors">{item.title}</h3>
                          <p className="text-gray-500 leading-relaxed max-w-xs">{item.desc}</p>
                          <div className="w-12 h-1 bg-white/20 mt-8 group-hover:w-full group-hover:bg-brand-400 transition-all duration-500"></div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-center py-12 border-t border-white/5">
        <div className="font-serif italic text-2xl text-white mb-4">My Expense Tracker</div>
        <p className="text-gray-600 text-sm tracking-widest uppercase">Made for the selected few.</p>
      </footer>

    </div>
  );
};