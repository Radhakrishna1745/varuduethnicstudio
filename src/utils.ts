/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CustomerLead, Appointment, ProductCollection, LookbookItem, StaticPhoto, StaticPhotoKey, GroomVideo } from './types';
import { COLLECTIONS, LOOKBOOK_GALLERY, DEFAULT_GROOM_VIDEOS } from './data';
import { collection, doc, setDoc, updateDoc, onSnapshot, getDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, uploadToStorage, deleteFromStorage, parseCloudinaryUrlOrPath } from './firebase';

// Key names kept for backward compatibility if any imports or type dependencies refer to them
export const LEADS_KEY = 'varudu_leads';
export const APPOINTMENTS_KEY = 'varudu_appointments';

// Initial Mock data so the CRM is immediately beautiful on load
const MOCK_LEADS: CustomerLead[] = [
  {
    id: 'lead-1',
    name: 'Kabir Thapar',
    phone: '+91 98765 43210',
    email: 'kabirthapar@gmail.com',
    weddingDate: '2026-11-18',
    occasion: 'Main Wedding Ceremony (Baraat & Pheras)',
    budget: 'royal-classic',
    preferredColors: ['Ivory', 'Kesar Gold'],
    preferredStyles: ['Heavy Embroidered Zardozi Sherwani'],
    notes: 'Bride wearing dark maroon lehenga. I want to coordinate my stole, borders, and kanti beads with her outfit.',
    timestamp: '2026-05-28T06:12:00Z',
    status: 'New',
    uploadedImages: [
      'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1618038483079-b864a0555431?auto=format&fit=crop&q=80&w=300'
    ],
    adminNotes: 'Assigned to chief styling draper Prasad. Scheduled custom color matching swatch.'
  },
  {
    id: 'lead-2',
    name: 'Major Raghav Chawla',
    phone: '+91 99999 88888',
    email: 'raghav.airforce@nic.in',
    weddingDate: '2026-12-05',
    occasion: 'Elegant Sangeet & Cocktail Night',
    budget: 'couture',
    preferredColors: ['Midnight Blue', 'Jet Black'],
    preferredStyles: ['Victorian Velvet Bandhgala', 'Asymmetric Indo-Western'],
    notes: 'Military posture. Custom monogram needed on the lapel highlighting squadron insignia.',
    timestamp: '2026-05-28T04:22:00Z',
    status: 'Contacted',
    uploadedImages: [
      'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&q=80&w=300'
    ]
  },
  {
    id: 'lead-3',
    name: 'Anirudh Roy Chowdhury',
    phone: '+91 90070 12345',
    email: 'anirudh.rc@gmr.com',
    weddingDate: '2026-10-22',
    occasion: 'Reception Gala Dinner',
    budget: 'above-5lakh',
    preferredColors: ['Deep Bordeaux Maroon', 'Rose Gold-Bronze'],
    preferredStyles: ['Shawl Collar Imperial Tuxedo'],
    notes: 'High fashion banquet entry, indoor ballroom lighting with gold beams.',
    timestamp: '2026-05-27T18:45:00Z',
    status: 'Trial Scheduled',
    uploadedImages: [
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=300'
    ],
    adminNotes: 'Trial scheduled for Sunday 11am at Secunderabad Lounge.'
  }
];

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt-1',
    branch: 'Chaitanyapuri Studio - Kothapet',
    date: '2026-06-03',
    time: '11:30 AM',
    occasion: 'Sherwani fitting discussion',
    customerName: 'Pranav Reddy',
    customerPhone: '+91 94400 12345',
    customerEmail: 'pranav.reddy@hyderabad.com',
    status: 'Confirmed',
    timestamp: '2026-05-28T05:00:00Z'
  },
  {
    id: 'appt-2',
    branch: 'Secunderabad Lounge - Thirumalagiri',
    date: '2026-06-05',
    time: '04:00 PM',
    occasion: 'Chikankari daytime pre-wedding look matching',
    customerName: 'Yaseen Kapoor',
    customerPhone: '+91 98111 22233',
    customerEmail: 'ykapoor@secunderabad.in',
    status: 'Pending',
    timestamp: '2026-05-28T02:15:00Z'
  }
];

// --- MODULE SCOPED MEMORY STORAGE (NO LOCALSTORAGE OR INDEXEDDB RUNTIME DEPENDENCY) ---
let _leadsInMemory: CustomerLead[] | null = null;
let _appointmentsInMemory: Appointment[] | null = null;
let _settingsInMemory: Record<string, any> = {};
let _settingsLoaded = false;
let _mediaAssetsInMemory: any[] = [];

export const hasSettingsLoaded = () => _settingsLoaded;

// Helper to initialize local data
export const getStoredLeads = (): CustomerLead[] => {
  if (_leadsInMemory) return _leadsInMemory;
  _leadsInMemory = [...MOCK_LEADS];
  return _leadsInMemory;
};

export const saveLead = (lead: Omit<CustomerLead, 'id' | 'timestamp' | 'status' | 'uploadedImages'>, uploadedImages: string[] = []): CustomerLead => {
  const leads = getStoredLeads();
  const newLead: CustomerLead = {
    ...lead,
    id: `lead-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: 'New',
    uploadedImages: uploadedImages.length > 0 ? uploadedImages : [
      'https://images.unsplash.com/photo-1597176116047-876a32798fcc?auto=format&fit=crop&q=80&w=300'
    ]
  };
  leads.unshift(newLead);
  _leadsInMemory = leads;

  // Sync to live Firestore in background
  setDoc(doc(db, 'leads', newLead.id), newLead).catch(error => {
    handleFirestoreError(error, OperationType.CREATE, `leads/${newLead.id}`);
  });

  // Trigger Custom Realtime Event
  window.dispatchEvent(new CustomEvent('varudu-lead-submitted', { detail: newLead }));
  window.dispatchEvent(new CustomEvent('varudu-lead-updated'));
  
  return newLead;
};

export const updateLeadStatus = (id: string, status: CustomerLead['status'], adminNotes?: string): CustomerLead[] => {
  const leads = getStoredLeads();
  let updatedDoc: CustomerLead | null = null;
  const updated = leads.map(l => {
    if (l.id === id) {
      const match = { ...l, status, adminNotes: adminNotes !== undefined ? adminNotes : l.adminNotes };
      updatedDoc = match;
      return match;
    }
    return l;
  });
  _leadsInMemory = updated;

  // Sync update to Firebase in background
  if (updatedDoc) {
    setDoc(doc(db, 'leads', id), updatedDoc).catch(error => {
      handleFirestoreError(error, OperationType.UPDATE, `leads/${id}`);
    });
  }

  window.dispatchEvent(new CustomEvent('varudu-lead-updated'));
  return updated;
};

export const getStoredAppointments = (): Appointment[] => {
  if (_appointmentsInMemory) return _appointmentsInMemory;
  _appointmentsInMemory = [...MOCK_APPOINTMENTS];
  return _appointmentsInMemory;
};

export const saveAppointment = (appointment: Omit<Appointment, 'id' | 'timestamp' | 'status'>): Appointment => {
  const appts = getStoredAppointments();
  const newAppt: Appointment = {
    ...appointment,
    id: `appt-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: 'Pending'
  };
  appts.unshift(newAppt);
  _appointmentsInMemory = appts;

  // Sync to live Firestore in background
  setDoc(doc(db, 'appointments', newAppt.id), newAppt).catch(error => {
    handleFirestoreError(error, OperationType.CREATE, `appointments/${newAppt.id}`);
  });

  // Trigger Custom Realtime Event
  window.dispatchEvent(new CustomEvent('varudu-appointment-booked', { detail: newAppt }));
  window.dispatchEvent(new CustomEvent('varudu-appointment-updated'));
  
  return newAppt;
};

export const updateAppointmentStatus = (id: string, status: Appointment['status'], adminNotes?: string): Appointment[] => {
  const appts = getStoredAppointments();
  let updatedDoc: Appointment | null = null;
  const updated = appts.map(a => {
    if (a.id === id) {
      const match = { ...a, status, adminNotes: adminNotes !== undefined ? adminNotes : a.adminNotes };
      updatedDoc = match;
      return match;
    }
    return a;
  });
  _appointmentsInMemory = updated;

  // Sync update to Firebase in background
  if (updatedDoc) {
    setDoc(doc(db, 'appointments', id), updatedDoc).catch(error => {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    });
  }

  window.dispatchEvent(new CustomEvent('varudu-appointment-updated', { detail: updated }));
  return updated;
};

export const updateAppointmentScanEvent = (id: string): Appointment[] => {
  const appts = getStoredAppointments();
  let updatedDoc: Appointment | null = null;
  const updated = appts.map(a => {
    if (a.id === id) {
      const scanCount = a.scanCount !== undefined ? a.scanCount + 1 : 1;
      const match = { ...a, scanCount, lastScannedAt: String(Date.now()) };
      updatedDoc = match;
      return match;
    }
    return a;
  });
  _appointmentsInMemory = updated;

  // Sync update to Firebase in background
  if (updatedDoc) {
    setDoc(doc(db, 'appointments', id), updatedDoc).catch(error => {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    });
  }

  window.dispatchEvent(new CustomEvent('varudu-appointment-updated', { detail: updated }));
  return updated;
};

export const deleteLead = (id: string): CustomerLead[] => {
  const leads = getStoredLeads();
  const updated = leads.filter(l => l.id !== id);
  _leadsInMemory = updated;

  // Sync delete to Firebase
  deleteDoc(doc(db, 'leads', id)).catch(error => {
    handleFirestoreError(error, OperationType.DELETE, `leads/${id}`);
  });

  window.dispatchEvent(new CustomEvent('varudu-lead-updated'));
  return updated;
};

export const deleteMultipleLeads = (ids: string[]): CustomerLead[] => {
  const leads = getStoredLeads();
  const updated = leads.filter(l => !ids.includes(l.id));
  _leadsInMemory = updated;

  // Sync deletes to Firebase in parallel
  ids.forEach(id => {
    deleteDoc(doc(db, 'leads', id)).catch(error => {
      handleFirestoreError(error, OperationType.DELETE, `leads/${id}`);
    });
  });

  window.dispatchEvent(new CustomEvent('varudu-lead-updated'));
  return updated;
};

export const deleteAppointment = (id: string): Appointment[] => {
  const appts = getStoredAppointments();
  const updated = appts.filter(a => a.id !== id);
  _appointmentsInMemory = updated;

  // Sync delete to Firebase
  deleteDoc(doc(db, 'appointments', id)).catch(error => {
    handleFirestoreError(error, OperationType.DELETE, `appointments/${id}`);
  });

  window.dispatchEvent(new CustomEvent('varudu-appointment-updated'));
  return updated;
};

// Initialize CRM default data in Firestore if empty
export const initializeCRMData = async () => {
  try {
    const stateDocRef = doc(db, 'settings', 'crm_status');
    const stateDoc = await getDoc(stateDocRef);
    let initialized = false;
    if (stateDoc.exists()) {
      initialized = !!stateDoc.data().initialized;
    }

    if (!initialized) {
      // 1. Populate default leads if they do not exist
      const leadsColRef = collection(db, 'leads');
      const leadsSnap = await getDocs(leadsColRef);
      if (leadsSnap.empty) {
        for (const lead of MOCK_LEADS) {
          await setDoc(doc(db, 'leads', lead.id), lead);
        }
      }

      // 2. Populate default appointments if they do not exist
      const apptsColRef = collection(db, 'appointments');
      const apptsSnap = await getDocs(apptsColRef);
      if (apptsSnap.empty) {
        for (const appt of MOCK_APPOINTMENTS) {
          await setDoc(doc(db, 'appointments', appt.id), appt);
        }
      }

      // 3. Mark CRM as initialized
      await setDoc(stateDocRef, { initialized: true });
    }
  } catch (error) {
    console.warn('Silent CRM initialization check:', error);
  }
};

// Start a live sync listener to receive real-time updates from Firebase
export const startLiveSync = () => {
  if (typeof window === 'undefined') return () => {};

  // Initialize defaults in background if empty
  initializeCRMData();

  const unsubscribeLeads = onSnapshot(collection(db, 'leads'), (snapshot) => {
    const leads: CustomerLead[] = [];
    snapshot.forEach(docSnap => {
      leads.push(docSnap.data() as CustomerLead);
    });
    leads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    _leadsInMemory = leads;
    window.dispatchEvent(new CustomEvent('varudu-lead-updated', { detail: leads }));
  }, (error) => {
    if (!error.message.includes('permission-denied') && !error.message.includes('Missing or insufficient permissions')) {
      console.warn('Leads Sync Error:', error);
    }
  });

  const unsubscribeAppts = onSnapshot(collection(db, 'appointments'), (snapshot) => {
    const appts: Appointment[] = [];
    snapshot.forEach(docSnap => {
      appts.push(docSnap.data() as Appointment);
    });
    appts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    _appointmentsInMemory = appts;
    window.dispatchEvent(new CustomEvent('varudu-appointment-updated', { detail: appts }));
  }, (error) => {
    if (!error.message.includes('permission-denied') && !error.message.includes('Missing or insufficient permissions')) {
      console.warn('Appointments Sync Error:', error);
    }
  });

  const unsubscribeSettings = onSnapshot(collection(db, 'settings'), (snapshot) => {
    snapshot.forEach(docSnap => {
      _settingsInMemory[docSnap.id] = docSnap.data();
    });
    _settingsLoaded = true;
    window.dispatchEvent(new CustomEvent('varudu-settings-updated', { detail: _settingsInMemory }));
    if (_settingsInMemory.collections && Array.isArray(_settingsInMemory.collections.list)) {
      window.dispatchEvent(new CustomEvent('varudu-collections-updated', { detail: _settingsInMemory.collections.list }));
    }
    if (_settingsInMemory.lookbook && Array.isArray(_settingsInMemory.lookbook.list)) {
      window.dispatchEvent(new CustomEvent('varudu-lookbook-updated', { detail: _settingsInMemory.lookbook.list }));
    }
    if (_settingsInMemory.groom_videos && Array.isArray(_settingsInMemory.groom_videos.list)) {
      window.dispatchEvent(new CustomEvent('varudu-groomvideos-updated', { detail: _settingsInMemory.groom_videos.list }));
    }
  }, (error) => {
    if (!error.message.includes('permission-denied') && !error.message.includes('Missing or insufficient permissions')) {
      console.warn('Settings Sync Error:', error);
    }
  });

  const unsubscribeMedia = onSnapshot(collection(db, 'media'), (snapshot) => {
    const media: any[] = [];
    snapshot.forEach(docSnap => {
      media.push(docSnap.data());
    });
    media.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    _mediaAssetsInMemory = media;
    window.dispatchEvent(new CustomEvent('varudu-media-updated', { detail: media }));
  }, (error) => {
    if (!error.message.includes('permission-denied') && !error.message.includes('Missing or insufficient permissions')) {
      console.warn('Media Sync Error:', error);
    }
  });

  const unsubscribeStaticPhotos = onSnapshot(collection(db, 'static_photos'), (snapshot) => {
    _settingsInMemory['web_photos'] = {};
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as Partial<StaticPhoto>;
      if (data && data.url) {
        _settingsInMemory['web_photos'][docSnap.id] = data.url;
      }
    });
    window.dispatchEvent(new CustomEvent('varudu-photo-updated', { detail: snapshot.size }));
  }, (error) => {
    if (!error.message.includes('permission-denied') && !error.message.includes('Missing or insufficient permissions')) {
      console.warn('Static Photos Sync Error:', error);
    }
  });

  return () => {
    unsubscribeLeads();
    unsubscribeAppts();
    unsubscribeSettings();
    unsubscribeMedia();
    unsubscribeStaticPhotos();
  };
};

// Play a premium crystal gold warning/chime buzzer
export const playRegalGoldChime = () => {
  try {
    // Check if user disabled sound effects in the administrative brand settings
    const isDisabled = getCachedSetting('brand', 'sound_effects_disabled', 'false') === 'true';
    if (isDisabled) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const context = new AudioContextClass();
    
    // First Chime note (Royal G5)
    _playTone(context, 783.99, 0.12, 0.08); // G5 note, short crisp
    
    // Second Chime note (Royal D6)
    setTimeout(() => {
      _playTone(context, 1174.66, 0.18, 0.3); // D6 note, beautiful metallic resonance
    }, 120);

  } catch (error) {
    console.error('Web Audio chime playback failed:', error);
  }
};

const _playTone = (context: AudioContext, frequency: number, attack: number, decay: number) => {
  const osc = context.createOscillator();
  const gain = context.createGain();
  
  osc.type = 'triangle'; // triangle has a softer, luxury flute-like quality than square
  osc.frequency.setValueAtTime(frequency, context.currentTime);
  
  // Custom filter to sound like soft golden bronze bells
  const bandpass = context.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = frequency;
  bandpass.Q.value = 1.0;

  gain.gain.setValueAtTime(0, context.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, context.currentTime + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + attack + decay);
  
  osc.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(context.destination);
  
  osc.start(context.currentTime);
  osc.stop(context.currentTime + attack + decay + 0.1);
};

// Helper for SEO JSON-LD schema markup
export const getGroomStructuredSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "MensClothingStore",
    "name": "VARUDU ETHNIC STUDIO",
    "description": "Exclusive luxury Indian groom wedding fashion showroom and men’s ethnic wear brand. Handcrafted Sherwanis, Indo-westerns, Royal Kurta Pajamas & accessories.",
    "url": "https://varuduethnicstudio.com",
    "telephone": "+91 70751 70725",
    "priceRange": "$$$$",
    "image": "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=80&w=800",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Ward No 2, NTR Nagar, Margadarsi Colony, Chaitanyapuri, Kothapet",
      "addressLocality": "Hyderabad",
      "addressRegion": "Telangana",
      "postalCode": "500035",
      "addressCountry": "IN"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "10:30",
      "closes": "22:30"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Luxury Groom Wedding Couture Catalog",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Bespoke Royal Zardozi Groom Sherwani",
            "description": "Exquisite bridal sherwani with authentic zardozi embroidery."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Rajputana Velvet Indo-Western Cut",
            "description": "Classic traditional bandhgalas and achkans."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Lucknowi Handwoven Chikankari Kurta Set",
            "description": "Artisanal georgette white shadow work kurta pajama."
          }
        }
      ]
    }
  };
};

// --- DYNAMIC CATALOGUE & EDITABLE PRODUCTS STORAGE (PURE DISKLESS MEMORY + FIRESTORE SNAPSHOT) ---
export const DYNAMIC_COLLECTIONS_KEY = 'varudu_collections_v1';
export const DYNAMIC_LOOKBOOK_KEY = 'varudu_lookbook_v1';

export const getDynamicCollections = (): ProductCollection[] => {
  if (_settingsInMemory.collections && Array.isArray(_settingsInMemory.collections.list)) {
    return _settingsInMemory.collections.list;
  }
  return COLLECTIONS;
};

export const saveDynamicCollections = (collections: ProductCollection[]): void => {
  if (typeof window === 'undefined') return;
  if (!_settingsInMemory.collections) {
    _settingsInMemory.collections = {};
  }
  _settingsInMemory.collections.list = collections;
  window.dispatchEvent(new CustomEvent('varudu-collections-updated', { detail: collections }));
  saveSetting('collections', { list: collections }).catch(err => {
    console.warn('Failed to sync collections count/list with Firestore:', err);
  });
};

export const getDynamicLookbook = (): LookbookItem[] => {
  if (_settingsInMemory.lookbook && Array.isArray(_settingsInMemory.lookbook.list)) {
    return _settingsInMemory.lookbook.list;
  }
  return LOOKBOOK_GALLERY as LookbookItem[];
};

export const saveDynamicLookbook = (lookbook: LookbookItem[]): void => {
  if (typeof window === 'undefined') return;
  if (!_settingsInMemory.lookbook) {
    _settingsInMemory.lookbook = {};
  }
  _settingsInMemory.lookbook.list = lookbook;
  window.dispatchEvent(new CustomEvent('varudu-lookbook-updated', { detail: lookbook }));
  saveSetting('lookbook', { list: lookbook }).catch(err => {
    console.warn('Failed to sync lookbook list with Firestore:', err);
  });
};

export const getDynamicGroomVideos = (): GroomVideo[] => {
  if (_settingsInMemory.groom_videos && Array.isArray(_settingsInMemory.groom_videos.list)) {
    return _settingsInMemory.groom_videos.list;
  }
  return DEFAULT_GROOM_VIDEOS as GroomVideo[];
};

export const saveDynamicGroomVideos = (videos: GroomVideo[]): void => {
  if (typeof window === 'undefined') return;
  if (!_settingsInMemory.groom_videos) {
    _settingsInMemory.groom_videos = {};
  }
  _settingsInMemory.groom_videos.list = videos;
  window.dispatchEvent(new CustomEvent('varudu-groomvideos-updated', { detail: videos }));
  saveSetting('groom_videos', { list: videos }).catch(err => {
    console.warn('Failed to sync groom videos list with Firestore:', err);
  });
};

// --- COLLECTION VIEWS & HERO BANNERS DYNAMIC CACHING ---
export const getCollectionViews = (): number => {
  return Number(getCachedSetting('analytics_metrics', 'collection_views', '1242'));
};

export const incrementCollectionViews = async (): Promise<number> => {
  const current = getCollectionViews();
  const next = current + 1;
  const merged = { ...(_settingsInMemory['analytics_metrics'] || {}), collection_views: String(next) };
  _settingsInMemory['analytics_metrics'] = merged;
  window.dispatchEvent(new CustomEvent('varudu-settings-updated', { detail: _settingsInMemory }));
  await saveSetting('analytics_metrics', merged);
  return next;
};

// --- HERO BANNER MANAGEMENT UTILITIES ---
import { HeroBanner } from './types';

export const getStoredHeroBanners = (): HeroBanner[] => {
  if (_settingsInMemory.hero_banners && Array.isArray(_settingsInMemory.hero_banners.list)) {
    return _settingsInMemory.hero_banners.list;
  }
  return [
    {
      id: 'banner-0',
      imageUrl: 'https://images.unsplash.com/photo-1597176116047-876a32798fcc?auto=format&fit=crop&q=82&w=1600',
      title: 'Where Royal Weddings Begin',
      subtitle: 'INDIAS PREMIER GROOM COUTURE STUDIO',
      description: 'Step into a world of timeless majesty. Handcrafted sherwanis tailored meticulously by generational master craftsmen to make your entry truly legendary.',
      enabled: true,
      order: 0
    },
    {
      id: 'banner-1',
      imageUrl: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=82&w=1600',
      title: 'Crafting the Groom of Your Dreams',
      subtitle: 'EXCLUSIVE BRIDAL SHERWANIS',
      description: 'Zardozi wire-work woven with real gold threads, semi-precious stone embellishments, and rich handspun silk drapes styled specifically for the elite groom.',
      enabled: true,
      order: 1
    },
    {
      id: 'banner-2',
      imageUrl: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&q=82&w=1600',
      title: 'India’s Premium Groom Fashion Destination',
      subtitle: 'THE MODERN RAJPUTANA CHIC',
      description: 'Explore state-of-the-art Indo-western structures, velvet Nawabi Peshawari sets, and sharp Italian Wool-mix bundis crafted strictly for high-converting celebrations.',
      enabled: true,
      order: 2
    }
  ];
};

export const saveHeroBanners = async (banners: HeroBanner[]): Promise<void> => {
  if (typeof window === 'undefined') return;
  if (!_settingsInMemory.hero_banners) {
    _settingsInMemory.hero_banners = {};
  }
  _settingsInMemory.hero_banners.list = banners;
  window.dispatchEvent(new CustomEvent('varudu-banners-updated', { detail: banners }));
  await saveSetting('hero_banners', { list: banners });
};

export const isBannerActive = (banner: HeroBanner): boolean => {
  if (!banner.enabled) return false;
  
  const now = new Date();
  
  if (banner.startDate) {
    const start = new Date(banner.startDate);
    if (!isNaN(start.getTime()) && now < start) return false;
  }
  
  if (banner.endDate) {
    const end = new Date(banner.endDate);
    if (banner.endDate.length <= 10) {
      end.setHours(23, 59, 59, 999);
    }
    if (!isNaN(end.getTime()) && now > end) return false;
  }
  
  return true;
};

export const getScheduledHeroBanners = (): HeroBanner[] => {
  const banners = getStoredHeroBanners();
  return banners
    .filter(isBannerActive)
    .sort((a, b) => a.order - b.order);
};

// --- IMAGE COMPRESSION BEFORE UPLOAD ---
export const compressImageBeforeUpload = async (file: File | Blob, maxWidth = 1200, maxHeight = 1200, quality = 0.82): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file); // fallback
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

// --- SITEMAP XML GENERATOR HELPER ---
export const generateSitemapXmlContent = (collections: ProductCollection[]): string => {
  const today = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // Home page root
  xml += `  <url>\n`;
  xml += `    <loc>https://varuduethnicstudio.com/</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;
  
  // Collections Section Anchor
  xml += `  <url>\n`;
  xml += `    <loc>https://varuduethnicstudio.com/#featured-collections-desk</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.8</priority>\n`;
  xml += `  </url>\n`;

  // Dynamic products
  collections.forEach(item => {
    xml += `  <url>\n`;
    xml += `    <loc>https://varuduethnicstudio.com/collection/${item.id}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `  </url>\n`;
  });
  
  xml += `</urlset>`;
  return xml;
};

// --- SETTINGS STORAGE UTILITIES ---
export const getCachedSetting = (docId: string, field: string, defaultValue: string): string => {
  if (_settingsInMemory[docId] && _settingsInMemory[docId][field]) {
    return _settingsInMemory[docId][field];
  }
  return defaultValue;
};

// Helper function to remove undefined values recursively so Firestore setDoc does not throw errors
export const cleanFirestoreData = (val: any): any => {
  if (val === undefined) return null;
  if (val === null) return val;
  if (Array.isArray(val)) {
    return val.map(cleanFirestoreData);
  }
  if (typeof val === 'object') {
    const res: any = {};
    for (const key of Object.keys(val)) {
      if (val[key] !== undefined) {
        res[key] = cleanFirestoreData(val[key]);
      }
    }
    return res;
  }
  return val;
};

export const saveSetting = async (docId: string, data: Record<string, any>) => {
  try {
    _settingsInMemory[docId] = { ...(_settingsInMemory[docId] || {}), ...data };
    window.dispatchEvent(new CustomEvent('varudu-settings-updated', { detail: _settingsInMemory }));
    
    // Propagate individual catalog changes immediately to maintain perfect synchronization
    if (docId === 'collections' && data.list) {
      window.dispatchEvent(new CustomEvent('varudu-collections-updated', { detail: data.list }));
    }
    if (docId === 'lookbook' && data.list) {
      window.dispatchEvent(new CustomEvent('varudu-lookbook-updated', { detail: data.list }));
    }

    // Sanitize any undefined elements recursively to protect setDoc
    const cleaned = cleanFirestoreData(data);
    await setDoc(doc(db, 'settings', docId), cleaned, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `settings/${docId}`);
  }
};

// --- DYNAMIC WEB PHOTO CUSTOMIZER UTILITIES ---
export const getWebPhoto = async (key: StaticPhotoKey, defaultUrl: string): Promise<string> => {
  try {
    const docSnap = await getDoc(doc(db, 'static_photos', key));
    if (docSnap.exists()) {
      const data = docSnap.data() as Partial<StaticPhoto>;
      if (data && data.url) {
        return data.url;
      }
    }
  } catch (error) {
    console.warn('Error fetching static web photo from Firestore, falling back to cached or default:', error);
  }
  // Fallback to legacy sync cache if exists
  const cachedUrl = getCachedSetting('web_photos', key, '');
  if (cachedUrl) return cachedUrl;
  return defaultUrl;
};

export const saveWebPhoto = async (key: StaticPhotoKey, file: Blob): Promise<void> => {
  try {
    const path = `hero-banners/${key}`;
    let downloadUrl = '';
    try {
      downloadUrl = await uploadToStorage(path, file);
    } catch (storageErr) {
      console.warn('Firebase Storage saveWebPhoto failed, converting to Base64 data URL fallback:', storageErr);
      downloadUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
    
    // Save record to Firestore collection 'static_photos'
    await setDoc(doc(db, 'static_photos', key), cleanFirestoreData({
      id: key,
      url: downloadUrl,
      timestamp: Date.now(),
      updatedAt: new Date().toISOString()
    }));

    console.log(`[StaticPhotos] Upload success for static photo [${key}]: ${downloadUrl}`);
    
    // Save mapping in settings Firestore document for backward compatibility
    await saveSetting('web_photos', { [key]: downloadUrl });
    
    // Dispatch update event
    window.dispatchEvent(new CustomEvent('varudu-photo-updated', { detail: { key, url: downloadUrl } }));
  } catch (error) {
    console.error('Firebase saveWebPhoto failure:', error);
    throw error;
  }
};

export const deleteWebPhoto = async (key: StaticPhotoKey): Promise<void> => {
  try {
    // Delete record from Firestore collection 'static_photos'
    await deleteDoc(doc(db, 'static_photos', key));
    console.log(`[StaticPhotos] Delete success for static photo [${key}]`);

    const cachedUrl = getCachedSetting('web_photos', key, '');
    // Remove references in Firestore Settings by setting the key to ""
    await saveSetting('web_photos', { [key]: "" });
    // Delete file from Cloudinary/Firebase Storage
    if (cachedUrl) {
      await deleteFromStorage(cachedUrl);
    } else {
      await deleteFromStorage(`hero-banners/${key}`);
    }
  } catch (error) {
    console.warn('Failed to delete web photo from storage:', error);
  }
  window.dispatchEvent(new CustomEvent('varudu-photo-updated', { detail: { key } }));
};


// --- GENERAL MEDIA MANAGEMENT WORKFLOWS (FIREBASE STORAGE + FIRESTORE) ---

export interface MediaAsset {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
  category: 'images' | 'videos' | 'hero-banners' | 'groom-collections';
  fileType: 'image' | 'video';
  public_id?: string;
  secure_url?: string;
  media_type?: 'image' | 'video';
  url?: string;
  timestamp?: number;
  uploadTimestamp?: number;
}

/**
 * Uploads any image or video to Cloudinary under the appropriate folder, Name-encoded,
 * and saves its registration entry in Firestore `/media/{mediaId}`.
 */
export const uploadMediaAsset = async (
  file: File | Blob, 
  title: string, 
  category: 'images' | 'videos' | 'hero-banners' | 'groom-collections'
): Promise<MediaAsset> => {
  const mediaId = `media-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Clean file name
  const originalName = file instanceof File ? file.name : 'blob';
  const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Format the folder path: folder_prefix/unique_id_cleanName
  const storagePath = `${category}/${mediaId}_${cleanName}`;
  let fileUrl = '';
  try {
    fileUrl = await uploadToStorage(storagePath, file);
  } catch (storageErr) {
    console.warn('Cloudinary uploadMediaAsset failed, converting to Base64 data URL fallback:', storageErr);
    fileUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  const fileType = file.type?.startsWith('video/') ? 'video' : 'image';
  const { publicId } = parseCloudinaryUrlOrPath(fileUrl);
  
  const assetTitle = title || originalName.split('.')[0] || 'Untitled Asset';
  
  // Prevent duplicate records & delete old image record upon uploading a replacement image
  try {
    const qName = query(collection(db, 'media'), where('fileName', '==', originalName));
    const querySnapshotN = await getDocs(qName);
    for (const docSnap of querySnapshotN.docs) {
      await deleteDoc(doc(db, 'media', docSnap.id));
    }
    
    if (assetTitle) {
      const qTitle = query(collection(db, 'media'), where('title', '==', assetTitle));
      const querySnapshotT = await getDocs(qTitle);
      for (const docSnap of querySnapshotT.docs) {
        if (docSnap.id !== mediaId) {
          await deleteDoc(doc(db, 'media', docSnap.id));
        }
      }
    }
  } catch (err) {
    console.warn('Clean up of duplicate/replacement media record failed:', err);
  }
  
  const now = Date.now();
  const mediaItem: MediaAsset = {
    id: mediaId,
    title: assetTitle,
    fileName: originalName,
    fileUrl,
    uploadDate: new Date().toISOString(),
    category,
    fileType,
    public_id: publicId || mediaId,
    secure_url: fileUrl,
    media_type: fileType,
    url: fileUrl,
    timestamp: now,
    uploadTimestamp: now
  };
  
  // Save registry in Firestore
  try {
    await setDoc(doc(db, 'media', mediaId), mediaItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `media/${mediaId}`);
  }
  
  return mediaItem;
};

/**
 * Update media item title or category in Firestore.
 */
export const updateMediaAssetMetadata = async (
  mediaId: string, 
  updates: Partial<{ title: string; category: 'images' | 'videos' | 'hero-banners' | 'groom-collections' }>
): Promise<void> => {
  try {
    await setDoc(doc(db, 'media', mediaId), updates, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `media/${mediaId}`);
  }
};

/**
 * Deletes media item from Firestore registry AND deletes underlying binary from Firebase Storage
 */
export const deleteMediaAsset = async (mediaId: string, fileUrl: string, category: string, fileName: string): Promise<void> => {
  try {
    // 1. Delete from Firestore
    await deleteDoc(doc(db, 'media', mediaId));
    
    // 2. Delete from Cloudinary Storage
    if (fileUrl) {
      await deleteFromStorage(fileUrl);
    } else {
      const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${category}/${mediaId}_${cleanName}`;
      await deleteFromStorage(storagePath);
    }
  } catch (error) {
    console.error('Failed to complete delete asset flow:', error);
  }
};

/**
 * Wipe all customer lead records from local cache and cloud DB.
 */
export const wipeAllLeads = async (): Promise<CustomerLead[]> => {
  _leadsInMemory = [];
  try {
    const qSnapshot = await getDocs(collection(db, 'leads'));
    const deletePromises = qSnapshot.docs.map(d => deleteDoc(doc(db, 'leads', d.id)));
    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('Wipe leads background Firestore task:', err);
  }
  window.dispatchEvent(new CustomEvent('varudu-lead-updated'));
  return [];
};

/**
 * Wipe all showroom appointment slots/bookings from local cache and cloud DB.
 */
export const wipeAllAppointments = async (): Promise<Appointment[]> => {
  _appointmentsInMemory = [];
  try {
    const qSnapshot = await getDocs(collection(db, 'appointments'));
    const deletePromises = qSnapshot.docs.map(d => deleteDoc(doc(db, 'appointments', d.id)));
    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('Wipe appointments background Firestore task:', err);
  }
  window.dispatchEvent(new CustomEvent('varudu-appointment-updated'));
  return [];
};

/**
 * Reset Couture Custom Catalog to original curated default items.
 */
export const resetCoutureCatalog = async (): Promise<ProductCollection[]> => {
  saveDynamicCollections(COLLECTIONS);
  return COLLECTIONS;
};

/**
 * Reset Groom Lookbook gallery to luxury curated defaults.
 */
export const resetLookbookGallery = async (): Promise<LookbookItem[]> => {
  saveDynamicLookbook(LOOKBOOK_GALLERY as LookbookItem[]);
  return LOOKBOOK_GALLERY as LookbookItem[];
};

/**
 * Reset Carousel slides back to pristine designer defaults.
 */
export const resetHeroBanners = async (): Promise<HeroBanner[]> => {
  const DEFAULT_BANNERS: HeroBanner[] = [
    {
      id: 'banner-0',
      imageUrl: 'https://images.unsplash.com/photo-1597176116047-876a32798fcc?auto=format&fit=crop&q=82&w=1600',
      title: 'Where Royal Weddings Begin',
      subtitle: 'INDIAS PREMIER GROOM COUTURE STUDIO',
      description: 'Step into a world of timeless majesty. Handcrafted sherwanis tailored meticulously by generational master craftsmen to make your entry truly legendary.',
      enabled: true,
      order: 0
    },
    {
      id: 'banner-1',
      imageUrl: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=82&w=1600',
      title: 'Crafting the Groom of Your Dreams',
      subtitle: 'EXCLUSIVE BRIDAL SHERWANIS',
      description: 'Zardozi wire-work woven with real gold threads, semi-precious stone embellishments, and rich handspun silk drapes styled specifically for the elite groom.',
      enabled: true,
      order: 1
    },
    {
      id: 'banner-2',
      imageUrl: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&q=82&w=1600',
      title: 'India’s Premium Groom Fashion Destination',
      subtitle: 'THE MODERN RAJPUTANA CHIC',
      description: 'Explore state-of-the-art Indo-western structures, velvet Nawabi Peshawari sets, and sharp Italian Wool-mix bundis crafted strictly for high-converting celebrations.',
      enabled: true,
      order: 2
    }
  ];
  await saveHeroBanners(DEFAULT_BANNERS);
  return DEFAULT_BANNERS;
};

