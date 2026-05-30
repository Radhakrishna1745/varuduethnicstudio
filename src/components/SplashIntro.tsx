/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Volume2, VolumeX, Sparkles, SkipForward, Swords, Film, Upload } from 'lucide-react';
import { playRegalGoldChime, getCachedSetting } from '../utils';

interface SplashIntroProps {
  onComplete: () => void;
  onNavigateToCRM: () => void;
}

export default function SplashIntro({ onComplete, onNavigateToCRM }: SplashIntroProps) {
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [animTriggered, setAnimTriggered] = useState(false);
  const [showSparks, setShowSparks] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let active = true;

    // Attempt to load the custom video logo from Firebase Storage
    async function loadCustomVideo() {
      try {
        const firebaseVideoUrl = getCachedSetting('brand', 'brand_logo_video', '');
        if (firebaseVideoUrl) {
          if (active) {
            setVideoBlobUrl(firebaseVideoUrl);
            setHasVideo(true);
          }
        }
      } catch (err) {
        console.warn('Could not read logo video from database, falling back to CSS animation:', err);
      } finally {
        if (active) {
          setLoading(false);
          // Trigger animations
          setTimeout(() => {
            if (active) {
              setAnimTriggered(true);
              // Play the elegant chime sound
              playRegalGoldChime();
            }
          }, 300);
          
          setTimeout(() => {
            if (active) setShowSparks(true);
          }, 1200);

          // Dynamic auto-dismiss timeout from Stylist curation desk
          const rawDuration = getCachedSetting('brand', 'intro_duration', '7');
          if (rawDuration !== 'full') {
            const numSecs = parseInt(rawDuration, 10) || 7;
            setTimeout(() => {
              if (active) {
                handleFinished();
              }
            }, numSecs * 1000);
          }
        }
      }
    }
    loadCustomVideo();

    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const settings = customEvent.detail;
      if (settings && settings.brand && settings.brand.brand_logo_video) {
        if (active) {
          setVideoBlobUrl(settings.brand.brand_logo_video);
          setHasVideo(true);
        }
      }
    };

    window.addEventListener('varudu-settings-updated', handleSettingsUpdate as EventListener);
    window.addEventListener('varudu-photo-updated', loadCustomVideo);

    return () => {
      active = false;
      window.removeEventListener('varudu-settings-updated', handleSettingsUpdate as EventListener);
      window.removeEventListener('varudu-photo-updated', loadCustomVideo);
    };
  }, []);

  // Handle skip/complete
  const handleFinished = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    // Fade out elements
    onComplete();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-t-[#C5A85D] border-gray-100 animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-white text-black flex flex-col justify-between overflow-hidden select-none" id="royal-splash-overlay">
      
      {/* Upper Brand Info bar */}
      <div className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 relative z-30">
        <div className="flex items-center space-x-2 text-[10px] uppercase font-sans font-medium tracking-[0.2em] text-gray-400">
          <Film className="w-4 h-4 text-[#C5A85D] animate-pulse" />
          <span>VARUDU CINEMATIC ENTRY</span>
        </div>
        <button
          onClick={handleFinished}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 border border-black/10 text-xs font-sans font-bold tracking-widest text-[#4A0E17] uppercase transition-all scale-95 hover:scale-100"
        >
          <span>Skip Intro</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Screen Center Stage */}
      <div className="flex-1 flex items-center justify-center relative w-full h-full p-4 sm:p-12">
        
        {hasVideo && videoBlobUrl ? (
          /* PLAY USER-UPLOADED LOGO VIDEO */
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-100 group">
            <video
              ref={videoRef}
              src={videoBlobUrl}
              autoPlay
              playsInline
              muted={isMuted}
              onEnded={handleFinished}
              className="w-full h-full object-contain"
            />
            {/* Play controls overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-between opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 text-white text-xs">
              <span className="font-sans text-[10px] text-gray-300 tracking-wider">
                Playing custom brand media
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded bg-white/20 hover:bg-white/35 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleFinished}
                  className="px-3 py-1.5 bg-[#C5A85D] hover:bg-[#D5B86D] text-black font-semibold rounded"
                >
                  Enter Site
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* HIGH-FIDELITY RECREATION OF LOGO VIDEO VIA FULL CSS ANIMATION */
          <div className="flex flex-col items-center justify-center text-center space-y-6 relative max-w-3xl">
            
            {/* Golden Sparkles in background */}
            {showSparks && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden xl:-m-8">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-gradient-to-r from-[#C5A85D] to-[#E5C46D] rounded-full animate-ping pointer-events-none opacity-40"
                    style={{
                      width: `${Math.random() * 8 + 4}px`,
                      height: `${Math.random() * 8 + 4}px`,
                      left: `${Math.random() * 90 + 5}%`,
                      top: `${Math.random() * 90 + 5}%`,
                      animationDuration: `${Math.random() * 2 + 1}s`,
                      animationDelay: `${Math.random() * 0.5}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Left Shield & Text flex structure */}
            <div className={`flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 transition-all duration-1000 ${animTriggered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              
              {/* Royal Golden Shield (V) */}
              <div className="relative w-32 h-36 md:w-36 md:h-40 shrink-0">
                
                {/* SVG Shield shape mimicking the gold V */}
                <svg viewBox="0 0 100 115" className="w-full h-full fill-none">
                  {/* Glowing golden drop-shadow filter */}
                  <defs>
                    <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8A6623" />
                      <stop offset="30%" stopColor="#C5A85D" />
                      <stop offset="70%" stopColor="#F3E7C4" />
                      <stop offset="100%" stopColor="#B38728" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Left part of V - Diagonal vertical letters: A, R, U, D, U */}
                  <path 
                    d="M 50,110 L 15,35 L 28,35 L 50,85 Z" 
                    fill="url(#gold-grad)" 
                    filter="url(#glow)"
                  />
                  {/* Wing flares / feathers on the right of the V */}
                  <path 
                    d="M 50,110 C 65,95 85,75 80,45 C 78,35 73,28 65,22 C 72,30 74,40 70,52 C 67,60 58,75 50,88 Z" 
                    fill="url(#gold-grad)"
                    filter="url(#glow)"
                  />
                  <path 
                    d="M 50,88 C 58,75 74,58 71,32 C 69,25 64,20 57,15 C 64,22 65,31 62,42 C 59,51 54,62 50,71 Z" 
                    fill="url(#gold-grad)"
                  />
                  <path 
                    d="M 50,71 C 54,61 62,48 59,28 C 57,22 53,18 47,14 C 52,20 52,28 49,36 C 46,43 42,50 42,54 Z" 
                    fill="url(#gold-grad)"
                  />
                </svg>

                {/* Vertical Letters on Left of V */}
                <div className="absolute inset-0 flex flex-col justify-between items-start pl-[28px] py-[44px] pointer-events-none font-serif text-[11px] md:text-[12px] font-bold text-white tracking-widest leading-none drop-shadow">
                  <span>A</span>
                  <span>R</span>
                  <span>U</span>
                  <span>D</span>
                  <span>U</span>
                </div>
                
                {/* Big V letter overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none font-serif text-[44px] md:text-[50px] font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#8A6623] via-yellow-100 to-[#B38728] pl-[10px] md:pl-[12px] pt-[15px] drop-shadow-md select-none">
                  V
                </div>
              </div>

              {/* Text Group */}
              <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-2">
                {/* VARUDU */}
                <h1 className="font-serif font-black text-5xl md:text-7xl tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#8A6623] via-[#E5C46D] to-[#8A6623] animate-shimmer select-none filter drop-shadow">
                  VARUDU
                </h1>

                {/* Ethnic Studio Subtitle with horizontal dividers */}
                <div className="flex items-center space-x-3 w-full">
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#C5A85D]" />
                  <span className="font-sans font-bold text-xs sm:text-sm tracking-[0.4em] uppercase text-[#C5A85D] whitespace-nowrap pl-1">
                    Ethnic Studio
                  </span>
                  <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#C5A85D]" />
                </div>

                {/* Groom Exclusive Subtitle */}
                <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.55em] text-gray-500 font-sans font-semibold font-light w-full text-center md:text-left pl-1">
                  Groom Exclusive
                </div>
              </div>

            </div>

            {/* Quick action button overlay */}
            <div className={`pt-8 flex flex-col items-center space-y-2 transition-all duration-1000 delay-500 ${animTriggered ? 'opacity-100' : 'opacity-0'}`}>
              <button
                onClick={handleFinished}
                className="group relative overflow-hidden px-8 py-3.5 bg-gradient-to-r from-[#4A0E17] to-red-950 text-[#F5EFEB] rounded font-sans text-xs uppercase font-bold tracking-[0.2em] shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#C5A85D] to-[#E5C46D] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <span>Enter Luxury Boutique</span>
              </button>
              
              {/* Optional CRM Quick Jump for Sreenivasulu */}
              <div className="text-[10px] text-gray-400 font-sans pt-4 flex items-center space-x-1">
                <span>Want to upload custom video?</span>
                <button 
                  onClick={onNavigateToCRM}
                  className="text-[#C5A85D] underline font-semibold hover:text-[#4A0E17] transition-colors"
                >
                  Stylist CRM Settings
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Footer guidance note */}
      <div className="w-full text-center py-4 text-[9px] text-gray-300 border-t border-gray-50 border-gray-100 font-sans tracking-widest uppercase relative z-30">
        Varudu Ethnic Studio © {new Date().getFullYear()} • Masterfully Designed for Grooms
      </div>

    </div>
  );
}
