/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CustomerLead, Appointment, ProductCollection, LookbookItem } from './types';
import { COLLECTIONS, LOOKBOOK_GALLERY } from './data';
import { collection, doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

// Key for storage
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

// Helper to initialize local data
export const getStoredLeads = (): CustomerLead[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LEADS_KEY);
  if (!stored) {
    localStorage.setItem(LEADS_KEY, JSON.stringify(MOCK_LEADS));
    return MOCK_LEADS;
  }
  return JSON.parse(stored);
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
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));

  // Sync to live Firestore in background
  setDoc(doc(db, 'leads', newLead.id), newLead).catch(error => {
    handleFirestoreError(error, OperationType.CREATE, `leads/${newLead.id}`);
  });

  // Trigger Custom Realtime Event
  window.dispatchEvent(new CustomEvent('varudu-lead-submitted', { detail: newLead }));
  
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
  localStorage.setItem(LEADS_KEY, JSON.stringify(updated));

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
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(APPOINTMENTS_KEY);
  if (!stored) {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(MOCK_APPOINTMENTS));
    return MOCK_APPOINTMENTS;
  }
  return JSON.parse(stored);
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
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appts));

  // Sync to live Firestore in background
  setDoc(doc(db, 'appointments', newAppt.id), newAppt).catch(error => {
    handleFirestoreError(error, OperationType.CREATE, `appointments/${newAppt.id}`);
  });

  // Trigger Custom Realtime Event
  window.dispatchEvent(new CustomEvent('varudu-appointment-booked', { detail: newAppt }));
  
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
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));

  // Sync update to Firebase in background
  if (updatedDoc) {
    setDoc(doc(db, 'appointments', id), updatedDoc).catch(error => {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    });
  }

  window.dispatchEvent(new CustomEvent('varudu-appointment-updated'));
  return updated;
};

// Start a live sync listener to receive real-time updates from Firebase
export const startLiveSync = () => {
  if (typeof window === 'undefined') return () => {};

  const unsubscribeLeads = onSnapshot(collection(db, 'leads'), (snapshot) => {
    const leads: CustomerLead[] = [];
    snapshot.forEach(docSnap => {
      leads.push(docSnap.data() as CustomerLead);
    });
    if (leads.length > 0) {
      leads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
      window.dispatchEvent(new CustomEvent('varudu-lead-updated'));
    }
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
    if (appts.length > 0) {
      appts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appts));
      window.dispatchEvent(new CustomEvent('varudu-appointment-updated'));
    }
  }, (error) => {
    if (!error.message.includes('permission-denied') && !error.message.includes('Missing or insufficient permissions')) {
      console.warn('Appointments Sync Error:', error);
    }
  });

  return () => {
    unsubscribeLeads();
    unsubscribeAppts();
  };
};

// Play a premium crystal gold warning/chime buzzer
export const playRegalGoldChime = () => {
  try {
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

// --- PERSISTENT BROADCAST MEDIA DATABASE (INDEXED DB) ---
export const MEDIA_STORE_NAME = 'video_store';
export const MEDIA_DB_NAME = 'VaruduMediaDB';
export const MEDIA_DB_VERSION = 1;

export const initMediaDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in current environment.'));
      return;
    }
    const request = indexedDB.open(MEDIA_DB_NAME, MEDIA_DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
        db.createObjectStore(MEDIA_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const storeMediaFile = async (key: string, file: Blob): Promise<void> => {
  const db = await initMediaDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE_NAME, 'readwrite');
    const store = tx.objectStore(MEDIA_STORE_NAME);
    const request = store.put(file, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getMediaFile = async (key: string): Promise<Blob | null> => {
  try {
    const db = await initMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE_NAME, 'readonly');
      const store = tx.objectStore(MEDIA_STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('Error reading from IndexedDB:', e);
    return null;
  }
};

export const clearMediaFile = async (key: string): Promise<void> => {
  const db = await initMediaDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE_NAME, 'readwrite');
    const store = tx.objectStore(MEDIA_STORE_NAME);
    const request = store.delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// --- DYNAMIC CATALOGUE & EDITABLE PRODUCTS STORAGE ---
export const DYNAMIC_COLLECTIONS_KEY = 'varudu_collections_v1';
export const DYNAMIC_LOOKBOOK_KEY = 'varudu_lookbook_v1';

export const getDynamicCollections = (): ProductCollection[] => {
  if (typeof window === 'undefined') return COLLECTIONS;
  const stored = localStorage.getItem(DYNAMIC_COLLECTIONS_KEY);
  if (!stored) {
    localStorage.setItem(DYNAMIC_COLLECTIONS_KEY, JSON.stringify(COLLECTIONS));
    return COLLECTIONS;
  }
  return JSON.parse(stored);
};

export const saveDynamicCollections = (collections: ProductCollection[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DYNAMIC_COLLECTIONS_KEY, JSON.stringify(collections));
  window.dispatchEvent(new CustomEvent('varudu-collections-updated', { detail: collections }));
};

export const getDynamicLookbook = (): LookbookItem[] => {
  if (typeof window === 'undefined') return LOOKBOOK_GALLERY as LookbookItem[];
  const stored = localStorage.getItem(DYNAMIC_LOOKBOOK_KEY);
  if (!stored) {
    localStorage.setItem(DYNAMIC_LOOKBOOK_KEY, JSON.stringify(LOOKBOOK_GALLERY));
    return LOOKBOOK_GALLERY as LookbookItem[];
  }
  return JSON.parse(stored);
};

export const saveDynamicLookbook = (lookbook: LookbookItem[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DYNAMIC_LOOKBOOK_KEY, JSON.stringify(lookbook));
  window.dispatchEvent(new CustomEvent('varudu-lookbook-updated', { detail: lookbook }));
};

// --- DYNAMIC WEB PHOTO CUSTOMIZER UTILITIES ---
export const getWebPhoto = async (key: string, defaultUrl: string): Promise<string> => {
  try {
    const blob = await getMediaFile(key);
    if (blob) {
      return URL.createObjectURL(blob);
    }
  } catch (error) {
    console.warn('Error reading web photo from IndexedDB:', error);
  }
  return defaultUrl;
};

export const saveWebPhoto = async (key: string, file: Blob): Promise<void> => {
  await storeMediaFile(key, file);
  window.dispatchEvent(new CustomEvent('varudu-photo-updated', { detail: { key } }));
};

export const deleteWebPhoto = async (key: string): Promise<void> => {
  await clearMediaFile(key);
  window.dispatchEvent(new CustomEvent('varudu-photo-updated', { detail: { key } }));
};
