/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, X, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { getDynamicLookbook } from '../utils';
import { IndexedAsset } from './FeaturedCollections';
import { LookbookItem } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { onSnapshot, doc } from 'firebase/firestore';

export default function GroomLookbook() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState<number | null>(null);
  const [lookbookItems, setLookbookItems] = useState<LookbookItem[]>(() => getDynamicLookbook());

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'lookbook'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.list)) {
          setLookbookItems(data.list as LookbookItem[]);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/lookbook');
    });

    return () => unsubscribe();
  }, []);

  const categories = ['All', 'Sherwani', 'Indo-Western', 'Kurta-Pajama', 'Groom-Accessories'];

  const filteredItems = activeCategory === 'All'
    ? lookbookItems
    : lookbookItems.filter(item => item.category === activeCategory);

  const handlePrev = () => {
    if (fullscreenImageIndex === null) return;
    setFullscreenImageIndex(prev => 
      prev === 0 ? filteredItems.length - 1 : (prev as number) - 1
    );
  };

  const handleNext = () => {
    if (fullscreenImageIndex === null) return;
    setFullscreenImageIndex(prev => 
      (prev as number + 1) % filteredItems.length
    );
  };

  const currentImageObj = fullscreenImageIndex !== null ? filteredItems[fullscreenImageIndex] : null;

  return (
    <section className="py-24 bg-[#0A0A0A] border-t border-[#C5A85D]/10" id="groom-lookbook-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Looking Section Title */}
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C5A85D] font-sans font-medium mb-3">
            Groom Editorial Fashion
          </p>
          <h2 className="font-display font-medium text-4xl sm:text-5xl text-white tracking-wide">
            The Royal <span className="text-gold-gradient italic font-serif font-light">Lookbook</span>
          </h2>
          <div className="w-24 h-[1px] bg-[#C5A85D] mx-auto mt-6" />
          <p className="max-w-xl mx-auto font-serif text-gray-400 text-sm mt-4 italic leading-relaxed">
            Witness majestic groom transformations. Authentic wedding portfolios outlining true Rajput royalty, nawabi drapes, and high-contrast styling.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 sm:px-5 py-2 text-[10px] sm:text-xs font-sans tracking-widest uppercase transition-all duration-300 rounded cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#4A0E17] text-white border border-[#C5A85D]/40 font-bold'
                  : 'bg-[#121212]/60 text-gray-400 border border-transparent hover:text-white hover:bg-[#121212]'
              }`}
            >
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Masonry-like Grid Layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6" id="lookbook-masonry-container">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setFullscreenImageIndex(index)}
              className="break-inside-avoid relative overflow-hidden bg-[#121212] border border-white/5 rounded-lg group cursor-pointer shadow-lg transition-all duration-500 hover:border-[#C5A85D]/40"
            >
              {/* Image with zoom effect */}
              <div className="overflow-hidden bg-black aspect-auto">
                <IndexedAsset
                  src={item.imageUrl}
                  videoSrc={item.videoUrl}
                  alt={item.title}
                  className="w-full object-cover object-top transition-transform duration-700 group-hover:scale-104 group-hover:brightness-90"
                />
              </div>

              {/* Hover content details strip */}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-widest text-[#C5A85D] font-sans font-semibold">
                    {item.category.replace('-', ' ')}
                  </span>
                  <Compass className="w-3.5 h-3.5 text-[#C5A85D]/40 group-hover:text-[#C5A85D] transition-colors" />
                </div>
                <h3 className="font-display font-medium text-base text-white tracking-widest mt-1.5 leading-tight group-hover:text-[#E5C46D] transition-colors">
                  {item.title}
                </h3>
                <p className="font-serif text-xs text-gray-400 mt-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="border-t border-white/5 mt-3 pt-2.5 text-[10px] text-[#E5C46D]/80 font-sans tracking-wide uppercase italic">
                  {item.credits}
                </div>
              </div>

              {/* Hover card border shadow accents */}
              <div className="absolute inset-0 border border-transparent group-hover:border-[#C5A85D]/20 duration-300 pointer-events-none rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Infinite zoom Fullscreen Swiper Modal */}
      {currentImageObj && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50">
          
          {/* Close trigger */}
          <button
            onClick={() => setFullscreenImageIndex(null)}
            className="absolute top-6 right-6 p-2 bg-black/60 border border-[#C5A85D]/20 text-gray-300 hover:text-white rounded-full z-25 cursor-pointer"
            aria-label="Close Gallery"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Controls */}
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 p-3 bg-[#121212]/50 hover:bg-[#C5A85D] border border-white/5 text-[#F5EFEB] hover:text-black rounded-full z-20 transition-all cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 p-3 bg-[#121212]/50 hover:bg-[#C5A85D] border border-white/5 text-[#F5EFEB] hover:text-black rounded-full z-20 transition-all cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slider Content Wrapper */}
          <div className="max-w-4xl w-full flex flex-col justify-center items-center" id="lookbook-fullscreen-panel">
            <div className="relative max-h-[70vh] sm:max-h-[80vh] overflow-hidden rounded border border-[#C5A85D]/30 shadow-2xl">
              <IndexedAsset
                src={currentImageObj.imageUrl}
                videoSrc={currentImageObj.videoUrl}
                alt={currentImageObj.title}
                className="max-h-[70vh] sm:max-h-[80vh] object-contain mx-auto"
                isBackgroundLoop={true}
              />
            </div>

            {/* Editorial Footer Details overlay */}
            <div className="text-center mt-6 max-w-2xl px-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#C5A85D] font-sans font-bold">
                ★ {currentImageObj.category} lookbook ★
              </p>
              <h4 className="font-display font-medium text-lg text-white mt-1.5 tracking-widest uppercase">
                {currentImageObj.title}
              </h4>
              <p className="font-serif text-sm text-gray-300 mt-2 leading-relaxed">
                {currentImageObj.description}
              </p>
              <div className="text-xs text-[#E5C46D] mt-2 font-sans italic tracking-wider">
                {currentImageObj.credits}
              </div>

              {/* Inquiry Action shortcut directly inside gallery! */}
              <div className="mt-4 flex justify-center">
                <a
                  href={`https://wa.me/919000777265?text=Hi%20Varudu!%20I%20am%20exploring%20your%20Groom%20Lookbook.%20I%20saw%20the%20"${currentImageObj.title}"%20composition%20and%20would%20love%20to%20know%20if%20this%20cut%20is%20available%20for%20fitting.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-[10px] uppercase font-semibold tracking-widest rounded transition-all flex items-center space-x-2.5 shadow"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Request Lookbook Fit on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      )}

    </section>
  );
}
