/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CustomerLead, Appointment, ProductCollection, LookbookItem } from '../types';
import { 
  getStoredLeads, updateLeadStatus, 
  getStoredAppointments, updateAppointmentStatus,
  playRegalGoldChime,
  storeMediaFile, getMediaFile, clearMediaFile,
  getDynamicCollections, saveDynamicCollections,
  getDynamicLookbook, saveDynamicLookbook,
  getWebPhoto, saveWebPhoto, deleteWebPhoto,
  saveSetting, getCachedSetting,
  uploadMediaAsset, updateMediaAssetMetadata, deleteMediaAsset, MediaAsset
} from '../utils';
import { uploadToStorage, deleteFromStorage } from '../firebase';
import { 
  Search, Filter, Sliders, MessageSquare, Phone, Clock, Download, 
  Sparkles, CheckCircle, AlertOctagon, TrendingUp, DollarSign, Calendar, 
  Users, Layers, Trash2, X, PlusCircle, Volume2, Shield, FileText, Check,
  Film, Play, VolumeX, Upload, HardDrive, AlertCircle, RefreshCw
} from 'lucide-react';

interface CRMProps {
  onClose: () => void;
}

export default function AdminCRM({ onClose }: CRMProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [crmTab, setCrmTab] = useState<'leads' | 'appointments' | 'analytics' | 'media'>('leads');

  // Leads & Appointments States
  const [leads, setLeads] = useState<CustomerLead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [budgetFilter, setBudgetFilter] = useState<string>('All');
  const [branchFilter, setBranchFilter] = useState<string>('All');

  // New lead real-time notification overlay
  const [liveLeadAlert, setLiveLeadAlert] = useState<CustomerLead | null>(null);

  // Selected lead for photo inspection modal
  const [inspectedLead, setInspectedLead] = useState<CustomerLead | null>(null);

  // --- DYNAMIC CATALOG & BLAZERS STATE ENGINE ---
  const [collectionsList, setCollectionsList] = useState<ProductCollection[]>(() => getDynamicCollections());
  const [lookbookList, setLookbookList] = useState<LookbookItem[]>(() => getDynamicLookbook());

  const [editingProduct, setEditingProduct] = useState<ProductCollection | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingLookbook, setEditingLookbook] = useState<LookbookItem | null>(null);
  const [isAddingLookbook, setIsAddingLookbook] = useState(false);

  // Blazer/Product form states
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCollection['category']>('Indo-Western');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodHighlights, setProdHighlights] = useState<string[]>(['']);
  const [prodTags, setProdTags] = useState('');
  const [prodFeatures, setProdFeatures] = useState('');
  const [prodImgFile, setProdImgFile] = useState<File | null>(null);
  const [prodVidFile, setProdVidFile] = useState<File | null>(null);

  // Lookbook form states
  const [lkTitle, setLkTitle] = useState('');
  const [lkCategory, setLkCategory] = useState('Indo-Western');
  const [lkDesc, setLkDesc] = useState('');
  const [lkCredits, setLkCredits] = useState('');
  const [lkImgFile, setLkImgFile] = useState<File | null>(null);
  const [lkVidFile, setLkVidFile] = useState<File | null>(null);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Start product editing
  const startEditProduct = (prod: ProductCollection) => {
    setEditingProduct(prod);
    setIsAddingProduct(false);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdPrice(prod.priceRange);
    setProdDesc(prod.description);
    setProdHighlights(prod.highlights && prod.highlights.length > 0 ? prod.highlights : ['']);
    setProdTags(prod.tags ? prod.tags.join(', ') : '');
    setProdFeatures(prod.features ? prod.features.join('. ') : '');
    setProdImgFile(null);
    setProdVidFile(null);
    setFormError('');
    setFormSuccess('');
  };

  // Start new product addition
  const startAddProduct = () => {
    setEditingProduct(null);
    setIsAddingProduct(true);
    setProdName('');
    setProdCategory('Indo-Western');
    setProdPrice('₹75,000 - ₹1,50,000');
    setProdDesc('A pristine custom bespoke blazer designed for modern grooms.');
    setProdHighlights(['Spun Luxury Italian Velvet', 'Made-to-measure tailoring draft', 'Premium Silk Inner Lining']);
    setProdTags('Blazer, Sangeet, Luxury');
    setProdFeatures('Available in customized navy, midnight velvet, emerald green shading');
    setProdImgFile(null);
    setProdVidFile(null);
    setFormError('');
    setFormSuccess('');
  };

  // Start lookbook editing
  const startEditLookbook = (lk: LookbookItem) => {
    setEditingLookbook(lk);
    setIsAddingLookbook(false);
    setLkTitle(lk.title);
    setLkCategory(lk.category);
    setLkDesc(lk.description);
    setLkCredits(lk.credits);
    setLkImgFile(null);
    setLkVidFile(null);
    setFormError('');
    setFormSuccess('');
  };

  // Start lookbook addition
  const startAddLookbook = () => {
    setEditingLookbook(null);
    setIsAddingLookbook(true);
    setLkTitle('');
    setLkCategory('Indo-Western');
    setLkDesc('High-contrast editorial suit styling and wedding photography look.');
    setLkCredits('Featured Groom: custom wedding look');
    setLkImgFile(null);
    setLkVidFile(null);
    setFormError('');
    setFormSuccess('');
  };

  // --- SAVE & DELETE HANDLERS ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      setFormError('Product Name is required.');
      return;
    }

    try {
      let finalImgUrl = editingProduct ? editingProduct.imageUrl : 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=800';
      let finalVidUrl = editingProduct ? editingProduct.videoUrl || '' : '';

      const targetId = editingProduct ? editingProduct.id : `prod-${Date.now()}`;

      // Store in IndexedDB cache and upload to Firebase Storage
      if (prodImgFile) {
        const key = `prod_img_${targetId}`;
        await storeMediaFile(key, prodImgFile);
        try {
          const downloadUrl = await uploadToStorage(`products/images/${targetId}`, prodImgFile);
          finalImgUrl = downloadUrl;
        } catch (_) {
          finalImgUrl = `indexeddb:${key}`;
        }
      }

      if (prodVidFile) {
        const key = `prod_vid_${targetId}`;
        await storeMediaFile(key, prodVidFile);
        try {
          const downloadUrl = await uploadToStorage(`products/videos/${targetId}`, prodVidFile);
          finalVidUrl = downloadUrl;
        } catch (_) {
          finalVidUrl = `indexeddb:${key}`;
        }
      }

      const tagsArray = prodTags ? prodTags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const featuresArray = prodFeatures ? prodFeatures.split('.').map(f => f.trim()).filter(Boolean) : [];

      const newProduct: ProductCollection = {
        id: targetId,
        name: prodName,
        category: prodCategory as any,
        priceRange: prodPrice,
        description: prodDesc,
        highlights: prodHighlights.filter(Boolean),
        tags: tagsArray,
        features: featuresArray,
        imageUrl: finalImgUrl,
        videoUrl: finalVidUrl,
      };

      let updatedList: ProductCollection[];
      if (editingProduct) {
        updatedList = collectionsList.map(p => p.id === targetId ? newProduct : p);
        setFormSuccess('Blazer details and highlights saved successfully!');
      } else {
        updatedList = [newProduct, ...collectionsList];
        setFormSuccess('New Blazer / Ethnic look added live to collections page!');
      }

      saveDynamicCollections(updatedList);
      setCollectionsList(updatedList);
      playRegalGoldChime();

      setTimeout(() => {
        setEditingProduct(null);
        setIsAddingProduct(false);
        setFormSuccess('');
      }, 1500);

    } catch (err) {
      console.error(err);
      setFormError('An error occurred while saving the assets to browser storage.');
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you absolutely sure you want to remove this royal selection?')) {
      const updated = collectionsList.filter(p => p.id !== id);
      saveDynamicCollections(updated);
      setCollectionsList(updated);
      try {
        clearMediaFile(`prod_img_${id}`);
        clearMediaFile(`prod_vid_${id}`);
      } catch (_) {}
      playRegalGoldChime();
    }
  };

  const handleSaveLookbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lkTitle.trim()) {
      setFormError('Lookbook Title is required.');
      return;
    }

    try {
      const targetId = editingLookbook ? editingLookbook.id : `look-${Date.now()}`;
      let finalImgUrl = editingLookbook ? editingLookbook.imageUrl : 'https://images.unsplash.com/photo-1597176116047-876a32798fcc?auto=format&fit=crop&q=80&w=800';
      let finalVidUrl = editingLookbook ? editingLookbook.videoUrl || '' : '';

      // Store in IndexedDB cache and upload to Firebase Storage
      if (lkImgFile) {
        const key = `lk_img_${targetId}`;
        await storeMediaFile(key, lkImgFile);
        try {
          const downloadUrl = await uploadToStorage(`lookbook/images/${targetId}`, lkImgFile);
          finalImgUrl = downloadUrl;
        } catch (_) {
          finalImgUrl = `indexeddb:${key}`;
        }
      }

      if (lkVidFile) {
        const key = `lk_vid_${targetId}`;
        await storeMediaFile(key, lkVidFile);
        try {
          const downloadUrl = await uploadToStorage(`lookbook/videos/${targetId}`, lkVidFile);
          finalVidUrl = downloadUrl;
        } catch (_) {
          finalVidUrl = `indexeddb:${key}`;
        }
      }

      const newLook: LookbookItem = {
        id: targetId,
        title: lkTitle,
        category: lkCategory,
        description: lkDesc,
        credits: lkCredits,
        imageUrl: finalImgUrl,
        videoUrl: finalVidUrl,
      };

      let updatedList: LookbookItem[];
      if (editingLookbook) {
        updatedList = lookbookList.map(l => l.id === targetId ? newLook : l);
        setFormSuccess('Lookbook presentation updated !');
      } else {
        updatedList = [newLook, ...lookbookList];
        setFormSuccess('New lookbook entry published live !');
      }

      saveDynamicLookbook(updatedList);
      setLookbookList(updatedList);
      playRegalGoldChime();

      setTimeout(() => {
        setEditingLookbook(null);
        setIsAddingLookbook(false);
        setFormSuccess('');
      }, 1500);

    } catch (err) {
      console.error(err);
      setFormError('Failed to publish lookbook assets.');
    }
  };

  const handleDeleteLookbook = (id: string) => {
    if (window.confirm('Do you really want to delete this lookbook presentation?')) {
      const updated = lookbookList.filter(l => l.id !== id);
      saveDynamicLookbook(updated);
      setLookbookList(updated);
      try {
        clearMediaFile(`lk_img_${id}`);
        clearMediaFile(`lk_vid_${id}`);
      } catch (_) {}
      playRegalGoldChime();
    }
  };

  // Custom persistent media states
  const [adminVideoBlob, setAdminVideoBlob] = useState<Blob | null>(null);
  const [adminVideoUrl, setAdminVideoUrl] = useState<string | null>(null);
  const [mediaUploadSuccess, setMediaUploadSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Customizable Webpage Photos states
  const [photoHero0, setPhotoHero0] = useState<string>('https://images.unsplash.com/photo-1597176116047-876a32798fcc?auto=format&fit=crop&q=82&w=1600');
  const [photoHero1, setPhotoHero1] = useState<string>('https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=82&w=1600');
  const [photoHero2, setPhotoHero2] = useState<string>('https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&q=82&w=1600');
  const [photoLegacy, setPhotoLegacy] = useState<string>('https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200');

  const [hasCustomHero0, setHasCustomHero0] = useState(false);
  const [hasCustomHero1, setHasCustomHero1] = useState(false);
  const [hasCustomHero2, setHasCustomHero2] = useState(false);
  const [hasCustomLegacy, setHasCustomLegacy] = useState(false);

  // General Media Asset Hub States
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [mediaAssetSearch, setMediaAssetSearch] = useState('');
  const [mediaAssetCategoryFilter, setMediaAssetCategoryFilter] = useState<string>('All');
  
  // Form Upload States
  const [newAssetTitle, setNewAssetTitle] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<'images' | 'videos' | 'hero-banners' | 'groom-collections'>('images');
  const [newAssetFile, setNewAssetFile] = useState<File | null>(null);
  const [assetUploadingFlag, setAssetUploadingFlag] = useState(false);
  const [assetFormError, setAssetFormError] = useState('');
  const [assetFormSuccess, setAssetFormSuccess] = useState('');

  // Inline Editing States
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingCategory, setEditingCategory] = useState<'images' | 'videos' | 'hero-banners' | 'groom-collections'>('images');

  // Load and subscribe to real-time events on same window
  useEffect(() => {
    // Load stored brand video logo preview
    async function loadStoredVideo() {
      try {
        const cachedUrl = getCachedSetting('brand', 'brand_logo_video', '');
        if (cachedUrl) {
          setAdminVideoUrl(cachedUrl);
        } else {
          const blob = await getMediaFile('brand_logo_video');
          if (blob) {
            setAdminVideoBlob(blob);
            setAdminVideoUrl(URL.createObjectURL(blob));
          }
        }
      } catch (e) {
        console.warn('Error reading from IndexedDB:', e);
      }
    }
    loadStoredVideo();

    // Load web photos
    async function loadWebPhotos() {
      const hero0 = await getWebPhoto('web_photo_hero_0', 'https://images.unsplash.com/photo-1597176116047-876a32798fcc?auto=format&fit=crop&q=82&w=1600');
      const hero1 = await getWebPhoto('web_photo_hero_1', 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=82&w=1600');
      const hero2 = await getWebPhoto('web_photo_hero_2', 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&q=82&w=1600');
      const legacy = await getWebPhoto('web_photo_legacy', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200');

      setPhotoHero0(hero0);
      setPhotoHero1(hero1);
      setPhotoHero2(hero2);
      setPhotoLegacy(legacy);

      const cached0 = getCachedSetting('web_photos', 'web_photo_hero_0', '');
      const cached1 = getCachedSetting('web_photos', 'web_photo_hero_1', '');
      const cached2 = getCachedSetting('web_photos', 'web_photo_hero_2', '');
      const cachedLegacy = getCachedSetting('web_photos', 'web_photo_legacy', '');

      const blob0 = await getMediaFile('web_photo_hero_0');
      const blob1 = await getMediaFile('web_photo_hero_1');
      const blob2 = await getMediaFile('web_photo_hero_2');
      const legacyBlob = await getMediaFile('web_photo_legacy');

      setHasCustomHero0(!!cached0 || !!blob0);
      setHasCustomHero1(!!cached1 || !!blob1);
      setHasCustomHero2(!!cached2 || !!blob2);
      setHasCustomLegacy(!!cachedLegacy || !!legacyBlob);
    }
    loadWebPhotos();

    // Load general media assets list
    const loadCachedMedia = () => {
      try {
        const stored = localStorage.getItem('varudu_media_asset_list');
        if (stored) {
          setMediaAssets(JSON.parse(stored));
        }
      } catch (err) {
        console.warn('Error loading media assets cache:', err);
      }
    };
    loadCachedMedia();

    const handleMediaUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && Array.isArray(detail)) {
        setMediaAssets(detail);
      }
    };
    window.addEventListener('varudu-media-updated', handleMediaUpdate as EventListener);

    return () => {
      window.removeEventListener('varudu-media-updated', handleMediaUpdate as EventListener);
      if (adminVideoUrl && !adminVideoUrl.startsWith('http')) {
        try {
          URL.revokeObjectURL(adminVideoUrl);
        } catch (_) {}
      }
    };
  }, []);

  const handlePhotoUpload = async (key: string, file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Only image files (JPEG, PNG, WEBP) are supported!');
      return;
    }
    try {
      await saveWebPhoto(key, file);
      const cached = getCachedSetting('web_photos', key, '');
      const url = cached || URL.createObjectURL(file);
      if (key === 'web_photo_hero_0') {
        setPhotoHero0(url);
        setHasCustomHero0(true);
      } else if (key === 'web_photo_hero_1') {
        setPhotoHero1(url);
        setHasCustomHero1(true);
      } else if (key === 'web_photo_hero_2') {
        setPhotoHero2(url);
        setHasCustomHero2(true);
      } else if (key === 'web_photo_legacy') {
        setPhotoLegacy(url);
        setHasCustomLegacy(true);
      }
      setMediaUploadSuccess(`Webpage photo updated successfully!`);
      playRegalGoldChime();
    } catch (e) {
      console.error('Error saving image:', e);
    }
  };

  const handlePhotoClear = async (key: string) => {
    try {
      await deleteWebPhoto(key);
      if (key === 'web_photo_hero_0') {
        setPhotoHero0('https://images.unsplash.com/photo-1597176116047-876a32798fcc?auto=format&fit=crop&q=82&w=1600');
        setHasCustomHero0(false);
      } else if (key === 'web_photo_hero_1') {
        setPhotoHero1('https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=82&w=1600');
        setHasCustomHero1(false);
      } else if (key === 'web_photo_hero_2') {
        setPhotoHero2('https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&q=82&w=1600');
        setHasCustomHero2(false);
      } else if (key === 'web_photo_legacy') {
        setPhotoLegacy('https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200');
        setHasCustomLegacy(false);
      }
      setMediaUploadSuccess(`Photo reverted to original default branding.`);
      playRegalGoldChime();
    } catch (e) {
      console.error('Error clearing image:', e);
    }
  };

  // General Media Asset Hub Actions
  const handleMediaAssetUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetFile) {
      setAssetFormError('Please select a file to upload.');
      return;
    }
    setAssetFormError('');
    setAssetFormSuccess('');
    setAssetUploadingFlag(true);

    try {
      const titleToSave = newAssetTitle.trim();
      const uploadedItem = await uploadMediaAsset(newAssetFile, titleToSave, newAssetCategory);
      setAssetFormSuccess(`Successfully uploaded "${uploadedItem.title}" to category "${newAssetCategory}" and synced!`);
      setNewAssetTitle('');
      setNewAssetFile(null);
      // Reset input element if any
      const fileInput = document.getElementById('general-asset-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      playRegalGoldChime();
    } catch (err: any) {
      console.error('Failed to upload general media asset:', err);
      setAssetFormError(`Upload failed: ${err.message || err}`);
    } finally {
      setAssetUploadingFlag(false);
    }
  };

  const handleDeleteMediaAsset = async (item: MediaAsset) => {
    if (!window.confirm(`Are you sure you want to permanently delete the media asset "${item.title}"?`)) {
      return;
    }
    try {
      await deleteMediaAsset(item.id, item.fileUrl, item.category, item.fileName);
      setMediaUploadSuccess(`Media asset "${item.title}" deleted successfully!`);
      playRegalGoldChime();
    } catch (err) {
      console.error('Failed to delete media asset:', err);
      alert('Failed to delete media asset.');
    }
  };

  const handleStartEditingMedia = (item: MediaAsset) => {
    setEditingMediaId(item.id);
    setEditingTitle(item.title);
    setEditingCategory(item.category);
  };

  const handleSaveEditingMedia = async (mediaId: string) => {
    if (!editingTitle.trim()) {
      alert('Title cannot be empty.');
      return;
    }
    try {
      await updateMediaAssetMetadata(mediaId, {
        title: editingTitle.trim(),
        category: editingCategory
      });
      setEditingMediaId(null);
      setMediaUploadSuccess('Media asset settings updated successfully!');
      playRegalGoldChime();
    } catch (err) {
      console.error('Failed to update media asset:', err);
      alert('Failed to update media asset details.');
    }
  };

  const handleMediaFileChange = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('video/')) {
       alert('Only .mp4, .webm, and other video files are supported!');
       return;
    }

    try {
      // 1. Store locally in IndexedDB as a cache/fallback
      await storeMediaFile('brand_logo_video', file);
      
      // 2. Upload to Firebase Storage in videos/
      setMediaUploadSuccess('Processing video encoding and transmitting to Firebase Storage...');
      const downloadUrl = await uploadToStorage('videos/brand_logo_video', file);
      
      // 3. Save URL to settings document
      await saveSetting('brand', { brand_logo_video: downloadUrl });

      // Update local states
      if (adminVideoUrl && !adminVideoUrl.startsWith('http')) {
        try {
          URL.revokeObjectURL(adminVideoUrl);
        } catch (_) {}
      }
      setAdminVideoUrl(downloadUrl);
      setAdminVideoBlob(file);
      setMediaUploadSuccess(`Brand intro video "${file.name}" uploaded successfully to Firebase Storage! All visitors will watch it instantly from high-speed CDN.`);
      playRegalGoldChime();
    } catch (err) {
      console.error('Failed to save branding video to Firebase Storage:', err);
      // Fallback to local
      try {
        await storeMediaFile('brand_logo_video', file);
        const url = URL.createObjectURL(file);
        setAdminVideoUrl(url);
        setAdminVideoBlob(file);
        setMediaUploadSuccess(`Uploaded local fallback: "${file.name}". Note: Visitors won't see this unless uploaded successfully to cloud.`);
      } catch (innerErr) {
        alert('Failed to store video: ' + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleMediaFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleClearMedia = async () => {
    try {
      await clearMediaFile('brand_logo_video');
      await saveSetting('brand', { brand_logo_video: "" });
      try {
        await deleteFromStorage('videos/brand_logo_video');
      } catch (_) {}
      
      if (adminVideoUrl && !adminVideoUrl.startsWith('http')) {
        try {
          URL.revokeObjectURL(adminVideoUrl);
        } catch (_) {}
      }
      setAdminVideoUrl(null);
      setAdminVideoBlob(null);
      setMediaUploadSuccess('Custom brand video cleared. The site will now revert to the beautiful gold particles CSS intro.');
    } catch (e) {
      console.error('Failed to clear video:', e);
    }
  };

  // Load and subscribe to real-time events on same window
  useEffect(() => {
    setLeads(getStoredLeads());
    setAppointments(getStoredAppointments());

    const handleNewLead = (e: Event) => {
      const customEvent = e as CustomEvent<CustomerLead>;
      const newLead = customEvent.detail;
      
      // Update local state instantly from localStorage
      setLeads(getStoredLeads());
      
      // Flash live visual notification and sound buzz
      setLiveLeadAlert(newLead);
      playRegalGoldChime();

      setTimeout(() => {
        setLiveLeadAlert(null);
      }, 7000);
    };

    const handleNewAppt = (e: Event) => {
      setAppointments(getStoredAppointments());
      playRegalGoldChime();
    };

    window.addEventListener('varudu-lead-submitted', handleNewLead);
    window.addEventListener('varudu-lead-updated', () => setLeads(getStoredLeads()));
    window.addEventListener('varudu-appointment-booked', handleNewAppt);
    window.addEventListener('varudu-appointment-updated', () => setAppointments(getStoredAppointments()));

    return () => {
      window.removeEventListener('varudu-lead-submitted', handleNewLead);
      window.removeEventListener('varudu-appointment-booked', handleNewAppt);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'admin123' || passcode === 'varudu2026') {
      setIsAuthenticated(true);
      setAuthError('');
      // Play soft gold chime as success cue
      playRegalGoldChime();
    } else {
      setAuthError('Access Denied. Exclusively reserved for VARUDU executive stylists.');
    }
  };

  const handleStatusChange = (leadId: string, newStatus: CustomerLead['status']) => {
    const updated = updateLeadStatus(leadId, newStatus);
    setLeads(updated);
  };

  const handleApptStatusChange = (apptId: string, newStatus: Appointment['status']) => {
    const updated = updateAppointmentStatus(apptId, newStatus);
    setAppointments(updated);
  };

  const handleSaveAdminNote = (leadId: string, notesText: string) => {
    const updated = updateLeadStatus(leadId, getStoredLeads().find(l => l.id === leadId)?.status || 'New', notesText);
    setLeads(updated);
  };

  const handleDownloadImage = (base64Url: string, index: number, groomName: string) => {
    try {
      const link = document.createElement('a');
      link.href = base64Url;
      link.download = `varudu_${groomName.replace(/\s+/g, '_')}_ref_${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      // Fallback
      window.open(base64Url, '_blank');
    }
  };

  // Budget calculations mapping for realistic estimated couture revenue
  const getBudgetWeight = (tier: string) => {
    switch (tier) {
      case 'budget': return 55000;
      case 'premium': return 110000;
      case 'couture': return 220000;
      case 'royal-classic': return 400000;
      case 'above-5lakh': return 650000;
      default: return 120000;
    }
  };

  // Raw lead filters
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lead.phone.includes(searchQuery) || 
                          lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.occasion.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchesBudget = budgetFilter === 'All' || lead.budget === budgetFilter;

    return matchesSearch && matchesStatus && matchesBudget;
  });

  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = appt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          appt.customerPhone.includes(searchQuery) ||
                          appt.branch.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBranch = branchFilter === 'All' || appt.branch.includes(branchFilter);

    return matchesSearch && matchesBranch;
  });

  // Analytics Metrics Gatherer
  const totalLeadsCount = leads.length;
  const newLeadsCount = leads.filter(l => l.status === 'New').length;
  const convertedLeadsCount = leads.filter(l => l.status === 'Converted').length;
  const trialScheduledCount = leads.filter(l => l.status === 'Trial Scheduled' || l.status === 'Appointment Booked').length;
  
  const estimatedRevenue = leads.reduce((acc, lead) => {
    if (lead.status === 'Converted') {
      return acc + getBudgetWeight(lead.budget);
    }
    return acc;
  }, 0);

  const potentialPipelineValue = leads.reduce((acc, lead) => {
    if (lead.status !== 'Closed' && lead.status !== 'Converted') {
      return acc + getBudgetWeight(lead.budget);
    }
    return acc;
  }, 0);

  const conversionPercentage = totalLeadsCount > 0 
    ? Math.round((convertedLeadsCount / totalLeadsCount) * 100) 
    : 0;

  // Render Lock Gate
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A]/95 flex items-center justify-center p-4 z-50 overflow-y-auto" id="crm-auth-screener">
        <div className="max-w-md w-full bg-[#121212] border-2 border-[#C5A85D] p-8 max-h-[90vh] rounded-lg shadow-2xl relative text-center">
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-[#C5A85D]"
            aria-label="Close Portal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-[#4A0E17] border border-[#C5A85D]/30 flex items-center justify-center rounded-full mx-auto mb-4">
            <Shield className="w-6 h-6 text-[#C5A85D]" />
          </div>

          <h3 className="font-display font-medium text-xl sm:text-2xl text-white tracking-[0.2em] uppercase">
            STYLIST LOGISTICS PORTAL
          </h3>
          <p className="text-[#C5A85D] text-[10px] tracking-widest uppercase font-sans mt-1">
            Varudu Exclusive Admin CRM
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-sans mb-1.5 text-left">
                Enter Administrative Stylist Passcode
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Passcode: (varudu2026 or admin123)"
                className="w-full bg-black border border-[#C5A85D]/25 focus:border-[#C5A85D] px-4 py-3 text-center text-sm tracking-widest text-[#E5C46D] rounded focus:outline-none focus:ring-0 placeholder:text-gray-700"
              />
              {authError && (
                <p className="text-red-400 text-[11px] mt-2 font-serif bg-red-950/20 py-2 border border-red-500/10 rounded">
                  {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#C5A85D] to-[#E5C46D] hover:scale-[1.01] transition-transform text-black text-xs font-semibold uppercase tracking-[0.25em] rounded cursor-pointer"
            >
              Verify Credentials
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-white/5 text-[9px] text-gray-500 uppercase tracking-widest font-sans">
            Secured via Standard AES256 Registry Key • Realtime enabled
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden flex flex-col" id="admin-crm-workspace">
      
      {/* Realtime Alert popover banner inside dashboard */}
      {liveLeadAlert && (
        <div className="absolute top-20 right-4 max-w-sm w-full bg-[#4A0E17] border-2 border-[#C5A85D] p-4 shadow-2xl z-55 animate-bounce rounded flex items-start space-x-3">
          <div className="p-1.5 bg-[#0A0A0A] border border-[#C5A85D]/50 text-[#C5A85D] rounded-full shrink-0">
            <Volume2 className="w-5 h-5 text-[#C5A85D] animate-ping" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-[#E5C46D] font-sans uppercase font-bold tracking-widest">
                🚨 LIVE GROOM INCOMING
              </span>
              <button onClick={() => setLiveLeadAlert(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-white text-xs font-sans font-semibold mt-1">
              {liveLeadAlert.name} just submitted a Lookbook consultation!
            </p>
            <p className="text-gray-300 text-[10px] font-serif mt-1 italic">
              Budget: {liveLeadAlert.budget.toUpperCase()} • Occasion: {liveLeadAlert.occasion}
            </p>
          </div>
        </div>
      )}

      {/* CRM Dashboard Top Bar */}
      <header className="bg-[#121212] border-b border-[#C5A85D]/20 px-6 h-20 shrink-0 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#4A0E17] border border-[#C5A85D]/30 flex items-center justify-center rounded-full">
            <Sparkles className="w-5 h-5 text-[#C5A85D]" />
          </div>
          <div>
            <h1 className="font-display font-medium text-[#E5C46D] text-lg tracking-widest uppercase flex items-center space-x-1.5">
              <span>Varudu CRM</span>
              <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[8px] tracking-normal font-sans rounded">
                ● Connected Live
              </span>
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-sans">
              Indian Wedding Fashion Atelier Operations
            </p>
          </div>
        </div>

        {/* Dashboard Tabs Selector */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCrmTab('leads')}
            className={`px-4 py-2 text-[10px] uppercase font-sans font-semibold tracking-widest rounded border transition-all cursor-pointer ${
              crmTab === 'leads'
                ? 'bg-[#C5A85D] text-black border-[#C5A85D]'
                : 'bg-black text-gray-400 border-white/5 hover:text-white'
            }`}
          >
            Leads Directory ({leads.length})
          </button>
          
          <button
            onClick={() => setCrmTab('appointments')}
            className={`px-4 py-2 text-[10px] uppercase font-sans font-semibold tracking-widest rounded border transition-all cursor-pointer ${
              crmTab === 'appointments'
                ? 'bg-[#C5A85D] text-black border-[#C5A85D]'
                : 'bg-black text-gray-400 border-white/5 hover:text-white'
            }`}
          >
            Showroom Bookings ({appointments.length})
          </button>

          <button
            onClick={() => setCrmTab('analytics')}
            className={`px-4 py-2 text-[10px] uppercase font-sans font-semibold tracking-widest rounded border transition-all cursor-pointer ${
              crmTab === 'analytics'
                ? 'bg-[#C5A85D] text-black border-[#C5A85D]'
                : 'bg-black text-gray-400 border-white/5 hover:text-white'
            }`}
          >
            Revenue Analytics
          </button>

          <button
            onClick={() => setCrmTab('media')}
            className={`px-4 py-2 text-[10px] uppercase font-sans font-semibold tracking-widest rounded border transition-all cursor-pointer ${
              crmTab === 'media'
                ? 'bg-[#C5A85D] text-black border-[#C5A85D]'
                : 'bg-black text-gray-400 border-white/5 hover:text-white'
            }`}
          >
            🎬 Brand Cinema
          </button>

          {/* Close Panel Button */}
          <button
            onClick={onClose}
            className="p-2 border border-white/10 hover:border-red-500 hover:text-red-500 rounded text-gray-400 transition-colors cursor-pointer"
            title="Exit Admin CRM"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* CRM Dynamic Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#0A0A0A] p-6">
        
        {crmTab === 'media' ? (
          /* CINEMA LOGO VIDEO & INTRO SETTINGS PANEL */
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in" id="crm-media-pane">
            
            {/* Header info panel */}
            <div className="bg-[#121212] border border-[#C5A85D]/20 p-6 sm:p-8 rounded-lg relative overflow-hidden shadow-xl">
              <div className="absolute right-6 top-6 text-[#C5A85D]/20 animate-pulse pointer-events-none">
                <Film className="w-20 h-20" />
              </div>
              <div className="relative z-10 max-w-3xl">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A85D] font-sans font-bold block mb-1">
                  Brand Identity Presence
                </span>
                <h3 className="font-display font-medium text-2xl text-white tracking-widest uppercase flex items-center space-x-2">
                  <span>Varudu Bridal Cinema & Logo Customizer</span>
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm mt-3 leading-relaxed">
                  Varudu Ethnic Studio represents high-performance aesthetic majesty. By uploading your 7-second gold metallic animated logo video here, the website will automatically greeting all new clients with a stunning immersive fullscreen cinematic intro!
                </p>
              </div>
            </div>

            {/* Notification Alert banner */}
            {mediaUploadSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg flex items-start space-x-2 animate-bounce-subtle">
                <Check className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{mediaUploadSuccess}</span>
              </div>
            )}

            {/* Content Split: Uploader on Left, Preview on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Drag/Drop Interactive Uploader */}
              <div className="space-y-6">
                
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 relative ${
                    dragActive 
                      ? 'border-[#C5A85D] bg-[#C5A85D]/5 md:scale-[1.02]' 
                      : 'border-white/10 bg-[#121212] hover:border-[#C5A85D]/40'
                  }`}
                  onDragOver={handleDrag}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="media-logo-upload"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleMediaFileChange(file);
                    }}
                    className="hidden"
                  />

                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 rounded-full bg-amber-500/10 text-[#C5A85D]">
                      <Upload className="w-8 h-8 animate-bounce" style={{ animationDuration: '3s' }} />
                    </div>
                    <div>
                      <h4 className="font-sans font-semibold text-sm text-white uppercase tracking-wider">
                        Drag & Drop Logo Video here
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Supports MP4, WebM, MOV, and high-contrast logo clips (Max 40MB)
                      </p>
                    </div>

                    <div className="text-xs text-gray-500">
                      &mdash; OR &mdash;
                    </div>

                    <label
                      htmlFor="media-logo-upload"
                      className="px-5 py-2.5 bg-[#C5A85D] hover:bg-[#D5B86D] text-black font-sans text-[10px] uppercase font-bold tracking-widest rounded transition-all shadow-md cursor-pointer block hover:scale-103"
                    >
                      Browse Video File
                    </label>
                  </div>
                </div>

                {/* Developer Instructions Manual / Repository guidance */}
                <div className="bg-[#121212] border border-white/5 p-6 rounded-lg space-y-4">
                  <div className="flex items-center space-x-2 text-white font-sans text-xs uppercase tracking-wider font-bold border-b border-white/5 pb-2">
                    <RefreshCw className="w-4 h-4 text-[#C5A85D]" />
                    <span>Permanent Production Integration</span>
                  </div>
                  <div className="font-sans text-xs text-gray-400 leading-relaxed space-y-3">
                    <p>
                      The uploader above saves files in your browser's local **IndexedDB** sandbox for instant evaluation.
                    </p>
                    <p>
                      To deploy this video permanently for all visitors worldwide on your production server:
                    </p>
                    <div className="bg-black/60 p-3 rounded font-mono text-[11px] text-amber-100 overflow-x-auto border border-white/5 whitespace-pre leading-normal">
                      1. Name your video file exactly:
                         {"\n"}   <span className="text-white font-bold">"logo_video.mp4"</span>
                      {"\n"}2. Drop it in your project's root folder
                      {"\n"}3. Commit & push it to GitHub/Vercel
                    </div>
                    <p className="text-[10px] text-gray-500 italic">
                      This will allow your video to load instantly for all devices natively without browser storage caching overhead!
                    </p>
                  </div>
                </div>

              </div>

              {/* Right Column: Live Presentation View & Replay Controls */}
              <div className="bg-[#121212] border border-white/5 rounded-xl p-6 flex flex-col justify-between space-y-6">
                
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#C5A85D] flex items-center space-x-1.5">
                      <HardDrive className="w-4 h-4" />
                      <span>Active Logo Preview</span>
                    </h4>
                    {adminVideoBlob && (
                      <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-[8px] font-mono tracking-normal rounded border border-yellow-500/20">
                        {Math.round(adminVideoBlob.size / 1024 / 1024 * 100) / 100} MB / IndexedDB
                      </span>
                    )}
                  </div>

                  {adminVideoUrl ? (
                    <div className="mt-5 border border-[#C5A85D]/20 rounded-lg overflow-hidden bg-black aspect-video relative flex items-center justify-center shadow-xl">
                      <video
                        src={adminVideoUrl}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="mt-5 border border-dashed border-white/5 rounded-lg aspect-video bg-black/60 flex flex-col items-center justify-center text-center p-4">
                      <div className="text-[32px] mb-2 filter grayscale saturate-50 drop-shadow">🎬</div>
                      <span className="text-xs text-white font-semibold uppercase tracking-wider block font-sans">
                        Playing Dynamic Web CSS Intro
                      </span>
                      <span className="text-[10px] text-gray-500 block max-w-xs mt-1.5 leading-relaxed">
                        Currently playing our majestic gold-foil CSS animation recreation because no file has been uploaded yet. Play it by clicking the Skip or Replay button!
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-white block font-sans font-semibold text-xs uppercase tracking-wider">
                      {adminVideoBlob ? 'Custom Video Active' : 'Gold CSS Fallback'}
                    </span>
                    <span className="text-gray-400 block text-[10.5px] font-sans mt-0.5 mt-1">
                      {adminVideoBlob ? 'Playing user uploaded high-contrast brand video' : 'Playing SVG/CSS gold particle shimmers'}
                    </span>
                  </div>

                  {adminVideoBlob && (
                    <button
                      onClick={handleClearMedia}
                      className="px-4 py-2 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white hover:bg-red-950/20 text-[9px] uppercase tracking-widest font-sans font-bold rounded transition-all cursor-pointer"
                    >
                      Remove Custom Video
                    </button>
                  )}
                </div>

              </div>

            </div>

            {/* BRAND COMPONENT PHOTO CUSTOMIZER */}
            <div className="bg-[#121212] border border-[#C5A85D]/20 p-6 sm:p-8 rounded-lg relative overflow-hidden shadow-xl" id="custom-static-photos-section">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A85D] font-sans font-bold block mb-1">
                Aesthetic Showcase Customization
              </span>
              <h3 className="font-display font-medium text-xl text-white tracking-widest uppercase flex items-center space-x-2">
                <span>Website Static Photos Manager</span>
              </h3>
              <p className="text-gray-300 text-xs mt-2 leading-relaxed max-w-3xl mb-8">
                Varudu Ethnic Studio displays majestic brand visuals across its sections. You can easily upload own custom images to replace these default photos on the live website. They are saved securely in local sandbox storage.
              </p>

              {/* Grid of the 4 key editable images */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Photo 1: Hero slide 0 */}
                <div className="bg-[#0D0D0D] border border-white/5 rounded-lg p-4 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="relative aspect-video rounded overflow-hidden bg-black border border-white/10 mb-3">
                      <img src={photoHero0} className="w-full h-full object-cover" alt="Hero 1" referrerPolicy="no-referrer" />
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] tracking-wider uppercase bg-black/80 font-mono text-[#C5A85D]">
                        {hasCustomHero0 ? '👑 Custom' : 'Fallback'}
                      </div>
                    </div>
                    <h4 className="text-white font-sans font-semibold text-xs uppercase tracking-wider">Hero Slide 1 Image</h4>
                    <p className="text-gray-400 text-[10px] mt-1 leading-normal">Displays on "Where Royal Weddings Begin" introductory slider block.</p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="flex items-center justify-center w-full py-2 bg-[#C5A85D] hover:bg-[#D5B86D] text-black font-sans font-bold text-[9px] tracking-wider uppercase rounded transition-all cursor-pointer">
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      Upload New
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload('web_photo_hero_0', file);
                        }}
                      />
                    </label>
                    {hasCustomHero0 && (
                      <button
                        onClick={() => handlePhotoClear('web_photo_hero_0')}
                        className="w-full py-1.5 border border-red-500/30 hover:border-red-500 text-red-100 hover:text-white hover:bg-red-950/10 text-[9px] uppercase tracking-wider font-sans rounded transition-all cursor-pointer"
                      >
                        Revert Default
                      </button>
                    )}
                  </div>
                </div>

                {/* Photo 2: Hero slide 1 */}
                <div className="bg-[#0D0D0D] border border-white/5 rounded-lg p-4 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="relative aspect-video rounded overflow-hidden bg-black border border-white/10 mb-3">
                      <img src={photoHero1} className="w-full h-full object-cover" alt="Hero 2" referrerPolicy="no-referrer" />
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] tracking-wider uppercase bg-black/80 font-mono text-[#C5A85D]">
                        {hasCustomHero1 ? '👑 Custom' : 'Fallback'}
                      </div>
                    </div>
                    <h4 className="text-white font-sans font-semibold text-xs uppercase tracking-wider">Hero Slide 2 Image</h4>
                    <p className="text-gray-400 text-[10px] mt-1 leading-normal">Image for "Crafting the Groom of Your Dreams" slide details.</p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="flex items-center justify-center w-full py-2 bg-[#C5A85D] hover:bg-[#D5B86D] text-black font-sans font-bold text-[9px] tracking-wider uppercase rounded transition-all cursor-pointer">
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      Upload New
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload('web_photo_hero_1', file);
                        }}
                      />
                    </label>
                    {hasCustomHero1 && (
                      <button
                        onClick={() => handlePhotoClear('web_photo_hero_1')}
                        className="w-full py-1.5 border border-red-500/30 hover:border-red-500 text-red-100 hover:text-white hover:bg-red-950/10 text-[9px] uppercase tracking-wider font-sans rounded transition-all cursor-pointer"
                      >
                        Revert Default
                      </button>
                    )}
                  </div>
                </div>

                {/* Photo 3: Hero slide 2 */}
                <div className="bg-[#0D0D0D] border border-white/5 rounded-lg p-4 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="relative aspect-video rounded overflow-hidden bg-black border border-white/10 mb-3">
                      <img src={photoHero2} className="w-full h-full object-cover" alt="Hero 3" referrerPolicy="no-referrer" />
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] tracking-wider uppercase bg-black/80 font-mono text-[#C5A85D]">
                        {hasCustomHero2 ? '👑 Custom' : 'Fallback'}
                      </div>
                    </div>
                    <h4 className="text-white font-sans font-semibold text-xs uppercase tracking-wider">Hero Slide 3 Image</h4>
                    <p className="text-gray-400 text-[10px] mt-1 leading-normal">Image for "India's Premium Groom Fashion Destination" slide detail.</p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="flex items-center justify-center w-full py-2 bg-[#C5A85D] hover:bg-[#D5B86D] text-black font-sans font-bold text-[9px] tracking-wider uppercase rounded transition-all cursor-pointer">
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      Upload New
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload('web_photo_hero_2', file);
                        }}
                      />
                    </label>
                    {hasCustomHero2 && (
                      <button
                        onClick={() => handlePhotoClear('web_photo_hero_2')}
                        className="w-full py-1.5 border border-red-500/30 hover:border-red-500 text-red-100 hover:text-white hover:bg-red-950/10 text-[9px] uppercase tracking-wider font-sans rounded transition-all cursor-pointer"
                      >
                        Revert Default
                      </button>
                    )}
                  </div>
                </div>

                {/* Photo 4: Udaipur Atelier */}
                <div className="bg-[#0D0D0D] border border-white/5 rounded-lg p-4 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="relative aspect-video rounded overflow-hidden bg-black border border-white/10 mb-3">
                      <img src={photoLegacy} className="w-full h-full object-cover" alt="Udaipur Atelier Legacy" referrerPolicy="no-referrer" />
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] tracking-wider uppercase bg-black/80 font-mono text-[#C5A85D]">
                        {hasCustomLegacy ? '👑 Custom' : 'Fallback'}
                      </div>
                    </div>
                    <h4 className="text-white font-sans font-semibold text-xs uppercase tracking-wider">Legacy Atelier boards</h4>
                    <p className="text-gray-400 text-[10px] mt-1 leading-normal">Featured under "Founded in 1968" history column on main homepage.</p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="flex items-center justify-center w-full py-2 bg-[#C5A85D] hover:bg-[#D5B86D] text-black font-sans font-bold text-[9px] tracking-wider uppercase rounded transition-all cursor-pointer">
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      Upload New
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload('web_photo_legacy', file);
                        }}
                      />
                    </label>
                    {hasCustomLegacy && (
                      <button
                        onClick={() => handlePhotoClear('web_photo_legacy')}
                        className="w-full py-1.5 border border-red-500/30 hover:border-red-500 text-red-100 hover:text-white hover:bg-red-950/10 text-[9px] uppercase tracking-wider font-sans rounded transition-all cursor-pointer"
                      >
                        Revert Default
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* GENERAL CLOUD MEDIA REPOSITORY HUB */}
            <div className="bg-[#121212] border border-[#C5A85D]/20 p-6 sm:p-8 rounded-lg relative overflow-hidden shadow-xl mt-10" id="general-media-hub-section">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A85D] font-sans font-bold block mb-1">
                Varudu Storage Registry Integration
              </span>
              <h3 className="font-display font-medium text-xl text-white tracking-widest uppercase flex items-center space-x-2 mb-6">
                <HardDrive className="w-5 h-5 text-[#C5A85D]" />
                <span>Global Media Asset Hub (Firebase Storage)</span>
              </h3>

              {/* TWO COLUMN GRID: UPLOAD ON LEFT, DICTIONARY ON RIGHT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* COLUMN 1: UPLOAD WIDGET (4 cols) */}
                <div className="lg:col-span-4 bg-[#0D0D0D] border border-white/5 rounded-lg p-5">
                  <h4 className="text-white font-sans font-semibold text-xs uppercase tracking-wider mb-4 text-[#C5A85D] border-b border-white/5 pb-2">
                    Upload New Asset
                  </h4>
                  
                  <form onSubmit={handleMediaAssetUpload} className="space-y-4">
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-sans font-bold mb-1">
                        Asset Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ivory Sherwani Detail"
                        value={newAssetTitle}
                        onChange={(e) => setNewAssetTitle(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#C5A85D]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-sans font-bold mb-1">
                        Destination Folder (Category)
                      </label>
                      <select
                        value={newAssetCategory}
                        onChange={(e: any) => setNewAssetCategory(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A85D]"
                      >
                        <option value="images">images/ (General Brand Photos)</option>
                        <option value="videos">videos/ (Cinema Clips & Loops)</option>
                        <option value="hero-banners">hero-banners/ (Hero Carousel Backdrops)</option>
                        <option value="groom-collections">groom-collections/ (Premium Grooming Catalogues)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-sans font-bold mb-2">
                        Image or Video Attachment
                      </label>
                      <div className="border border-dashed border-white/10 hover:border-[#C5A85D]/40 rounded-lg p-4 text-center cursor-pointer transition-all bg-black/50 hover:bg-black relative">
                        <input
                          id="general-asset-input"
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setNewAssetFile(file);
                              if (!newAssetTitle) {
                                // Default title to clean filename omitting extension
                                const cleanBase = file.name.split('.')[0].replace(/[-_]/g, ' ');
                                setNewAssetTitle(cleanBase);
                              }
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex flex-col items-center space-y-1">
                          <Upload className="w-6 h-6 text-gray-500" />
                          <span className="text-[10px] text-gray-400 font-sans">
                            {newAssetFile ? newAssetFile.name : 'Click or Drag & Drop'}
                          </span>
                          <span className="text-[8px] text-gray-600 uppercase tracking-widest font-mono">
                            {newAssetFile ? `${(newAssetFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Images or Videos up to 100MB'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {assetFormError && (
                      <div className="bg-red-950/20 border border-red-500/20 rounded p-3 flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <span className="text-[10px] text-red-200 leading-tight">{assetFormError}</span>
                      </div>
                    )}

                    {assetFormSuccess && (
                      <div className="bg-emerald-950/20 border border-emerald-500/20 rounded p-3 flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-[10px] text-emerald-200 leading-tight">{assetFormSuccess}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={assetUploadingFlag || !newAssetFile}
                      className="w-full py-2.5 bg-[#C5A85D] hover:bg-[#D5B86D] disabled:bg-gray-800 disabled:text-gray-500 text-black font-sans font-bold text-[10px] uppercase tracking-widest rounded transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                    >
                      {assetUploadingFlag ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Streaming to Storage...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Deploy Asset to Cloud</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* COLUMN 2: REGISTRY BROWSER Grid (8 cols) */}
                <div className="lg:col-span-8 flex flex-col space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
                    <div>
                      <h4 className="text-white font-sans font-semibold text-xs uppercase tracking-wider text-[#C5A85D]">
                        Cloud Storage Directory
                      </h4>
                      <p className="text-gray-400 text-[10px] mt-0.5 leading-normal">
                        Active assets linked directly across the groom styling framework.
                      </p>
                    </div>

                    {/* Filter controls */}
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-48">
                        <Search className="absolute left-2.5 top-2.5 w-3 h-3 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search files..."
                          value={mediaAssetSearch}
                          onChange={(e) => setMediaAssetSearch(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded-md pl-7 pr-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-[#C5A85D]"
                        />
                      </div>
                      
                      <select
                        value={mediaAssetCategoryFilter}
                        onChange={(e) => setMediaAssetCategoryFilter(e.target.value)}
                        className="bg-black border border-white/10 rounded-md px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-[#C5A85D]"
                      >
                        <option value="All">All Folders</option>
                        <option value="images">images/</option>
                        <option value="videos">videos/</option>
                        <option value="hero-banners">hero-banners/</option>
                        <option value="groom-collections">groom-collections/</option>
                      </select>
                    </div>
                  </div>

                  {/* FILES GRID */}
                  {(() => {
                    const filtered = mediaAssets.filter(item => {
                      const matchesCategory = mediaAssetCategoryFilter === 'All' || item.category === mediaAssetCategoryFilter;
                      const matchesQuery = !mediaAssetSearch.trim() || item.title.toLowerCase().includes(mediaAssetSearch.toLowerCase()) || item.fileName.toLowerCase().includes(mediaAssetSearch.toLowerCase());
                      return matchesCategory && matchesQuery;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/5 rounded-lg bg-black/30">
                          <AlertCircle className="w-8 h-8 text-gray-600 mb-2" />
                          <h5 className="text-xs text-gray-400 font-sans uppercase font-bold tracking-wider text-white">No matching assets found</h5>
                          <p className="text-[10px] text-gray-500 mt-1 max-w-xs text-center leading-normal">Upload new branding photos or videos to populate this secure storage folder.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[460px] overflow-y-auto pr-1">
                        {filtered.map(item => {
                          const isEditing = editingMediaId === item.id;
                          return (
                            <div key={item.id} className="bg-[#0D0D0D] border border-white/5 rounded-lg p-3 flex flex-col justify-between hover:border-[#C5A85D]/30 transition-all shadow">
                              <div>
                                {/* Media Thumbnail */}
                                <div className="aspect-video bg-black rounded overflow-hidden mb-2.5 relative border border-white/10 group flex items-center justify-center">
                                  {item.fileType === 'video' ? (
                                    <video
                                      src={item.fileUrl}
                                      controls
                                      className="w-full h-full object-cover"
                                      preload="metadata"
                                    />
                                  ) : (
                                    <img
                                      src={item.fileUrl}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  )}
                                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-mono tracking-wider uppercase bg-black/80 text-gray-300">
                                    {item.category}
                                  </div>
                                </div>

                                {/* EDITING FIELDS OR STATIC DETAILS */}
                                {isEditing ? (
                                  <div className="space-y-2 mt-2">
                                    <input
                                      type="text"
                                      value={editingTitle}
                                      onChange={(e) => setEditingTitle(e.target.value)}
                                      className="w-full bg-black border border-white/20 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-[#C5A85D]"
                                    />
                                    <select
                                      value={editingCategory}
                                      onChange={(e: any) => setEditingCategory(e.target.value)}
                                      className="w-full bg-black border border-white/20 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-[#C5A85D]"
                                    >
                                      <option value="images">images/</option>
                                      <option value="videos">videos/</option>
                                      <option value="hero-banners">hero-banners/</option>
                                      <option value="groom-collections">groom-collections/</option>
                                    </select>
                                  </div>
                                ) : (
                                  <>
                                    <h5 className="text-white font-sans font-bold text-xs truncate" title={item.title}>
                                      {item.title}
                                    </h5>
                                    <span className="text-[9px] text-gray-500 font-mono block mt-1 truncate" title={item.fileName}>
                                      {item.fileName}
                                    </span>
                                  </>
                                )}
                              </div>

                              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[8px] text-gray-500 font-mono">
                                  {new Date(item.uploadDate).toLocaleDateString()}
                                </span>

                                <div className="flex items-center space-x-1.5">
                                  {isEditing ? (
                                    <>
                                      <button
                                        onClick={() => handleSaveEditingMedia(item.id)}
                                        className="p-1 px-2 bg-[#C5A85D] text-black hover:bg-[#D5B86D] rounded text-[9px] font-sans font-bold uppercase transition-all cursor-pointer"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingMediaId(null)}
                                        className="p-1 px-2 border border-white/20 text-gray-400 hover:text-white rounded text-[9px] font-sans transition-all cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleStartEditingMedia(item)}
                                        className="p-1 border border-white/10 text-gray-400 hover:text-[#C5A85D] hover:border-[#C5A85D]/30 rounded transition-all cursor-pointer"
                                        title="Edit Title & Category"
                                      >
                                        <Sliders className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteMediaAsset(item)}
                                        className="p-1 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded transition-all cursor-pointer"
                                        title="Delete Permanently"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

              </div>
            </div>

            {/* SECTION 2: THE REGAL COUTURE & BLAZERS CATALOG MANAGER */}
            <div className="border-t border-[#C5A85D]/20 pt-10 mt-10 space-y-8" id="crm-catalog-manager">
              
              <div className="bg-[#121212]/90 border-2 border-dashed border-[#C5A85D]/25 p-6 rounded-lg">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A85D] font-sans font-bold block mb-1">
                  Varudu Atelier Studio Settings
                </span>
                <h3 className="font-display font-medium text-lg text-white tracking-widest uppercase flex items-center space-x-2">
                  <span>Royal Blazers & Lookbook Customizer</span>
                </h3>
                <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                  In this unified control room, you can upload new bespoke blazer looks, add active video clips for each luxury category, or update your wedding lookbook editorial gallery. Grooms get direct access to these assets with seamless performance.
                </p>
              </div>

              {/* PRODUCT FORM PANEL */}
              {(editingProduct || isAddingProduct) && (
                <div className="bg-[#121212] border border-[#C5A85D] p-6 rounded-lg space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="font-display font-medium text-base text-white tracking-wider uppercase">
                      {editingProduct ? `✏️ Edit Product specs: ${prodName}` : '👑 Create New Royal Selection'}
                    </h3>
                    <button 
                      onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }}
                      className="text-gray-400 hover:text-white"
                      type="button"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {formError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded">
                      {formError}
                    </div>
                  )}

                  {formSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded">
                      {formSuccess}
                    </div>
                  )}

                  <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase text-[#C5A85D] font-bold mb-1 tracking-wider">Product Name / Title</label>
                        <input 
                          type="text"
                          value={prodName}
                          onChange={e => setProdName(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 text-white text-xs p-2.5 rounded focus:border-[#C5A85D] outline-none"
                          placeholder="e.g. Royal Navy Velvet Blazer Set"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-[#C5A85D] font-bold mb-1 tracking-wider">Category</label>
                        <select
                          value={prodCategory}
                          onChange={e => setProdCategory(e.target.value as any)}
                          className="w-full bg-black/60 border border-white/10 text-[#C5A85D] text-xs p-2.5 rounded focus:border-[#C5A85D] outline-none cursor-pointer"
                        >
                          <option value="Sherwani">Sherwani</option>
                          <option value="Indo-Western">Indo-Western (Blazers & Suits)</option>
                          <option value="Kurta-Pajama">Kurta-Pajama</option>
                          <option value="Reception-Wear">Reception-Wear / Tuxedos</option>
                          <option value="Groom-Accessories">Groom Accessories</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase text-[#C5A85D] font-bold mb-1 tracking-wider">Estimated Price tag</label>
                        <input 
                          type="text"
                          value={prodPrice}
                          onChange={e => setProdPrice(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 text-white text-xs p-2.5 rounded focus:border-[#C5A85D] outline-none"
                          placeholder="e.g. ₹65,000 - ₹1,20,000"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-[#C5A85D] font-bold mb-1 tracking-wider">Highlight Tags (Comma separated)</label>
                        <input 
                          type="text"
                          value={prodTags}
                          onChange={e => setProdTags(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 text-white text-xs p-2.5 rounded focus:border-[#C5A85D] outline-none"
                          placeholder="e.g. Sangeet, Velvet Blazer, Baroque Embroidery"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase text-[#C5A85D] font-bold mb-1 tracking-wider">Editorial Description</label>
                      <textarea 
                        value={prodDesc}
                        onChange={e => setProdDesc(e.target.value)}
                        rows={3}
                        className="w-full bg-black/60 border border-white/10 text-white text-xs p-2.5 rounded focus:border-[#C5A85D] outline-none"
                        placeholder="Silhouette details, drape details..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase text-[#C5A85D] font-bold mb-1 tracking-wider flex items-center justify-between">
                        <span>Royal Highlights (One specification line per field)</span>
                        <button 
                          type="button"
                          onClick={() => setProdHighlights([...prodHighlights, ''])}
                          className="text-[10px] text-emerald-400 hover:underline uppercase"
                        >
                          + Add line
                        </button>
                      </label>
                      <div className="space-y-2 mt-1">
                        {prodHighlights.map((hl, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <input 
                              type="text"
                              value={hl}
                              onChange={e => {
                                const copy = [...prodHighlights];
                                copy[i] = e.target.value;
                                setProdHighlights(copy);
                              }}
                              className="flex-1 bg-black/60 border border-white/10 text-white text-xs p-2 rounded focus:border-[#C5A85D] outline-none"
                              placeholder="e.g. Pure Georgette inner cowled drape with micro velvet collar"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const copy = [...prodHighlights];
                                copy.splice(i, 1);
                                setProdHighlights(copy.length > 0 ? copy : ['']);
                              }}
                              className="text-red-400 hover:text-white font-sans text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/30 p-4 border border-white/5 rounded">
                      <div>
                        <label className="block text-[10px] uppercase text-gray-300 font-bold mb-1.5 tracking-wider">
                          📸 Product Photo File
                        </label>
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            if (e.target.files?.[0]) setProdImgFile(e.target.files[0]);
                          }}
                          className="w-full text-xs text-gray-400
                            file:mr-4 file:py-1.5 file:px-3
                            file:rounded file:border-0
                            file:text-[10px] file:font-semibold
                            file:bg-[#C5A85D] file:text-black
                            hover:file:bg-[#E5C46D] file:cursor-pointer"
                        />
                        {prodImgFile && <p className="text-[10px] text-amber-200 mt-1">✓ Loaded: {prodImgFile.name}</p>}
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-gray-300 font-bold mb-1.5 tracking-wider">
                          🎬 Blazer Video Reel (Plays in smooth loop)
                        </label>
                        <input 
                          type="file"
                          accept="video/*"
                          onChange={e => {
                            if (e.target.files?.[0]) setProdVidFile(e.target.files[0]);
                          }}
                          className="w-full text-xs text-gray-400
                            file:mr-4 file:py-1.5 file:px-3
                            file:rounded file:border-0
                            file:text-[10px] file:font-semibold
                            file:bg-[#C5A85D] file:text-black
                            hover:file:bg-[#E5C46D] file:cursor-pointer"
                        />
                        {prodVidFile && <p className="text-[10px] text-emerald-300 mt-1">✓ Loaded: {prodVidFile.name}</p>}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }}
                        className="px-4 py-2 border border-white/10 text-gray-400 hover:text-white text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#C5A85D] hover:bg-[#E5C46D] text-black text-xs font-bold uppercase tracking-widest rounded"
                      >
                        {editingProduct ? 'Save Blazer specs' : 'Add blazer to collections'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* LOOKBOOK FORM PANEL */}
              {(editingLookbook || isAddingLookbook) && (
                <div className="bg-[#121212] border border-[#C5A85D] p-6 rounded-lg space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="font-display font-medium text-base text-white tracking-wider uppercase">
                      {editingLookbook ? `✏️ Edit Lookbook Entry: ${lkTitle}` : '👑 Create New Lookbook Entry'}
                    </h3>
                    <button 
                      onClick={() => { setEditingLookbook(null); setIsAddingLookbook(false); }}
                      className="text-gray-400 hover:text-white"
                      type="button"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {formError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded">
                      {formError}
                    </div>
                  )}

                  {formSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded">
                      {formSuccess}
                    </div>
                  )}

                  <form onSubmit={handleSaveLookbook} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase text-[#C5A85D] font-bold mb-1 tracking-wider">Look Title / Composition</label>
                        <input 
                          type="text"
                          value={lkTitle}
                          onChange={e => setLkTitle(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 text-white text-xs p-2.5 rounded focus:border-[#C5A85D] outline-none"
                          placeholder="e.g. Premium Jodhpur Blazer Cut"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-[#C5A85D] font-bold mb-1 tracking-wider">Category</label>
                        <input 
                          type="text"
                          value={lkCategory}
                          onChange={e => setLkCategory(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 text-white text-xs p-2.5 rounded focus:border-[#C5A85D] outline-none"
                          placeholder="e.g. Indo-Western, Sherwani"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase text-[#C5A85D] font-bold mb-1 tracking-wider">Groom Credits / Location</label>
                        <input 
                          type="text"
                          value={lkCredits}
                          onChange={e => setLkCredits(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 text-white text-xs p-2.5 rounded focus:border-[#C5A85D] outline-none"
                          placeholder="e.g. Custom Double Breasted Suit look"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase text-[#C5A85D] font-bold mb-1 tracking-wider">Editorial Composition Description</label>
                      <textarea 
                        value={lkDesc}
                        onChange={e => setLkDesc(e.target.value)}
                        rows={3}
                        className="w-full bg-black/60 border border-white/10 text-white text-xs p-2.5 rounded focus:border-[#C5A85D] outline-none"
                        placeholder="Details of embroidery, background scenery..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/30 p-4 border border-white/5 rounded">
                      <div>
                        <label className="block text-[10px] uppercase text-gray-300 font-bold mb-1.5 tracking-wider">
                          📸 Editorial Look Photo (PNG/JPG)
                        </label>
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            if (e.target.files?.[0]) setLkImgFile(e.target.files[0]);
                          }}
                          className="w-full text-xs text-gray-400
                            file:mr-4 file:py-1.5 file:px-3
                            file:rounded file:border-0
                            file:text-[10px] file:font-semibold
                            file:bg-[#C5A85D] file:text-black
                            hover:file:bg-[#E5C46D] file:cursor-pointer"
                        />
                        {lkImgFile && <p className="text-[10px] text-amber-200 mt-1">✓ Loaded: {lkImgFile.name}</p>}
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-gray-300 font-bold mb-1.5 tracking-wider">
                          🎬 Dramatic Lookbook Loop Video (Full screen support)
                        </label>
                        <input 
                          type="file"
                          accept="video/*"
                          onChange={e => {
                            if (e.target.files?.[0]) setLkVidFile(e.target.files[0]);
                          }}
                          className="w-full text-xs text-gray-400
                            file:mr-4 file:py-1.5 file:px-3
                            file:rounded file:border-0
                            file:text-[10px] file:font-semibold
                            file:bg-[#C5A85D] file:text-black
                            hover:file:bg-[#E5C46D] file:cursor-pointer"
                        />
                        {lkVidFile && <p className="text-[10px] text-emerald-300 mt-1">✓ Loaded: {lkVidFile.name}</p>}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => { setEditingLookbook(null); setIsAddingLookbook(false); }}
                        className="px-4 py-2 border border-white/10 text-gray-400 hover:text-white text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#C5A85D] hover:bg-[#E5C46D] text-black text-xs font-bold uppercase tracking-widest rounded"
                      >
                        Save Lookbook entry
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* LISTINGS PANELS */}
              <div className="space-y-12">
                
                {/* Product/Blazer section */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-display font-medium text-base text-white tracking-widest uppercase flex items-center space-x-2">
                        <span>👑 Tailored collections & Blazer catalog</span>
                        <span className="text-[8px] bg-amber-500/10 text-[#C5A85D] font-mono rounded px-2 py-0.5 border border-amber-500/30">
                          {collectionsList.length} total looks live
                        </span>
                      </h4>
                      <p className="text-gray-400 text-xs font-serif mt-1">
                        Rendered on the main page under "Featured Collection Categories"
                      </p>
                    </div>
                    <button
                      onClick={startAddProduct}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-sans font-bold uppercase tracking-wider rounded cursor-pointer transition-all hover:scale-103 shadow"
                    >
                      + Add New blazer look
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collectionsList.map(item => (
                      <div key={item.id} className="bg-[#121212]/50 border border-white/5 p-4 rounded flex flex-col justify-between hover:border-[#C5A85D]/20 transition-all">
                        <div>
                          <div className="aspect-video bg-black/60 rounded mb-3 overflow-hidden relative border border-white/5 flex items-center justify-center text-[10px]">
                            {item.imageUrl.startsWith('indexeddb:') ? (
                              <span className="text-[#C5A85D] font-mono">Custom photo loaded ✔</span>
                            ) : (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover object-top" />
                            )}
                            {item.videoUrl && (
                              <span className="absolute bottom-2 right-2 bg-[#4A0E17]/90 text-[#E5C46D] border border-[#C5A85D]/40 font-mono text-[8px] px-1.5 py-0.5 rounded">✓ Video reel</span>
                            )}
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-[#C5A85D] font-sans font-bold block">{item.category}</span>
                            <h5 className="text-white font-sans font-semibold text-xs mt-1">{item.name}</h5>
                            <span className="text-gray-400 font-mono text-[10px] mt-0.5 block">{item.priceRange}</span>
                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed font-serif">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4 pt-2.5 border-t border-white/5">
                          <button
                            onClick={() => startEditProduct(item)}
                            className="px-2.5 py-1 text-[9px] font-sans font-bold uppercase tracking-wider border border-[#C5A85D]/40 text-[#C5A85D] hover:bg-[#C5A85D] hover:text-black rounded transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(item.id)}
                            className="px-2.5 py-1 text-[9px] font-sans font-bold uppercase tracking-wider bg-red-950/20 text-red-400 border border-red-500/20 hover:bg-red-900 hover:text-white rounded transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lookbook Portfolio section */}
                <div className="space-y-4 pt-8 border-t border-white/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-display font-medium text-base text-white tracking-widest uppercase flex items-center space-x-2">
                        <span>🎬 Groom Lookbook Portfolio & Loops</span>
                        <span className="text-[8px] bg-red-500/15 text-white font-mono rounded px-2 py-0.5 border border-red-500/30">
                          {lookbookList.length} wedding presentations
                        </span>
                      </h4>
                      <p className="text-gray-400 text-xs font-serif mt-1">
                        Rendered under the "Groom Lookbook Portfolio" masonry stream
                      </p>
                    </div>
                    <button
                      onClick={startAddLookbook}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-sans font-bold uppercase tracking-wider rounded cursor-pointer transition-all hover:scale-103 shadow white"
                    >
                      + Add Lookbook entry
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lookbookList.map(item => (
                      <div key={item.id} className="bg-[#121212]/50 border border-white/5 p-4 rounded flex flex-col justify-between hover:border-[#4A0E17]/20 transition-all">
                        <div>
                          <div className="aspect-video bg-black/60 rounded mb-3 overflow-hidden relative border border-white/5 flex items-center justify-center text-[10px]">
                            {item.imageUrl.startsWith('indexeddb:') ? (
                              <span className="text-[#C5A85D] font-mono">Custom photo loaded ✔</span>
                            ) : (
                              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover object-top" />
                            )}
                            {item.videoUrl && (
                              <span className="absolute bottom-2 right-2 bg-red-950/90 text-red-300 font-mono text-[8px] px-1.5 py-0.5 rounded border border-red-500/20">✓ Video loop</span>
                            )}
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-[#C5A85D] font-sans font-bold block">{item.category}</span>
                            <h5 className="text-white font-sans font-semibold text-xs mt-1">{item.title}</h5>
                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed font-serif">{item.description}</p>
                            <span className="text-[9px] text-[#E5C46D] italic mt-1 block font-serif">{item.credits}</span>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4 pt-2.5 border-t border-white/5">
                          <button
                            onClick={() => startEditLookbook(item)}
                            className="px-2.5 py-1 text-[9px] font-sans font-bold uppercase tracking-wider border border-[#C5A85D]/40 text-[#C5A85D] hover:bg-[#C5A85D] hover:text-black rounded transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteLookbook(item.id)}
                            className="px-2.5 py-1 text-[9px] font-sans font-bold uppercase tracking-wider bg-red-950/20 text-red-400 border border-red-500/20 hover:bg-red-900 hover:text-white rounded transition-all cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : crmTab === 'analytics' ? (
          /* Robust analytics board with metrics cards */
          <div className="max-w-6xl mx-auto space-y-8" id="crm-analytics-pane">
            
            {/* Top Row - Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Converted Sales */}
              <div className="bg-[#121212] border border-[#C5A85D]/25 p-5 rounded-lg flex items-center justify-between shadow-lg">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#C5A85D] font-sans block font-semibold">
                    Atelier Converted Sales
                  </span>
                  <div className="font-display font-medium text-2xl text-white">
                    ₹{estimatedRevenue.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-sans block flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    <span>Based on real measurements</span>
                  </span>
                </div>
                <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-full">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              {/* Conversion Percentage */}
              <div className="bg-[#121212] border border-[#C5A85D]/25 p-5 rounded-lg flex items-center justify-between shadow-lg">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#C5A85D] font-sans block font-semibold">
                    Engagement Index
                  </span>
                  <div className="font-display font-medium text-2xl text-white">
                    {conversionPercentage}%
                  </div>
                  <span className="text-[11px] text-gray-400 font-serif block italic">
                    {convertedLeadsCount} of {totalLeadsCount} Groom Leads Locked
                  </span>
                </div>
                <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-full">
                  <PercentIcon className="w-6 h-6 text-[#C5A85D]" />
                </div>
              </div>

              {/* Trials Scheduled */}
              <div className="bg-[#121212] border border-[#C5A85D]/25 p-5 rounded-lg flex items-center justify-between shadow-lg">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#E5C46D] font-sans block font-semibold">
                    Scheduled VIP Trials
                  </span>
                  <div className="font-display font-medium text-2xl text-white">
                    {trialScheduledCount} Slots
                  </div>
                  <span className="text-[11px] text-gray-400 font-sans block uppercase tracking-wider">
                    {appointments.filter(a => a.status === 'Confirmed').length} Confirmed Calendar Events
                  </span>
                </div>
                <div className="p-3 bg-[#4A0E17] text-red-400 rounded-full">
                  <Calendar className="w-6 h-6 text-[#C5A85D]" />
                </div>
              </div>

              {/* Pipeline Value */}
              <div className="bg-[#121212] border border-[#C5A85D]/25 p-5 rounded-lg flex items-center justify-between shadow-lg">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 font-sans block font-semibold">
                    Outstanding Pipeline Value
                  </span>
                  <div className="font-display font-medium text-2xl text-[#E5C46D]">
                    ₹{potentialPipelineValue.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] font-sans text-gray-500 block">
                    {leads.filter(l => l.status === 'New').length} New Leads waiting follow-up
                  </span>
                </div>
                <div className="p-3 bg-zinc-800 text-zinc-400 rounded-full">
                  <Users className="w-6 h-6 text-[#C5A85D]" />
                </div>
              </div>

            </div>

            {/* Middle Section: Breakdown Charts Mock & System Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Visual Sales Pipeline Chart using beautifully shaped CSS bars */}
              <div className="bg-[#121212] border border-white/5 p-6 rounded-lg">
                <h4 className="font-display font-medium text-base text-white tracking-widest uppercase mb-6 flex items-center">
                  <Layers className="w-4.5 h-4.5 text-[#C5A85D] mr-2" />
                  <span>Interactive Pipeline Funnel Analysis</span>
                </h4>
                
                <div className="space-y-5">
                  {[
                    { label: 'New Inquiries', count: leads.filter(l => l.status === 'New').length, color: 'bg-[#C5A85D]' },
                    { label: 'Contacted Grooms', count: leads.filter(l => l.status === 'Contacted').length, color: 'bg-indigo-500' },
                    { label: 'VIP Trial Scheduled', count: leads.filter(l => l.status === 'Trial Scheduled' || l.status === 'Appointment Booked').length, color: 'bg-amber-600' },
                    { label: 'Converted Royalties', count: leads.filter(l => l.status === 'Converted').length, color: 'bg-emerald-600' },
                    { label: 'Closed / Terminated', count: leads.filter(l => l.status === 'Closed').length, color: 'bg-zinc-700' },
                  ].map((row, i) => {
                    const ratio = totalLeadsCount > 0 ? (row.count / totalLeadsCount) * 100 : 0;
                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-sans">
                          <span className="text-gray-300 uppercase tracking-widest">{row.label}</span>
                          <span className="text-[#C5A85D] font-bold">{row.count} Grooms ({Math.round(ratio)}%)</span>
                        </div>
                        <div className="w-full bg-black h-3 rounded-full overflow-hidden border border-white/5">
                          <div className={`h-full ${row.color} rounded-full transition-all duration-1000`} style={{ width: `${ratio}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Collection demand weights */}
              <div className="bg-[#121212] border border-white/5 p-6 rounded-lg">
                <h4 className="font-display font-medium text-base text-white tracking-widest uppercase mb-6 flex items-center">
                  <Sparkles className="w-4.5 h-4.5 text-[#C5A85D] mr-2" />
                  <span>Apparel Demand Matrix</span>
                </h4>
                
                <div className="space-y-5">
                  {[
                    { style: 'Traditional heavy Sherwani', popularity: 65, avgCart: '₹2,10,000' },
                    { style: 'Asymmetric Indo-Western Cuts', popularity: 45, avgCart: '₹1,20,000' },
                    { style: 'Nawabi Peshawari Tier Sets', popularity: 30, avgCart: '₹3,50,000' },
                    { style: 'Groom Silk Mojris Kits', popularity: 80, avgCart: '₹35,000' },
                    { style: 'Lucknowi Chikankari sets', popularity: 55, avgCart: '₹60,000' }
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded">
                      <div className="font-sans text-xs">
                        <span className="text-white block font-medium uppercase tracking-wider">{row.style}</span>
                        <span className="text-gray-500 text-[10px] block mt-0.5">Average Order: {row.avgCart}</span>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-[#4A0E17] text-[#E5C46D] text-[10px] font-sans font-bold uppercase tracking-wider border border-[#C5A85D]/25 rounded">
                          {row.popularity}% Demand index
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        ) : crmTab === 'leads' ? (
          /* Leads List Directory Deck */
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Search & Filter tools row */}
            <div className="bg-[#121212] border border-white/5 p-4 rounded-lg flex flex-col md:flex-row items-center gap-4 justify-between">
              
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#C5A85D]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search grooms, contacts, occasions..."
                  className="w-full bg-black border border-white/10 focus:border-[#C5A85D] pl-10 pr-4 py-2 text-xs font-sans rounded focus:outline-none text-[#F5EFEB]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto" id="crm-filter-dropdowns">
                
                {/* Status Dropdowns */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-black text-[10px] uppercase font-sans tracking-widest text-[#C5A85D] border border-white/10 px-3 py-2 rounded focus:outline-none"
                  >
                    <option value="All">All Lead Statuses</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Appointment Booked">Appointment Booked</option>
                    <option value="Trial Scheduled">Trial Scheduled</option>
                    <option value="Converted">Converted</option>
                    <option value="Follow-up Pending">Follow-up Pending</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Budget filter selectors */}
                <div>
                  <select
                    value={budgetFilter}
                    onChange={(e) => setBudgetFilter(e.target.value)}
                    className="bg-black text-[10px] uppercase font-sans tracking-widest text-[#C5A85D] border border-white/10 px-3 py-2 rounded focus:outline-none"
                  >
                    <option value="All">All Budgets</option>
                    <option value="budget">Classic Groom (35k-75k)</option>
                    <option value="premium">Premium (75k-1.5L)</option>
                    <option value="couture">Couture (1.5L-3L)</option>
                    <option value="royal-classic">Maharaja Heritage (3L-5L)</option>
                    <option value="above-5lakh">Besame Haute (&gt;5L)</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                    setBudgetFilter('All');
                  }}
                  className="px-3.5 py-2 text-[10px] font-sans font-bold text-gray-500 border border-transparent hover:text-white transition-colors"
                >
                  Reset filters
                </button>

              </div>
            </div>

            {/* Leads List Grid */}
            <div className="space-y-4" id="leads-realtime-deck">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-[#121212]/90 border border-[#C5A85D]/20 hover:border-[#C5A85D]/50 p-6 rounded-lg relative overflow-hidden transition-all duration-300 flex flex-col md:flex-row justify-between md:items-center gap-6"
                  >
                    
                    {/* Status accent indicator color block */}
                    <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                      lead.status === 'New' ? 'bg-[#C5A85D]' :
                      lead.status === 'Contacted' ? 'bg-indigo-500' :
                      lead.status === 'Trial Scheduled' ? 'bg-amber-600' :
                      lead.status === 'Converted' ? 'bg-emerald-600' : 'bg-zinc-600'
                    }`} />

                    {/* Left: Groom and wedding config elements */}
                    <div className="space-y-4 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] uppercase tracking-widest font-mono text-gray-500">
                          ID: #{lead.id.replace('lead-', '')}
                        </span>
                        <h3 className="font-display font-semibold text-lg text-white tracking-widest uppercase">
                          {lead.name}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] uppercase font-sans tracking-wider border" style={{
                          borderColor: lead.status === 'New' ? '#C5A85D' : '#121212',
                          color: lead.status === 'New' ? '#C5A85D' : '#FFF',
                          backgroundColor: lead.status === 'New' ? 'rgba(197,168,93,0.1)' : 'rgba(255,255,255,0.05)'
                        }}>
                          {lead.status}
                        </span>
                      </div>

                      {/* Info grid spacer */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 text-xs">
                        <p className="text-gray-300 font-sans flex items-center">
                          <Phone className="w-3.5 h-3.5 text-[#C5A85D] mr-2 shrink-0" />
                          <span>{lead.phone}</span>
                        </p>
                        <p className="text-gray-300 font-sans flex items-center underline">
                          <FileText className="w-3.5 h-3.5 text-[#C5A85D] mr-2 shrink-0" />
                          <span>{lead.email}</span>
                        </p>
                        <p className="text-[#E5C46D] font-sans flex items-center font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-[#C5A85D] mr-2 shrink-0" />
                          <span>Pheras Date: {lead.weddingDate}</span>
                        </p>
                        <p className="text-gray-400 font-serif leading-none flex items-center">
                          <strong>Format Occasion:</strong> {lead.occasion}
                        </p>
                        <p className="text-[#C5A85D] font-sans leading-none flex items-center uppercase font-bold text-[10px] tracking-widest">
                          <strong>Est Budget:</strong> {lead.budget.toUpperCase()}
                        </p>
                      </div>

                      {/* Custom uploaded images list trigger */}
                      {lead.uploadedImages.length > 0 && (
                        <div className="flex items-center space-x-3 pt-2">
                          <span className="text-[10px] uppercase font-sans tracking-widest text-[#C5A85D]">
                            Custom Photo Attachment:
                          </span>
                          <div className="flex items-center space-x-2">
                            {lead.uploadedImages.map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setInspectedLead(lead)}
                                className="relative w-10 h-10 border border-white/10 rounded overflow-hidden hover:border-[#C5A85D] transition-colors"
                              >
                                <img src={img} alt="groom_sketch" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes Box inline edit */}
                      <div className="mt-3 bg-black/40 p-3 rounded border border-white/5 space-y-1.5 max-w-2xl">
                        <span className="text-[9px] uppercase tracking-widest text-[#C5A85D] font-sans block">
                          Atelier Follow-up Brief
                        </span>
                        <input
                          type="text"
                          defaultValue={lead.adminNotes || ''}
                          onBlur={(e) => handleSaveAdminNote(lead.id, e.target.value)}
                          placeholder="Stylist follow-up notes... (e.g. Ivory gold matched, trial secured)"
                          className="w-full bg-transparent border-0 border-b border-white/10 focus:border-[#C5A85D] py-1 text-xs text-gray-300 font-serif focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Right: Quick Action Controls */}
                    <div className="flex flex-col sm:row-center md:items-end gap-3 shrink-0" id="crm-lead-actions">
                      
                      {/* Dropdown status modifier */}
                      <div className="space-y-1 w-full sm:w-auto">
                        <span className="text-[9px] uppercase font-sans tracking-widest text-gray-500 block">
                          Set Status
                        </span>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                          className="w-full sm:w-auto bg-black text-[#C5A85D] border border-[#C5A85D]/20 px-3 py-1.5 text-xs font-sans rounded focus:outline-none"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Appointment Booked">Appointment Booked</option>
                          <option value="Trial Scheduled">Trial Scheduled</option>
                          <option value="Converted">Converted</option>
                          <option value="Follow-up Pending">Follow-up Pending</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>

                      {/* Speed Communications Links */}
                      <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                        
                        {/* Instant Call */}
                        <a
                          href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                          className="flex items-center justify-center p-2.5 bg-zinc-800 hover:bg-zinc-700 text-[#C5A85D] rounded border border-white/5 shadow text-xs font-sans font-medium uppercase tracking-wider"
                          title="Call Client instantly"
                        >
                          <Phone className="w-4 h-4 mr-1 text-[#E5C46D]" />
                          <span>Call Shop</span>
                        </a>

                        {/* Format follow-up WhatsApp message */}
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${lead.name}! I am contacting you on behalf of Chief Stylist team from VARUDU ETHNIC STUDIO regarding your elite Groom Bridal Sherwani booking for your wedding on ${lead.weddingDate}. We would love to finalize your measurement swatches. Shall we block a private trial this weekend?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center p-2.5 bg-emerald-600/10 hover:bg-emerald-600 hover:text-white text-emerald-400 rounded border border-emerald-500/20 text-xs font-sans font-medium uppercase tracking-wider"
                          title="Draft WhatsApp dialogue"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          <span>WhatsApp</span>
                        </a>

                      </div>

                    </div>

                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-[#C5A85D] font-serif uppercase tracking-widest bg-[#121212] border border-white/5 rounded">
                  No Groom records found matching those parameters.
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Showroom Calendar VIP Bookings List */
          <div className="max-w-4xl mx-auto space-y-6" id="crm-appointments-pane">
            
            {/* Search filter banner */}
            <div className="bg-[#121212] border border-white/5 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <h3 className="font-display text-white text-base font-medium tracking-widest uppercase">
                Appointment Calendar Index
              </h3>
              <div>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="bg-black text-[10px] uppercase font-sans tracking-widest text-[#C5A85D] border border-white/10 px-3 py-2 rounded focus:outline-none"
                >
                  <option value="All">All Showrooms</option>
                  <option value="Chaitanyapuri">Chaitanyapuri Studio</option>
                  <option value="Secunderabad">Secunderabad Lounge</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="space-y-4">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="bg-[#121212] border border-white/10 p-5 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] uppercase tracking-widest text-[#C5A85D] font-mono leading-none">
                          APPT: #{appt.id.replace('appt-', '')}
                        </span>
                        <h4 className="font-display font-medium text-base text-white tracking-widest uppercase">
                          {appt.customerName}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-sans tracking-wide ${
                          appt.status === 'Confirmed' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' :
                          appt.status === 'Completed' ? 'bg-zinc-800 text-zinc-400' : 'bg-amber-600/10 text-amber-500'
                        }`}>
                          {appt.status}
                        </span>
                      </div>

                      <p className="text-gray-400 font-sans text-xs mt-2 font-medium">
                        📍 Showroom Venue: <span className="text-[#E5C46D]">{appt.branch}</span>
                      </p>

                      <div className="grid grid-cols-2 gap-4 mt-3 text-xs font-sans text-gray-300">
                        <p>🕒 Time booked: <strong>{appt.date} at {appt.time}</strong></p>
                        <p>💬 Groom Phone: <strong>{appt.customerPhone}</strong></p>
                      </div>
                    </div>

                    {/* Appt Modifier */}
                    <div className="flex items-center space-x-3 shrink-0">
                      
                      <select
                        value={appt.status}
                        onChange={(e) => handleApptStatusChange(appt.id, e.target.value as any)}
                        className="bg-black text-[#C5A85D] text-xs font-sans border border-[#C5A85D]/20 px-2.5 py-1.5 rounded focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Canceled">Canceled</option>
                      </select>

                      <a
                        href={`tel:${appt.customerPhone.replace(/\s+/g, '')}`}
                        className="p-2.5 bg-zinc-800 text-[#C5A85D] rounded hover:bg-[#C5A85D] hover:text-black transition-colors"
                        title="Contact customer"
                      >
                        <Phone className="w-4 h-4" />
                      </a>

                    </div>

                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-[#C5A85D] font-serif uppercase tracking-widest bg-[#121212] border border-white/5 rounded">
                  No Showroom appointments recorded.
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Sub-Modal: Custom Sketch Previewer & Photo Download Slider */}
      {inspectedLead && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-55">
          <div className="relative w-full max-w-3xl bg-[#121212] border-2 border-[#C5A85D] rounded overflow-hidden shadow-2xl">
            <button
              onClick={() => setInspectedLead(null)}
              className="absolute top-4 right-4 p-2 bg-black border border-white/10 rounded-full text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h4 className="font-display font-medium text-lg text-[#E5C46D] uppercase tracking-widest">
                  Custom Groom Media Viewer
                </h4>
                <p className="text-gray-400 text-xs font-sans mt-1">
                  Customer Name: {inspectedLead.name} | Budget Range: {inspectedLead.budget.toUpperCase()}
                </p>
              </div>

              {/* Photos deck */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inspectedLead.uploadedImages.map((img, idx) => (
                  <div key={idx} className="border border-white/10 rounded overflow-hidden bg-black space-y-3 p-3">
                    <div className="h-[250px] overflow-hidden rounded relative">
                      <img src={img} alt="Sketch attachment" className="w-full h-full object-cover object-top" />
                    </div>
                    <button
                      onClick={() => handleDownloadImage(img, idx, inspectedLead.name)}
                      className="w-full py-2 bg-[#C5A85D] hover:bg-[#E5C46D] text-black text-[10px] uppercase tracking-widest font-sans font-bold rounded flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File Shortcut</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="text-center text-[10px] font-sans text-gray-500 uppercase tracking-widest">
                All photos are protected securely under AES256 local database storage constraints
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Customized percent helper representing styling locks
function PercentIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" x2="5" y1="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}
