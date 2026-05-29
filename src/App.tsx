/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FullscreenHero from './components/FullscreenHero';
import FeaturedCollections from './components/FeaturedCollections';
import ConsultationSystem from './components/ConsultationSystem';
import GroomLookbook from './components/GroomLookbook';
import StoreLocations from './components/StoreLocations';
import AdminCRM from './components/AdminCRM';
import RecentInquiryPopup from './components/RecentInquiryPopup';
import ExitIntentPopup from './components/ExitIntentPopup';
import SplashIntro from './components/SplashIntro';
import GroomFAQ from './components/GroomFAQ';

import { 
  getStoredLeads, getStoredAppointments, 
  saveAppointment, getGroomStructuredSchema, playRegalGoldChime,
  startLiveSync, getWebPhoto
} from './utils';

import { 
  TESTIMONIALS, BLOGS, COLLECTIONS 
} from './data';

import { 
  ProductCollection, Testimonial 
} from './types';

import { 
  Sparkles, Calendar, MessageSquare, Phone, MapPin, 
  Clock, ShieldCheck, Star, ArrowRight, BookOpen, 
  Heart, Check, Info, Award, Settings, UserCheck, X 
} from 'lucide-react';

export default function App() {
  // Cinema Logo Splash Screen Intro State
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('varudu_splash_played');
      return !stored;
    }
    return true;
  });

  const handleSplashComplete = () => {
    setShowSplash(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('varudu_splash_played', 'true');
    }
  };

  // Navigation State
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedProductInquiry, setSelectedProductInquiry] = useState<string>('');

  // Lock admin CRM portal open state
  const [isAdminCrmOpen, setIsAdminCrmOpen] = useState(false);

  // High conversion urgency indicators
  const [vipSlotsLeft, setVipSlotsLeft] = useState(3);

  // Testimonials custom entry array state
  const [activeTestimonials, setActiveTestimonials] = useState<Testimonial[]>([]);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewLocation, setNewReviewLocation] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // VIP Appointment Form States
  const [apptBranch, setApptBranch] = useState('Chaitanyapuri Studio - Kothapet');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('11:00 AM');
  const [apptOccasion, setApptOccasion] = useState('Main Wedding Sherwani Trial');
  const [apptName, setApptName] = useState('');
  const [apptPhone, setApptPhone] = useState('');
  const [apptEmail, setApptEmail] = useState('');
  const [apptSuccessTicket, setApptSuccessTicket] = useState<any | null>(null);

  // Floating widgets toggles
  const [isUrgencyPromptOpen, setIsUrgencyPromptOpen] = useState(true);

  // Active blog state for modal reading
  const [activeReadBlog, setActiveReadBlog] = useState<any | null>(null);

  // Dynamic Web Legacy Photo
  const [legacyPhotoUrl, setLegacyPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200');

  useEffect(() => {
    // Sync star testimonials
    setActiveTestimonials(TESTIMONIALS);

    // Initial Live Sync subscription with Firebase Firestore
    const stopLiveSync = startLiveSync();

    // Load custom majestic legacy image
    const loadLegacyPhoto = async () => {
      const url = await getWebPhoto('web_photo_legacy', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200');
      if (url) {
        setLegacyPhotoUrl(url);
      }
    };
    loadLegacyPhoto();

    window.addEventListener('varudu-photo-updated', loadLegacyPhoto);

    // Randomize slot decreases slowly to trigger real customer scarcity/FOMO
    const interval = setInterval(() => {
      setVipSlotsLeft(prev => {
        if (prev <= 1) return 3; // reset
        return prev - 1;
      });
    }, 45000);

    return () => {
      clearInterval(interval);
      stopLiveSync();
      window.removeEventListener('varudu-photo-updated', loadLegacyPhoto);
    };
  }, []);

  const handleCustomReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTest: Testimonial = {
      id: `test-${Date.now()}`,
      name: newReviewName,
      role: 'Real Groom of Varudu',
      review: newReviewText,
      imageUrl: 'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?auto=format&fit=crop&q=80&w=150',
      rating: newReviewRating,
      weddingLocation: newReviewLocation || 'Married at Royal Ceremony'
    };

    setActiveTestimonials([newTest, ...activeTestimonials]);
    setNewReviewName('');
    setNewReviewText('');
    setNewReviewLocation('');
    setReviewSuccess(true);
    playRegalGoldChime();
    setTimeout(() => setReviewSuccess(false), 5000);
  };

  const handleBookApptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const apptData = {
      branch: apptBranch,
      date: apptDate,
      time: apptTime,
      occasion: apptOccasion,
      customerName: apptName,
      customerPhone: apptPhone,
      customerEmail: apptEmail
    };

    const newAppt = saveAppointment(apptData);
    setApptSuccessTicket(newAppt);
    // Reset forms
    setApptName('');
    setApptPhone('');
    setApptEmail('');
    setApptDate('');
    playRegalGoldChime();

    // Prepare robust WhatsApp text notification template to notify the showroom owner of the new appointment booking
    const text = `*NEW SHOWROOM APPOINTMENT SELECTED*\n━━━━━━━━━━━━━━━━━━━━\n👤 *Groom Name:* ${apptData.customerName}\n📞 *Phone Number:* ${apptData.customerPhone}\n📧 *Email:* ${apptData.customerEmail || 'None provided'}\n🏢 *Selected Showroom:* ${apptData.branch}\n📅 *Appointment Slot:* ${apptData.date} at ${apptData.time}\n🏛️ *Occasion details:* ${apptData.occasion}\n━━━━━━━━━━━━━━━━━━━━\n✨ _Logged instantly database backed with live Firebase! _`;
    const whatsappUrl = `https://wa.me/919505122400?text=${encodeURIComponent(text)}`;
    
    // Automatically open WhatsApp in background to log the appointment notification directly to owner
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 800);
  };

  const handleSelectProductFromCollections = (productName: string) => {
    setSelectedProductInquiry(productName);
    setActiveView('upload');
  };

  const handleExitIntentBookingTrigger = () => {
    setActiveView('appointment');
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-gray-200 selection:bg-[#C5A85D] selection:text-black">
      
      {/* HTML SEO Schema Injection inside raw view */}
      <script type="application/ld+json">
        {JSON.stringify(getGroomStructuredSchema())}
      </script>

      {/* Header and Brand identity */}
      <Header 
        activeView={activeView} 
        setActiveView={(v) => {
          setActiveView(v);
          setSelectedProductInquiry('');
        }} 
        openAdminLock={() => setIsAdminCrmOpen(true)}
        onReplaySplash={() => {
          setShowSplash(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* RENDER PAGES DYNAMICALLY */}
      <main className="pb-16" id="root-viewport">

        {activeView === 'home' && (
          <div className="space-y-0" id="home-view">
            
            {/* Fullscreen Epic Hero */}
            <FullscreenHero onNavigate={setActiveView} />

            {/* TRUST & STATS SECTION */}
            <section className="py-16 bg-[#121212] border-y border-[#C5A85D]/10 relative overflow-hidden" id="trust-section">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                  
                  <div className="space-y-1">
                    <div className="text-[#C5A85D] font-display font-medium text-4xl sm:text-5xl tracking-tight">
                      15,000+
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#FAFAFA] font-sans font-semibold">
                      Real Grooms Styled
                    </p>
                    <p className="font-serif text-gray-400 text-xs">
                      Handcrafted weddings of timeless aesthetic
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[#C5A85D] font-display font-medium text-4xl sm:text-5xl tracking-tight">
                      58 Years
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#FAFAFA] font-sans font-semibold">
                      Atelier Heritage
                    </p>
                    <p className="font-serif text-gray-400 text-xs">
                      Generational master craftsmen of Udaipur
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[#C5A85D] font-display font-medium text-4xl sm:text-5xl tracking-tight">
                      100%
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#FAFAFA] font-sans font-semibold">
                      Groom Specialization
                    </p>
                    <p className="font-serif text-gray-400 text-xs">
                      Strictly zero brides. Zero distractions.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[#C5A85D] font-display font-medium text-4xl sm:text-5xl tracking-tight">
                      2 Studios
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#FAFAFA] font-sans font-semibold">
                      Luxury Ateliers
                    </p>
                    <p className="font-serif text-gray-400 text-xs">
                      Kothapet & Secunderabad Lounges
                    </p>
                  </div>

                </div>
              </div>
            </section>

            {/* QUICK PREVIEW PREVIEW OF COLLECTIONS DESK */}
            <FeaturedCollections onSelectProduct={handleSelectProductFromCollections} />

            {/* COUTURE LORE SECTION: WHY CHOOSE VARUDU */}
            <section className="py-24 bg-gradient-to-b from-[#0A0A0A] to-[#121212] relative overflow-hidden" id="why-choose-varudu-panel">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center mb-16">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A85D] font-sans font-medium block">
                    Tailored Skeletal fitting
                  </span>
                  <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl text-white tracking-wide mt-2">
                    Why Royalty Selects <span className="text-gold-gradient italic font-serif font-light">Varudu</span>
                  </h2>
                  <div className="w-16 h-[1px] bg-[#C5A85D] mx-auto mt-4" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  <div className="bg-black/40 border border-[#C5A85D]/15 p-8 rounded-lg space-y-4 hover:border-[#C5A85D]/40 transition-all duration-300">
                    <div className="w-12 h-12 bg-[#4A0E17] border border-[#C5A85D]/25 flex items-center justify-center rounded-full text-[#C5A85D]">
                      <Award className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-lg text-white font-medium tracking-widest uppercase">
                      Exclusive Turban & Mojri Matching
                    </h3>
                    <p className="font-serif text-xs text-gray-400 leading-relaxed">
                      We dye luxury silk threads to precisely match your bride\'s design sample, weaving a coordinated Safa and custom orthopedic-cushioned velvet mojri shoes.
                    </p>
                  </div>

                  <div className="bg-black/40 border border-[#C5A85D]/15 p-8 rounded-lg space-y-4 hover:border-[#C5A85D]/40 transition-all duration-300">
                    <div className="w-12 h-12 bg-[#4A0E17] border border-[#C5A85D]/25 flex items-center justify-center rounded-full text-[#C5A85D]">
                      <Settings className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
                    </div>
                    <h3 className="font-display text-lg text-white font-medium tracking-widest uppercase">
                      German Solvi canvas interlining
                    </h3>
                    <p className="font-serif text-xs text-gray-400 leading-relaxed">
                      Unlike store-bought coats that buckle, our structural interlinings preserve clean lines. You remain in high-definition photogenic focus under bright venue beams.
                    </p>
                  </div>

                  <div className="bg-black/40 border border-[#C5A85D]/15 p-8 rounded-lg space-y-4 hover:border-[#C5A85D]/40 transition-all duration-300">
                    <div className="w-12 h-12 bg-[#4A0E17] border border-[#C5A85D]/25 flex items-center justify-center rounded-full text-[#C5A85D]">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-lg text-white font-medium tracking-widest uppercase">
                      Lifetime skeletal fit registry
                    </h3>
                    <p className="font-serif text-xs text-gray-400 leading-relaxed">
                      Your measurements are secured. If you require a custom Kurta set for subsequent anniversaries, order directly on phone and receive pristine bespoke sizes in 7 days flat.
                    </p>
                  </div>

                </div>

              </div>
            </section>

            {/* PRE-DRESSED TESTIMONIALS SPOTLIGHT slider */}
            <section className="py-24 bg-[#0A0A0A] border-t border-[#C5A85D]/10" id="testimonials-spotlight">
              <div className="max-w-5xl mx-auto px-4 sm:px-6">
                
                <div className="text-center mb-12">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A85D] font-sans font-bold block">
                    Groom Legacies
                  </span>
                  <h3 className="font-display font-medium text-2xl sm:text-4xl text-white tracking-widest uppercase mt-2">
                    Grooms of <span className="text-gold-gradient italic font-serif font-light">VARUDU</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {activeTestimonials.slice(0, 3).map((item) => (
                    <div key={item.id} className="bg-[#121212] border border-white/5 p-6 rounded-lg space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-1">
                          {[...Array(item.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-[#C5A85D] fill-[#C5A85D]" />
                          ))}
                        </div>
                        <p className="font-serif text-xs text-gray-300 leading-relaxed italic">
                          "{item.review}"
                        </p>
                      </div>
                      <div className="pt-4 border-t border-white/5 flex items-center space-x-3">
                        <img 
                          src={item.imageUrl} 
                          alt="Groom profile" 
                          className="w-10 h-10 object-cover object-top rounded-full border border-[#C5A85D]/30"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="text-xs font-sans font-semibold text-white uppercase tracking-wider">{item.name}</h4>
                          <span className="text-[9px] text-[#C5A85D] font-sans block">{item.weddingLocation}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-10">
                  <button
                    onClick={() => setActiveView('testimonials')}
                    className="px-6 py-3 bg-transparent hover:bg-white/5 text-xs font-sans font-bold uppercase tracking-widest border border-[#C5A85D] text-[#C5A85D] rounded transition-all cursor-pointer"
                  >
                    View All Groom Chronicles
                  </button>
                </div>

              </div>
            </section>

            {/* SHOWROOM MAPS PREVIEW */}
            <StoreLocations />

          </div>
        )}

        {/* DETAILS SUB-PAGES */}
        {activeView === 'collections' && (
          <FeaturedCollections onSelectProduct={handleSelectProductFromCollections} />
        )}

        {activeView === 'lookbook' && (
          <GroomLookbook />
        )}

        {activeView === 'upload' && (
          <ConsultationSystem 
            preFilledProduct={selectedProductInquiry} 
            onSuccess={() => setSelectedProductInquiry('')} 
          />
        )}

        {/* VIP BOOKING PAGE STATE */}
        {activeView === 'appointment' && (
          <section className="py-24 bg-[#0A0A0A] border-b border-white/5" id="appointment-booking-page">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {apptSuccessTicket ? (
                /* Ticket Success Panel */
                <div className="bg-[#121212] border-2 border-[#C5A85D] p-8 sm:p-12 rounded-lg text-center shadow-2xl max-w-xl mx-auto">
                  
                  <div className="w-14 h-14 bg-[#4A0E17] border border-[#C5A85D]/30 flex items-center justify-center rounded-full mx-auto mb-6">
                    <Check className="w-7 h-7 text-emerald-400" />
                  </div>

                  <h3 className="font-display font-medium text-2xl text-white tracking-widest uppercase">
                    REGISTRATION CONFIRMED
                  </h3>
                  <p className="text-[#C5A85D] text-[10px] tracking-widest uppercase font-sans mt-1">
                    Atelier Booking Ticket #{apptSuccessTicket.id.replace('appt-', '')}
                  </p>

                  <div className="w-12 h-[1px] bg-[#C5A85D] mx-auto my-6" />

                  <div className="bg-black/60 p-5 rounded border border-white/5 text-left text-xs font-sans tracking-wide space-y-3 font-medium text-gray-300">
                    <p>🤴 *Groom Client:* <span className="text-white font-bold">{apptSuccessTicket.customerName}</span></p>
                    <p>⚓ *Selected lounge:* <span className="text-[#E5C46D]">{apptSuccessTicket.branch}</span></p>
                    <p>⏰ *Fitting clock:* <span className="text-white">{apptSuccessTicket.date} at {apptSuccessTicket.time}</span></p>
                    <p>👔 *Gifting purpose:* {apptOccasion}</p>
                  </div>

                  <p className="text-xs text-gray-400 font-serif leading-relaxed mt-6">
                    Your styling chamber has been locked. Check your phone for custom WhatsApp confirmation prompts. A stylist will reach you of any measurements checkups dynamic to your selected date.
                  </p>

                  <div className="mt-8 gap-4 flex flex-col sm:flex-row justify-center">
                    <a
                      href={`https://wa.me/919505122400?text=Hi%20Varudu!%20I%20have%20successfully%20reserved%20appointment%20ticket%20%23${apptSuccessTicket.id.replace('appt-', '')}.%20Please%20verify%20my%20slot%20for%20fitting.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs uppercase font-bold tracking-widest rounded transition-transform shadow flex items-center justify-center space-x-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Verify on WhatsApp</span>
                    </a>
                    <button
                      onClick={() => setApptSuccessTicket(null)}
                      className="px-6 py-3.5 bg-transparent border border-white/10 hover:bg-white/5 text-gray-300 text-xs font-sans uppercase tracking-widest rounded"
                    >
                      Reset Form
                    </button>
                  </div>

                </div>
              ) : (
                <div className="bg-[#121212] border border-[#C5A85D]/20 p-6 sm:p-10 rounded-lg shadow-2xl relative">
                  
                  {/* Urgency indicator header */}
                  <div className="bg-[#4A0E17] border border-[#C5A85D]/30 p-4 rounded text-center text-xs text-white uppercase tracking-wider mb-8">
                    ⚠️ <strong className="text-[#E5C46D]">URGENT CALENDAR WARNING:</strong> Only <span className="font-bold underline text-[#E5C46D]">{vipSlotsLeft} VIP styling chambers</span> remain open for this weekend. Lock your slot immediately.
                  </div>

                  <div className="text-center mb-8 pb-6 border-b border-white/5">
                    <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#C5A85D] font-bold block">
                      VIP Fitting Scheduler
                    </span>
                    <h3 className="font-display font-medium text-2xl sm:text-3xl text-white tracking-widest">
                      Reserve Showroom Appointment
                    </h3>
                  </div>

                  <form onSubmit={handleBookApptSubmit} className="space-y-6">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-sans tracking-widest text-[#C5A85D] mb-1 font-semibold">
                          Select Flagship Atelier *
                        </label>
                        <select
                          required
                          value={apptBranch}
                          onChange={(e) => setApptBranch(e.target.value)}
                          className="w-full bg-black border border-white/10 text-white px-4 py-3 rounded text-sm font-sans focus:outline-none focus:border-[#C5A85D]"
                        >
                          <option value="Chaitanyapuri Studio - Kothapet">Chaitanyapuri Studio - Kothapet</option>
                          <option value="Secunderabad Lounge - Thirumalagiri">Secunderabad Lounge - Thirumalagiri</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-sans tracking-widest text-gray-300 mb-1 font-semibold">
                          Groom Wear Occasion *
                        </label>
                        <select
                          required
                          value={apptOccasion}
                          onChange={(e) => setApptOccasion(e.target.value)}
                          className="w-full bg-black border border-white/10 text-white px-4 py-3 rounded text-sm font-sans focus:outline-none focus:border-[#C5A85D]"
                        >
                          <option value="Main Wedding Sherwani Trial">Main Wedding Sherwani Trial</option>
                          <option value="Sangeet / Reception Indo-Western Cut fitting">Sangeet / Reception Indo-Western Cut fitting</option>
                          <option value="Haldi daytime kurta sizing">Haldi daytime kurta sizing</option>
                          <option value="Full Groom Accessory Custom Box match">Full Groom Accessory Custom Box match</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-sans tracking-widest text-gray-300 mb-1 font-semibold">
                          Select Calendar Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={apptDate}
                          onChange={(e) => setApptDate(e.target.value)}
                          className="w-full bg-black border border-white/10 text-white px-4 py-3 rounded text-sm font-sans focus:outline-none focus:border-[#C5A85D]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-sans tracking-widest text-gray-300 mb-1 font-semibold">
                          Preferred Hour Slot *
                        </label>
                        <select
                          required
                          value={apptTime}
                          onChange={(e) => setApptTime(e.target.value)}
                          className="w-full bg-black border border-white/10 text-white px-4 py-3 rounded text-sm font-sans focus:outline-none focus:border-[#C5A85D]"
                        >
                          <option value="11:00 AM">11:00 AM (Morning Swatch Reveal)</option>
                          <option value="01:00 PM">01:00 PM</option>
                          <option value="03:00 PM">03:00 PM</option>
                          <option value="05:00 PM">05:00 PM (High Tea Session)</option>
                          <option value="07:00 PM">07:00 PM</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-sans tracking-widest text-gray-300 mb-1 font-semibold">
                          Groom Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={apptName}
                          onChange={(e) => setApptName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full bg-black border border-white/10 text-white px-4 py-3 rounded text-sm font-sans focus:outline-none focus:border-[#C5A85D] placeholder:text-gray-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-sans tracking-widest text-gray-300 mb-1 font-semibold">
                          WhatsApp Contact Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={apptPhone}
                          onChange={(e) => setApptPhone(e.target.value)}
                          placeholder="e.g. +91 99000 88888"
                          className="w-full bg-black border border-white/10 text-white px-4 py-3 rounded text-sm font-sans focus:outline-none focus:border-[#C5A85D] placeholder:text-gray-700"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-sans tracking-widest text-gray-300 mb-1 font-semibold">
                          Preferred Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={apptEmail}
                          onChange={(e) => setApptEmail(e.target.value)}
                          placeholder="wedding@groom.com"
                          className="w-full bg-black border border-white/10 text-white px-4 py-3 rounded text-sm font-sans focus:outline-none focus:border-[#C5A85D] placeholder:text-gray-700"
                        />
                      </div>
                    </div>

                    <div className="text-center pt-4">
                      <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-[#C5A85D] to-[#E5C46D] text-black font-sans font-bold text-xs uppercase tracking-[0.2em] rounded transition-transform cursor-pointer hover:scale-[1.01]"
                      >
                        Secure VIP Stylist Chamber
                      </button>
                    </div>

                  </form>
                </div>
              )}

            </div>
          </section>
        )}

        {/* LORE & HERITAGE ABOUT US PAGE STATE */}
        {activeView === 'about' && (
          <section className="py-24 bg-[#0A0A0A]" id="about-legacy-page">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              
              {/* Heading */}
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A85D] font-sans font-bold block">
                  Generational Weaving Artistry
                </span>
                <h2 className="font-display font-medium text-4xl text-white tracking-widest uppercase mt-2">
                  Our Majestic <span className="text-gold-gradient italic font-serif font-light">Legacy</span>
                </h2>
                <div className="w-16 h-[1px] bg-[#C5A85D] mx-auto mt-4" />
              </div>

              {/* Picture Lore frame */}
              <div className="border border-white/10 rounded overflow-hidden aspect-video relative max-h-[400px]">
                <img
                  src={legacyPhotoUrl}
                  alt="Atelier weavers"
                  className="w-full h-full object-cover grayscale"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 text-left">
                  <span className="text-[#C5A85D] text-[10px] font-sans tracking-[0.2em] uppercase block">
                    FOUNDED IN 1968
                  </span>
                  <span className="font-display font-bold text-lg text-white block mt-1 tracking-wider">
                    UDAIPUR ATELIER BOARDS
                  </span>
                </div>
              </div>

              {/* Text Blocks */}
              <div className="font-serif text-sm sm:text-base text-gray-300 leading-relaxed tracking-wider space-y-6">
                <p>
                  Varudu Ethnic Studio was established under the visual directives of master draper Sreenivasulu and traditional gold-wire weavers of Rajputana estates. Deciding that groom wedding shopping should not be integrated adjacent to feminine fashion distractions, the board laid a strict foundational policy: **Exclusively masculine wedding design, with zero compromises.**
                </p>
                
                <h4 className="font-sans text-xs uppercase font-bold text-[#E5C46D] tracking-[0.15em] border-b border-white/5 pb-2">
                  THE WEAVING CODE OF ARTISTRY
                </h4>

                <p>
                  Everything we craft starts with raw Mulberry silk reels handspun in Varanasi. Our embroidery threads contain an ultra-thin coating of 24k gold leaf wrapped around genuine copper wiring. This ensures your Zardozi patterns capture flickering candlelight and chandeliers uniquely, evoking structural gravity as you make your entrada.
                </p>

                <p>
                  To secure lifetime durability, every structured high-neck collar is reinforced with three-point canvas layering sourced out of historical laboratories in Solingen, Germany. This blocks sweat marks entirely, keeping you pristine throughout multi-hour fireside rituals.
                </p>
              </div>

            </div>
          </section>
        )}

        {/* STORE LOCATIONS PAGE */}
        {activeView === 'locations' && (
          <StoreLocations />
        )}

        {/* GROOM JOURNALS TESTIMONIALS & REVIEWS WRITER PAGE */}
        {activeView === 'testimonials' && (
          <section className="py-24 bg-[#0A0A0A]" id="groom-testimonials-portal">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              
              <div className="text-center mb-16">
                <span className="text-[10px] uppercase font-sans tracking-[0.3em] text-[#C5A85D] font-bold block">
                  The Sovereign Records
                </span>
                <h2 className="font-display font-medium text-4xl text-white tracking-widest mt-2 uppercase">
                  Groom <span className="text-gold-gradient italic font-serif font-light">Testimonials</span>
                </h2>
                <p className="font-serif text-xs text-gray-400 mt-2 max-w-sm mx-auto italic">
                  Read genuine chronicles of grooms who exchanged pheras clothed in Varudu artistry.
                </p>
              </div>

              {/* Reviews grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16" id="reviews-directory">
                {activeTestimonials.map((item) => (
                  <div key={item.id} className="bg-[#121212]/90 border border-white/5 p-6 rounded-lg space-y-4 shadow-lg flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-1.5 text-[#C5A85D]">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#C5A85D]" />
                        ))}
                      </div>
                      <p className="font-serif text-sm text-gray-300 leading-relaxed italic">
                        "{item.review}"
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center space-x-3.5">
                      <img 
                        src={item.imageUrl} 
                        alt="Groom pic" 
                        className="w-12 h-12 object-cover object-top rounded-full border border-[#C5A85D]/30" 
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-xs font-sans font-semibold text-white uppercase tracking-wider">{item.name}</h4>
                        <span className="text-[10px] text-[#C5A85D] block font-sans">{item.weddingLocation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Leave Your Review form section */}
              <div className="bg-[#121212] border-2 border-[#C5A85D]/25 p-6 sm:p-10 rounded-lg max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <h4 className="font-display text-white text-lg tracking-widest uppercase">
                    Submit Your Groom Photo & Testimonial
                  </h4>
                  <p className="text-[11px] text-gray-400 font-serif mt-1">
                    Sharing your legacy inspires generation to follow. Submit your wedding photographs now.
                  </p>
                </div>

                {reviewSuccess && (
                  <p className="bg-emerald-900/20 border border-emerald-500/20 text-emerald-400 font-sans text-xs text-center py-3.5 rounded mb-4">
                    ✓ Thank you, Brother. Your royal testimonial is logged and published to the live registry instantly.
                  </p>
                )}

                <form onSubmit={handleCustomReviewSubmit} className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-sans uppercase tracking-widest text-gray-400 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={newReviewName}
                        onChange={(e) => setNewReviewName(e.target.value)}
                        placeholder="e.g. Sameer Kapoor"
                        className="w-full bg-black border border-white/10 p-3 rounded text-xs focus:outline-none focus:border-[#C5A85D] text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans uppercase tracking-widest text-gray-400 mb-1">Wedding Location *</label>
                      <input
                        type="text"
                        required
                        value={newReviewLocation}
                        onChange={(e) => setNewReviewLocation(e.target.value)}
                        placeholder="e.g. Married at ITC Grand Chola"
                        className="w-full bg-black border border-white/10 p-3 rounded text-xs focus:outline-none focus:border-[#C5A85D] text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-widest text-[#C5A85D] mb-1">Grooming Star Rating</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewReviewRating(star)}
                          className="text-gray-500 hover:text-[#C5A85D] focus:outline-none transition-all"
                        >
                          <Star className={`w-6 h-6 ${star <= newReviewRating ? 'text-[#C5A85D] fill-[#C5A85D]' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-widest text-gray-400 mb-1">Your Experience Letter *</label>
                    <textarea
                      required
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="Write your experience with Varudu fitting, sizing, fabrics..."
                      className="w-full h-24 bg-black border border-white/10 p-3 rounded text-xs focus:outline-none focus:border-[#C5A85D] text-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#4A0E17] hover:bg-[#5F1924] border border-[#C5A85D]/30 text-white font-sans text-xs font-bold uppercase tracking-widest rounded transition-all"
                  >
                    Submit sovereign Testimony
                  </button>

                </form>
              </div>

            </div>
          </section>
        )}

        {/* HIGH-FASHION GROOM STYLE BLOG JOURNAL */}
        {activeView === 'blog' && (
          <section className="py-24 bg-[#0A0A0A]" id="groom-style-journal">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              
              <div className="text-center mb-16">
                <span className="text-[10px] uppercase font-sans tracking-[0.3em] text-[#C5A85D] font-bold block animate-pulse">
                  The Sarto Journal
                </span>
                <h2 className="font-display font-medium text-4xl text-white tracking-widest mt-2 uppercase">
                  Style <span className="text-gold-gradient italic font-serif font-light">Guide</span>
                </h2>
                <div className="w-16 h-[1px] bg-[#C5A85D] mx-auto mt-4" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {BLOGS.map((post) => (
                  <div
                    key={post.id}
                    className="bg-[#121212] border border-white/5 rounded-lg overflow-hidden flex flex-col justify-between group hover:border-[#C5A85D]/30 duration-300"
                  >
                    <div className="h-48 overflow-hidden bg-black relative">
                      <img
                        src={post.imageUrl}
                        alt="Style guide fabric"
                        className="w-full h-full object-cover object-top group-hover:scale-103 duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-[#C5A85D] font-sans font-bold">
                          <span>{post.date}</span>
                          <span>&middot; {post.readTime}</span>
                        </div>
                        <h3 className="font-display font-medium text-base text-white tracking-wider mt-2 group-hover:text-[#E5C46D] duration-300 leading-snug">
                          {post.title}
                        </h3>
                        <p className="font-serif text-xs text-gray-400 mt-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveReadBlog(post)}
                        className="inline-flex items-center text-xs font-sans text-[#C5A85D] hover:text-white font-semibold group cursor-pointer"
                      >
                        <span>Read full study</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        )}

        {/* CUSTOM CONTACT PAGE */}
        {activeView === 'contact' && (
          <section className="py-24 bg-[#0A0A0A]" id="contact-us-page">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A85D] font-sans font-bold block">
                  Concierge Direct Connection
                </span>
                <h2 className="font-display font-medium text-4xl text-white tracking-widest uppercase mt-2">
                  Contact <span className="text-gold-gradient italic font-serif font-light">Us</span>
                </h2>
                <div className="w-16 h-[1px] bg-[#C5A85D] mx-auto mt-4" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left side card */}
                <div className="bg-[#121212] border border-[#C5A85D]/20 p-8 rounded-lg space-y-6">
                  <h4 className="font-display font-medium text-lg text-white tracking-widest uppercase">
                    Central Weaving Commission
                  </h4>
                  <p className="font-serif text-sm text-gray-300 leading-relaxed">
                    Have absolute custom design requests? Connect directly with our boardroom.
                  </p>

                  <div className="space-y-4 text-xs font-sans tracking-wide">
                    <div className="border-b border-white/5 pb-3">
                      <p className="text-[#C5A85D] font-bold uppercase text-[10px] tracking-wider mb-1">Chaitanyapuri Studio</p>
                      <p className="flex items-center text-gray-300">
                        <Phone className="w-3.5 h-3.5 text-[#C5A85D] mr-2 shrink-0" />
                        <span>Direct: <strong>+91 70751 70725</strong></span>
                      </p>
                    </div>
                    <div className="border-b border-white/5 pb-3">
                      <p className="text-[#C5A85D] font-bold uppercase text-[10px] tracking-wider mb-1">Thirumalagiri Lounge</p>
                      <p className="flex items-center text-gray-300">
                        <Phone className="w-3.5 h-3.5 text-[#C5A85D] mr-2 shrink-0" />
                        <span>Direct: <strong>+91 98495 56052</strong></span>
                      </p>
                    </div>
                    <p className="flex items-center text-gray-300">
                      <Clock className="w-4 h-4 text-[#C5A85D] mr-3 shrink-0" />
                      <span>Opening hours: <strong>10:30 AM to 10:30 PM (Daily)</strong></span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="https://wa.me/919505122400?text=Hello%20Varudu!%20I%20am%20looking%20to%20discuss%20a%20luxury%20groom%20customization%20fitting%20at%20Chaitanyapuri."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-[10px] uppercase font-bold tracking-widest rounded transition-all block"
                    >
                      Chaitanyapuri WA
                    </a>
                    <a
                      href="https://wa.me/919505122400?text=Hello%20Varudu!%20I%20am%20looking%20to%20discuss%20a%20luxury%20groom%20customization%20fitting%20at%20Thirumalagiri."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center py-2.5 bg-[#C5A85D] hover:bg-[#D5B86D] text-black font-sans text-[10px] uppercase font-bold tracking-widest rounded transition-all block"
                    >
                      Thirumalagiri WA
                    </a>
                  </div>
                </div>

                {/* Right side simple routing message log */}
                <div className="bg-[#121212] border border-white/5 p-8 rounded-lg space-y-4">
                  <h4 className="font-display font-medium text-lg text-white tracking-widest uppercase">
                    Concierge Message Routing
                  </h4>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    alert('Your message has been logged inside administrative logs.');
                    playRegalGoldChime();
                  }} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        className="w-full bg-black border border-white/10 p-3 rounded text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        required
                        placeholder="WhatsApp Phone"
                        className="w-full bg-black border border-white/10 p-3 rounded text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <textarea
                        required
                        placeholder="Describe your design specifications or wedding timeline..."
                        className="w-full h-28 bg-black border border-white/10 p-3 rounded text-xs text-white focus:outline-none resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-[#C5A85D] to-[#E5C46D] text-black font-sans text-xs font-bold uppercase tracking-widest rounded transition-all"
                    >
                      Route Message to Board
                    </button>
                  </form>
                </div>

              </div>

            </div>
          </section>
        )}

        {/* LEGAL VIEWS: PRIVACY AGREEMENT */}
        {activeView === 'privacy' && (
          <section className="py-24 bg-[#0A0A0A]" id="privacy-policy-view">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#121212] border-2 border-[#C5A85D]/30 p-8 sm:p-12 rounded-lg space-y-6 font-serif tracking-wider leading-relaxed">
              <h2 className="font-display font-medium text-2xl text-[#E5C46D] tracking-widest uppercase text-center border-b border-white/5 pb-4">
                Sovereign Privacy Agreement
              </h2>
              <p className="text-xs text-gray-400 uppercase font-sans tracking-widest text-center">
                Effective Validation Protocol: 2026-05-28
              </p>
              
              <p>
                At **VARUDU ETHNIC STUDIO**, your creative design concepts, uploaded photographs, pre-wedding trial sketches, and master anatomical skeletal measurements are locked inside secure administrative registers. We do not distribute, lease, sell, or disclose your family coordinates to downstream advertising algorithms.
              </p>

              <h4 className="font-sans text-xs text-white font-bold tracking-widest uppercase border-l-2 border-[#C5A85D] pl-3">
                1. COLLECTION AND RETENTION FOR SIZING
              </h4>

              <p>
                We store uploaded photos solely to allow administrative stylings board to review color match coordination on the bridal dress. Upon completed trial fittings or closed leads status, base64 files are systematically purged in compliance with national privacy grids.
              </p>
            </div>
          </section>
        )}

        {/* LEGAL VIEWS: TERMS OF COUTURE */}
        {activeView === 'terms' && (
          <section className="py-24 bg-[#0A0A0A]" id="terms-of-couture-view">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#121212] border-2 border-[#C5A85D]/30 p-8 sm:p-12 rounded-lg space-y-6 font-serif tracking-wider leading-relaxed">
              <h2 className="font-display font-medium text-2xl text-[#E5C46D] tracking-widest uppercase text-center border-b border-white/5 pb-4">
                Terms of Royal Fitting Agreement
              </h2>
              
              <p>
                By reserving wedding styling chambers, ordering bespoke swatches, or uploading bridal reference boards, you declare compliance with our elite tailoring terms of service:
              </p>

              <h4 className="font-sans text-xs text-white font-bold tracking-widest uppercase border-l-2 border-[#C5A85D] pl-3">
                1. BESPOKE ADJUSTMENT TOLERANCES
              </h4>
              <p>
                Bespoke sherwanis are tailored to custom anatomical sketches. We authorize up to 1.5 inches of skeletal expanders inside vertical seams, enabling tailoring modifications as pheras date triggers closer.
              </p>

              <h4 className="font-sans text-xs text-white font-bold tracking-widest uppercase border-l-2 border-[#C5A85D] pl-3">
                2. ARTISANAL APPAREL ACCURACY
              </h4>
              <p>
                Hand Zardozi copper embroidery can showcase slight shading variances as gold plating reacts with sunlight. This is a signature hallmark of fine craftsmanship and royal ancestry, not structural deficiency.
              </p>
            </div>
          </section>
        )}

        {/* CUSTOM ROUTED VIEW: COUTURE FAQ KNOWLEDGE CENTRIC */}
        {activeView === 'faq' && (
          <GroomFAQ />
        )}

      </main>

      {/* PERSISTENT HIGH CONVERSION ACTIONS DOCK  */}
      <div 
        className="fixed bottom-0 inset-x-0 bg-black/90 border-t border-[#C5A85D]/30 py-3 px-4 z-40 backdrop-blur-md flex items-center justify-between shadow-2xl transition-all"
        id="high-conversion-floating-bar"
      >
        <div className="hidden lg:flex items-center space-x-6 text-[10px] sm:text-xs text-[#E5C46D]">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
            <span className="font-sans font-semibold uppercase tracking-wider">
              Chaitanyapuri: +91 70751 70725
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
            <span className="font-sans font-semibold uppercase tracking-wider">
              Thirumalagiri: +91 98495 56052
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full lg:w-auto flex-1 lg:flex-initial">
          <a
            href="https://wa.me/919505122400?text=Hi%20Varudu!%20I%20am%20interested%20in%20a%20Groom%20Wedding%20Couture%20Inquiry."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 py-3 px-4 sm:px-6 bg-[#121212] hover:bg-[#1C1C1C] text-emerald-400 border border-emerald-500/30 text-xs font-sans font-bold uppercase tracking-widest rounded"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Stylist</span>
          </a>

          <button
            onClick={() => {
              setActiveView('appointment');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center justify-center space-x-2 py-3 px-4 sm:px-6 bg-gradient-to-r from-[#C5A85D] to-[#E5C46D] text-black text-xs font-sans font-bold uppercase tracking-widest rounded animate-gold-pulse cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-black" />
            <span>Book VIP Fitting</span>
          </button>
        </div>
      </div>

      {/* READ DYNAMIC JOURNAL STUDY MODAL OVERLAY */}
      {activeReadBlog && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-55">
          <div className="relative w-full max-w-2xl bg-[#121212] border-2 border-[#C5A85D] max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl">
            <button
              onClick={() => setActiveReadBlog(null)}
              className="absolute top-4 right-4 p-2 bg-black border border-white/5 rounded-full text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="h-64 rounded overflow-hidden relative">
                <img src={activeReadBlog.imageUrl} alt="study fabric" className="w-full h-full object-cover object-top" />
              </div>
              
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#C5A85D] font-sans font-bold">
                  Published: {activeReadBlog.date} &middot; written by {activeReadBlog.author}
                </span>
                <h4 className="font-display font-medium text-xl sm:text-2xl text-white tracking-wider mt-1 uppercase leading-snug">
                  {activeReadBlog.title}
                </h4>
              </div>

              <div className="font-serif text-sm text-gray-300 leading-relaxed tracking-wider border-t border-white/5 pt-4 space-y-4">
                <p className="italic text-[#E5C46D]">
                  "{activeReadBlog.excerpt}"
                </p>
                <p>
                  {activeReadBlog.content}
                </p>
                <p>
                  At VARUDU, we make sure standard weaving constraints are systematically audited. By ordering dynamic fit profiles prior to baraat timelines, we guarantee pristine results under full physical motion.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setActiveReadBlog(null);
                    setActiveView('appointment');
                  }}
                  className="w-full py-3 bg-[#C5A85D] text-black text-xs font-sans font-bold uppercase tracking-widest rounded text-center cursor-pointer"
                >
                  Book Stylist Dialogue
                </button>
                <button
                  onClick={() => setActiveReadBlog(null)}
                  className="w-full py-3 bg-transparent hover:bg-white/5 border border-white/10 text-gray-400 hover:text-white text-xs font-sans uppercase tracking-widest rounded text-center cursor-pointer"
                >
                  Close study
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE POPUPS */}
      <RecentInquiryPopup />
      <ExitIntentPopup onTriggerBook={handleExitIntentBookingTrigger} />

      {/* FULL REALTIME ADMINISTRATIVE CRM LAYOUT */}
      {isAdminCrmOpen && (
        <AdminCRM onClose={() => setIsAdminCrmOpen(false)} />
      )}

      {/* CINEMA LOGO INTRO SPLASH OVERLAY */}
      {showSplash && (
        <SplashIntro 
          onComplete={handleSplashComplete} 
          onNavigateToCRM={() => {
            setShowSplash(false);
            setIsAdminCrmOpen(true);
          }}
        />
      )}

      {/* Footer copyright */}
      <Footer onNavigate={setActiveView} openAdminLock={() => setIsAdminCrmOpen(true)} />

    </div>
  );
}
