import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  writeBatch
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific Database ID if present
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Firestore helper functions for app state sync
export async function syncCollectionToFirestore<T extends Record<string, any>>(
  collectionName: string,
  items: T[],
  docIdField: string = 'id'
) {
  try {
    const batch = writeBatch(db);
    items.forEach((item) => {
      const docId = item[docIdField] || item.id || item.tipo;
      if (docId) {
        const itemRef = doc(db, collectionName, String(docId));
        batch.set(itemRef, item, { merge: true });
      }
    });
    await batch.commit();
  } catch (err) {
    console.error(`Error syncing collection ${collectionName} to Firestore:`, err);
  }
}

export async function saveDocumentToFirestore<T extends Record<string, any>>(
  collectionName: string,
  item: T,
  docIdField: string = 'id'
) {
  try {
    const docId = item[docIdField] || item.id || item.tipo;
    if (docId) {
      const docRef = doc(db, collectionName, String(docId));
      await setDoc(docRef, item, { merge: true });
    } else {
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, item);
      return docRef.id;
    }
  } catch (err) {
    console.error(`Error saving document to ${collectionName}:`, err);
  }
}

export async function deleteDocumentFromFirestore(collectionName: string, id: string) {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error(`Error deleting document from ${collectionName}:`, err);
  }
}

export function subscribeToCollection<T>(
  collectionName: string,
  callback: (data: T[]) => void
) {
  const q = query(collection(db, collectionName));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as T);
      });
      callback(items);
    },
    (error) => {
      console.warn(`Firestore subscription error on ${collectionName}:`, error);
    }
  );
}
