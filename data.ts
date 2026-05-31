/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Crown, Menu, X, Landmark, Compass, Calendar, BookOpen, Sparkles, MessageCircle, Info, Lock } from 'lucide-react';

interface HeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
  openAdminLock: () => void;
  onReplaySplash?: () => void;
}

export default function Header({ activeView, setActiveView, openAdminLock, onReplaySplash }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // All pages requested
  const menuItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'collections', label: 'Collections', icon: Sparkles },
    { id: 'lookbook', label: 'Lookbook', icon: Crown },
    { id: 'upload', label: 'Groom Consultation', icon: Sparkles },
    { id: 'appointment', label: 'Book VIP Slot', icon: Calendar },
    { id: 'about', label: 'Our Legacy', icon: Info },
    { id: 'locations', label: 'Locations', icon: Landmark },
    { id: 'testimonials', label: 'Happy Grooms', icon: Sparkles },
    { id: 'blog', label: 'Style Journal', icon: BookOpen },
    { id: 'faq', label: 'FAQ', icon: Info },
    { id: 'contact', label: 'Contact Us', icon: MessageCircle },
  ];

  const handleNav = (viewId: string) => {
    setActiveView(viewId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A0A0A]/95 border-b border-[#C5A85D]/20 backdrop-blur-md glass-premium" id="royal-header">
      {/* Top micro announcement bar */}
      <div className="w-full bg-[#4A0E17] text-[#F5EFEB] py-1.5 text-[10px] tracking-[0.25em] font-medium text-center uppercase border-b border-[#C5A85D]/10">
        ✨ Exclusive Indian Groom Haute Couture & VIP Wedding Styling Lounge ✨
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand Brand Identity */}
          <div className="flex items-center space-x-3">
            <div 
              className="flex flex-col items-start cursor-pointer group" 
              onClick={() => handleNav('home')}
              id="brand-logo"
            >
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A85D] group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-display font-bold text-base sm:text-2xl tracking-[0.2em] text-white">
                  VARUDU
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-[#C5A85D] font-sans -mt-1 pl-7 sm:pl-8">
                Ethnic Studio
              </span>
            </div>
            
            {onReplaySplash && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReplaySplash();
                }}
                title="Play Cinematic Logo Intro"
                className="flex items-center space-x-1.5 px-3 py-1 font-sans text-[9px] font-bold uppercase tracking-widest bg-[#4A0E17]/80 text-[#E5C46D] border border-[#C5A85D]/30 rounded-full hover:bg-[#C5A85D] hover:text-black hover:border-transparent transition-all hover:scale-105 duration-300 cursor-pointer"
              >
                <span className="animate-pulse">🎬</span>
                <span className="hidden xs:inline">Cinema</span>
              </button>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1.5" id="desktop-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`relative px-3 py-2 text-xs font-sans font-medium tracking-[0.1em] uppercase transition-all duration-300 rounded ${
                    isActive 
                      ? 'text-[#C5A85D] font-semibold bg-[#4A0E17]/30 border border-[#C5A85D]/20' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-[#C5A85D]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Luxury Actions Trigger */}
          <div className="hidden xl:flex items-center space-x-3">
            <button
              onClick={() => handleNav('appointment')}
              className="px-4 py-2 text-[10px] uppercase font-sans font-medium tracking-[0.15em] border border-[#C5A85D] text-[#C5A85D] hover:bg-[#C5A85D] hover:text-[#0A0A0A] transition-all duration-500 rounded bg-transparent cursor-pointer"
            >
              VIP Booking
            </button>
            <button
              onClick={() => handleNav('upload')}
              className="relative overflow-hidden px-4 py-2 text-[10px] uppercase font-sans font-medium tracking-[0.15em] bg-gradient-to-r from-[#C5A85D] to-[#E5C46D] text-black hover:scale-105 transition-all duration-300 rounded shadow-md animate-gold-pulse cursor-pointer"
            >
              Style Consult
            </button>
            <button
              onClick={openAdminLock}
              className="p-2 text-gray-500 hover:text-[#C5A85D] transition-colors"
              title="Stylist CRM Login"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden space-x-3">
            <button
              onClick={openAdminLock}
              className="p-2 text-gray-400 hover:text-[#C5A85D]"
            >
              <Lock className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#C5A85D] hover:text-white transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-[112px] left-0 w-full h-[calc(100vh-112px)] bg-[#0A0A0A]/98 backdrop-blur-lg border-b border-[#C5A85D]/20 z-40 overflow-y-auto">
          <div className="px-6 py-8 space-y-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#C5A85D] font-sans border-b border-[#C5A85D]/10 pb-2">
              Navigating Groom Luxury
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center space-x-4 w-full px-4 py-3 text-left font-sans text-sm uppercase tracking-[0.12em] rounded-lg transition-all ${
                    isActive 
                      ? 'bg-[#4A0E17]/40 border-l-2 border-[#C5A85D] text-[#C5A85D]' 
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#C5A85D]" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-[#C5A85D]/10">
              <button
                onClick={() => handleNav('appointment')}
                className="w-full py-3 text-center text-[10px] uppercase font-sans font-semibold tracking-[0.15em] border border-[#C5A85D] text-[#C5A85D] rounded"
              >
                Book VIP slot
              </button>
              <button
                onClick={() => handleNav('upload')}
                className="w-full py-3 text-center text-[10px] uppercase font-sans font-semibold tracking-[0.15em] bg-gradient-to-r from-[#C5A85D] to-[#E5C46D] text-black rounded shadow"
              >
                Upload Photo
              </button>
            </div>

            <div className="text-center pt-8">
              <div className="text-[10px] text-gray-500 font-sans uppercase tracking-[0.2em]">
                Varudu Ethnic Showrooms
              </div>
              <div className="text-[11px] text-[#C5A85D] mt-1 font-sans">
                Chaitanyapuri • Secunderabad
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
