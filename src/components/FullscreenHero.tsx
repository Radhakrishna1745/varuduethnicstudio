/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Upload, MessageSquare, MapPin, Sparkles, Shield, Trophy, Ruler } from 'lucide-react';
import { getScheduledHeroBanners, isBannerActive } from '../utils';
import { HeroBanner } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { onSnapshot, doc } from 'firebase/firestore';

interface HeroProps {
  onNavigate: (viewId: string) => void;
}

export default function FullscreenHero({ onNavigate }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<HeroBanner[]>(() => getScheduledHeroBanners());

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'hero_banners'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.list)) {
          const activeBanners = (data.list as HeroBanner[])
            .filter(isBannerActive)
            .sort((a, b) => a.order - b.order);
          setBanners(activeBanners);
          setCurrentSlide(0);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/hero_banners');
    });

    const interval = setInterval(() => {
      setBanners((prev) => {
        if (prev.length > 0) {
          setCurrentSlide((prevIndex) => (prevIndex + 1) % prev.length);
        }
        return prev;
      });
    }, 8000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Standard safe slide getter
  const activeSlide = banners[currentSlide] || {
    imageUrl: 'https://images.unsplash.com/photo-1597176116047-876a32798fcc?auto=format&fit=crop&q=82&w=1600',
    title: 'Where Royal Weddings Begin',
    subtitle: 'INDIAS PREMIER GROOM COUTURE STUDIO',
    description: 'Step into a world of timeless majesty. Handcrafted sherwanis tailored meticulously by generational master craftsmen to make your entry truly legendary.'
  };

  return (
    <section className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center bg-black overflow-hidden" id="fullscreen-epic-hero">
      
      {/* Cinematic Background Slideshow */}
      {banners.map((slide, index) => (
        <div
          key={slide.id || index}
          className={`absolute inset-0 transition-opacity duration-1500 cubic-bezier(0.4, 0, 0.2, 1) ${
            index === currentSlide ? 'opacity-70 z-0' : 'opacity-0 -z-10'
          }`}
        >
          {/* Zoom Overlay (Ken Burns Animation) */}
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className={`w-full h-full object-cover object-top ${
              index === currentSlide ? 'animate-ken-burns' : ''
            }`}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          {/* Luxury heavy gradient mask overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-black/30" />
          <div className="absolute inset-0 bg-radial-gradient(circle at center, transparent 30%, #0A0A0A 100%)" />
        </div>
      ))}

      {/* Floating Golden Sparks / Light Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="particle bg-gradient-to-t from-[#E5C46D] to-transparent"
            style={{
              width: `${Math.random() * 5 + 3}px`,
              height: `${Math.random() * 5 + 3}px`,
              left: `${Math.random() * 95}%`,
              bottom: `${Math.random() * 20}%`,
              animationDuration: `${Math.random() * 6 + 4}s`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle Breathing Maroon Glow on the sides to frame the page */}
      <div className="absolute -left-1/4 top-1/4 w-[400px] h-[400px] rounded-full bg-[#4A0E17] filter blur-[150px] maroon-glow-bg pointer-events-none z-10" />
      <div className="absolute -right-1/4 bottom-1/4 w-[400px] h-[400px] rounded-full bg-[#4A0E17] filter blur-[150px] maroon-glow-bg pointer-events-none z-10" />

      {/* Hero Content Panel */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 pt-16 text-center select-none">
        
        {/* Elite Sub-title */}
        <div className="inline-flex items-center space-x-2 bg-[#4A0E17]/80 px-4 py-1.5 rounded-full border border-[#C5A85D]/40 mb-6 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#E5C46D] animate-spin" style={{ animationDuration: '4s' }} />
          <span className="font-sans text-[9px] sm:text-[11px] font-semibold tracking-[0.3em] uppercase text-[#F5EFEB]">
            {activeSlide.subtitle}
          </span>
        </div>

        {/* Cinematic Main Title */}
        <h1 className="font-display font-medium text-4xl sm:text-6xl lg:text-7xl tracking-wide text-white mb-6">
          <span className="block italic text-gray-300 text-3xl sm:text-4xl lg:text-5xl font-serif font-light mb-2">
            The Royal Wardrobe of
          </span>
          <span className="text-gold-gradient font-bold drop-shadow-2xl">
            {activeSlide.title}
          </span>
        </h1>

        {/* Editorial Subdescription */}
        <p className="max-w-2xl mx-auto font-serif text-base sm:text-xl text-[#F5EFEB]/80 leading-relaxed tracking-wider mb-10 drop-shadow-md">
          {activeSlide.description}
        </p>

        {/* HIGH-CONVERSION HIGH-PERFORMANCE CTA BLOCK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto pb-12" id="hero-cta-grid">
          
          <button
            onClick={() => onNavigate('appointment')}
            className="flex items-center justify-center space-x-3 w-full py-4 px-6 bg-gradient-to-r from-[#C5A85D] to-[#E5C46D] text-black font-sans font-semibold text-xs uppercase tracking-[0.15em] rounded transition-transform duration-300 hover:scale-103 shadow-lg hover:shadow-[#C5A85D]/20 hover:border-[#E5C46D] border border-transparent cursor-pointer group"
          >
            <Calendar className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
            <span>Book Groom Session</span>
          </button>

          <button
            onClick={() => onNavigate('upload')}
            className="flex items-center justify-center space-x-3 w-full py-4 px-6 bg-transparent hover:bg-white/5 text-[#F5EFEB] border border-[#C5A85D] font-sans font-semibold text-xs uppercase tracking-[0.15em] rounded transition-transform duration-300 hover:scale-103 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#C5A85D]" />
            <span>Style Matching AI</span>
          </button>

          <a
            href="https://wa.me/919000777265?text=Hi%20Varudu%20Ethnic%20Studio!%20I%20am%20a%20groom%20planning%20my%20wedding.%20I%20would%20love%20to%20connect%20with%20a%20creative%20groom%20stylist%20to%20help%20me%20design%20my%20dream%20Sherwani."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-3 w-full py-3.5 px-6 bg-[#121212] hover:bg-[#1C1C1C] text-emerald-400 border border-emerald-500/30 font-sans font-semibold text-xs uppercase tracking-[0.15em] rounded transition-transform duration-300 hover:scale-103 cursor-pointer font-medium"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Stylist</span>
          </a>

          <button
            onClick={() => onNavigate('locations')}
            className="flex items-center justify-center space-x-3 w-full py-4 px-6 bg-[#4A0E17] hover:bg-[#5F1924] text-white font-sans font-semibold text-xs uppercase tracking-[0.15em] rounded transition-transform duration-300 hover:scale-103 cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-[#C5A85D]" />
            <span>Visit Showrooms</span>
          </button>

        </div>

        {/* Mini Trust Badges section right under CTA */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 pt-4 border-t border-white/10 max-w-3xl mx-auto text-center">
          <div className="flex flex-col items-center justify-center text-[#F5EFEB]/70">
            <div className="flex items-center space-x-1">
              <Trophy className="w-4 h-4 text-[#C5A85D]" />
              <span className="font-display font-bold text-sm md:text-lg text-[#E5C46D]">15,000+</span>
            </div>
            <span className="text-[9px] md:text-[10px] tracking-widest uppercase font-sans">Happy Royal Grooms</span>
          </div>
          <div className="flex flex-col items-center justify-center text-[#F5EFEB]/70">
            <div className="flex items-center space-x-1">
              <Ruler className="w-4 h-4 text-[#C5A85D]" />
              <span className="font-display font-bold text-sm md:text-lg text-[#E5C46D]">Bespoke</span>
            </div>
            <span className="text-[9px] md:text-[10px] tracking-widest uppercase font-sans">Handcrafted Fitting</span>
          </div>
          <div className="flex flex-col items-center justify-center text-[#F5EFEB]/70">
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4 text-[#C5A85D]" />
              <span className="font-display font-bold text-sm md:text-lg text-[#E5C46D]">100%</span>
            </div>
            <span className="text-[9px] md:text-[10px] tracking-widest uppercase font-sans">Masculine Groom Focus</span>
          </div>
        </div>

      </div>

      {/* Cinematic scroll indicator bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-1.5 z-20 cursor-pointer" onClick={() => {
        const nextSec = document.getElementById('trust-section');
        if (nextSec) nextSec.scrollIntoView({ behavior: 'smooth' });
      }}>
        <span className="text-[9px] uppercase tracking-[0.25em] text-[#C5A85D] font-sans font-light">Scroll Discovery</span>
        <div className="w-5 h-9 rounded-full border border-[#C5A85D]/55 p-1 flex justify-center">
          <div className="w-1 h-2 bg-[#C5A85D] rounded-full animate-bounce" />
        </div>
      </div>

    </section>
  );
}
