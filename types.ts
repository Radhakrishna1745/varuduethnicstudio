/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { STORE_LOCATIONS } from '../data';
import { StoreLocation } from '../types';
import { MapPin, Phone, Clock, ShieldCheck, Landmark, MessageSquare, Compass, Copy, Globe } from 'lucide-react';

export default function StoreLocations() {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('loc-kot');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<'roadmap' | 'satellite'>('roadmap');

  const activeBranch = STORE_LOCATIONS.find(loc => loc.id === selectedBranchId) || STORE_LOCATIONS[0];

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus(null), 2500);
  };

  const getMapUrl = (baseUrl: string, style: 'roadmap' | 'satellite') => {
    if (style === 'satellite') {
      return baseUrl.includes('?') ? `${baseUrl}&t=k` : `${baseUrl}?t=k`;
    }
    return baseUrl;
  };

  return (
    <section className="py-24 bg-[#0A0A0A] border-t border-[#C5A85D]/10" id="showroom-locations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header content section */}
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C5A85D] font-sans font-medium mb-3">
            Elite Showroom Locations
          </p>
          <h2 className="font-display font-medium text-4xl sm:text-5xl text-white tracking-wide">
            Our Grand <span className="text-gold-gradient italic font-serif font-light">Ateliers</span>
          </h2>
          <div className="w-24 h-[1px] bg-[#C5A85D] mx-auto mt-6" />
          <p className="max-w-xl mx-auto font-serif text-gray-400 text-sm sm:text-base mt-4 italic leading-relaxed">
            Walk into absolute luxury. Have your skeletal structures mapped by expert wedding weavers inside our temperature-controlled VIP consultation lounges.
          </p>
        </div>

        {/* Tab Selection Row for showroom */}
        <div className="flex flex-wrap justify-center gap-3 mb-10" id="branch-selection-tabs">
          {STORE_LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setSelectedBranchId(loc.id)}
              className={`px-5 sm:px-6 py-3 text-[11px] sm:text-xs font-sans tracking-widest font-semibold uppercase border transition-all duration-300 rounded cursor-pointer ${
                selectedBranchId === loc.id
                  ? 'bg-[#C5A85D] text-black border-[#C5A85D] shadow-lg shadow-[#C5A85D]/10'
                  : 'bg-[#121212]/70 text-gray-400 border-white/5 hover:border-white/10 hover:text-white'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Landmark className="w-4 h-4" />
                <span>{loc.name.split(' - ')[1]}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Selected Showroom Detailed Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-[#121212]/90 border border-[#C5A85D]/20 p-6 sm:p-10 rounded-lg shadow-2xl relative overflow-hidden" id="branch-details-view">
          
          {/* Subtle logo back ornament */}
          <div className="absolute right-0 top-0 text-[#C5A85D]/3 font-display text-[15rem] leading-none select-none pointer-events-none transform translate-x-20 -translate-y-20">
            V
          </div>

          <div className="flex flex-col justify-between space-y-6 relative z-10">
            
            {/* Showroom visual label info */}
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#4A0E17] text-[#E5C46D] text-[10px] font-sans uppercase tracking-[0.2em] rounded-full mb-4">
                <Compass className="w-3.5 h-3.5 text-[#C5A85D] animate-spin" style={{ animationDuration: '6s' }} />
                <span>Flagship Atelier Suite</span>
              </div>
              <h3 className="font-display font-medium text-2xl sm:text-3xl text-white tracking-widest">
                {activeBranch.name}
              </h3>
            </div>

            {/* Structured Specifications list */}
            <div className="space-y-4">
              
              {/* Address details */}
              <div className="flex items-start">
                <div className="p-2.5 bg-black text-[#C5A85D] border border-white/5 rounded mr-4 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-sans">
                    Showroom Address
                  </h4>
                  <p className="text-sm font-serif text-[#F5EFEB]/95 mt-1 leading-relaxed max-w-sm">
                    {activeBranch.address}
                  </p>
                  <button
                    onClick={() => handleCopyAddress(activeBranch.address)}
                    className="flex items-center space-x-1.5 mt-2 text-[10px] text-[#C5A85D] hover:text-white uppercase tracking-wider font-sans bg-white/5 px-2.5 py-1 rounded cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copyStatus === 'copied' ? 'Address Copied!' : 'Copy full address'}</span>
                  </button>
                </div>
              </div>

              {/* Call support */}
              <div className="flex items-start">
                <div className="p-2.5 bg-black text-[#C5A85D] border border-white/5 rounded mr-4 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-sans">
                    Stylist Direct Line
                  </h4>
                  <p className="text-sm font-sans font-semibold text-white mt-1">
                    {activeBranch.phone}
                  </p>
                  <a
                    href={`tel:${activeBranch.phone.replace(/\s+/g, '')}`}
                    className="inline-block mt-1 font-sans text-xs font-semibold text-[#E5C46D] hover:underline"
                  >
                    Call store instantly &rarr;
                  </a>
                </div>
              </div>

              {/* Timing info */}
              <div className="flex items-start">
                <div className="p-2.5 bg-black text-[#C5A85D] border border-white/5 rounded mr-4 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-sans">
                    Atelier Timings
                  </h4>
                  <p className="text-sm font-serif text-gray-300 mt-1">
                    {activeBranch.timing}
                  </p>
                </div>
              </div>

              {/* Valet Parking Info */}
              <div className="flex items-start bg-black/40 p-4 border border-[#C5A85D]/15 rounded">
                <div className="p-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/10 rounded mr-3 shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[11px] text-[#E5C46D] uppercase tracking-wider font-sans font-semibold">
                    Valet & Parking Guarantee
                  </h4>
                  <p className="text-[11px] text-gray-400 font-serif leading-normal mt-1">
                    {activeBranch.parkingInfo}
                  </p>
                </div>
              </div>

            </div>

            {/* High Conversion Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <a
                href={activeBranch.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs uppercase font-bold tracking-[0.15em] rounded hover:shadow shadow-zinc-800 transition-all flex items-center justify-center space-x-2 text-center"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Directions</span>
              </a>

              <a
                href={`tel:${activeBranch.phone.replace(/\s/g, '')}`}
                className="py-3.5 bg-[#4A0E17] hover:bg-[#5F1924] text-white border border-[#C5A85D]/20 font-sans text-xs uppercase font-semibold tracking-[0.15em] rounded transition-all text-center"
              >
                Call Lounge
              </a>
            </div>

          </div>

          {/* Map Embed and visual framing */}
          <div className="rounded-lg overflow-hidden border border-[#C5A85D]/15 h-[350px] sm:h-[450px] bg-[#0A0A0A] relative shadow-inner group">
            <iframe
              src={getMapUrl(activeBranch.mapEmbedUrl, mapStyle)}
              className={`w-full h-full border-0 transition-all duration-500 focus:outline-none ${
                mapStyle === 'roadmap'
                  ? 'grayscale invert opacity-70 contrast-125'
                  : 'opacity-90 contrast-110 saturate-125'
              }`}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer"
              title={`${activeBranch.name} Map coordinates`}
            />

            {/* Float Toggle Control for Grooms' Ease of Navigation */}
            <div className="absolute top-4 right-4 z-20 flex gap-1 p-1 bg-black/90 backdrop-blur-md border border-[#C5A85D]/20 rounded shadow-lg">
              <button
                type="button"
                onClick={() => setMapStyle('roadmap')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded text-[10px] sm:text-xs font-sans tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  mapStyle === 'roadmap'
                    ? 'bg-[#C5A85D] text-black font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Roadmap</span>
              </button>
              <button
                type="button"
                onClick={() => setMapStyle('satellite')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded text-[10px] sm:text-xs font-sans tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  mapStyle === 'satellite'
                    ? 'bg-[#C5A85D] text-black font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Satellite</span>
              </button>
            </div>

            {/* Visual aesthetic gold border frame */}
            <div className="absolute inset-0 border-2 border-[#C5A85D]/20 pointer-events-none m-3 rounded shadow-inner" />
          </div>

        </div>

      </div>
    </section>
  );
}
