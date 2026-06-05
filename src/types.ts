/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CustomerLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  weddingDate: string;
  occasion: string;
  budget: 'budget' | 'premium' | 'couture' | 'royal-classic' | 'above-5lakh'; // different premium tiers
  preferredColors: string[];
  preferredStyles: string[];
  notes?: string;
  timestamp: string;
  status: 'New' | 'Contacted' | 'Appointment Booked' | 'Trial Scheduled' | 'Converted' | 'Follow-up Pending' | 'Closed';
  uploadedImages: string[];
  adminNotes?: string;
  whatsappSent?: boolean;
  location?: string;
}

export interface Appointment {
  id: string;
  branch: string;
  date: string;
  time: string;
  occasion: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Canceled';
  timestamp: string;
  specialRequests?: string;
  adminNotes?: string;
  lastScannedAt?: string;
  scanCount?: number;
}

export interface ProductCollection {
  id: string;
  name: string;
  category: 'Sherwani' | 'Indo-Western' | 'Kurta-Pajama' | 'Reception-Wear' | 'Groom-Accessories' | 'Sherwanis' | 'Indo-Westerns' | 'Tuxedos' | 'Kurta Sets' | 'Reception Wear' | 'Accessories';
  description: string;
  priceRange: string;
  imageUrl: string;
  videoUrl?: string; // Optional custom product loop video
  highlights: string[];
  tags: string[];
  features: string[];
  images?: string[]; // Multiple images support per collection
  featured?: boolean; // Highlighted or featured flag
}

export interface HeroBanner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  description: string;
  startDate?: string; // ISO date or YYYY-MM-DD
  endDate?: string;   // ISO date or YYYY-MM-DD
  enabled: boolean;
  order: number;
}

export interface StyleBlog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  readTime: string;
  date: string;
  author: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  timing: string;
  parkingInfo: string;
  mapEmbedUrl: string;
  imageUrl: string;
  whatsappLink: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  review: string;
  imageUrl: string;
  rating: number;
  weddingLocation: string;
}

export interface LookbookItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  videoUrl?: string; // Optional custom loop video
  description: string;
  credits: string;
}

export interface GroomVideo {
  id: string;
  title: string;
  category: string;
  videoUrl: string;
  thumbnailUrl?: string;
  description: string;
  credits: string;
  duration?: string;
  views?: number;
  status?: 'active' | 'disabled';
}

export type StaticPhotoKey = 'web_photo_hero_0' | 'web_photo_hero_1' | 'web_photo_hero_2' | 'web_photo_legacy';

export interface StaticPhoto {
  id: StaticPhotoKey;
  url: string;
  timestamp: number;
  updatedAt: string;
}
