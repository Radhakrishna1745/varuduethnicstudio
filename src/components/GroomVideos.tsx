/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, MessageSquare, Flame, ChevronLeft, ChevronRight, Bookmark, ArrowRight, Eye } from 'lucide-react';
import { getDynamicGroomVideos } from '../utils';
import { GroomVideo } from '../types';
import { db } from '../firebase';
import { onSnapshot, doc } from 'firebase/firestore';

export default function GroomVideos() {
  const [videosList, setVideosList] = useState<GroomVideo[]>(() => getDynamicGroomVideos().filter(v => v.status !== 'disabled'));
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    // Listen to real-time additions/edits to the videos list
    const unsubscribe = onSnapshot(doc(db, 'settings', 'groom_videos'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.list)) {
          setVideosList((data.list as GroomVideo[]).filter(v => v.status !== 'disabled'));
          setActiveVideoIndex(0);
        }
      }
    }, (err) => {
      console.warn("Groom Videos listener failure:", err);
    });
    return () => unsubscribe();
  }, []);

  const categories = ['All', 'Sherwani', 'Indo-Western', 'Kurta-Pajama'];

  const filteredVideos = activeCategory === 'All'
    ? videosList
    : videosList.filter(v => v.category === activeCategory);

  const activeVideo = filteredVideos[activeVideoIndex];

  // Control video player state
  useEffect(() => {
    if (!activeVideo) return;
    const player = videoRefs.current[activeVideo.id];
    if (player) {
      player.muted = isAudioMuted;
      if (isPlaying) {
        player.play().catch(() => {
          // Fallback if browser blocks sound auto-play
          player.muted = true;
          setIsAudioMuted(true);
          player.play().catch(e => console.warn('Video failed to play:', e));
        });
      } else {
        player.pause();
      }
    }
  }, [activeVideoIndex, isPlaying, activeVideo, isAudioMuted]);

  // Handle play/pause toggle click
  const togglePlayState = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMuteState = () => {
    setIsAudioMuted(!isAudioMuted);
  };

  const handleNextVideo = () => {
    if (filteredVideos.length === 0) return;
    setIsPlaying(true);
    setActiveVideoIndex((prev) => (prev + 1) % filteredVideos.length);
  };

  const handlePrevVideo = () => {
    if (filteredVideos.length === 0) return;
    setIsPlaying(true);
    setActiveVideoIndex((prev) => (prev === 0 ? filteredVideos.length - 1 : prev - 1));
  };

  const selectCategoryAndReset = (cat: string) => {
    setActiveCategory(cat);
    setActiveVideoIndex(0);
    setIsPlaying(true);
  };

  return (
    <section className="py-24 bg-[#050505] border-t border-[#C5A85D]/10" id="royal-videos-reels">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Header */}
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C5A85D] font-sans font-medium mb-3">
            Cinematic Groom Experience
          </p>
          <h2 className="font-display font-medium text-4xl sm:text-5xl text-white tracking-wide">
            Royal Groom <span className="text-gold-gradient italic font-serif font-light">Cinema Reels</span>
          </h2>
          <div className="w-24 h-[1px] bg-[#C5A85D] mx-auto mt-6" />
          <p className="max-w-xl mx-auto font-serif text-gray-400 text-sm mt-4 italic leading-relaxed">
            Witness our ethnic drapes and bespoke sherwanis captured in high-definition cinematic motion. Experience luxury texture flows and imperial postures.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => selectCategoryAndReset(cat)}
              className={`px-4 sm:px-5 py-2 text-[10px] sm:text-xs font-sans tracking-widest uppercase transition-all duration-300 rounded cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#4A0E17] text-white border border-[#C5A85D]/40 font-bold shadow'
                  : 'bg-[#121212]/60 text-gray-400 border border-transparent hover:text-white hover:bg-[#121212]'
              }`}
            >
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>

        {filteredVideos.length === 0 ? (
          <div className="bg-[#121212] border border-white/5 p-12 text-center rounded-xl max-w-lg mx-auto">
            <span className="text-4xl block mb-4">🎬</span>
            <h4 className="text-white font-sans text-sm font-semibold uppercase tracking-wider">No Reels Found</h4>
            <p className="text-xs text-gray-500 mt-2">Adjust your filters or visit the Customizer desk as an Admin to add majestic loop videos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            
            {/* LEFT SIDE: Big Immersive Portrait Player Block */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px] aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-[#C5A85D]/30 shadow-2xl group flex items-center justify-center">
                
                {/* Standard HTML5 autoplaying loop video */}
                <video
                  ref={(el) => { videoRefs.current[activeVideo.id] = el; }}
                  src={activeVideo.videoUrl}
                  loop
                  muted={isAudioMuted}
                  playsInline
                  autoPlay
                  className="w-full h-full object-cover"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                {/* Micro Category Tag (Floating Top Left) */}
                <div className="absolute top-4 left-4 flex items-center space-x-1.5 px-3 py-1 rounded bg-[#4A0E17]/90 border border-[#C5A85D]/30 shadow">
                  <Flame className="w-3 h-3 text-[#E5C46D] animate-pulse" />
                  <span className="text-[8px] font-sans font-bold text-white uppercase tracking-wider">{activeVideo.category}</span>
                </div>

                {/* Floating views count */}
                <div className="absolute top-4 right-4 flex items-center space-x-1 px-2.5 py-1 rounded bg-black/60 border border-white/10 text-gray-300 text-[9px] font-mono">
                  <Eye className="w-3 h-3 text-amber-200" />
                  <span>{activeVideo.views || Math.floor(Math.random() * 500) + 700} views</span>
                </div>

                {/* Hover Center Controls play state indic */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/0 group-hover:bg-black/20 transition-all duration-300">
                  <button
                    onClick={togglePlayState}
                    className="p-4 bg-[#4A0E17]/90 border border-[#C5A85D]/50 hover:bg-[#C5A85D] hover:text-[#0A0A0A] rounded-full text-[#C5A85D] shadow-xl hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 duration-300 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                </div>

                {/* Audio controls speaker (Bottom Right Overlay) */}
                <div className="absolute bottom-4 right-4 z-10">
                  <button
                    onClick={toggleMuteState}
                    className="p-2.5 bg-black/80 hover:bg-[#4A0E17] border border-white/10 text-white hover:text-[#E5C46D] rounded-full transition-all duration-300 shadow cursor-pointer"
                    title={isAudioMuted ? "Unmute sound track" : "Mute audio"}
                  >
                    {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Slider pagination indicators inside video */}
                <div className="absolute bottom-4 left-4 z-10 flex space-x-1">
                  {filteredVideos.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded transition-all duration-300 ${
                        i === activeVideoIndex ? 'w-5 bg-[#C5A85D]' : 'w-1.5 bg-white/40'
                      }`}
                    />
                  ))}
                </div>

              </div>
            </div>

            {/* RIGHT SIDE: Interactive Details, Description & WhatsApp Quick Inquiry */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-[#C5A85D] font-bold">
                  ★ Active Cinema Reel {activeVideoIndex + 1} of {filteredVideos.length} ★
                </span>
                <span className="h-[1px] w-12 bg-[#C5A85D]/40" />
              </div>

              <h3 className="font-display font-medium text-2xl sm:text-3.5xl text-white tracking-widest uppercase leading-tight">
                {activeVideo.title}
              </h3>

              <div className="p-4 bg-[#121212] border-l-2 border-[#C5A85D] rounded-r-lg">
                <p className="font-serif text-sm text-gray-300 leading-relaxed italic">
                  &ldquo;{activeVideo.description}&rdquo;
                </p>
                <div className="mt-3 text-[10px] uppercase tracking-wider text-amber-200 font-sans font-bold flex items-center space-x-2">
                  <Bookmark className="w-3 h-3 text-[#C5A85D]" />
                  <span>Credits: {activeVideo.credits}</span>
                </div>
              </div>

              {/* Slider Next/Prev Arrows Controls Box */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrevVideo}
                  aria-label="Previous Cinematic Reel"
                  className="px-4 py-2 bg-[#121212] hover:bg-[#C5A85D] text-gray-400 hover:text-black hover:border-transparent pr-4.5 border border-white/5 uppercase font-sans tracking-widest text-[9px] font-bold rounded flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Loop</span>
                </button>
                <button
                  onClick={handleNextVideo}
                  aria-label="Next Cinematic Reel"
                  className="px-4 py-2 bg-[#121212] hover:bg-[#C5A85D] text-gray-400 hover:text-black hover:border-transparent pl-4.5 border border-white/5 uppercase font-sans tracking-widest text-[9px] font-bold rounded flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <span>Next Reel</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons: Request and Appointments ties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                
                <a
                  href={`https://wa.me/919000777265?text=Hi%20Varudu!%20I%20am%20watching%20your%20Royal%20Groom%20Cinema%20Reels%20and%20loved%20the%20"${activeVideo.title}"%20(${activeVideo.category}).%20Is%20this%20specific%20styling%20available%20for%20fitting?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2.5 px-6 py-3.5 bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/20 text-white font-sans text-xs uppercase font-bold tracking-widest rounded-lg shadow-xl hover:scale-101 active:scale-99 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4.5 h-4.5" />
                  <span>Style WhatsApp Chat</span>
                </a>

                <div className="bg-[#121212] hover:bg-[#202020] border border-white/5 p-4 rounded-lg flex flex-col justify-center">
                  <p className="text-[10px] text-gray-400 font-sans tracking-wider uppercase">Coordinated Groom Trial</p>
                  <p className="text-white text-xs font-sans font-bold mt-1">Book an atelier slot today</p>
                  <div className="flex items-center text-[#C5A85D] text-[9px] uppercase tracking-wider font-semibold mt-2 group cursor-pointer">
                    <span>Reserve Fitting Slot</span>
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}
