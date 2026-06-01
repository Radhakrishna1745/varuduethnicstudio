/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductCollection, StyleBlog, StoreLocation, Testimonial } from './types';

export const COLLECTIONS: ProductCollection[] = [
  {
    id: 'coll-royal-zardozi',
    name: 'Imperial Zardozi Sherwani',
    category: 'Sherwani',
    description: 'Our signature bridal sherwani handcrafted with real gold-coated metallic threads, semiprecious stone encrustings, and premium banarasi silk backings.',
    priceRange: '₹1,20,000 - ₹3,50,000',
    imageUrl: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=80&w=800',
    highlights: ['240+ Hours of Hand-embroidery', 'Micro-velvet Premium Collar', 'Semi-precious Ruby Buttons', 'Includes Matching Shawl & Safa fabric'],
    tags: ['Groom Bridal', 'Zardozi', 'Royal Ivory', 'Varanasi Silk'],
    features: ['Custom Bespoke Tailoring', 'Available in Ivory, Antique Gold, & Crimson Regal Shading', 'Includes complimentary 1-on-1 session with Head Designer']
  },
  {
    id: 'coll-gothic-bandhgala',
    name: 'Midnight Velvet Bandhgala',
    category: 'Indo-Western',
    description: 'A sharp, structurally-girdled fusion of Victorian styling and classic Indian heritage. Structured shoulder pads and a pristine high-neck collar define this regal silhouette.',
    priceRange: '₹85,000 - ₹1,80,000',
    imageUrl: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&q=80&w=800',
    highlights: ['Superspun Italian Silk-Velvet Blend', 'Engraved Brass Royal Insignia Buttons', 'Asymmetric Drape Placket', 'Satin-silk Sweat-absorbent Lining'],
    tags: ['Sangeet', 'Reception', 'Masculine Silhouette', 'Midnight Black'],
    features: ['Made-to-Measure Draft', 'Interlining by Solvi (Germany)', 'Optional custom monogram embroidery inside chest pocket']
  },
  {
    id: 'coll-anarkali-sherwani',
    name: 'Nawabi Peshawari Sherwani Set',
    category: 'Sherwani',
    description: 'An elegant tiered structure featuring a pristine inner flared kurta with an outer open sherwani coat, perfect for the modern groom who demands a cinematic walking entry.',
    priceRange: '₹1,50,000 - ₹4,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1597176116047-876a32798fcc?auto=format&fit=crop&q=80&w=800',
    highlights: ['Tiered Georgette and Banarasi Jacquard Brocade', 'Hand-stitched Pleats', 'Pearl-work Tassel Closures', 'Flared Anarkali Flow'],
    tags: ['Royal Groom', 'Layered Haute Couture', 'Champagne Gold', 'Peshawari'],
    features: ['3D digital fitting mapping', 'Available in Pastel Sage, Vintage Rose, & Classic Ivory Gold']
  },
  {
    id: 'coll-mint-kurta',
    name: 'Lucknowi Chikankari Kurta Set',
    category: 'Kurta-Pajama',
    description: 'Bespoke hand-embroidered Chikankari on premium georgette, shadow-woven with fine cotton thread by master artisans in Lucknow. Exudes pristine minimalism for daytime Haldi & Mehendi rituals.',
    priceRange: '₹35,000 - ₹75,000',
    imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800',
    highlights: ['Authentic Lucknowi Georgette', 'Fine Shadow-work (Bakhiya) Embroidery', 'Swarovski Crystal Accents', 'Matching Pure Silk Churidar'],
    tags: ['Haldi', 'Mehendi', 'Artisanal Handcraft', 'Pastel Mint'],
    features: ['Unmatched breathability & luxury handfeel', 'Washable premium fabric with colorlock technology']
  },
  {
    id: 'coll-reception-tuxedo',
    name: 'Royal Shawl-Collar Tuxedo Indo-Western',
    category: 'Reception-Wear',
    description: 'Crafted for the ultimate wedding reception glamour. Merges high-fashion western tux tailoring with deep maroon and gold micro-brocade collars of Indian roots.',
    priceRange: '₹95,000 - ₹2,10,000',
    imageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=800',
    highlights: ['Premium Merino Wood Blend', 'Structured Silk-Brocade Shawl Lapel', 'Signature Gilt Cuff-links Included', 'Double Vent Royal Slit Cut'],
    tags: ['Reception Night', 'Black Tie Fusion', 'Regal Maroon Accent', 'Sartorial'],
    features: ['Includes structured trousers & custom waist coat', 'Tailored to perfection with multiple fitting adjustments']
  },
  {
    id: 'coll-royal-mojris',
    name: 'Artisanal Gold Brocade Safa & Mojris Kit',
    category: 'Groom-Accessories',
    description: 'An premium curated styling combination including a pre-pleated banarasi silk safa (turban) with a gemstones-embellished kalangi (brooch) and high-heeled velvet mojris.',
    priceRange: '₹25,000 - ₹60,000',
    imageUrl: 'https://images.unsplash.com/photo-1618038483079-b864a0555431?auto=format&fit=crop&q=80&w=800',
    highlights: ['Genuine Leather Bedded Shoes', 'Handcrafted Golden Kalangi with Ruby Embellishment', 'Zari Embroidered Brocade Mojri', 'Traditional Royal Tassel Work'],
    tags: ['Groom Styling', 'Mojris & Safa', 'Gold Accents', 'Groom Accessories'],
    features: ['Cushioned orthotic insole for long standing weddings', 'Safa custom sized to head dimensions']
  }
];

export const LOOKBOOK_GALLERY = [
  {
    id: 'look-1',
    title: 'The Maharaja Grand Entrada',
    category: 'Sherwani',
    imageUrl: 'https://images.unsplash.com/photo-1597176116047-876a32798fcc?auto=format&fit=crop&q=80&w=700',
    description: 'Traditional heavy gold-wire zardozi sherwani shot on location at the Udaipur Lake Palace.',
    credits: 'Featured Groom: Dr. Aditya Singhania, Udaipur Palace'
  },
  {
    id: 'look-2',
    title: 'Modern Rajputana Indo-Western',
    category: 'Indo-Western',
    imageUrl: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&q=80&w=700',
    description: 'Deep crimson velvet bandhgala combined with asymmetric draped cowled breeches/Jodhpurs.',
    credits: 'High Fashion Editorial shoot by Tarun Malhotra'
  },
  {
    id: 'look-3',
    title: 'Lucknowi Aristocracy',
    category: 'Kurta-Pajama',
    imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=700',
    description: 'Pristine heavy Chikankari layered over a structured silk waistcoat under a soft morning glow.',
    credits: 'Mehendi Session, Rambagh Palace Jaipur'
  },
  {
    id: 'look-4',
    title: 'Groom Royal Accessories',
    category: 'Groom-Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1618038483079-b864a0555431?auto=format&fit=crop&q=80&w=700',
    description: 'Custom emerald beads multistrand kanti coupled with custom-designed hand block printed mojris.',
    credits: 'Bespoke Groom Box Kit'
  },
  {
    id: 'look-5',
    title: 'Classic Ivory & Burgundy',
    category: 'Sherwani',
    imageUrl: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=80&w=700',
    description: 'Traditional ivory jamawar silk sherwani paired with an exquisite hand-crushed burgundy silk stole.',
    credits: 'Featured Groom: Karan Thapar, Hyderabad'
  },
  {
    id: 'look-6',
    title: 'The Royal Stance: Sangeet Night',
    category: 'Indo-Western',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=700',
    description: 'Deep navy textured velvet trench-style sherwani highlighting detailed gold cuff monograms.',
    credits: 'The Taj Residency Gala Event'
  }
];

export const STORE_LOCATIONS: StoreLocation[] = [
  {
    id: 'loc-kot',
    name: 'Chaitanyapuri Studio - Kothapet',
    address: 'Varudu Ethnic Studio, Ward No 2, NTR Nagar, Margadarsi Colony, Chaitanyapuri, Kothapet, Saroornagar, Hyderabad, Telangana - 500035',
    phone: '+91 70751 70725',
    timing: '10:30 AM - 10:30 PM (Daily)',
    parkingInfo: 'Valet Parking & Dedicated Ground Frontage Parking available',
    mapEmbedUrl: 'https://maps.google.com/maps?q=17.3682053,78.5309888&z=16&ie=UTF8&iwloc=&output=embed',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800',
    whatsappLink: 'https://wa.me/919000777265?text=Hi%20Varudu%20Ethnic%20Studio!%20I%20want%20to%20visit%20your%20Chaitanyapuri%20showroom.%20Please%20guide%20me%20with%20directions.'
  },
  {
    id: 'loc-sec',
    name: 'Secunderabad Lounge - Thirumalagiri',
    address: 'Varudu Mens Wedding Collection, No. 4-13-11, Rajiv Rahadari, Opposite Indian Oil Petrol Pump, Thirumalagiri, Secunderabad, Telangana - 500015',
    phone: '+91 98495 56052',
    timing: '10:30 AM - 10:30 PM (Daily)',
    parkingInfo: 'Valet Parking & Dedicated Frontage Parking Spaces Available for Grooms',
    mapEmbedUrl: 'https://maps.google.com/maps?q=17.4697413,78.5089814&z=16&ie=UTF8&iwloc=&output=embed',
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800',
    whatsappLink: 'https://wa.me/919000777265?text=Hi%20Varudu%20Ethnic%20Studio!%20I%20want%20to%20visit%20your%20Secunderabad%20Thirumalagiri%20showroom.%20Please%20guide%20me%20with%20directions.'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Sanjay Deshmukh',
    role: 'Real Groom of Varudu',
    review: 'Our family was looking for a sherwani that reflected Rajput royal heritage. Varudu crafted a bespoke double-layered Peshawari sherwani that left everyone speechless during my Royal Entrada in Udaipur. The fit was absolutely precise on the first trial itself.',
    imageUrl: 'https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    weddingLocation: 'Married at Jagmandir Island Palace, Udaipur'
  },
  {
    id: 'test-2',
    name: 'Amitabh Reddy',
    role: 'Tech Entrepreneur Groom',
    review: 'The virtual consultation system is top-class. I uploaded my pre-wedding photos and my bride\'s outfit color, and the head designer matched it with an Ivory-Gold Zardozi sherwani. The embroidery details are phenomenal. It felt extremely masculine, royal and lightweight!',
    imageUrl: 'https://images.unsplash.com/photo-1622556498246-755f44ca76f3?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    weddingLocation: 'Married at GMR Arena, Hyderabad'
  },
  {
    id: 'test-3',
    name: 'Rohan Mehra',
    role: 'Elite Corporate Counsel',
    review: 'I booked a VIP Groom Session at their Secunderabad Thirumalagiri suite. From being welcomed with specialized high tea to having master drapers map my posture, the attention to detail is magnificent. Traditional luxury at its absolute zenith.',
    imageUrl: 'https://images.unsplash.com/photo-1601054704854-1a2e79dac4d3?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    weddingLocation: 'Married at Taj Falaknuma Palace, Hyderabad'
  }
];

export const BLOGS: StyleBlog[] = [
  {
    id: 'blog-1',
    title: 'How to Choose Your Groom Sherwani to Match the Bridal Lehenga Perfect Colors',
    excerpt: 'Avoid matching color-for-color. Discover how a subtle touch of the bride\'s embroidery shade inside your Stole, Safa, or pocket square creates the ultimate cohesive royal couple symmetry.',
    content: 'For absolute visual harmony during the varmala, we recommend the 80-20 styling rule. 80% should be your own strong grooming color scheme (e.g. Ivory Gold, Deep Jet Black, or Vintage Burgundy), and 20% should subtly incorporate elements of the bride\'s outfit—specifically in the dupatta lining or embroidered collar details. This guides the cameras safely during zoom shots.',
    imageUrl: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=80&w=800',
    readTime: '6 min read',
    date: 'May 12, 2026',
    author: 'Chief Stylist Varun Acharya'
  },
  {
    id: 'blog-2',
    title: 'The Anatomy of a Royal Indian Sherwani: Fabrics, Embroideries, & Inner Linings',
    excerpt: 'Explore why German solvi interlinings, raw Mulberry silk cores, and gold-plated copper wire (Zardozi) are the standard hallmarks of true masculine luxury couture garments.',
    content: 'A cheap sherwani falls stiffly or wrinkles upon sitting. A luxury Varudu sherwani is built on structured German Solvi canvas backing which adapts directly to your exact chest contours over time, guaranteeing a photogenic posture from the baraat entry to late-night pheras.',
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
    readTime: '10 min read',
    date: 'April 20, 2026',
    author: 'Master Draper Jagdish Prasad'
  },
  {
    id: 'blog-3',
    title: 'Summer Groom Guide: Staying Cool While Wearing Heavy Wedding Traditional Wear',
    excerpt: 'Do not sweat on your big day. Learn why authentic Lucknowi Chikankari on micro-bemberg cotton linings is the ultimate savior for high-temp Indian wedding ceremonies.',
    content: 'When getting married during hot Indian summer months, choose half-linings or premium micro-bemberg cotton linings which provide continuous ventilation. Avoid polyester bases. Our Lucknowi collection features ventilated shadow weaves that block high temperature while keeping full heavy-embroidery presence.',
    imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800',
    readTime: '4 min read',
    date: 'March 15, 2026',
    author: 'Stylist Karan Johar Thapar'
  }
];

export const RECENT_INQUIRIES_MOCK = [
  { name: 'Sameer Sen', city: 'Secunderabad', action: 'booked a VIP Sherwani Consultation at Thirumalagiri', minutes: '2 mins ago' },
  { name: 'Dr. Akhil K.', city: 'Hyderabad', action: 'uploaded 3 images for Style Analysis', minutes: '15 mins ago' },
  { name: 'Deepak Chawla', city: 'Kothapet', action: 'scheduled a Groom Trial Session', minutes: '34 mins ago' },
  { name: 'Vikramaditya S.', city: 'Hyderabad', action: 'placed a customized Nawabi Sherwani Inquiry', minutes: '48 mins ago' },
  { name: 'Sarthak Kapoor', city: 'Secunderabad', action: 'requested a custom velvet Bandhgala sketch', minutes: '1 hr ago' }
];

export const DEFAULT_GROOM_VIDEOS = [
  {
    id: 'vid-1',
    title: 'The Royal Velvet Bandhgala Motion',
    category: 'Indo-Western',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-model-wearing-traditional-indian-clothing-40224-large.mp4',
    description: 'A cinematic high-definition tracking shot highlighting the seamless drapes and heavy hand-woven metallic gold embroidery on imported velvet fabrics.',
    credits: 'Couture design by Master Draper Jagdish - Shot at Taj Krishna Hyderabad',
    duration: '0:12',
    views: 1240,
    status: 'active'
  },
  {
    id: 'vid-2',
    title: 'Classic Ivory Sherwani Walkthrough',
    category: 'Sherwani',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-groom-preparing-his-traditional-outfit-39987-large.mp4',
    description: 'Immersive close-up slow-motion walk showcasing the majestic posture and custom gold button cuffs of our signature German Canvas-lined Ivory Sherwani.',
    credits: 'Styled for Groom Dr. Aditya Singhania - Lake Palace Editorial',
    duration: '0:18',
    views: 3105,
    status: 'active'
  },
  {
    id: 'vid-3',
    title: 'Lucknowi Chikankari Morning Mood',
    category: 'Kurta-Pajama',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-under-colored-lights-43404-large.mp4',
    description: 'Soft lighting panning over delicate shadow-weave cotton silk lucknowi panels, designed for ultimate thermic comfort during long morning groom sessions.',
    credits: 'Stylist Selection - Rambagh Palace Session',
    duration: '0:10',
    views: 940,
    status: 'active'
  }
];
