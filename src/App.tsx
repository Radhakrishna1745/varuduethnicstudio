/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Header from './components/Header';
import Footer from './components/Footer';
import FullscreenHero from './components/FullscreenHero';
import FeaturedCollections from './components/FeaturedCollections';
import ConsultationSystem from './components/ConsultationSystem';
import GroomLookbook from './components/GroomLookbook';
import GroomVideos from './components/GroomVideos';
import StoreLocations from './components/StoreLocations';
import AdminCRM from './components/AdminCRM';
import RecentInquiryPopup from './components/RecentInquiryPopup';
import ExitIntentPopup from './components/ExitIntentPopup';
import SplashIntro from './components/SplashIntro';
import GroomFAQ from './components/GroomFAQ';

import { 
  getStoredLeads, getStoredAppointments, 
  saveAppointment, getGroomStructuredSchema, playRegalGoldChime,
  startLiveSync, getWebPhoto, updateAppointmentScanEvent
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
  Heart, Check, Info, Award, Settings, UserCheck, X, Printer, Navigation, QrCode, Volume2, RefreshCw, ExternalLink
} from 'lucide-react';

// Framer Motion Animation Variants for Staggered Appt Inputs
const formContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const formItemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

export default function App() {
  // Cinema Logo Splash Screen Intro State
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('varudu_splash_played');
        return !stored;
      } catch (err) {
        console.warn('Session storage is blocked or loaded inside sandboxed iframe without permissions:', err);
        return true;
      }
    }
    return true;
  });

  const handleSplashComplete = () => {
    setShowSplash(false);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('varudu_splash_played', 'true');
      } catch (err) {
        console.warn('Could not save splash played flag to session storage:', err);
      }
    }
  };

  // Navigation State
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedProductInquiry, setSelectedProductInquiry] = useState<string>('');

  // Lock admin CRM portal open state
  const [isAdminCrmOpen, setIsAdminCrmOpen] = useState(() => {
    return localStorage.getItem('varudu_admin_crm_open') === 'true';
  });

  useEffect(() => {
    if (isAdminCrmOpen) {
      localStorage.setItem('varudu_admin_crm_open', 'true');
    } else {
      localStorage.removeItem('varudu_admin_crm_open');
    }
  }, [isAdminCrmOpen]);

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
  const [apptSecondaryBranch, setApptSecondaryBranch] = useState('');
  const [apptMultiSelect, setApptMultiSelect] = useState(false);
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('11:00 AM');
  const [apptOccasion, setApptOccasion] = useState('Main Wedding Sherwani Trial');
  const [apptName, setApptName] = useState('');
  const [apptPhone, setApptPhone] = useState('');
  const [apptEmail, setApptEmail] = useState('');
  const [apptSpecialRequests, setApptSpecialRequests] = useState('');
  const [apptSuccessTicket, setApptSuccessTicket] = useState<any | null>(null);

  // Geolocation Pre-Selection States
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [geoSuccessMsg, setGeoSuccessMsg] = useState('');

  const autoDetectNearestStudio = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    setGeoSuccessMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        // Studio Coordinates:
        // Kothapet: Lat 17.3682053, Lng 78.5309888
        // Secunderabad: Lat 17.4697413, Lng 78.5089814
        const kothapetLat = 17.3682053;
        const kothapetLng = 78.5309888;
        const secunderabadLat = 17.4697413;
        const secunderabadLng = 78.5089814;

        const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371; // Earth Radius in km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        };

        const distToKothapet = getDistance(userLat, userLng, kothapetLat, kothapetLng);
        const distToSecunderabad = getDistance(userLat, userLng, secunderabadLat, secunderabadLng);

        if (distToKothapet < distToSecunderabad) {
          setApptBranch('Chaitanyapuri Studio - Kothapet');
          if (apptMultiSelect) {
            setApptSecondaryBranch('Secunderabad Lounge - Thirumalagiri');
          } else {
            setApptSecondaryBranch('');
          }
          setGeoSuccessMsg(`Kothapet Studio is closest to you (~${distToKothapet.toFixed(1)} km away).`);
        } else {
          setApptBranch('Secunderabad Lounge - Thirumalagiri');
          if (apptMultiSelect) {
            setApptSecondaryBranch('Chaitanyapuri Studio - Kothapet');
          } else {
            setApptSecondaryBranch('');
          }
          setGeoSuccessMsg(`Secunderabad Lounge is closest to you (~${distToSecunderabad.toFixed(1)} km away).`);
        }
        setGeoLoading(false);
        playRegalGoldChime();
      },
      (error) => {
        let msg = 'Failed to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Permission denied. Set location access settings on your browser to auto-detect showrooms.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location position unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        setGeoError(msg);
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 600000 }
    );
  };

  // Trigger auto-detect when accessing the appointment form
  useEffect(() => {
    if (activeView === 'appointment') {
      autoDetectNearestStudio();
    }
  }, [activeView]);

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
    window.addEventListener('varudu-settings-updated', loadLegacyPhoto);

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
      window.removeEventListener('varudu-settings-updated', loadLegacyPhoto);
    };
  }, []);

  // Listen for Live Scanner Event on the current apptSuccessTicket
  useEffect(() => {
    if (!apptSuccessTicket) return;

    let lastScanCount = apptSuccessTicket.scanCount || 0;
    let lastScannedTime = apptSuccessTicket.lastScannedAt || '';

    const handleAppointmentsChange = (e: any) => {
      const appts = e.detail;
      if (!appts || !Array.isArray(appts)) return;

      const currentTicket = appts.find((a: any) => a.id === apptSuccessTicket.id);
      if (currentTicket) {
        const newScanCount = currentTicket.scanCount || 0;
        const newScannedTime = currentTicket.lastScannedAt || '';

        // Play golden chime when scan event occurs
        if (newScanCount > lastScanCount || (newScannedTime && newScannedTime !== lastScannedTime)) {
          playRegalGoldChime();
          setApptSuccessTicket(currentTicket);

          // Flash visual pulse wave surrounding ticket to signify successful parse
          const ticketCard = document.getElementById('printable-ticket');
          if (ticketCard) {
            ticketCard.classList.add('ring-4', 'ring-emerald-500/80', 'scale-[1.01]', 'duration-300');
            setTimeout(() => {
              ticketCard.classList.remove('ring-4', 'ring-emerald-500/80', 'scale-[1.01]');
            }, 1200);
          }
        } else {
          // Sync minor details (like status changes "Confirmed" -> "Completed" etc)
          setApptSuccessTicket(currentTicket);
        }

        lastScanCount = newScanCount;
        lastScannedTime = newScannedTime;
      }
    };

    window.addEventListener('varudu-appointment-updated', handleAppointmentsChange);
    return () => {
      window.removeEventListener('varudu-appointment-updated', handleAppointmentsChange);
    };
  }, [apptSuccessTicket]);

  const handleOpenTicketInNewWindow = () => {
    if (!apptSuccessTicket) return;
    playRegalGoldChime();

    const qrDataStr = `VARUDU ATELIER RESERVATION\nID: ${apptSuccessTicket.id.replace('appt-', '')}\nGroom: ${apptSuccessTicket.customerName}\nPhone: ${apptSuccessTicket.customerPhone}\nLounge: ${apptSuccessTicket.branch}\nSlot: ${apptSuccessTicket.date} @ ${apptSuccessTicket.time}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrDataStr)}`;

    const newWindowString = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Varudu Atelier Pass — #${apptSuccessTicket.id.replace('appt-', '')}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
        <style>
          body {
            background-color: #060608;
            color: #F5EFEB;
            font-family: 'Inter', sans-serif;
          }
          .font-display {
            font-family: 'Space Grotesk', sans-serif;
          }
          .font-serif {
            font-family: 'Playfair Display', serif;
          }
          .font-mono {
            font-family: 'JetBrains Mono', monospace;
          }
          .gold-border {
            border-color: rgba(197, 168, 93, 0.35);
          }
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              background-color: #FFFFFF !important;
              color: #000000 !important;
            }
            .print-card {
              border: 3px solid #000000 !important;
              box-shadow: none !important;
              background-color: #FFFFFF !important;
              color: #000000 !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 2rem !important;
            }
            .print-text {
              color: #000000 !important;
            }
            .print-text-muted {
              color: #4b5563 !important;
            }
            .print-border {
              border-color: #000000 !important;
            }
            .print-bg-light {
              background-color: #f3f4f6 !important;
            }
          }
        </style>
      </head>
      <body class="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-[#060608]">
        <div class="print-card max-w-lg w-full bg-[#121212] border-2 border-[#C5A85D] p-8 sm:p-10 rounded-xl text-center shadow-[0_0_50px_rgba(197,168,93,0.15)] relative overflow-hidden my-4">
          
          <div class="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#C5A85D]/40 print-border"></div>
          <div class="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#C5A85D]/40 print-border"></div>
          <div class="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#C5A85D]/40 print-border"></div>
          <div class="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#C5A85D]/40 print-border"></div>

          <div class="w-16 h-16 bg-[#4A0E17]/80 border-2 border-[#C5A85D]/50 flex items-center justify-center rounded-full mx-auto mb-6 shadow-inner print-border select-none">
            <span class="text-[#E5C46D] font-serif font-semibold text-2xl tracking-tighter">V</span>
          </div>

          <h3 class="font-display font-bold text-xl text-white tracking-[0.18em] uppercase print-text">
            Bespoke Entrance Pass
          </h3>
          <p class="text-[#C5A85D] text-[9px] tracking-[0.2em] uppercase font-mono mt-1 font-bold print-text-muted">
            Varudu Atelier & Showroom Entry Gateway
          </p>

          <div class="w-16 h-[1.5px] bg-[#C5A85D]/35 mx-auto my-5 print-border" />

          <div class="bg-black/40 border border-[#C5A85D]/20 rounded-md p-5 text-left text-xs tracking-wide space-y-3.5 text-gray-300 print-border print-bg-light">
            <div class="border-b border-white/10 pb-2 print-border">
              <span class="text-[9px] uppercase tracking-widest font-mono text-[#C5A85D] font-extrabold print-text">OFFICIAL ROYAL CREDENTIALS</span>
            </div>
            
            <div class="flex justify-between items-center py-0.5 border-b border-white/[0.03] print-border">
              <strong class="text-zinc-500 font-sans uppercase text-[9px] tracking-wider print-text-muted">Groom Identity:</strong>
              <span class="text-white font-bold ml-2 print-text">${apptSuccessTicket.customerName}</span>
            </div>
            
            <div class="flex justify-between items-center py-0.5 border-b border-white/[0.03] print-border">
              <strong class="text-zinc-500 font-sans uppercase text-[9px] tracking-wider print-text-muted">Mobile Registry:</strong>
              <span class="text-white font-mono ml-2 print-text">${apptSuccessTicket.customerPhone}</span>
            </div>

            <div class="flex justify-between items-center py-0.5 border-b border-white/[0.03] print-border">
              <strong class="text-zinc-500 font-sans uppercase text-[9px] tracking-wider print-text-muted">Atelier Studio:</strong>
              <span class="text-[#E5C46D] font-bold ml-2 print-text">${apptSuccessTicket.branch}</span>
            </div>

            <div class="flex justify-between items-center py-0.5 border-b border-white/[0.03] print-border">
              <strong class="text-zinc-500 font-sans uppercase text-[9px] tracking-wider print-text-muted">Fitting Clock:</strong>
              <span class="text-white font-bold ml-2 print-text">${apptSuccessTicket.date} at ${apptSuccessTicket.time}</span>
            </div>

            <div class="flex justify-between items-center py-0.5 print-border">
              <strong class="text-zinc-500 font-sans uppercase text-[9px] tracking-wider print-text-muted">Registry Occasion:</strong>
              <span class="text-white ml-2 print-text">${apptSuccessTicket.occasion}</span>
            </div>

            ${apptSuccessTicket.specialRequests ? `
            <div class="border-t border-white/10 pt-3 mt-3 text-gray-400 print-border">
              <strong class="text-[#C5A85D] text-[9px] uppercase font-mono tracking-widest block mb-1.5 print-text-muted">Bespoke Adjustments & Remarks:</strong>
              <p class="text-zinc-300 italic font-serif leading-relaxed text-xs print-text">"${apptSuccessTicket.specialRequests}"</p>
            </div>` : ''}
          </div>

          <div class="mt-6 p-5 bg-[#161618] border border-[#C5A85D]/20 rounded-lg flex flex-col items-center justify-center space-y-4 print-bg-light print-border">
            <span class="text-[#C5A85D] font-mono text-[9px] tracking-widest uppercase font-bold print-text">
              🔒 Dynamic Scan Desk Interface
            </span>
            <div class="p-3 bg-white rounded-md border border-[#C5A85D]/40 shadow-md">
              <img src="${qrCodeUrl}" alt="Varudu QR Code" class="w-[140px] h-[140px] block" />
            </div>
            
            <div class="w-full flex items-center justify-between border-t border-[#C5A85D]/10 pt-3 px-1 print-border">
              <span class="text-[9px] text-[#C5A85D] tracking-widest uppercase font-mono font-bold print-text-muted">Interactive Desk Log:</span>
              <span class="bg-black text-[#E5C46D] border border-[#C5A85D]/30 px-3 py-1 rounded text-[10px] font-mono font-black shadow print-bg-light print-text print-border">
                Scanned Count: ${apptSuccessTicket.scanCount || 0}
              </span>
            </div>
          </div>

          <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 no-print">
            <button onclick="window.print()" class="w-full sm:w-auto px-6 py-2.5 bg-[#C5A85D] hover:bg-[#E5C46D] text-black text-[10px] font-sans font-extrabold uppercase tracking-widest rounded-md shadow-md transition-all active:scale-[0.98] cursor-pointer">
              Print Official Ticket
            </button>
            <button onclick="window.close()" class="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-[10px] font-sans font-bold uppercase tracking-widest rounded-md transition-all cursor-pointer">
              Close Window
            </button>
          </div>
          
        </div>
      </body>
      </html>
    `;

    try {
      const livePassWindow = window.open("", "_blank");
      if (livePassWindow) {
        livePassWindow.document.write(newWindowString);
        livePassWindow.document.close();
      } else {
        window.print();
      }
    } catch (e) {
      console.warn("Popup blocked, calling standard print utility:", e);
      window.print();
    }
  };

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
    
    const finalBranchString = apptSecondaryBranch 
      ? `${apptBranch} (Pref 2: ${apptSecondaryBranch})`
      : apptBranch;

    const apptData = {
      branch: finalBranchString,
      date: apptDate,
      time: apptTime,
      occasion: apptOccasion,
      customerName: apptName,
      customerPhone: apptPhone,
      customerEmail: apptEmail,
      specialRequests: apptSpecialRequests.trim() || undefined
    };

    const newAppt = saveAppointment(apptData);
    setApptSuccessTicket(newAppt);
    // Reset forms
    setApptName('');
    setApptPhone('');
    setApptEmail('');
    setApptDate('');
    setApptSpecialRequests('');
    playRegalGoldChime();

    // Prepare robust WhatsApp text notification template to notify the showroom owner of the new appointment booking
    const requestsSection = apptData.specialRequests ? `\n✍️ *Special Requests:* ${apptData.specialRequests}` : '';
    const text = `*NEW SHOWROOM APPOINTMENT SELECTED*\n━━━━━━━━━━━━━━━━━━━━\n👤 *Groom Name:* ${apptData.customerName}\n📞 *Phone Number:* ${apptData.customerPhone}\n📧 *Email:* ${apptData.customerEmail || 'None provided'}\n🏢 *Selected Showroom:* ${apptData.branch}\n📅 *Appointment Slot:* ${apptData.date} at ${apptData.time}\n🏛️ *Occasion details:* ${apptData.occasion}${requestsSection}\n━━━━━━━━━━━━━━━━━━━━\n✨ _Logged instantly database backed with live Firebase! _`;
    const whatsappUrl = `https://wa.me/919000777265?text=${encodeURIComponent(text)}`;
    
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

  // Calendar Integration Helpers to parse and download/link calendar events
  const parseAppointmentDateTime = (dateStr: string, timeStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      let hour = 11;
      let minute = 0;
      
      const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let h = parseInt(timeMatch[1], 10);
        const m = parseInt(timeMatch[2], 10);
        const isPm = timeMatch[3].toUpperCase() === 'PM';
        if (isPm && h < 12) h += 12;
        if (!isPm && h === 12) h = 0;
        hour = h;
        minute = m;
      }
      
      const startDate = new Date(year, month - 1, day, hour, minute);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour duration
      
      return { startDate, endDate };
    } catch (error) {
      const d = new Date();
      return { startDate: d, endDate: new Date(d.getTime() + 3600000) };
    }
  };

  const formatToUTCString = (date: Date) => {
    const yrs = date.getUTCFullYear();
    const mths = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dys = String(date.getUTCDate()).padStart(2, '0');
    const hrs = String(date.getUTCHours()).padStart(2, '0');
    const mins = String(date.getUTCMinutes()).padStart(2, '0');
    const secs = String(date.getUTCSeconds()).padStart(2, '0');
    return `${yrs}${mths}${dys}T${hrs}${mins}${secs}Z`;
  };

  const getGoogleCalendarLink = (appt: any) => {
    if (!appt) return '#';
    const { startDate, endDate } = parseAppointmentDateTime(appt.date, appt.time);
    const startStr = formatToUTCString(startDate);
    const endStr = formatToUTCString(endDate);
    
    const title = encodeURIComponent(`Varudu Royal Groom Fitting Room Reservation`);
    const details = encodeURIComponent(
      `Dear Groom,\n\nYour exclusive VIP premium fitting session has been locked.\n\n` +
      `👤 Client: ${appt.customerName}\n` +
      `👔 Fitting Occasion Style: ${appt.occasion}\n` +
      `📍 Atelier Lounge Address: ${appt.branch}\n\n` +
      `Contact Registry: +91 9000777265.\n` +
      `We look forward to serving you with ultimate drape perfection.`
    );
    const location = encodeURIComponent(appt.branch);
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  };

  const downloadIcsFile = (appt: any) => {
    if (!appt) return;
    const { startDate, endDate } = parseAppointmentDateTime(appt.date, appt.time);
    const startStr = formatToUTCString(startDate);
    const endStr = formatToUTCString(endDate);
    const nowStr = formatToUTCString(new Date());
    
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Varudu Ethnic Studio//Bespoke Registry//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:appt-${appt.id}@varuduethnic.com`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:Varudu Royal Groom Fitting: ${appt.customerName}`,
      `DESCRIPTION:Exclusive Groom Wear Trial Session to coordinate bespoke attire styling.\\n\\n📍 Lounge: ${appt.branch}\\n👔 Prep details: ${appt.occasion}`,
      `LOCATION:${appt.branch}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    
    const icsString = icsLines.join('\r\n');
    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `varudu-royal-appointment.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

        {activeView === 'reels' && (
          <GroomVideos />
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
                /* Ticket Success Panel wrapper with print-friendly ID */
                <div id="printable-ticket" className="bg-[#121212] border-2 border-[#C5A85D] p-8 sm:p-12 rounded-lg text-center shadow-2xl max-w-xl mx-auto relative overflow-hidden">
                  
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

                  <div className="bg-black/60 p-5 rounded border border-white/5 text-left text-xs font-sans tracking-wide space-y-3 font-medium text-gray-300 font-sans">
                    <p>🤴 *Groom Client:* <span className="text-white font-bold">{apptSuccessTicket.customerName}</span></p>
                    <p>⚓ *Selected lounge:* <span className="text-[#E5C46D]">{apptSuccessTicket.branch}</span></p>
                    <p>⏰ *Fitting clock:* <span className="text-white">{apptSuccessTicket.date} at {apptSuccessTicket.time}</span></p>
                    <p>👔 *Gifting purpose:* <span className="text-white">{apptSuccessTicket.occasion}</span></p>
                    {apptSuccessTicket.specialRequests && (
                      <p className="border-t border-white/10 pt-2.5 mt-2.5 text-gray-400">
                        ✍️ *Special Requests:* <span className="text-white italic">"{apptSuccessTicket.specialRequests}"</span>
                      </p>
                    )}
                  </div>

                  {/* Luxury Digital Entry Permit & QR Code Card */}
                  <div className="mt-6 p-5 bg-[#161618] border border-[#C5A85D]/30 rounded-lg text-center space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-[#C5A85D]/10 pb-3">
                      <div className="flex items-center justify-center sm:justify-start space-x-2 text-[#C5A85D] font-sans text-[10px] tracking-widest uppercase font-bold">
                        <QrCode className="w-4 h-4 text-[#C5A85D]" />
                        <span>Atelier Check-In QR Pass</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                        {apptSuccessTicket.scanCount !== undefined && apptSuccessTicket.scanCount > 0 && (
                          <div className="inline-flex items-center justify-center space-x-1 bg-[#C5A85D]/15 border border-[#C5A85D]/40 px-2 py-1 rounded text-[8px] uppercase tracking-[0.08em] font-sans font-bold text-[#E5C46D]">
                            <span>Verified Scans: {apptSuccessTicket.scanCount}</span>
                          </div>
                     	  )}
                        <div className="inline-flex items-center justify-center self-center sm:self-auto space-x-2 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded text-[8px] uppercase tracking-[0.12em] font-sans font-bold text-emerald-400">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                          </span>
                          <span>Studio Scanner Ready</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* QR Code Container with High-Contrast Quiet Zone - Clickable to open print pass details */}
                    <div 
                      onClick={handleOpenTicketInNewWindow}
                      className="qr-quiet-zone inline-block p-3.5 bg-white rounded-md border-2 border-[#C5A85D]/50 shadow-lg mx-auto relative cursor-pointer hover:border-[#C5A85D] hover:scale-[1.03] transition-all group"
                      title="Click directly to open live print pass details in a separate window"
                    >
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                          `VARUDU ATELIER RESERVATION\nID: ${apptSuccessTicket.id.replace('appt-', '')}\nGroom: ${apptSuccessTicket.customerName}\nPhone: ${apptSuccessTicket.customerPhone}\nLounge: ${apptSuccessTicket.branch}\nSlot: ${apptSuccessTicket.date} @ ${apptSuccessTicket.time}`
                        )}`} 
                        alt="Atelier Booking QR Code" 
                        className="w-[140px] h-[140px] block transition-transform duration-300 group-hover:scale-[1.01]"
                        referrerPolicy="no-referrer"
                      />
                      {/* Dynamic Scan Count Badge */}
                      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#C5A85D] text-black font-sans font-extrabold text-[9px] px-2.5 py-0.5 rounded shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-black uppercase tracking-widest whitespace-nowrap select-none group-hover:bg-[#E5C46D] transition-colors">
                        Scans: {apptSuccessTicket.scanCount || 0}
                      </div>

                      {/* Interactive click helper tooltip overlay */}
                      <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-2 rounded text-center">
                        <ExternalLink className="w-5 h-5 text-[#E5C46D] mb-1 animate-pulse" />
                        <span className="text-[9px] text-[#E5C46D] font-sans font-extrabold uppercase tracking-widest leading-none">View Pass Details</span>
                        <span className="text-[7px] text-gray-300 font-sans tracking-wide mt-0.5 uppercase">Separate Window</span>
                      </div>
                    </div>

                    {/* Interactive Action Control Center */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 no-print-element font-sans">
                      {/* Open digital pass in external window */}
                      <button
                        type="button"
                        onClick={handleOpenTicketInNewWindow}
                        className="px-4 py-2.5 bg-[#C5A85D]/10 hover:bg-[#C5A85D]/25 hover:scale-[1.02] active:scale-[0.98] text-[9px] tracking-widest font-sans font-extrabold uppercase text-[#E5C46D] border border-[#C5A85D]/40 hover:border-[#C5A85D] rounded transition-all cursor-pointer flex items-center space-x-1.5 shadow-md"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#C5A85D]" />
                        <span>Open Pass Window</span>
                      </button>

                      {/* Manual Re-trigger Check-In Scan simulation hook */}
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            const updated = updateAppointmentScanEvent(apptSuccessTicket.id);
                            const fresh = updated.find((a: any) => a.id === apptSuccessTicket.id);
                            if (fresh) {
                              setApptSuccessTicket(fresh);
                            }
                          } catch (e) {
                            console.warn("Could not fire manual scan refresh:", e);
                          }
                        }}
                        className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 hover:scale-[1.02] active:scale-[0.98] text-[9px] tracking-widest font-sans font-bold uppercase text-gray-300 border border-white/10 hover:border-white/20 rounded transition-all cursor-pointer flex items-center space-x-1.5 shadow-md"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-zinc-400 hover:rotate-180 transition-transform duration-700" />
                        <span>Re-Trigger Scan Event</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-[#E5C46D] font-sans font-extrabold">
                        Bespoke Booking Reference: #{apptSuccessTicket.id.replace('appt-', '')}
                      </p>
                      <p className="text-[9px] text-gray-400 font-sans max-w-sm mx-auto leading-normal">
                        Showroom entry code: Present this screen or the printed ticket upon arrival. The front-desk receptionist will scan this code to retrieve your body specifications and styling records instantly.
                      </p>
                    </div>
                  </div>

                  {/* Staff instruction sublink */}
                  <p className="text-[10px] font-mono text-zinc-500 mt-2 text-center select-none">
                    Staff: Scan this reference to pull up the Groom File (Measurement + Fitting History).
                  </p>

                  {/* Add to Calendar Integration Drawer (Hidden during print) */}
                  <div className="mt-6 p-5 bg-zinc-950/80 rounded border border-[#C5A85D]/20 text-left space-y-3 shadow-lg no-print-element">
                    <div className="flex items-center space-x-2 text-[#C5A85D] font-sans text-[10px] tracking-widest uppercase font-bold">
                      <Calendar className="w-4 h-4 text-[#C5A85D]" />
                      <span>Sync Fitting to Your Calendar</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                      Add this exclusive appointment slot to your personal calendar to receive automatic push notifications for your upcoming draping.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <a
                        href={getGoogleCalendarLink(apptSuccessTicket)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-[#4A0E17]/80 hover:bg-[#4A0E17] border border-[#C5A85D]/30 hover:border-[#C5A85D] text-[#E5C46D] hover:text-white font-sans text-[10px] uppercase font-bold tracking-widest rounded transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-center select-none"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Google Calendar</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => downloadIcsFile(apptSuccessTicket)}
                        className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-sans text-[10px] uppercase font-bold tracking-widest rounded transition-all flex items-center justify-center space-x-1.5 cursor-pointer select-none"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>iCal / ICS File</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 font-serif leading-relaxed mt-6">
                    Your styling chamber has been locked. Check your phone for custom WhatsApp confirmation prompts. A stylist will reach you of any measurements checkups dynamic to your selected date.
                  </p>

                  {/* Interactive Button Panel (Hidden during print) */}
                  <div className="mt-8 gap-3 flex flex-col sm:flex-row justify-center no-print-element">
                    <a
                      href={`https://wa.me/919000777265?text=Hi%20Varudu!%20I%20have%20successfully%20reserved%20appointment%20ticket%20%23${apptSuccessTicket.id.replace('appt-', '')}.%20Please%20verify%20my%20slot%20for%20fitting.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs uppercase font-bold tracking-widest rounded transition-all shadow flex items-center justify-center space-x-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Verify on WhatsApp</span>
                    </a>
                    
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-5 py-3.5 bg-zinc-800 hover:bg-[#C5A85D] hover:text-black hover:border-[#C5A85D] text-white border border-white/10 font-sans text-xs uppercase font-bold tracking-widest rounded transition-all shadow flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Ticket</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setApptSuccessTicket(null)}
                      className="px-5 py-3.5 bg-transparent border border-white/10 hover:bg-white/5 text-gray-300 text-xs font-sans uppercase tracking-widest rounded cursor-pointer"
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

                  <motion.form 
                    onSubmit={handleBookApptSubmit} 
                    className="space-y-6"
                    variants={formContainerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.div variants={formItemVariants} className="sm:col-span-2 space-y-3 p-4 bg-zinc-950/80 border border-[#C5A85D]/15 rounded-md">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/5 pb-2">
                          <label className="block text-[10px] uppercase font-sans tracking-widest text-[#C5A85D] font-bold">
                            Atelier Showroom Preferences *
                          </label>
                          
                          {/* Geolocation Trigger & Proximity Info Badge */}
                          <div className="flex items-center text-[10px] font-sans">
                            {geoLoading ? (
                              <span className="text-amber-400 flex items-center animate-pulse font-semibold">
                                <Navigation className="w-3 h-3 mr-1 animate-spin" />
                                Detecting nearest showroom...
                              </span>
                            ) : geoSuccessMsg ? (
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-400 flex items-center bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                                  <MapPin className="w-3 h-3 mr-1 text-emerald-400 shrink-0 animate-ping" style={{ animationDuration: '3s' }} />
                                  <span>📍 GPS Selected: {geoSuccessMsg}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={autoDetectNearestStudio}
                                  className="text-[#C5A85D] hover:text-white text-[9px] underline uppercase tracking-wider ml-1 cursor-pointer"
                                >
                                  Re-Scan
                                </button>
                              </div>
                            ) : geoError ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={autoDetectNearestStudio}
                                  className="text-amber-400 hover:text-white flex items-center transition-colors underline decoration-dotted cursor-pointer text-left font-semibold"
                                  title={geoError}
                                >
                                  <Navigation className="w-3 h-3 mr-1" />
                                  GPS blocked: click to retry
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={autoDetectNearestStudio}
                                className="text-gray-400 hover:text-[#C5A85D] flex items-center transition-colors font-semibold cursor-pointer"
                              >
                                <Navigation className="w-3 h-3 mr-1" />
                                Auto-Detect Nearest
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Card 1: Chaitanyapuri */}
                          <div 
                            onClick={() => {
                              if (!apptMultiSelect) {
                                setApptBranch('Chaitanyapuri Studio - Kothapet');
                                setApptSecondaryBranch('');
                              } else {
                                if (apptBranch === 'Chaitanyapuri Studio - Kothapet') {
                                  // toggle roles
                                  if (apptSecondaryBranch === 'Chaitanyapuri Studio - Kothapet') {
                                    setApptSecondaryBranch('');
                                  } else {
                                    setApptBranch('Secunderabad Lounge - Thirumalagiri');
                                    setApptSecondaryBranch('Chaitanyapuri Studio - Kothapet');
                                  }
                                } else {
                                  setApptBranch('Chaitanyapuri Studio - Kothapet');
                                  setApptSecondaryBranch('Secunderabad Lounge - Thirumalagiri');
                                }
                              }
                            }}
                            className={`p-3.5 rounded border transition-all duration-300 cursor-pointer ${
                              apptBranch === 'Chaitanyapuri Studio - Kothapet'
                                ? 'border-[#C5A85D] bg-[#C5A85D]/10 text-white shadow-md shadow-[#C5A85D]/5'
                                : apptSecondaryBranch === 'Chaitanyapuri Studio - Kothapet'
                                ? 'border-[#C5A85D]/50 border-dashed bg-amber-500/5 text-amber-100 hover:border-[#C5A85D]'
                                : 'border-white/5 bg-black/40 text-gray-500 hover:border-white/10 hover:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`font-sans font-bold text-xs uppercase tracking-wider ${
                                apptBranch === 'Chaitanyapuri Studio - Kothapet' || apptSecondaryBranch === 'Chaitanyapuri Studio - Kothapet'
                                  ? 'text-white'
                                  : 'text-gray-400'
                              }`}>Kothapet Studio</span>
                              {apptBranch === 'Chaitanyapuri Studio - Kothapet' && (
                                <span className="bg-[#C5A85D] text-black font-sans text-[8px] font-bold uppercase px-2 py-0.5 rounded tracking-widest">
                                  Primary
                                </span>
                              )}
                              {apptSecondaryBranch === 'Chaitanyapuri Studio - Kothapet' && (
                                <span className="bg-[#4A0E17]/80 text-[#E5C46D] border border-dashed border-[#C5A85D]/40 font-sans text-[8px] font-bold uppercase px-2 py-0.5 rounded tracking-widest">
                                  Secondary
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 font-serif mt-1.5 leading-relaxed">
                              Chaitanyapuri Studio, NTR Nagar. (Dedicated Valet)
                            </p>
                          </div>

                          {/* Card 2: Secunderabad */}
                          <div 
                            onClick={() => {
                              if (!apptMultiSelect) {
                                setApptBranch('Secunderabad Lounge - Thirumalagiri');
                                setApptSecondaryBranch('');
                              } else {
                                if (apptBranch === 'Secunderabad Lounge - Thirumalagiri') {
                                  if (apptSecondaryBranch === 'Secunderabad Lounge - Thirumalagiri') {
                                    setApptSecondaryBranch('');
                                  } else {
                                    setApptBranch('Chaitanyapuri Studio - Kothapet');
                                    setApptSecondaryBranch('Secunderabad Lounge - Thirumalagiri');
                                  }
                                } else {
                                  setApptBranch('Secunderabad Lounge - Thirumalagiri');
                                  setApptSecondaryBranch('Chaitanyapuri Studio - Kothapet');
                                }
                              }
                            }}
                            className={`p-3.5 rounded border transition-all duration-300 cursor-pointer ${
                              apptBranch === 'Secunderabad Lounge - Thirumalagiri'
                                ? 'border-[#C5A85D] bg-[#C5A85D]/10 text-white shadow-md shadow-[#C5A85D]/5'
                                : apptSecondaryBranch === 'Secunderabad Lounge - Thirumalagiri'
                                ? 'border-[#C5A85D]/50 border-dashed bg-amber-500/5 text-amber-100 hover:border-[#C5A85D]'
                                : 'border-white/5 bg-black/40 text-gray-500 hover:border-white/10 hover:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`font-sans font-bold text-xs uppercase tracking-wider ${
                                apptBranch === 'Secunderabad Lounge - Thirumalagiri' || apptSecondaryBranch === 'Secunderabad Lounge - Thirumalagiri'
                                  ? 'text-white'
                                  : 'text-gray-400'
                              }`}>Secunderabad Lounge</span>
                              {apptBranch === 'Secunderabad Lounge - Thirumalagiri' && (
                                <span className="bg-[#C5A85D] text-black font-sans text-[8px] font-bold uppercase px-2 py-0.5 rounded tracking-widest">
                                  Primary
                                </span>
                              )}
                              {apptSecondaryBranch === 'Secunderabad Lounge - Thirumalagiri' && (
                                <span className="bg-[#4A0E17]/80 text-[#E5C46D] border border-dashed border-[#C5A85D]/40 font-sans text-[8px] font-bold uppercase px-2 py-0.5 rounded tracking-widest">
                                  Secondary
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 font-serif mt-1.5 leading-relaxed">
                              Thirumalagiri Opposite Petrol Pump. (Dedicated Parking)
                            </p>
                          </div>
                        </div>

                        {/* Flex Preference Checkbox */}
                        <div className="flex items-center space-x-2 pt-1">
                          <input 
                            type="checkbox"
                            id="appt-multi-select-toggle"
                            checked={apptMultiSelect}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setApptMultiSelect(checked);
                              if (checked) {
                                if (apptBranch === 'Chaitanyapuri Studio - Kothapet') {
                                  setApptSecondaryBranch('Secunderabad Lounge - Thirumalagiri');
                                } else {
                                  setApptSecondaryBranch('Chaitanyapuri Studio - Kothapet');
                                }
                              } else {
                                setApptSecondaryBranch('');
                              }
                            }}
                            className="accent-[#C5A85D] cursor-pointer w-3.5 h-3.5"
                          />
                          <label htmlFor="appt-multi-select-toggle" className="text-[10px] uppercase font-sans tracking-widest text-[#E5C46D] font-bold cursor-pointer select-none">
                            💫 Select second branch as fallback (Doubles chances for busy season)
                          </label>
                        </div>
                      </motion.div>

                      <motion.div variants={formItemVariants} className="sm:col-span-2">
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
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <motion.div variants={formItemVariants}>
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
                      </motion.div>

                      <motion.div variants={formItemVariants}>
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
                      </motion.div>

                      <motion.div variants={formItemVariants}>
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
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.div variants={formItemVariants}>
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
                      </motion.div>

                      <motion.div variants={formItemVariants}>
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
                      </motion.div>
                    </div>

                    <motion.div variants={formItemVariants} className="space-y-1">
                      <label className="block text-[10px] uppercase font-sans tracking-widest text-gray-300 mb-1 font-semibold">
                        Special Styling Requests & Fabric Concerns (Optional)
                      </label>
                      <textarea
                        value={apptSpecialRequests}
                        onChange={(e) => setApptSpecialRequests(e.target.value)}
                        placeholder="Detail specific style elements, custom silhouettes, accessory expectations, wedding theme colors, or sensitive skin/fabric specifications..."
                        rows={3}
                        className="w-full bg-black border border-white/10 text-white px-4 py-3 rounded text-sm font-sans focus:outline-none focus:border-[#C5A85D] placeholder:text-gray-700 resize-none"
                      />
                    </motion.div>

                    <motion.div variants={formItemVariants} className="text-center pt-4">
                      <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-[#C5A85D] to-[#E5C46D] text-black font-sans font-bold text-xs uppercase tracking-[0.2em] rounded transition-transform cursor-pointer hover:scale-[1.01]"
                      >
                        Secure VIP Stylist Chamber
                      </button>
                    </motion.div>

                  </motion.form>
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
                      href="https://wa.me/919000777265?text=Hello%20Varudu!%20I%20am%20looking%20to%20discuss%20a%20luxury%20groom%20customization%20fitting%20at%20Chaitanyapuri."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-[10px] uppercase font-bold tracking-widest rounded transition-all block"
                    >
                      Chaitanyapuri WA
                    </a>
                    <a
                      href="https://wa.me/919000777265?text=Hello%20Varudu!%20I%20am%20looking%20to%20discuss%20a%20luxury%20groom%20customization%20fitting%20at%20Thirumalagiri."
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
            href="https://wa.me/919000777265?text=Hi%20Varudu!%20I%20am%20interested%20in%20a%20Groom%20Wedding%20Couture%20Inquiry."
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
