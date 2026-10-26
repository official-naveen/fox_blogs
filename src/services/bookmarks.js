import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { fireDB } from "../firebase/FirebaseConfig";

/** Saved posts live in users/{uid}/bookmarks/{postId}. */
export const getBookmarkIds = async (uid) => {
  const snap = await getDocs(collection(fireDB, "users", uid, "bookmarks"));
  return snap.docs.map((d) => d.id);
};
export const addBookmark = (uid, postId) =>
  setDoc(doc(fireDB, "users", uid, "bookmarks", postId), { postId, createdAt: serverTimestamp() });
export const removeBookmark = (uid, postId) =>
  deleteDoc(doc(fireDB, "users", uid, "bookmarks", postId));
