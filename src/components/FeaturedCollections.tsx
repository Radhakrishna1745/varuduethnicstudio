/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ProductCollection, GroomVideo } from '../types';
import { MessageSquare, Sparkles, Send, Ruler, Info, X, Check, Play, Film, Heart, Share2, ChevronLeft, ChevronRight, Volume2, VolumeX, Eye } from 'lucide-react';
import { getDynamicCollections, incrementCollectionViews, getDynamicGroomVideos } from '../utils';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { onSnapshot, doc } from 'firebase/firestore';

// Helper to normalize legacy and new categories so everything is beautifully merged
const normalizeCategoryLabel = (cat: string): string => {
  const c = String(cat || '').toLowerCase().trim();
  if (c.includes('sherwani')) return 'Sherwanis';
  if (c.includes('indo-western') || c.includes('indowestern')) return 'Indo-Westerns';
  if (c.includes('tuxedo')) return 'Tuxedos';
  if (c.includes('kurta') || c.includes('pajama') || c.includes('kurta set')) return 'Kurta Sets';
  if (c.includes('reception') || c.includes('tuxedos') || c === 'reception wear') return 'Reception Wear';
  if (c.includes('accessory') || c.includes('accessories')) return 'Accessories';
  return cat;
};

// Dynamic Asset Renderer supporting photo & loop videos from static URLs
interface IndexedAssetProps {
  src: string;
  videoSrc?: string;
  alt: string;
  className?: string;
  isBackgroundLoop?: boolean;
}

export function IndexedAsset({ src, videoSrc, alt, className = "", isBackgroundLoop = false }: IndexedAssetProps) {
  const resolvedSrc = src.startsWith('indexeddb:')
    ? 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=800'
    : src;
  const resolvedVideoSrc = videoSrc && videoSrc.startsWith('indexeddb:') ? '' : videoSrc;

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
  const [groomVideos, setGroomVideos] = useState<GroomVideo[]>(() => getDynamicGroomVideos().filter(v => v.status !== 'disabled'));
  const [selectedVideo, setSelectedVideo] = useState<GroomVideo | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  
  // Multiple images in modal tracking
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Wishlist in localStorage
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('varudu_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  // Sharing copy notification toast state
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'collections'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.list)) {
          setProducts(data.list as ProductCollection[]);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/collections');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubGroomVids = onSnapshot(doc(db, 'settings', 'groom_videos'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.list)) {
          setGroomVideos((data.list as GroomVideo[]).filter(v => v.status !== 'disabled'));
        }
      }
    }, (error) => {
      console.warn("FeaturedCollections groom videos sync warning:", error);
    });
    return () => unsubGroomVids();
  }, []);

  // Reset active image scroller index when switching active view item
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedProduct]);

  const categories = ['All', 'Sherwanis', 'Indo-Westerns', 'Tuxedos', 'Kurta Sets', 'Reception Wear', 'Accessories', 'Royal Reels 📹'];

  // Handle product inspection and record views metric beautifully
  const handleInspectProduct = (product: ProductCollection) => {
    setSelectedProduct(product);
    incrementCollectionViews().catch(err => {
      console.warn('Failed tracking collection view count with Firestore:', err);
    });
  };

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    setWishlist(updated);
    try {
      localStorage.setItem('varudu_wishlist', JSON.stringify(updated));
    } catch (_) {}
  };

  const handleShareProduct = (product: ProductCollection, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Explore this royal tailored styling selection "${product.name}" at VARUDU ETHNIC STUDIO:`;
    const shareUrl = `${window.location.origin}/#featured-collections-desk`;

    if (navigator.share) {
      navigator.share({
        title: 'VARUDU Ethnic Studio',
        text: shareText,
        url: shareUrl,
      }).catch(err => console.debug('Navigator share closed', err));
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`).then(() => {
        setCopiedLink(product.id);
        setTimeout(() => setCopiedLink(null), 2000);
      });
    }
  };

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => normalizeCategoryLabel(p.category) === activeCategory);

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
    return `https://wa.me/919000777265?text=${encodeURIComponent(text)}`;
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
              {cat}
            </button>
          ))}
        </div>

        {/* Interactive Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="collections-grid">
          {activeCategory === 'Royal Reels 📹' ? (
            groomVideos.map((video) => (
              <div
                key={`collection-reel-${video.id}`}
                className="group bg-[#121212] border border-[#C5A85D]/15 hover:border-[#C5A85D]/40 rounded overflow-hidden flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(229,196,109,0.05)] relative"
              >
                {/* Cinema Reel Video Player Container */}
                <div 
                  className="relative h-[380px] overflow-hidden bg-black cursor-pointer group-hover:brightness-95 transition-all" 
                  onClick={() => setSelectedVideo(video)}
                >
                  <video
                    src={video.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  
                  {/* Floating category decoration tag */}
                  <div className="absolute top-4 left-4 bg-[#4A0E17] px-3 py-1 border border-[#C5A85D]/30 text-white font-sans text-[9px] uppercase tracking-widest flex items-center space-x-1.5 backdrop-blur-sm z-10 font-bold">
                    <Film className="w-3 h-3 text-[#E5C46D] animate-pulse" />
                    <span>{video.category}</span>
                  </div>

                  <div className="absolute top-4 right-4 flex items-center space-x-1 px-2.5 py-1 rounded bg-black/85 border border-[#C5A85D]/20 text-gray-200 text-[9px] font-mono z-10 backdrop-blur-sm">
                    <Eye className="w-3.5 h-3.5 text-amber-300" />
                    <span>{video.views || 920} Views</span>
                  </div>

                  {/* Play circle overlay button */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/15 transition-all pointer-events-none">
                    <div className="p-4 bg-[#4A0E17]/95 border border-[#C5A85D]/50 text-[#C5A85D] rounded-full shadow-xl transition-all scale-95 group-hover:scale-105 group-hover:bg-[#C5A85D] group-hover:text-black">
                      <Play className="w-6 h-6 fill-current text-current" />
                    </div>
                  </div>

                  {/* Cinema Vignette Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-transparent to-transparent h-28 pointer-events-none" />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-medium text-lg text-white tracking-widest group-hover:text-[#E5C46D] transition-colors leading-snug">
                      {video.title}
                    </h3>
                    <p className="font-serif text-xs text-gray-400 leading-relaxed mt-2 italic">
                      &ldquo;{video.description}&rdquo;
                    </p>
                    <div className="text-[10px] uppercase font-sans tracking-widest text-[#C5A85D] mt-4 font-bold">
                      🎬 Credits: {video.credits}
                    </div>
                  </div>

                  {/* Reel customized high conversion quick inquiries */}
                  <div className="grid grid-cols-2 gap-3 mt-6 border-t border-[#C5A85D]/10 pt-4 font-sans">
                    <button
                      onClick={() => {
                        onSelectProduct(`${video.title} (Style Reel inspired)`);
                        const target = document.getElementById('consultation-engine');
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="flex items-center justify-center space-x-1.5 py-2.5 px-3 border border-[#C5A85D] hover:bg-[#C5A85D] text-[#C5A85D] hover:text-black font-sans text-[10px] uppercase font-semibold tracking-widest rounded transition-all cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Request Fitting</span>
                    </button>

                    <a
                      href={`https://wa.me/919000777265?text=${encodeURIComponent(`Hi Varudu team! I am viewing your active elite collections and watching the "${video.title}" Cinema Reel. Can I enquire about getting customized attire of this ethnic styling?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-400 hover:text-white font-sans text-[10px] uppercase font-semibold tracking-widest rounded transition-all"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp Link</span>
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-[#121212] border border-[#C5A85D]/15 hover:border-[#C5A85D]/40 rounded overflow-hidden flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(229,196,109,0.05)] relative"
              >
                {/* Product Visual Container with hover zooms */}
                <div className="relative h-[380px] overflow-hidden bg-black cursor-pointer" onClick={() => handleInspectProduct(product)}>
                  <IndexedAsset
                    src={product.imageUrl}
                    videoSrc={product.videoUrl}
                    alt={product.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 group-hover:brightness-95"
                    isBackgroundLoop={true}
                  />
                  
                  {/* Premium tag */}
                  <div className="absolute top-4 left-4 bg-black/85 px-3 py-1 border border-[#C5A85D]/30 text-white font-sans text-[9px] uppercase tracking-widest flex items-center space-x-1.5 backdrop-blur-sm z-10">
                    <Sparkles className="w-3 h-3 text-[#E5C46D]" />
                    <span>{normalizeCategoryLabel(product.category)}</span>
                  </div>

                  {/* Heart wishlist top right */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
                    <button
                      onClick={(e) => toggleWishlist(product.id, e)}
                      className="p-2 rounded-full bg-black/80 hover:bg-black border border-white/5 text-[#E5C46D] hover:scale-110 transition-all cursor-pointer backdrop-blur-sm"
                      title={wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-[#E5C46D]' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => handleShareProduct(product, e)}
                      className="p-2 rounded-full bg-black/80 hover:bg-black border border-white/5 text-[#C5A85D] hover:scale-110 transition-all cursor-pointer backdrop-blur-sm relative"
                      title="Share look link"
                    >
                      <Share2 className="w-4 h-4" />
                      {copiedLink === product.id && (
                        <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-amber-950 border border-[#C5A85D]/45 text-[#E5C46D] text-[9px] px-2 py-0.5 rounded font-sans uppercase font-bold tracking-widest animate-fade-in shadow-lg">
                          Copied Link!
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Price indicators */}
                  <div className="absolute bottom-4 right-4 bg-gradient-to-r from-[#4A0E17] to-[#2F050B]/90 px-3 py-1.5 border border-[#C5A85D]/40 text-[#F5EFEB] font-sans font-medium text-xs tracking-wider z-10">
                    {product.priceRange}
                  </div>

                  {/* Hidden hover details overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-[#0A0A0A]/95 p-6 border-t border-[#C5A85D]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex flex-col justify-between h-[60%] z-10">
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
            ))
          )}
        </div>

        {/* Row of Dynamic Reels underneath the Collections grid */}
        {activeCategory !== 'Royal Reels 📹' && groomVideos.length > 0 && (
          <div className="mt-20 pt-16 border-t border-[#C5A85D]/10" id="collections-groom-cinema-showcase">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5A85D] font-sans font-semibold">
                  Sartorial Postures in High Motion
                </p>
                <h3 className="font-display font-medium text-2xl text-white tracking-widest uppercase mt-1">
                  Royal Groom <span className="text-gold-gradient italic font-serif font-light">Cinema Snippets</span>
                </h3>
              </div>
              <button
                onClick={() => setActiveCategory('Royal Reels 📹')}
                className="mt-4 md:mt-0 font-sans text-[10px] font-bold text-[#C5A85D] hover:text-white uppercase tracking-[0.2em] flex items-center space-x-2 border-b border-[#C5A85D]/20 pb-0.5 cursor-pointer bg-transparent border-t-0 border-x-0 outline-none"
              >
                <span>View All {groomVideos.length} Reels</span>
                <span>→</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {groomVideos.slice(0, 3).map((video) => (
                <div 
                  key={`highlight-${video.id}`}
                  onClick={() => setSelectedVideo(video)}
                  className="group bg-[#121212] border border-[#C5A85D]/10 hover:border-[#C5A85D]/40 p-3.5 rounded-lg cursor-pointer transition-all flex space-x-4 items-center"
                >
                  <div className="relative w-16 h-24 aspect-[9/16] bg-black rounded overflow-hidden shrink-0 border border-white/5">
                    <video
                      src={video.videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/45 flex items-center justify-center group-hover:bg-black/10 transition-all">
                      <Play className="w-5 h-5 text-white hover:text-[#C5A85D] fill-current" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[8px] uppercase font-mono tracking-widest text-[#C5A85D] font-bold">{video.category}</span>
                    <h4 className="text-white font-sans font-bold text-xs truncate uppercase mt-0.5 tracking-wider group-hover:text-[#E5C46D] transition-colors">{video.title}</h4>
                    <p className="text-gray-400 text-[10px] font-serif italic mt-1 line-clamp-2 leading-relaxed">&ldquo;{video.description}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bespoke Interactive Product Specs Modal */}
      {selectedProduct && (() => {
        const carouselImages = [
          selectedProduct.imageUrl,
          ...(selectedProduct.images || [])
        ].filter(Boolean);

        return (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in" id="product-detail-modal">
            <div className="relative w-full max-w-4xl bg-[#121212] border border-[#C5A85D]/30 max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 text-gray-400 hover:text-[#C5A85D] border border-white/10 rounded-full transition-all z-10 cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-10">
                
                {/* Image side with Multi-Image Carousel */}
                <div className="flex flex-col space-y-4">
                  <div className="relative h-[300px] sm:h-[400px] overflow-hidden rounded border border-white/5 bg-black">
                    <IndexedAsset
                      src={carouselImages[activeImageIndex]}
                      videoSrc={activeImageIndex === 0 ? selectedProduct.videoUrl : undefined}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover object-top transition-all duration-300"
                      isBackgroundLoop={true}
                    />
                    
                    {/* Carousel Prev/Next Buttons */}
                    {carouselImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImageIndex(prev => (prev - 1 + carouselImages.length) % carouselImages.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-black/75 hover:bg-black rounded-full text-white hover:text-[#C5A85D] border border-white/10 cursor-pointer transition-all z-10"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActiveImageIndex(prev => (prev + 1) % carouselImages.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-black/75 hover:bg-black rounded-full text-white hover:text-[#C5A85D] border border-white/10 cursor-pointer transition-all z-10"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                  </div>

                  {/* Multi-Image Thumbnails Scroller Row */}
                  {carouselImages.length > 1 && (
                    <div className="flex items-center space-x-2.5 overflow-x-auto py-1">
                      {carouselImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`w-14 h-14 rounded overflow-hidden border transition-all cursor-pointer bg-black shrink-0 ${
                            activeImageIndex === idx ? 'border-[#C5A85D] scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Text specifications side */}
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-sans uppercase tracking-[0.2em] mb-2 text-[#C5A85D]">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4" />
                        <span>VARUDU ATELIER SELECTION</span>
                      </div>
                      
                      {/* Interactive Heart wishlist in details */}
                      <button
                        onClick={(e) => toggleWishlist(selectedProduct.id, e)}
                        className="text-[#E5C46D] hover:scale-105 transition-all flex items-center space-x-1 uppercase tracking-widest text-[10px] font-bold cursor-pointer"
                      >
                        <Heart className={`w-4 h-4 inline ${wishlist.includes(selectedProduct.id) ? 'fill-[#E5C46D]' : ''}`} />
                        <span>{wishlist.includes(selectedProduct.id) ? 'SAVED' : 'SAVE'}</span>
                      </button>
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
        );
      })()}

      {/* Immersive Selected Video Reel Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-fade-in" id="groom-video-reel-modal">
          <div className="relative w-full max-w-lg bg-[#0F0F0F] border border-[#C5A85D]/40 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Header / Info bar */}
            <div className="p-4 border-b border-white/5 bg-black/80 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-mono text-[#C5A85D] font-bold tracking-widest">{selectedVideo.category} Cinema Reel</span>
                <h4 className="text-white font-sans font-bold text-sm tracking-wide uppercase truncate max-w-[260px]">{selectedVideo.title}</h4>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 text-gray-400 hover:text-[#C5A85D] bg-white/5 rounded-full hover:scale-105 transition-all cursor-pointer border border-white/5"
                title="Dismiss Reel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Immersive Vertical Video Container */}
            <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center aspect-[9/16] min-h-[300px] max-h-[60vh] sm:max-h-[65vh]">
              <video
                src={selectedVideo.videoUrl}
                autoPlay
                controls
                playsInline
                loop
                muted={isAudioMuted}
                className="w-full h-full object-contain"
              />

              {/* Instant Mute/Unmute toggle indicator */}
              <button
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className="absolute bottom-4 right-4 p-2.5 bg-black/80 hover:bg-black text-[#C5A85D] hover:scale-110 border border-[#C5A85D]/25 rounded-full z-20 cursor-pointer transition-all flex items-center justify-center shadow"
                title={isAudioMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <div className="absolute top-4 left-4 bg-[#4A0E17]/90 px-3 py-1 border border-[#C5A85D]/40 text-[#E5C46D] text-[9px] uppercase tracking-widest font-sans font-bold z-10 rounded shadow backdrop-blur-sm">
                🎬 Royal Studio Walk Shorts
              </div>
            </div>

            {/* Footer and dynamic CTA specifications */}
            <div className="p-5 sm:p-6 bg-black/95 border-t border-white/5 space-y-4">
              <div>
                <p className="text-gray-300 font-serif text-xs italic leading-relaxed">&ldquo;{selectedVideo.description}&rdquo;</p>
                <div className="text-[10px] text-amber-100 font-sans tracking-wide mt-2 block opacity-85">
                  ✂ Tailoring & Styling Credits: <strong className="text-[#C5A85D] font-semibold">{selectedVideo.credits}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <button
                  onClick={() => {
                    onSelectProduct(`${selectedVideo.title} (Motion Reel selection)`);
                    setSelectedVideo(null);
                    const target = document.getElementById('consultation-engine');
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full py-2 bg-[#C5A85D] hover:bg-[#D5B86D] text-black text-[10px] font-sans font-bold uppercase tracking-wider rounded transition-all cursor-pointer"
                >
                  Reserve Stylist
                </button>
                <a
                  href={`https://wa.me/919000777265?text=${encodeURIComponent(`Hi Varudu team! I am watching the Groom Cinema Reel "${selectedVideo.title}" (${selectedVideo.category}) and would love to style my customized attire in similar patterns. Please advise.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-sans font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center space-x-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Swatch</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
