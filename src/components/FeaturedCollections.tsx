/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProductCollection } from '../types';
import { MessageSquare, Sparkles, Send, Ruler, Info, X, Check, Play, Film } from 'lucide-react';
import { getDynamicCollections, getMediaFile } from '../utils';

// Dynamic Asset Renderer supporting photo & loop videos from IndexedDB or static URLs
interface IndexedAssetProps {
  src: string;
  videoSrc?: string;
  alt: string;
  className?: string;
  isBackgroundLoop?: boolean;
}

export function IndexedAsset({ src, videoSrc, alt, className = "", isBackgroundLoop = false }: IndexedAssetProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string>('');
  const [resolvedVideoSrc, setResolvedVideoSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let urlToRevoke = '';
    let videoUrlToRevoke = '';

    async function load() {
      // Resolve Image
      if (src.startsWith('indexeddb:')) {
        const key = src.replace('indexeddb:', '');
        const blob = await getMediaFile(key);
        if (blob && active) {
          urlToRevoke = URL.createObjectURL(blob);
          setResolvedSrc(urlToRevoke);
        } else if (active) {
          setResolvedSrc('https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=800'); // fallback
        }
      } else {
        setResolvedSrc(src);
      }

      // Resolve Video (if exists)
      if (videoSrc) {
        if (videoSrc.startsWith('indexeddb:')) {
          const key = videoSrc.replace('indexeddb:', '');
          const blob = await getMediaFile(key);
          if (blob && active) {
            videoUrlToRevoke = URL.createObjectURL(blob);
            setResolvedVideoSrc(videoUrlToRevoke);
          }
        } else {
          setResolvedVideoSrc(videoSrc);
        }
      }

      if (active) setLoading(false);
    }

    load();

    return () => {
      active = false;
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
      if (videoUrlToRevoke) URL.revokeObjectURL(videoUrlToRevoke);
    };
  }, [src, videoSrc]);

  if (loading) {
    return (
      <div className="w-full h-full bg-[#121212] animate-pulse flex flex-col items-center justify-center text-[10px] text-gray-500 font-sans tracking-widest uppercase">
        <div className="w-6 h-6 rounded-full border border-t-[#C5A85D] border-white/5 animate-spin mb-2" />
        <span>Developing Fabric...</span>
      </div>
    );
  }

  if (resolvedVideoSrc && isBackgroundLoop) {
    return (
      <video
        src={resolvedVideoSrc}
        autoPlay
        loop
        muted
        playsInline
        className={`${className} w-full h-full object-cover`}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      <img
        src={resolvedSrc}
        alt={alt}
        className={`${className} w-full h-full object-cover`}
        referrerPolicy="no-referrer"
      />
      {resolvedVideoSrc && (
        <div className="absolute top-3 right-3 bg-red-950/90 text-[#E5C46D] border border-[#C5A85D]/30 px-2 py-0.5 rounded text-[8px] font-sans font-bold tracking-[0.15em] uppercase flex items-center space-x-1.5 backdrop-blur-sm shadow z-10 animate-pulse">
          <Film className="w-3 h-3 text-[#E5C46D]" />
          <span>CINEMATIC SHOWCASE</span>
        </div>
      )}
    </div>
  );
}

interface CollectionsProps {
  onSelectProduct: (productName: string) => void;
}

export default function FeaturedCollections({ onSelectProduct }: CollectionsProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<ProductCollection | null>(null);
  const [products, setProducts] = useState<ProductCollection[]>(() => getDynamicCollections());

  useEffect(() => {
    const handleUpdate = () => {
      setProducts(getDynamicCollections());
    };
    window.addEventListener('varudu-collections-updated', handleUpdate);
    return () => {
      window.removeEventListener('varudu-collections-updated', handleUpdate);
    };
  }, []);

  const categories = ['All', 'Sherwani', 'Indo-Western', 'Kurta-Pajama', 'Reception-Wear', 'Groom-Accessories'];

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const handleQuickInquiry = (product: ProductCollection) => {
    onSelectProduct(product.name);
    // Smooth scroll to the Consultation section
    const target = document.getElementById('consultation-engine');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getWhatsAppMessageLink = (product: ProductCollection) => {
    const text = `Hi Varudu Ethnic Studio team! I saw your stunning custom "${product.name}" (${product.priceRange}) on your website and would love to inquire about a tailored fitting session for my upcoming wedding. Can you guide me with the next steps?`;
    return `https://wa.me/919505122400?text=${encodeURIComponent(text)}`;
  };

  return (
    <section className="py-24 bg-[#0A0A0A] border-t border-[#C5A85D]/10" id="featured-collections-desk">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Heading */}
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C5A85D] font-sans font-medium mb-3">
            Pure Masculine Splendor
          </p>
          <h2 className="font-display font-medium text-4xl sm:text-5xl text-white tracking-wide">
            Elite Custom <span className="text-gold-gradient italic font-serif font-light">Collections</span>
          </h2>
          <div className="w-24 h-[1px] bg-[#C5A85D] mx-auto mt-6" />
          <p className="max-w-xl mx-auto font-serif text-gray-400 text-sm sm:text-base mt-4 italic">
            Zero female models. Zero distractions. Just majestic, hand-stitched wedding attire for the sophisticated Indian groom and his royalty circle.
          </p>
        </div>

        {/* Categories Tab Deck */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-12" id="category-filter-buttons">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 sm:px-6 py-2.5 text-[10px] sm:text-xs font-sans tracking-[0.15em] uppercase border transition-all duration-300 rounded cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#C5A85D] text-black border-[#C5A85D] font-semibold shadow-md shadow-[#C5A85D]/10'
                  : 'bg-[#121212] text-gray-300 border-[#C5A85D]/10 hover:border-[#C5A85D]/30 hover:text-white'
              }`}
            >
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Interactive Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="collections-grid">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-[#121212] border border-[#C5A85D]/15 hover:border-[#C5A85D]/40 rounded overflow-hidden flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(229,196,109,0.05)]"
            >
              {/* Product Visual Container with hover zooms */}
              <div className="relative h-[380px] overflow-hidden bg-black cursor-pointer" onClick={() => setSelectedProduct(product)}>
                <IndexedAsset
                  src={product.imageUrl}
                  videoSrc={product.videoUrl}
                  alt={product.name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 group-hover:brightness-95"
                />
                
                {/* Premium tag */}
                <div className="absolute top-4 left-4 bg-black/80 px-3 py-1 border border-[#C5A85D]/30 text-white font-sans text-[9px] uppercase tracking-widest flex items-center space-x-1.5 backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 text-[#E5C46D]" />
                  <span>{product.category.replace('-', ' ')}</span>
                </div>

                {/* Price indicators */}
                <div className="absolute bottom-4 right-4 bg-gradient-to-r from-[#4A0E17] to-[#2F050B]/90 px-3 py-1.5 border border-[#C5A85D]/40 text-[#F5EFEB] font-sans font-medium text-xs tracking-wider">
                  {product.priceRange}
                </div>

                {/* Hidden hover details overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-[#0A0A0A]/95 p-6 border-t border-[#C5A85D]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex flex-col justify-between h-[60%]">
                  <div>
                    <h4 className="font-display text-base text-[#E5C46D] font-medium tracking-wide">
                      Craft Highlights
                    </h4>
                    <ul className="mt-3 space-y-1.5">
                      {product.highlights.slice(0, 3).map((hl, i) => (
                        <li key={i} className="flex items-start text-[11px] text-gray-300 font-sans tracking-wide">
                          <Check className="w-3.5 h-3.5 text-[#C5A85D] mr-2 mt-0.5 shrink-0" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-[10px] text-gray-400 font-serif italic border-t border-[#C5A85D]/10 pt-3">
                    Click anywhere on card to inspect bespoke options
                  </div>
                </div>
              </div>

              {/* Product text content fields */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-medium text-lg text-white tracking-widest group-hover:text-[#E5C46D] transition-colors leading-snug">
                    {product.name}
                  </h3>
                  <p className="font-serif text-xs text-gray-400 leading-relaxed mt-2 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Subtle styling tags spacer */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {product.tags.map(tag => (
                      <span key={tag} className="bg-white/5 border border-white/5 px-2.5 py-0.5 rounded text-[9px] text-[#C5A85D] tracking-wider uppercase font-sans">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Core high conversion action controllers */}
                <div className="grid grid-cols-2 gap-3 mt-6 border-t border-[#C5A85D]/10 pt-4">
                  <button
                    onClick={() => handleQuickInquiry(product)}
                    className="flex items-center justify-center space-x-1.5 py-2.5 px-3 border border-[#C5A85D] hover:bg-[#C5A85D] text-[#C5A85D] hover:text-black font-sans text-[10px] uppercase font-semibold tracking-widest rounded transition-all cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Inquire Swatch</span>
                  </button>

                  <a
                    href={getWhatsAppMessageLink(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-400 hover:text-white font-sans text-[10px] uppercase font-semibold tracking-widest rounded transition-all"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bespoke Interactive Product Specs Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto" id="product-detail-modal">
          <div className="relative w-full max-w-4xl bg-[#121212] border border-[#C5A85D]/30 max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 text-gray-400 hover:text-[#C5A85D] border border-white/10 rounded-full transition-all z-10 cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-10">
              
              {/* Image side */}
              <div className="relative h-[300px] sm:h-[450px] overflow-hidden rounded border border-white/5 bg-black">
                <IndexedAsset
                  src={selectedProduct.imageUrl}
                  videoSrc={selectedProduct.videoUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover object-top"
                  isBackgroundLoop={true}
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />
              </div>

              {/* Text specifications side */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-[#C5A85D] text-xs font-sans uppercase tracking-[0.2em] mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>VARUDU ATELIER SELECTION</span>
                  </div>
                  
                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-widest leading-tight">
                    {selectedProduct.name}
                  </h3>
                  
                  <div className="inline-block mt-3 px-3 py-1 bg-[#4A0E17] text-[#E5C46D] text-xs uppercase font-sans tracking-[0.15em] border border-[#C5A85D]/20">
                    Pricing: {selectedProduct.priceRange}
                  </div>

                  <p className="text-gray-300 font-serif text-sm mt-5 leading-relaxed tracking-wider">
                    {selectedProduct.description}
                  </p>

                  {/* Highlights section list */}
                  <div className="mt-6">
                    <h4 className="text-[#C5A85D] font-sans text-xs uppercase tracking-[0.15em] border-b border-white/10 pb-1.5 mb-3 font-semibold">
                      Sartorial Specifications
                    </h4>
                    <ul className="space-y-2">
                      {selectedProduct.highlights.map((item, index) => (
                        <li key={index} className="flex items-start font-sans text-xs text-gray-300">
                          <Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bespoke policies */}
                  <div className="mt-6 bg-[#0A0A0A] p-4 border border-[#C5A85D]/10 rounded">
                    <h5 className="flex items-center font-sans text-xs font-semibold text-[#E5C46D] uppercase tracking-wider mb-2">
                      <Ruler className="w-3.5 h-3.5 mr-1.5 text-[#C5A85D]" />
                      VIP Custom Tailoring Standard
                    </h5>
                    <p className="text-[11px] text-gray-400 font-serif leading-relaxed">
                      All Varudu products are tailored from scratch based on custom neck, chest, shoulder, posture, and arm measurements. Multi-point skeletal modeling guarantees zero pulling.
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-[#C5A85D]/10 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      handleQuickInquiry(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full py-3.5 bg-[#C5A85D] hover:bg-[#E5C46D] text-black text-xs font-sans font-semibold uppercase tracking-[0.15em] rounded transition-all cursor-pointer"
                  >
                    Reserve Fitting
                  </button>
                  <a
                    href={getWhatsAppMessageLink(selectedProduct)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-sans font-semibold uppercase tracking-[0.15em] rounded transition-all flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </section>
  );
}
