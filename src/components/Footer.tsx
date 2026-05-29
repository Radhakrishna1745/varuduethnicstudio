/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Crown, Landmark, Mail, Phone, Clock, MessageCircle, ShieldCheck, Heart, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (viewId: string) => void;
  openAdminLock: () => void;
}

export default function Footer({ onNavigate, openAdminLock }: FooterProps) {
  
  const currentYear = new Date().getFullYear();

  const handleNav = (viewId: string) => {
    onNavigate(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#C5A85D]/20 text-[#FAFAFA] font-sans overflow-hidden" id="royal-footer">
      
      {/* Visual top dividers */}
      <div className="w-full h-1 bg-gradient-to-r from-[#4A0E17] via-[#C5A85D] to-[#4A0E17]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1: Brand Lore */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => handleNav('home')}>
              <Crown className="w-6 h-6 text-[#C5A85D] transition-transform duration-300 group-hover:scale-110" />
              <span className="font-display font-bold text-xl tracking-[0.2em] text-white">
                VARUDU
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#C5A85D] font-sans -mt-3 pl-8">
              Ethnic Studio
            </p>
            <p className="font-serif text-xs text-gray-400 leading-relaxed tracking-wider pt-2">
              India\'s premier groom wedding design house since 1968. Every sherwani, bandhgala, and peshawari is constructed strictly for the elite masculine profile, utilizing generational zardozi arts.
            </p>
            <div className="flex items-center space-x-2 text-[10px] text-gray-500 uppercase tracking-widest font-sans pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Masculine Groom Focus</span>
            </div>
          </div>

          {/* Column 2: Structural Navigation Links */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] text-[#C5A85D] border-b border-white/5 pb-2.5 mb-4 font-semibold">
              The Grand Map
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {[
                { id: 'home', label: 'Home Entrance' },
                { id: 'collections', label: 'Couture Catalogs' },
                { id: 'lookbook', label: 'Groom Lookbook' },
                { id: 'upload', label: 'Consult Stylist' },
                { id: 'appointment', label: 'Book VIP Slots' },
                { id: 'about', label: 'Our Legacy' },
                { id: 'locations', label: 'Atelier Lounges' },
                { id: 'testimonials', label: 'Real Grooms' },
                { id: 'blog', label: 'Design Journal' },
                { id: 'contact', label: 'Contact Direct' },
                { id: 'faq', label: 'FAQ Groom Info' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className="text-left text-xs text-gray-400 hover:text-[#C5A85D] transition-colors font-sans truncate cursor-pointer"
                >
                  &middot; {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Central Corporate Ateliers and direct phone line */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] text-[#C5A85D] border-b border-white/5 pb-2.5 mb-1 font-semibold">
              The Central lounges
            </h4>
            <div className="space-y-3.5 text-xs text-gray-400">
              <div className="flex items-start">
                <Landmark className="w-4 h-4 text-[#C5A85D] mr-3 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white block font-sans font-medium">Chaitanyapuri Studio</span>
                  <span className="text-[11px] block font-serif mt-0.5">Margadarsi Colony, Kothapet, Hyderabad</span>
                </div>
              </div>
              <div className="flex items-start">
                <Landmark className="w-4 h-4 text-[#C5A85D] mr-3 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white block font-sans font-medium">Secunderabad Lounge</span>
                  <span className="text-[11px] block font-serif mt-0.5">Thirumalagiri Crossroads, Secunderabad</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Contact Core */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] text-[#C5A85D] border-b border-white/5 pb-2.5 mb-1 font-semibold">
              Concierge Desk
            </h4>
            <p className="font-serif text-xs text-gray-400 leading-relaxed">
              Have unique requirements? Reach our custom concierge desk or speak directly to our design board.
            </p>
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex flex-col space-y-1.5 pt-1">
                <p className="flex items-center">
                  <Phone className="w-4 h-4 text-[#C5A85D] mr-2.5 shrink-0" />
                  <span className="font-sans font-semibold text-xs">+91 70751 70725 <span className="text-gray-500 font-normal">(Chaitanyapuri)</span></span>
                </p>
                <p className="flex items-center">
                  <Phone className="w-4 h-4 text-[#C5A85D] mr-2.5 shrink-0" />
                  <span className="font-sans font-semibold text-xs">+91 98495 56052 <span className="text-gray-500 font-normal">(Thirumalagiri)</span></span>
                </p>
              </div>
              <p className="flex items-center underline">
                <Mail className="w-4 h-4 text-[#C5A85D] mr-2.5 shrink-0" />
                <span className="font-sans">varuduethnicstudiochaitanyapur@gmail.com</span>
              </p>
              <p className="flex items-center">
                <Clock className="w-4 h-4 text-[#C5A85D] mr-2.5 shrink-0" />
                <span className="font-serif">Daily desk: 10:30 AM - 10:30 PM</span>
              </p>
            </div>
          </div>

        </div>

        {/* Global Floating Action triggers representation inside footer */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <div className="flex items-center space-x-2">
            <span>&copy; {currentYear} VARUDU ETHNIC STUDIO. All rights reserved.</span>
            <span>&bull;</span>
            <button onClick={() => handleNav('privacy')} className="hover:text-[#C5A85D] transition-colors cursor-pointer">
              Privacy Agreement
            </button>
            <span>&bull;</span>
            <button onClick={() => handleNav('terms')} className="hover:text-[#C5A85D] transition-colors cursor-pointer">
              Terms of Couture
            </button>
          </div>

          {/* Discreet stylus portal activation button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={openAdminLock}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-gray-400 hover:text-[#C5A85D] hover:border-[#C5A85D]/30 rounded font-sans text-[10px] uppercase tracking-widest cursor-pointer transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-[#C5A85D]" />
              <span>Stylist Admin CRM Portal</span>
            </button>
            
            <div className="flex items-center space-x-1 text-[10px]" title="Tailored with pristine dedication">
              <span>Made with dedication for Grooms</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
