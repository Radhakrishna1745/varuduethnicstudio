/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  HelpCircle, ChevronDown, ChevronUp, Search, Sparkles, 
  Ruler, Flame, CalendarClock, MessageCircle, ArrowRight,
  ShieldAlert, Scissors
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'fitting' | 'care' | 'timeline';
  tags: string[];
}

export default function GroomFAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'fitting' | 'care' | 'timeline'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('fitting-1');

  const faqData: FAQItem[] = [
    // --- CATEGORY: FITTING ---
    {
      id: 'fitting-1',
      category: 'fitting',
      question: 'What is the default seam adjustment allowance on a custom Varudu sherwani?',
      answer: 'Our handcrafted sherwanis are structured with up to 1.5 to 2.0 inches of hidden inside vertical seam expanders. This allows our master tailors to easily adjust the outfit to match any subtle anatomical changes or weight fluctuations as your wedding pheras date triggers closer.',
      tags: ['seam allowance', 'alterations', 'sizes', 'tailoring margins']
    },
    {
      id: 'fitting-2',
      category: 'fitting',
      question: 'How do you handle size measurements for NRI or out-of-town grooms?',
      answer: 'We host dedicated remote consultation sessions over video calls. Our executive design board will guide you on custom skeletal measurements step-by-step. Alternatively, you can send us a self-provided well-fitting sample garment, or utilize our premium measurement kit shipped right to your address.',
      tags: ['nri measurements', 'video support', 'remote sizing', 'fitting trial']
    },
    {
      id: 'fitting-3',
      category: 'fitting',
      question: 'How many personal trials will I need in the styling lounge before the main wedding day?',
      answer: 'Typically, only 2 sessions are required. The first session takes place immediately after the initial raw baste structure is constructed (to pin down precision drape constraints). The final trial happens about 2 weeks before dispatch to ensure absolute posture match with the matching handcrafted footwear (Juti) and Safa (turban).',
      tags: ['trial count', 'fitting sessions', 'final trial', 'bespoke schedule']
    },
    {
      id: 'fitting-4',
      category: 'fitting',
      question: 'Can you customize the inner lining fabric for hot pre-wedding weather?',
      answer: 'Absolutely. We offer lightweight, hypoallergenic premium organic cotton-silk blends or ultra-breathable micro-modal inner linings. This keeps the groom high-comfort under warm outdoor climates, intense wedding canopy lighting, or long ceremonial rituals without sacrificing the stiff regal outer structure.',
      tags: ['inner lining', 'summer wedding', 'breathable fabrics', 'comfort fitting']
    },

    // --- CATEGORY: FABRIC CARE ---
    {
      id: 'care-1',
      category: 'care',
      question: 'How should I store and preserve my Zardozi real copper wire embroidery after the wedding?',
      answer: 'Zardozi wire-work is layered with precious metallic plating that naturally reacts with atmospheric moisture. Store your couture flat or hung on our custom padded timber hangers, wrapped in the specialized organic white cotton dust-cover bags provided. Never place them inside standard plastic cases or air-tight synthetic wraps, which trap moisture and cause oxidation.',
      tags: ['zardozi care', 'embroidery preservation', 'dust cover', 'gold wire']
    },
    {
      id: 'care-2',
      category: 'care',
      question: 'What are the cleaning protocols for heavy velvet or raw handloom silk outfits?',
      answer: 'Varudu apparel is strictly dry-clean only. We recommend choosing specialized heritage curators experienced in pure copper zardozi and antique textiles. For swift emergency spot cleaning during the wedding event, gently dab using dry cotton swabs from the inside. Do not apply commercial solvents or heavy friction to the front face.',
      tags: ['dry cleaning', 'spot cleaning', 'raw silk', 'velvet care']
    },
    {
      id: 'care-3',
      category: 'care',
      question: 'How do I iron or remove transit wrinkles from heavy silk sherwanis and kurtas?',
      answer: 'Always use low-temperature vertical steam iron with a clean cotton protective cloth sheet (such as a muslin layer) placed between the steam nozzle and the fabric. Never press a traditional hot metal iron directly onto pure raw silk or delicate gold-plated embroidery threads, as high structural heat will burn the filament structures.',
      tags: ['steaming', 'ironing rules', 'crease removal', 'silk finish']
    },

    // --- CATEGORY: TIMELINE ---
    {
      id: 'timeline-1',
      category: 'timeline',
      question: 'What is the required lead time to construct a fully custom royal groom outfit?',
      answer: 'Our master craftsmen invest 60 to 90 hours of manual weave-work per outfit. Therefore, we prefer orders booked at least 6 to 8 weeks in advance of your first celebratory event. However, for urgent requirements, we can trigger active fast-track slots (Super VIP Express lanes) to deliver within 15 to 20 days under dedicated master supervision.',
      tags: ['lead time', 'order timeframe', 'rush orders', 'production slot']
    },
    {
      id: 'timeline-2',
      category: 'timeline',
      question: 'What happens if my wedding gets rescheduled? Can you hold the outfit?',
      answer: 'Yes. We offer complimentary vaulting in our temperature-controlled atelier archives for up to 6 months. We will pause final stitching processes at the raw-fabric stage and resume tailors when you confirm your new dates, ensuring your posture and sizing remain fully aligned with your actual celebration day.',
      tags: ['rescheduling', 'vault warehouse', 'hold order', 'postpone wedding']
    },
    {
      id: 'timeline-3',
      category: 'timeline',
      question: 'How do you coordinate dress timing for the grooms groomsmen or immediate family?',
      answer: 'We design cohesive family color schemes. We block dedicated styling slots for groomsmen, fathers, and brothers. We recommend initiating groomsmen catalog consults 4 weeks before the ceremony to secure identical yarn dyelots, matching safa turbans, and unified pocket square accents.',
      tags: ['groomsmen coordination', 'family color matching', 'safa turban drapes']
    }
  ];

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFaqs = faqData.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="py-20 bg-[#0A0A0A] text-white" id="groom-couture-faq-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading with Royal aesthetics */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#4A0E17]/60 text-[#E5C46D] px-4 py-1.5 rounded-full text-[10px] tracking-[0.25em] font-sans font-bold uppercase mb-4 border border-[#C5A85D]/20">
            <Sparkles className="w-3 h-3 text-[#C5A85D]" />
            <span>Master Stylists Knowledge Board</span>
          </div>
          <h2 className="font-display font-medium text-3xl sm:text-4xl text-white tracking-[0.1em] uppercase mb-4 leading-normal">
            Groom Couture <span className="text-[#C5A85D]">FAQ Hub</span>
          </h2>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C5A85D] to-transparent mx-auto mb-6" />
          <p className="font-serif text-sm text-gray-400 leading-relaxed tracking-wide">
            Detailed archival knowledge on tailored sherwani fitting structures, Zardozi preservation guidelines, and pre-wedding timeline coordination constructed specifically to ensure the elite Varudu groom remains impeccably royal.
          </p>
        </div>

        {/* Dynamic Search & Categorized Navigation Row */}
        <div className="bg-[#121212] border border-[#C5A85D]/20 rounded-xl p-6 mb-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Categorized Filter Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {[
              { id: 'all', label: 'All Knowledge', icon: HelpCircle },
              { id: 'fitting', label: 'Fitting & Silhouette', icon: Ruler },
              { id: 'care', label: 'Fabric Care & Zardozi', icon: Flame },
              { id: 'timeline', label: 'Timeline & Delivery', icon: CalendarClock }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 rounded text-xs tracking-wider uppercase font-sans font-medium transition-all ${
                    isActive
                      ? 'bg-[#4A0E17] text-[#E5C46D] border border-[#C5A85D]/40 shadow-lg'
                      : 'bg-black/40 text-gray-400 hover:text-white hover:bg-black border border-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Elegant Search bar input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search fitting, silk, dry clean..."
              className="w-full bg-black/60 border border-white/10 rounded px-4 py-2.5 pl-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A85D] transition-colors"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          </div>

        </div>

        {/* FAQ Grid with Sidebar Highlight Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Essential Guidelines Highlights */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-[#121212]/90 border border-white/5 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 bg-gradient-to-bl from-[#4A0E17]/20 to-transparent pointer-events-none" />
              <div className="flex items-center space-x-2 text-[#E5C46D] mb-4">
                <Scissors className="w-4 h-4" />
                <h4 className="font-sans font-bold text-xs uppercase tracking-widest">Atelier Sizing Promise</h4>
              </div>
              <p className="font-serif text-xs text-gray-300 leading-relaxed mb-4">
                "Our designs never restrict. A Varudu sherwani is custom-sculpted around active posture maps, ensuring you stand with ultimate comfort during pheras, hand shakes, and royal grand entrances."
              </p>
              <span className="text-[10px] text-gray-500 font-sans block uppercase tracking-[0.2em]">— Master Pattern Cutter, Varudu Studio</span>
            </div>

            <div className="bg-[#121212]/90 border border-[#C5A85D]/20 rounded-xl p-6 relative overflow-hidden">
              <div className="flex items-center space-x-2 text-[#E5C46D] mb-4">
                <ShieldAlert className="w-4 h-4" />
                <h4 className="font-sans font-bold text-xs uppercase tracking-widest">Heritage Care Alert</h4>
              </div>
              <ul className="space-y-3.5 font-serif text-xs text-gray-300 leading-relaxed list-disc list-inside">
                <li>Never spray alcohol or strong perfumes directly on high-grade gold-plated zardozi wire thread.</li>
                <li>Ensure dry cleaning is done solely with organic gentle chemical solvents.</li>
                <li>Store in breathable woven cases, never air-tight vinyl wraps.</li>
              </ul>
            </div>

            {/* Direct WhatsApp Concierge Help Card */}
            <div className="bg-gradient-to-br from-[#4A0E17] to-[#1a0508] border-2 border-[#C5A85D]/40 rounded-xl p-6 text-center space-y-4">
              <h4 className="font-sans font-bold text-base text-[#E5C46D] tracking-wider uppercase">Need Instant Stylist Guidance?</h4>
              <p className="font-serif text-xs text-gray-200 leading-relaxed">
                Connect directly with our master designers in Chaitanyapuri Lounge via WhatsApp. Send custom sketches or seek rapid sizing solutions.
              </p>
              <a 
                href="https://wa.me/919000777265?text=Hello%20Varudu%20Ethnic%20Studio%20stylist!%20I%20have%20an%20inquiry%20regarding%20groom%20sherwani%20fitting%20and%20timeline%20coordination."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center space-x-2 w-full py-3 bg-[#E5C46D] hover:bg-[#F5D47D] text-black font-sans text-xs font-bold uppercase tracking-widest rounded transition-all shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Stylist</span>
              </a>
            </div>

          </div>

          {/* Right/Middle Column: Accordion Lists (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            
            {filteredFaqs.length === 0 ? (
              <div className="bg-[#121212] border border-white/5 rounded-xl p-12 text-center">
                <HelpCircle className="w-12 h-12 text-[#C5A85D]/30 mx-auto mb-4" />
                <h4 className="text-white font-sans font-bold uppercase tracking-widest mb-1">No Matching Inquiries Found</h4>
                <p className="text-gray-400 text-xs font-serif">Try searching with other generic terms like "measurement", "silk", "trial" or select another category above.</p>
              </div>
            ) : (
                filteredFaqs.map(faq => {
                  const isOpen = expandedId === faq.id;
                  return (
                    <div 
                      key={faq.id} 
                      className={`bg-[#121212] border transition-all duration-300 rounded-lg overflow-hidden ${
                        isOpen ? 'border-[#C5A85D] shadow-xl' : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() => handleToggle(faq.id)}
                        className="w-full flex items-center justify-between p-5 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-start space-x-3 pr-4">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider uppercase shrink-0 mt-1 ${
                            faq.category === 'fitting' ? 'bg-[#5B3E13] text-[#FFE8B8]' :
                            faq.category === 'care' ? 'bg-[#4A0E17] text-[#FFEBEB]' : 'bg-black/60 text-indigo-200'
                          }`}>
                            {faq.category}
                          </span>
                          <span className="font-sans font-semibold text-sm sm:text-base text-white hover:text-[#E2C063] transition-colors leading-snug">
                            {faq.question}
                          </span>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-[#C5A85D] shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
                        )}
                      </button>

                      {/* Accordion Content */}
                      <div 
                        className={`transition-all duration-500 overflow-hidden ${
                          isOpen ? 'max-h-96 border-t border-white/5' : 'max-h-0'
                        }`}
                      >
                        <div className="p-6 font-serif text-sm text-gray-300 leading-relaxed space-y-4 bg-black/20">
                          <p>{faq.answer}</p>
                          
                          {/* Tags Section */}
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {faq.tags.map(tag => (
                              <span 
                                key={tag} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSearchTerm(tag);
                                }}
                                className="text-[10px] font-mono text-[#C5A85D]/80 hover:text-[#C5A85D] hover:underline cursor-pointer bg-[#C5A85D]/5 px-2 py-0.5 rounded border border-[#C5A85D]/10"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })
            )}

            {/* Schema Meta optimization search keyword boost section (visual footer in corner) */}
            <div className="pt-6 text-center lg:text-left">
              <p className="text-[11px] font-sans text-gray-500 uppercase tracking-widest flex items-center justify-center lg:justify-start gap-1">
                <span>Optimized Groom Couture search indexing active</span>
                <span className="text-emerald-500 font-bold">&bull; Live update matched</span>
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
