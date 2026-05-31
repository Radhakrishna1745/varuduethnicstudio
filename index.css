/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RECENT_INQUIRIES_MOCK } from '../data';
import { Sparkles, X, Smartphone } from 'lucide-react';

export default function RecentInquiryPopup() {
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show first popup after 10s
    const firstTimeout = setTimeout(() => {
      triggerNewPopup();
    }, 10000);

    // Set recurring intervals of 35 seconds
    const interval = setInterval(() => {
      triggerNewPopup();
    }, 35000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, []);

  const triggerNewPopup = () => {
    const randomIndex = Math.floor(Math.random() * RECENT_INQUIRIES_MOCK.length);
    setActiveItem(RECENT_INQUIRIES_MOCK[randomIndex]);
    setVisible(true);

    // Hide after 6 seconds
    setTimeout(() => {
      setVisible(false);
    }, 6000);
  };

  if (!activeItem || !visible) return null;

  return (
    <div 
      className="fixed bottom-24 left-4 z-40 max-w-[320px] w-full bg-[#121212]/95 border border-[#C5A85D]/30 p-3 sm:p-4 rounded shadow-2xl backdrop-blur transition-all duration-500 hover:scale-102 flex items-start space-x-3 text-left animate-slide-up"
      style={{
        boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 15px rgba(197,168,93,0.05)'
      }}
      id="recent-inquiry-ticker"
    >
      {/* Royal Sparkle */}
      <div className="p-2 bg-[#4A0E17] text-[#C5A85D] border border-[#C5A85D]/10 rounded-full shrink-0">
        <Sparkles className="w-4.5 h-4.5 animate-pulse" />
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[8px] tracking-[0.2em] font-sans text-[#E5C46D] uppercase block">
            LIVE ATELIER ACTIVITY
          </span>
          <button 
            type="button"
            onClick={() => setVisible(false)} 
            className="text-gray-500 hover:text-white"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <p className="font-sans text-xs text-white tracking-wide font-medium leading-normal">
          <strong className="text-[#C5A85D]">{activeItem.name}</strong> from {activeItem.city}{' '}
          <span className="text-gray-300 font-normal font-serif italic">{activeItem.action}</span>
        </p>

        <p className="font-sans text-[8px] text-gray-500 uppercase tracking-widest block flex items-center">
          <Smartphone className="w-3 h-3 text-emerald-500 mr-1" />
          <span>Verified • {activeItem.minutes}</span>
        </p>
      </div>
    </div>
  );
}
