import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "mock-app-id"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export interface Thought {
  id: string;
  text: string;
  createdAt: string;
}

export const subscribeToThoughts = (callback: (thoughts: Thought[]) => void) => {
  const q = query(collection(db, "thoughts"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const thoughts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        text: data.text,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : new Date().toISOString()
      };
    });
    callback(thoughts);
  }, (error) => {
    console.error("Error fetching thoughts:", error);
    callback([]);
  });
};

export const createThought = async (text: string) => {
  try {
    await addDoc(collection(db, "thoughts"), {
      text,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error creating thought:", error);
    throw error;
  }
};

export const removeThought = async (id: string) => {
  try {
    await deleteDoc(doc(db, "thoughts", id));
  } catch (error) {
    console.error("Error deleting thought:", error);
    throw error;
  }
};
