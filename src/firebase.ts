import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore, doc, getDoc } from 'firebase/firestore';
// @ts-ignore
import firebaseConfigRaw from '../firebase-applet-config.json?raw';

// Safe parse of the Firebase configuration to survive empty/missing config during deployments
let firebaseConfig: any = {
  projectId: "elemental-path-81b2m",
  appId: "1:333821311032:web:04444588efbdd955ce0ecd",
  apiKey: "AIzaSyB3U1b_-EcWrruxNJB8DFjT-o_PLkzD2Og",
  authDomain: "elemental-path-81b2m.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-92e15d51-850b-4ef4-9643-bba73e28c56d",
  storageBucket: "elemental-path-81b2m.firebasestorage.app",
  messagingSenderId: "333821311032",
  measurementId: ""
};

try {
  if (firebaseConfigRaw && firebaseConfigRaw.trim()) {
    const parsed = JSON.parse(firebaseConfigRaw);
    if (parsed && typeof parsed === 'object') {
      firebaseConfig = {
        ...firebaseConfig,
        ...parsed
      };
    }
  }
} catch (e) {
  console.warn("Could not parse firebase-applet-config.json raw string safely. Using fallback placeholders.", e);
}

const app = initializeApp(firebaseConfig);

let firestoreInstance: any;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  console.warn("IndexedDB offline cache is not supported or blocked in this iframe. Falling back to default in-memory cache.", e);
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance; /* CRITICAL: The app will break without this line */
export const auth = getAuth();

// --- CLOUDINARY ENVIRONMENT CONFIGURATION RESOLVER ---
export async function getCloudinaryConfig(): Promise<{ cloudName: string; uploadPreset: string }> {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'cloudinary'));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        cloudName: data.cloud_name || 'dckhkshb8',
        uploadPreset: data.upload_preset || 'varudu_uploads',
      };
    }
  } catch (err) {
    console.error('Error fetching Cloudinary settings from Firestore:', err);
  }
  // Safe default public check/fallback or empty values to configure
  return { cloudName: 'dckhkshb8', uploadPreset: 'varudu_uploads' };
}

// Browser native SHA-1 hash generator for Cloudinary signed deletion signatures
async function sha1(string: string): Promise<string> {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await window.crypto.subtle.digest('SHA-1', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Parses Cloudinary URL or path to pull publicId and resourceType
export function parseCloudinaryUrlOrPath(urlOrPath: string): { publicId: string; resourceType: 'image' | 'video' } {
  let resourceType: 'image' | 'video' = 'image';
  if (
    urlOrPath.includes('/video/') || 
    urlOrPath.endsWith('.mp4') || 
    urlOrPath.endsWith('.mov') || 
    urlOrPath.endsWith('.webm') || 
    urlOrPath.includes('videoUrl')
  ) {
    resourceType = 'video';
  }

  if (urlOrPath.startsWith('http')) {
    try {
      const url = new URL(urlOrPath);
      const pathname = url.pathname; // e.g. /cloud_name/image/upload/v12345/folder/public_id.jpg
      const parts = pathname.split('/');
      
      const uploadIdx = parts.indexOf('upload');
      if (uploadIdx !== -1 && uploadIdx < parts.length - 1) {
        let publicIdParts = parts.slice(uploadIdx + 2); // default skip over v[version]
        // If there's no version prefix v[digits], use parts from uploadIdx + 1
        if (!parts[uploadIdx + 1].startsWith('v') && !/^\d+$/.test(parts[uploadIdx + 1])) {
          publicIdParts = parts.slice(uploadIdx + 1);
        }
        
        let publicId = publicIdParts.join('/');
        const dotIdx = publicId.lastIndexOf('.');
        if (dotIdx !== -1) {
          publicId = publicId.substring(0, dotIdx);
        }
        
        if (parts.includes('video')) {
          resourceType = 'video';
        }
        
        return { publicId, resourceType };
      }
    } catch (e) {
      console.warn('Failed parsing Cloudinary URL, falling back to basic extraction:', e);
    }
  }

  // Fallback if relative path
  let cleanPath = urlOrPath;
  const dotIdx = cleanPath.lastIndexOf('.');
  if (dotIdx !== -1 && dotIdx > cleanPath.lastIndexOf('/')) {
    cleanPath = cleanPath.substring(0, dotIdx);
  }
  return { publicId: cleanPath, resourceType };
}

// --- CLOUDINARY DROP-IN HELPER FUNCTIONS (REPLACING FIREBASE STORAGE) ---
export async function uploadToStorage(path: string, file: Blob | File): Promise<string> {
  const config = await getCloudinaryConfig();
  if (!config.cloudName || !config.uploadPreset) {
    throw new Error('Cloudinary is not configured. Please input your Cloud Name and Upload Preset in the Admin Panel settings first.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.uploadPreset);
  
  // Clean custom public_id and folder structure
  const parts = path.split('/');
  if (parts.length > 1) {
    const folder = parts.slice(0, -1).join('/');
    formData.append('folder', folder);
    
    const lastPart = parts[parts.length - 1];
    const cleanPublicId = lastPart.replace(/[^a-zA-Z0-9_-]/g, '_');
    formData.append('public_id', cleanPublicId);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Cloudinary Upload Failed: ${errText || response.statusText}`);
  }

  const data = await response.json();
  return data.secure_url;
}

export async function deleteFromStorage(urlOrPath: string): Promise<void> {
  // Client-side API Secret/Key usage is removed. Deletion operates only on Firestore records,
  // making the asset hidden/removed live across all device interfaces instantly.
  console.log('Client-side deletion safe-intercept:', urlOrPath);
}

// Structured Firestore error logger as mandated by guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
