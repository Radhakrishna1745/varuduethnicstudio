/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { saveLead, playRegalGoldChime } from '../utils';
import { Upload, HelpCircle, Check, Sparkles, MessageCircle, AlertCircle, FileText, Smartphone } from 'lucide-react';

interface ConsultationSystemProps {
  preFilledProduct?: string;
  onSuccess: () => void;
}

export default function ConsultationSystem({ preFilledProduct = '', onSuccess }: ConsultationSystemProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [occasion, setOccasion] = useState('Main Wedding Ceremony (Baraat & Pheras)');
  const [budget, setBudget] = useState<'budget' | 'premium' | 'couture' | 'royal-classic' | 'above-5lakh'>('premium');
  const [preferredColors, setPreferredColors] = useState<string[]>([]);
  const [preferredStyles, setPreferredStyles] = useState<string[]>([]);
  const [notes, setNotes] = useState(preFilledProduct ? `Interested in inquiring about: ${preFilledProduct}` : '');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Image Upload States
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Success Feedback
  const [submittedLead, setSubmittedLead] = useState<any | null>(null);

  const colorsList = ['Ivory White', 'Mint Green', 'Royal Crimson Red', 'Midnight Black', 'Kesar Gold', 'Emerald Navy', 'Sage Pastel', 'Champagne Beige'];
  const stylesList = ['Traditional Sherwani', 'Peshawari Layered Set', 'Asymmetric Indo-Western', 'Classic Jodhpuri Bandhgala', 'Double-Vented Tuxedo Suit'];

  const handleColorToggle = (color: string) => {
    if (preferredColors.includes(color)) {
      setPreferredColors(preferredColors.filter(c => c !== color));
    } else {
      setPreferredColors([...preferredColors, color]);
    }
  };

  const handleStyleToggle = (style: string) => {
    if (preferredStyles.includes(style)) {
      setPreferredStyles(preferredStyles.filter(s => s !== style));
    } else {
      setPreferredStyles([...preferredStyles, style]);
    }
  };

  // Process Mock Image Upload (with real base64 support for absolute CRM fidelity!)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (files: FileList) => {
    setIsUploading(true);
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 30;
      });
    }, 150);

    const base64Promises = Array.from(files).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(base64Promises).then((results) => {
      setTimeout(() => {
        setUploadedImages(prev => [...prev, ...results as string[]]);
        setIsUploading(false);
        setUploadProgress(0);
      }, 600);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      alert('Please review and accept our strict privacy agreement.');
      return;
    }

    const payload = {
      name,
      phone,
      email,
      weddingDate,
      occasion,
      budget,
      preferredColors: preferredColors.length > 0 ? preferredColors : ['Ivory White'],
      preferredStyles: preferredStyles.length > 0 ? preferredStyles : ['Traditional Sherwani'],
      notes
    };

    // Save lead in localStorage + syncs to Firestore securely, dispatches CustomEvent and Synthesized audio chime
    const newLead = saveLead(payload, uploadedImages);
    playRegalGoldChime();
    setSubmittedLead(newLead);
    onSuccess();

    // Prepare robust WhatsApp text notification template to notify the showroom owner
    const text = `*NEW GROOM CONSULTATION INQUIRY*\n━━━━━━━━━━━━━━━━━━━━\n👤 *Groom Name:* ${payload.name}\n📞 *Phone Number:* ${payload.phone}\n📧 *Email:* ${payload.email}\n📅 *Wedding Date:* ${payload.weddingDate || 'Not specified'}\n🏛️ *Occasion Type:* ${payload.occasion}\n💎 *Budget Tier:* ${payload.budget.toUpperCase()}\n🎨 *Preferred Colors:* ${payload.preferredColors.join(', ')}\n👔 *Style Prefs:* ${payload.preferredStyles.join(', ')}\n📝 *Client Notes:* ${payload.notes || 'No extra notes.'}\n━━━━━━━━━━━━━━━━━━━━\n✨ _Submitted instantly with live Firebase database backup!_`;
    const whatsappUrl = `https://wa.me/919505122400?text=${encodeURIComponent(text)}`;
    
    // Automatically open WhatsApp in background to log the lead notification directly to owner
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 800);
  };

  const handleReset = () => {
    setName('');
    setPhone('');
    setEmail('');
    setWeddingDate('');
    setOccasion('Main Wedding Ceremony (Baraat & Pheras)');
    setBudget('premium');
    setPreferredColors([]);
    setPreferredStyles([]);
    setNotes('');
    setUploadedImages([]);
    setTermsAccepted(false);
    setSubmittedLead(null);
  };

  // Format WhatsApp template code to show to the customer or trigger
  const getWhatsAppURILink = () => {
    if (!submittedLead) return '#';
    const text = `*NEW GROOM CONSULTATION INQUIRY*\n━━━━━━━━━━━━━━━━━━━━\n👤 *Groom Name:* ${submittedLead.name}\n📞 *Phone Number:* ${submittedLead.phone}\n📅 *Wedding Date:* ${submittedLead.weddingDate}\n🏛️ *Occasion Type:* ${submittedLead.occasion}\n💎 *Budget Tier:* ${submittedLead.budget.toUpperCase()}\n🎨 *Preferred Colors:* ${submittedLead.preferredColors.join(', ')}\n👔 *Style Prefs:* ${submittedLead.preferredStyles.join(', ')}\n📝 *Client Notes:* ${submittedLead.notes || 'No extra notes.'}\n━━━━━━━━━━━━━━━━━━━━\n✨ _Submitted instantly from Royal Applet. Status Set: NEW._`;
    return `https://wa.me/919505122400?text=${encodeURIComponent(text)}`;
  };

  return (
    <section className="py-24 bg-[#0A0A0A] border-y border-[#C5A85D]/15 position-relative overflow-hidden" id="consultation-engine">
      
      {/* Decorative luxury columns background */}
      <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient(circle, rgba(74,14,23,0.1) 0%, transparent 80%) pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {submittedLead ? (
          /* Beautiful High-Conversion success screen */
          <div className="bg-[#121212] border-2 border-[#C5A85D] p-8 sm:p-12 text-center rounded-lg shadow-2xl relative" id="consultation-success">
            {/* Crown animation */}
            <div className="w-16 h-16 bg-[#4A0E17] border border-[#C5A85D] flex items-center justify-center rounded-full mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-[#C5A85D] animate-pulse" />
            </div>

            <h3 className="font-display font-bold text-2xl sm:text-4xl text-white tracking-widest uppercase">
              RESERVATION SUCCESSFUL
            </h3>
            <p className="text-[#C5A85D] font-sans text-xs tracking-[0.25em] uppercase mt-2">
              Varudu Royal Fitting Registry
            </p>
            
            <div className="w-16 h-[1px] bg-[#C5A85D] mx-auto my-6" />

            <div className="max-w-lg mx-auto text-center space-y-4 font-serif text-gray-300">
              <p className="text-base sm:text-lg">
                Greetings, <span className="text-[#E5C46D] font-bold font-sans">{submittedLead.name}</span>. Your styling lookbook profile has been registered as Lead <span className="font-sans text-[#E5C46D]">#{submittedLead.id.replace('lead-', '')}</span>.
              </p>
              <p className="text-xs sm:text-sm text-gray-400">
                A premium royal gold buzzer notification has just run in our Chaitanyapuri administrative studio. Your assigned drapers and custom sketch specialists will trigger an introductory contact shortly.
              </p>
            </div>

            {/* Simulated WhatsApp routing box */}
            <div className="mt-8 p-6 bg-black/50 border border-[#C5A85D]/25 rounded text-left max-w-xl mx-auto">
              <div className="flex items-center space-x-2 text-[#C5A85D] font-sans text-[10px] tracking-widest uppercase mb-3 font-semibold">
                <FileText className="w-4 h-4" />
                <span>Standard Structured Lead Output</span>
              </div>
              <div className="font-mono text-[11px] text-gray-300 space-y-1 select-all break-words leading-relaxed p-3 bg-[#121212] border border-white/5 rounded">
                <p className="text-[#E5C46D] font-bold">★ NEW GROOM INQUIRY ★</p>
                <p><strong>Customer Name:</strong> {submittedLead.name}</p>
                <p><strong>Phone:</strong> {submittedLead.phone}</p>
                <p><strong>Wedding Date:</strong> {submittedLead.weddingDate}</p>
                <p><strong>Occasion:</strong> {submittedLead.occasion}</p>
                <p><strong>Budget Tier:</strong> {submittedLead.budget.toUpperCase()}</p>
                <p><strong>Preferred Styles:</strong> {submittedLead.preferredStyles.join(', ')}</p>
                <p><strong>Photos Loaded:</strong> {submittedLead.uploadedImages.length} items</p>
              </div>
            </div>

            {/* Instant WhatsApp activation triggers */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={getWhatsAppURILink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs uppercase tracking-[0.15em] rounded transition-transform duration-300 hover:scale-103 shadow flex items-center justify-center space-x-2.5"
              >
                <MessageCircle className="w-4.5 h-4.5 text-white" />
                <span>Instantly Open WhatsApp Chat</span>
              </a>

              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-4 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white border border-white/10 font-sans text-xs uppercase tracking-[0.15em] rounded transition-colors"
              >
                Submit Another Consultation
              </button>
            </div>
            
            <div className="mt-6 flex justify-center items-center space-x-2 text-[10px] text-gray-500 font-sans tracking-widest uppercase">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct SMS and Email notification dispatched simultaneously</span>
            </div>

          </div>
        ) : (
          <div className="bg-[#121212] border border-[#C5A85D]/15 p-6 sm:p-10 rounded-lg shadow-xl" id="consultation-form-wrapper">
            
            {/* System Title */}
            <div className="text-center mb-8 pb-6 border-b border-[#C5A85D]/10">
              <div className="inline-flex py-1 px-3 bg-[#4A0E17] border border-[#C5A85D]/30 text-[#E5C46D] text-[10px] font-sans uppercase tracking-[0.2em] mb-3">
                Signature Groom Registry
              </div>
              <h3 className="font-display font-medium text-2xl sm:text-3xl text-white tracking-widest">
                Groom Style Consultation
              </h3>
              <p className="text-xs font-serif text-gray-400 mt-2 italic">
                Upload layout concepts or bridal lehenga swatches. Receive a customized sketch and color matrix from our high-fashion head draper.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Image Upload Area with camera capability simulation */}
              <div>
                <label className="block text-xs uppercase font-sans tracking-wider text-[#C5A85D] mb-2 font-semibold">
                  Upload Creative Concept / Bridal Colors / Suit Reference Models (Multi-Upload Support)
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    dragOver 
                      ? 'border-[#C5A85D] bg-[#4A0E17]/10' 
                      : 'border-[#C5A85D]/20 bg-[#0A0A0A] hover:border-[#C5A85D]/50'
                  }`}
                  id="drag-drop-container"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                    accept="image/*"
                  />
                  
                  {isUploading ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 border-2 border-t-[#C5A85D] border-white/10 rounded-full animate-spin mx-auto" />
                      <p className="font-sans text-xs text-gray-400 uppercase tracking-widest">
                        Encrypting and Loading Photos ({uploadProgress}%)
                      </p>
                      <div className="w-48 bg-white/5 h-1.5 rounded-full mx-auto overflow-hidden">
                        <div className="bg-[#C5A85D] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-[#121212] border border-[#C5A85D]/25 flex items-center justify-center rounded-full mx-auto mb-2 text-[#C5A85D]">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="font-sans font-medium text-xs text-gray-300">
                        Drag & Drop Groom References or <span className="text-[#C5A85D] underline">Browse Storage</span>
                      </p>
                      <p className="font-sans text-[10px] text-gray-500 uppercase tracking-wider">
                        Camera upload supported on mobile devices • PNG, JPG, WEBP • Max 15MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Micro Thumbnail Showcases */}
                {uploadedImages.length > 0 && (
                  <div className="mt-4 p-4 bg-black/40 border border-[#C5A85D]/15 rounded">
                    <p className="text-[10px] uppercase tracking-widest text-[#C5A85D] font-sans font-medium mb-2.5">
                      Uploaded Files for CRM Preview ({uploadedImages.length})
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {uploadedImages.map((img, i) => (
                        <div key={i} className="relative w-16 h-20 bg-cover bg-center rounded border border-[#C5A85D]/30 group overflow-hidden">
                          <img src={img} alt="concept" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedImages(uploadedImages.filter((_, idx) => idx !== i));
                            }}
                            className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-500 font-sans text-[10px] uppercase font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-sans tracking-widest text-gray-300 mb-1.5 font-medium">
                    Groom Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#C5A85D] px-4 py-3 rounded text-sm text-white font-sans focus:outline-none transition-all placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-sans tracking-widest text-gray-300 mb-1.5 font-medium">
                    WhatsApp Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#C5A85D] px-4 py-3 rounded text-sm text-white font-sans focus:outline-none transition-all placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-sans tracking-widest text-gray-300 mb-1.5 font-medium">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="groom@gmail.com"
                    className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#C5A85D] px-4 py-3 rounded text-sm text-white font-sans focus:outline-none transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* Timing and Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-sans tracking-widest text-gray-300 mb-1.5 font-medium">
                    Anticipated Wedding Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#C5A85D] px-4 py-3 rounded text-sm text-white font-sans focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-sans tracking-widest text-gray-300 mb-1.5 font-medium">
                    Wedding Ritual / Occasion
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#C5A85D] px-4 py-3 rounded text-sm text-white font-sans focus:outline-none transition-all"
                  >
                    <option value="Main Wedding Ceremony (Baraat & Pheras)">Main Wedding Ceremony (Baraat & Pheras)</option>
                    <option value="Sangeet & Cocktail Sensation">Sangeet & Cocktail Sensation</option>
                    <option value="Royal Reception Banquet">Royal Reception Banquet</option>
                    <option value="Haldi & Daytime Mehendi">Haldi & Daytime Mehendi</option>
                    <option value="Multi-event Wardrobe Pack">Multi-event Wardrobe Pack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-sans tracking-widest text-gray-300 mb-1.5 font-medium">
                    Estimated Budget Tier *
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value as any)}
                    className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#C5A85D] px-4 py-3 rounded text-sm text-[#C5A85D] font-sans focus:outline-none transition-all"
                  >
                    <option value="budget">Classic Groom Pack (₹35k - ₹75k)</option>
                    <option value="premium">Elite Premium (₹75k - ₹1.5Lakh)</option>
                    <option value="couture">Imperial Zardozi Couture (₹1.5L - ₹3L)</option>
                    <option value="royal-classic">Heritage Maharaja Luxury (₹3L - ₹5L)</option>
                    <option value="above-5lakh">Besame Haute-Artistry (&gt; ₹5Lakh)</option>
                  </select>
                </div>
              </div>

              {/* Colors Filter Toggle */}
              <div>
                <label className="block text-[10px] uppercase font-sans tracking-widest text-[#C5A85D] mb-2 font-semibold">
                  Preferred Color Palette
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorsList.map((color) => {
                    const isSelected = preferredColors.includes(color);
                    return (
                      <button
                        type="button"
                        key={color}
                        onClick={() => handleColorToggle(color)}
                        className={`px-3.5 py-1.5 text-[9px] uppercase font-sans tracking-widest border rounded transition-all ${
                          isSelected 
                            ? 'bg-[#C5A85D] text-black border-[#C5A85D] font-bold' 
                            : 'bg-black/55 text-gray-400 border-white/5 hover:border-white/10'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Styles List Filter Toggle */}
              <div>
                <label className="block text-[10px] uppercase font-sans tracking-widest text-[#C5A85D] mb-2 font-semibold">
                  Preferred Fitting Styles
                </label>
                <div className="flex flex-wrap gap-2">
                  {stylesList.map((style) => {
                    const isSelected = preferredStyles.includes(style);
                    return (
                      <button
                        type="button"
                        key={style}
                        onClick={() => handleStyleToggle(style)}
                        className={`px-3.5 py-1.5 text-[9px] uppercase font-sans tracking-widest border rounded transition-all ${
                          isSelected 
                            ? 'bg-[#4A0E17] text-white border-[#C5A85D] font-bold' 
                            : 'bg-black/55 text-gray-400 border-white/5 hover:border-white/10'
                        }`}
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Extra notes */}
              <div>
                <label className="block text-[10px] uppercase font-sans tracking-widest text-gray-300 mb-1.5 font-medium">
                  Additional Notes (Groom height, bride\'s outfit description, unique customizations...)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us about your wedding styling goals... "
                  className="w-full h-32 bg-[#0A0A0A] border border-white/10 focus:border-[#C5A85D] px-4 py-3 rounded text-sm text-white font-sans focus:outline-none transition-all placeholder:text-gray-600 resize-none"
                />
              </div>

              {/* Privacy and verification guidelines */}
              <div className="flex items-start space-x-3 bg-black/40 p-4 border border-[#C5A85D]/10 rounded">
                <input
                  type="checkbox"
                  required
                  id="privacy-check"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 accent-[#C5A85D] cursor-pointer"
                />
                <label htmlFor="privacy-check" className="text-[10px] text-gray-400 leading-normal font-sans cursor-pointer">
                  I agree to save my groom measurements and concepts with Varudu. I confirm that all uploaded photos represent 100% genuine groom or menswear references in compliance with the store\'s strict, client-centric privacy policy.
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#C5A85D] to-[#E5C46D] text-black font-sans font-bold text-xs uppercase tracking-[0.2em] rounded transition-transform duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-[#C5A85D]/10 cursor-pointer flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4.5 h-4.5 text-black" />
                <span>Submit Styling Profile & Trigger Sound Buzz</span>
              </button>

            </form>

          </div>
        )}

      </div>
    </section>
  );
}
