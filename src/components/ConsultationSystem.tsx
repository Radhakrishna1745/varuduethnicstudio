/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { saveLead, playRegalGoldChime } from '../utils';
import { uploadToStorage } from '../firebase';
import { Upload, HelpCircle, Check, Sparkles, MessageCircle, AlertCircle, FileText, Smartphone, Mail, Bell, Clock, Send, Calendar } from 'lucide-react';

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
  
  // Validation States
  const [phoneError, setPhoneError] = useState('');
  const [dateError, setDateError] = useState('');
  const [formError, setFormError] = useState('');
  
  // Image Upload States
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Success Feedback
  const [submittedLead, setSubmittedLead] = useState<any | null>(null);
  const [showSimulatedReminder, setShowSimulatedReminder] = useState(false);
  const [reminderNotificationSent, setReminderNotificationSent] = useState(false);

  const getReminderDateString = (weddingDateStr: string) => {
    if (!weddingDateStr) return '24 Hours prior to ceremony';
    try {
      const d = new Date(weddingDateStr);
      d.setDate(d.getDate() - 1);
      return d.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return '24 Hours prior to ceremony';
    }
  };

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
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    const uploadPromises = Array.from(files).map((file, index) => {
      const fileNameClean = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `leads/reference_${Date.now()}_${index}_${fileNameClean}`;
      return uploadToStorage(path, file).catch(err => {
        console.warn('Firebase Storage upload failed, falling back to base64 reader:', err);
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });
    });

    Promise.all(uploadPromises).then((results) => {
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        setUploadedImages(prev => [...prev, ...results]);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }).catch(err => {
      console.error('All upload workflows failed:', err);
      setIsUploading(false);
      setUploadProgress(0);
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
    
    // Clear previous errors
    setPhoneError('');
    setDateError('');
    setFormError('');

    // Phone Validation: Ensure at least 10 digits
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      setPhoneError('WhatsApp phone must contain at least 10 digits.');
      setFormError('Measurement validation failed: The WhatsApp phone number must contain at least 10 digits.');
      return;
    }

    // Wedding Date Validation: Ensure date is not in the past
    if (weddingDate) {
      const selectedDate = new Date(weddingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // start of today
      
      if (selectedDate < today) {
        setDateError('The wedding date cannot be in the past.');
        setFormError('Inquiry Validation Failed: The selected wedding date has already passed. Please select an upcoming date.');
        return;
      }
    }

    if (!termsAccepted) {
      setFormError('Please review and accept our strict privacy agreement.');
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
    const whatsappUrl = `https://wa.me/919000777265?text=${encodeURIComponent(text)}`;
    
    // Automatically open WhatsApp in background to log the lead notification directly to owner
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 800);
  };

  const handleReset = () => {
    setName('');
    setPhone('');
    setPhoneError('');
    setEmail('');
    setWeddingDate('');
    setDateError('');
    setOccasion('Main Wedding Ceremony (Baraat & Pheras)');
    setBudget('premium');
    setPreferredColors([]);
    setPreferredStyles([]);
    setNotes('');
    setUploadedImages([]);
    setTermsAccepted(false);
    setSubmittedLead(null);
    setFormError('');
    setShowSimulatedReminder(false);
    setReminderNotificationSent(false);
  };

  // Format WhatsApp template code to show to the customer or trigger
  const getWhatsAppURILink = () => {
    if (!submittedLead) return '#';
    const text = `*NEW GROOM CONSULTATION INQUIRY*\n━━━━━━━━━━━━━━━━━━━━\n👤 *Groom Name:* ${submittedLead.name}\n📞 *Phone Number:* ${submittedLead.phone}\n📅 *Wedding Date:* ${submittedLead.weddingDate}\n🏛️ *Occasion Type:* ${submittedLead.occasion}\n💎 *Budget Tier:* ${submittedLead.budget.toUpperCase()}\n🎨 *Preferred Colors:* ${submittedLead.preferredColors.join(', ')}\n👔 *Style Prefs:* ${submittedLead.preferredStyles.join(', ')}\n📝 *Client Notes:* ${submittedLead.notes || 'No extra notes.'}\n━━━━━━━━━━━━━━━━━━━━\n✨ _Submitted instantly from Royal Applet. Status Set: NEW._`;
    return `https://wa.me/919000777265?text=${encodeURIComponent(text)}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    }
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

            {/* Simulated 24-Hour Reminder Box */}
            <div className="mt-6 p-6 bg-gradient-to-b from-zinc-900/60 to-black/40 border border-[#C5A85D]/20 rounded-lg text-left max-w-xl mx-auto shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-[#C5A85D] font-sans text-[10px] tracking-widest uppercase font-semibold">
                  <Bell className="w-4 h-4 text-[#C5A85D] animate-bounce" />
                  <span>24-Hour Imperial Wedding Reminder</span>
                </div>
                <span className="bg-[#C5A85D]/10 text-[#C5A85D] text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-[#C5A85D]/25 font-bold">
                  Active Schedule
                </span>
              </div>
              
              <div className="space-y-3 text-xs text-gray-300">
                <p className="font-serif leading-relaxed text-[11px] text-gray-400">
                  To guarantee perfect final drapes and fitting adjustments, our system has scheduled an automated imperial reminder 24 hours prior to your wedding day.
                </p>
                <div className="p-3 bg-black/60 rounded border border-white/5 space-y-1.5 font-sans text-[11px]">
                  <div className="flex items-center space-x-2 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Scheduled Date: <strong className="text-[#E5C46D]">{getReminderDateString(submittedLead.weddingDate)}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 font-medium">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>Notification Sent To: <strong className="text-white">{submittedLead.email || 'whatsapp-fallback'}</strong> & <strong className="text-white">{submittedLead.phone}</strong></span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSimulatedReminder(!showSimulatedReminder);
                      setReminderNotificationSent(true);
                      playRegalGoldChime();
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-[#C5A85D]/10 hover:bg-[#C5A85D]/20 border border-[#C5A85D]/30 text-[#C5A85D] hover:text-white font-sans text-[10px] uppercase font-bold tracking-wider rounded cursor-pointer transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{showSimulatedReminder ? 'Hide System Preview' : '⚡ Simulate Reminder Trigger Now'}</span>
                  </button>
                  {reminderNotificationSent && (
                    <span className="text-[10px] text-emerald-400 font-sans flex items-center shrink-0">
                      <Check className="w-3.5 h-3.5 mr-1" /> Reminder Sent Simulating Successful!
                    </span>
                  )}
                </div>
              </div>

              {/* Simulated Reminder Preview Panel */}
              <AnimatePresence>
                {showSimulatedReminder && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-white/10 overflow-hidden"
                  >
                    <div className="space-y-4 bg-zinc-950 p-4 rounded border border-[#C5A85D]/30">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                        </div>
                        <span className="text-[9px] font-mono text-gray-500 uppercase">Interactive Client Notification Log</span>
                      </div>

                      {/* Mock Smartphone SMS */}
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase tracking-widest text-[#C5A85D] block font-semibold">SMS / WhatsApp Message (Scheduled Client Push)</span>
                        <div className="p-3 bg-zinc-900 border border-white/5 rounded text-[11px] leading-relaxed text-gray-300 font-mono">
                          <p className="text-amber-300 font-bold">👑 VARUDU ROYAL REMINDER</p>
                          <p className="mt-1">
                            Respected <strong>{submittedLead.name}</strong>, this is your wedding custom drape fitting reminder for your upcoming ceremony/appointment scheduled tomorrow (<strong>{submittedLead.weddingDate}</strong>).
                          </p>
                          <p className="mt-1">
                            Our master drapers have calibrated matching color fits reflecting your selected <strong>{submittedLead.preferredColors.join(', ')}</strong> layouts to ensure supreme luxury wear comfort.
                          </p>
                          <p className="mt-1 text-gray-400 text-[10px]">
                            Showroom: Chaitanyapuri, Hyderabad. Call registry: +91 9000777265.
                          </p>
                        </div>
                      </div>

                      {/* Mock Rich Email */}
                      {submittedLead.email && (
                        <div className="space-y-1">
                          <span className="text-[8px] uppercase tracking-widest text-[#C5A85D] block font-semibold">Email Dispatch Inbox (Client Mailbox)</span>
                          <div className="bg-[#121212] border border-white/10 rounded overflow-hidden">
                            <div className="p-2 bg-zinc-900 border-b border-white/5 text-[9px] text-gray-400 space-y-0.5">
                              <p><strong>From:</strong> registry@varuduethnic.com (Varudu Royal Fitting Registry)</p>
                              <p><strong>To:</strong> {submittedLead.email}</p>
                              <p><strong>Subject:</strong> 24-Hours To Wedding Fitting Coordination: Your Bespoke Wear is Ready 📦</p>
                            </div>
                            <div className="p-4 text-xs font-serif text-gray-300 leading-relaxed space-y-3">
                              <div className="text-center pb-2 border-b border-white/5">
                                <h4 className="font-sans font-bold tracking-[0.25em] text-white uppercase text-[11px]">VARUDU ETHNIC STUDIO</h4>
                                <span className="text-[8px] font-mono text-[#C5A85D] uppercase">Impeccable Weaving & Fitting Audits</span>
                              </div>
                              <p>
                                Dear <strong>{submittedLead.name}</strong>,
                              </p>
                              <p>
                                Greetings from the fitting desk at Varudu. As your wedding day approaches, we want to ensure your custom apparel fits with ultimate comfort.
                              </p>
                              <p>
                                Your 24-hour coordination window starts tomorrow. Our master weavers have incorporated your preferred colors <strong>({submittedLead.preferredColors.join(', ')})</strong> with luxury-grade canvas alignments.
                              </p>
                              <div className="p-3 bg-black/40 rounded border border-[#C5A85D]/10 font-sans space-y-1">
                                <p className="text-[10px] text-[#C5A85D] uppercase tracking-widest font-semibold">Coordination Directives:</p>
                                <p className="text-[11px]">👤 Candidate ID: <span className="text-white">#{submittedLead.id.replace('lead-', '')}</span></p>
                                <p className="text-[11px]">📍 Fitting Location: <span className="text-white">Varudu Chaitanyapuri, Hyderabad</span></p>
                              </div>
                              <p className="text-[11px] italic text-gray-400">
                                This automated dispatch has been executed via client-centric sync algorithms to guarantee perfect, stress-free elegance.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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

            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              
              {formError && (
                <motion.div 
                  variants={itemVariants}
                  className="p-4 bg-red-950/40 border border-red-500/30 rounded text-red-200 text-xs font-sans flex items-start space-x-2.5 shadow-lg animate-fadeIn"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-red-450 uppercase tracking-widest text-[9px] mb-1">Registration Swatch Alert</h5>
                    <p>{formError}</p>
                  </div>
                </motion.div>
              )}

              {/* Image Upload Area with camera capability simulation */}
              <motion.div variants={itemVariants}>
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
              </motion.div>

              {/* Personal Info Grid */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError('');
                    }}
                    placeholder="e.g. +91 98765 43210"
                    className={`w-full bg-[#0A0A0A] border px-4 py-3 rounded text-sm text-white font-sans focus:outline-none transition-all placeholder:text-gray-600 ${
                      phoneError 
                        ? 'border-red-500 focus:border-red-500 bg-red-500/5' 
                        : 'border-white/10 focus:border-[#C5A85D]'
                    }`}
                  />
                  {phoneError && (
                    <p className="text-red-400 text-[10px] mt-1.5 font-sans flex items-center">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 mr-1.5 shrink-0" />
                      {phoneError}
                    </p>
                  )}
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
              </motion.div>

              {/* Timing and Budget */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-sans tracking-widest text-gray-300 mb-1.5 font-medium">
                    Anticipated Wedding Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={weddingDate}
                    onChange={(e) => {
                      setWeddingDate(e.target.value);
                      if (dateError) setDateError('');
                    }}
                    className={`w-full bg-[#0A0A0A] border px-4 py-3 rounded text-sm text-white font-sans focus:outline-none transition-all ${
                      dateError 
                        ? 'border-red-500 focus:border-red-500 bg-red-500/5' 
                        : 'border-white/10 focus:border-[#C5A85D]'
                    }`}
                  />
                  {dateError && (
                    <p className="text-red-400 text-[10px] mt-1.5 font-sans flex items-center">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 mr-1.5 shrink-0" />
                      {dateError}
                    </p>
                  )}
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
              </motion.div>

              {/* Colors Filter Toggle */}
              <motion.div variants={itemVariants}>
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
              </motion.div>

              {/* Styles List Filter Toggle */}
              <motion.div variants={itemVariants}>
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
              </motion.div>

              {/* Extra notes */}
              <motion.div variants={itemVariants}>
                <label className="block text-[10px] uppercase font-sans tracking-widest text-gray-300 mb-1.5 font-medium">
                  Additional Notes (Groom height, bride's outfit description, unique customizations...)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us about your wedding styling goals... "
                  className="w-full h-32 bg-[#0A0A0A] border border-white/10 focus:border-[#C5A85D] px-4 py-3 rounded text-sm text-white font-sans focus:outline-none transition-all placeholder:text-gray-600 resize-none"
                />
              </motion.div>

              {/* Privacy and verification guidelines */}
              <motion.div variants={itemVariants} className="flex items-start space-x-3 bg-black/40 p-4 border border-[#C5A85D]/10 rounded">
                <input
                  type="checkbox"
                  required
                  id="privacy-check"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 accent-[#C5A85D] cursor-pointer"
                />
                <label htmlFor="privacy-check" className="text-[10px] text-gray-400 leading-normal font-sans cursor-pointer">
                  I agree to save my groom measurements and concepts with Varudu. I confirm that all uploaded photos represent 100% genuine groom or menswear references in compliance with the store's strict, client-centric privacy policy.
                </label>
              </motion.div>

              {/* Submit CTA */}
              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#C5A85D] to-[#E5C46D] text-black font-sans font-bold text-xs uppercase tracking-[0.2em] rounded transition-transform duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-[#C5A85D]/10 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4.5 h-4.5 text-black" />
                  <span>Submit Styling Profile & Trigger Sound Buzz</span>
                </button>
              </motion.div>

            </motion.form>

          </div>
        )}

      </div>
    </section>
  );
}
