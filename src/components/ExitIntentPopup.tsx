/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, X, Gift, PhoneCall, HelpCircle } from 'lucide-react';

interface ExitIntentProps {
  onTriggerBook: () => void;
}

export default function ExitIntentPopup({ onTriggerBook }: ExitIntentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check session safety
    if (typeof window === 'undefined') return;
    const dismissed = sessionStorage.getItem('varudu_has_seen_exit');
    if (dismissed) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // clientY < 15 signals moving cursor toward top browser tabs
      if (e.clientY < 15 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
        sessionStorage.setItem('varudu_has_seen_exit', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  const handleClaim = () => {
    setIsOpen(false);
    onTriggerBook();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-55 animate-fade-in" id="exit-intent-modal">
      <div className="relative max-w-lg w-full bg-[#121212] border-2 border-[#C5A85D] p-8 rounded-lg shadow-2xl overflow-hidden">
        
        {/* Soft maroon radial light behind */}
        <div className="absolute inset-0 bg-radial-gradient(circle at center, rgba(74,14,23,0.3) 0%, transparent 70%) pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-[#C5A85D] p-1 cursor-pointer rounded-full border border-white/5 bg-black/40"
          aria-label="Dismiss Offer"
        >
          <X className="w-5.5 h-5.5" />
        </button>

        {/* Content */}
        <div className="text-center relative z-10 space-y-5">
          
          <div className="w-14 h-14 bg-[#4A0E17] border border-[#C5A85D]/30 flex items-center justify-center rounded-full mx-auto">
            <Gift className="w-7 h-7 text-[#C5A85D] animate-bounce" />
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-sans text-[#E5C46D] block font-bold">
              EXCLUSIVE OFF-SEASON OFFER
            </span>
            <h3 className="font-display font-medium text-2xl sm:text-3xl text-white mt-1 uppercase tracking-widest leading-snug">
              RESERVE YOUR STYLING KIT
            </h3>
            <p className="text-sm font-serif text-gray-300 mt-2 max-w-sm mx-auto leading-relaxed italic">
              "A crown is not bought; it is fitted." 
            </p>
          </div>

          {/* Offer Details Bullet block */}
          <div className="bg-black/60 p-4 border border-[#C5A85D]/20 rounded text-left space-y-2.5 max-w-sm mx-auto">
            <div className="flex items-center text-xs font-sans text-gray-300">
              <Sparkles className="w-4 h-4 text-[#C5A85D] mr-2.5 shrink-0" />
              <span>Complimentary Wardrobe Color Swatches (worth ₹5,000)</span>
            </div>
            <div className="flex items-center text-xs font-sans text-gray-300">
              <Sparkles className="w-4 h-4 text-[#C5A85D] mr-2.5 shrink-0" />
              <span>1-on-1 Consultation with Chief Draper & Couturier</span>
            </div>
            <div className="flex items-center text-xs font-sans text-gray-300">
              <Sparkles className="w-4 h-4 text-[#C5A85D] mr-2.5 shrink-0" />
              <span>Flat 15% Booking Reservation Waiver code: <strong>ROYAL15</strong></span>
            </div>
          </div>

          <p className="text-[11px] font-sans text-gray-400 tracking-wide">
            Only 3 VIP styling slots remain open for this weekend in our flagships.
          </p>

          {/* Action buttons */}
          <div className="space-y-3 pt-3">
            <button
              onClick={handleClaim}
              className="w-full py-4 bg-gradient-to-r from-[#C5A85D] to-[#E5C46D] text-black font-sans font-bold text-xs uppercase tracking-[0.15em] rounded transition-transform cursor-pointer hover:scale-[1.01]"
            >
              Lock In My VIP Fitting slot
            </button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="text-[10px] text-gray-500 hover:text-[#C5A85D] uppercase tracking-[0.2em] font-sans block mx-auto underline mt-2"
            >
              No thank you, I prefer generic fitting sizes
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
