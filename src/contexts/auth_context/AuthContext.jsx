import React, { useContext, useEffect, useState } from "react";
import authContextAPI from "./authContextAPI";
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { auth, fireDB } from "../../firebase/FirebaseConfig";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import loadingContextAPI from "../loading_context/loadingContextAPI";

/**
 * Looks up a user's profile document. New accounts are stored under their
 * Firebase uid; older / admin-created records are matched by email.
 * Returns { role, id } or null when no profile exists.
 */
async function fetchProfile(firebaseUser) {
  const byUid = await getDoc(doc(fireDB, "users", firebaseUser.uid));
  if (byUid.exists()) {
    return { role: byUid.data().role, id: byUid.id };
  }
  const snap = await getDocs(
    query(collection(fireDB, "users"), where("email", "==", firebaseUser.email))
  );
  if (snap.empty) return null;
  return { role: snap.docs[0].data().role, id: snap.docs[0].id };
}

const isAdminRole = (role) => String(role || "").toLowerCase() === "admin";

function AuthContext(props) {
  const { setIsLoading, setNotification } = useContext(loadingContextAPI);

  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [, setProfileVersion] = useState(0);
  // true until Firebase has told us whether someone is signed in
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  // Firebase is the single source of truth for "who is logged in".
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (!firebaseUser) {
        setIsAdmin(false);
        setAuthLoading(false);
        return;
      }
      try {
        const profile = await fetchProfile(firebaseUser);
        setIsAdmin(isAdminRole(profile?.role));
      } catch (error) {
        console.error("Could not load user profile:", error);
        setIsAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const notify = (type, message) =>
    setNotification({ type, message, isVisible: true });

  const signUp = async (email, password, name) => {
    setIsLoading(true);
    try {
      // 1. Create the auth account first, so we never leave an orphan profile.
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      // 2. Store the profile under the uid. Everyone starts as a plain "user";
      //    Firestore rules stop anyone from granting themselves "admin".
      await setDoc(doc(fireDB, "users", cred.user.uid), {
        name,
        email,
        role: "user",
      });

      notify("success", "Account created. Welcome!");
      navigate("/");
    } catch (error) {
      console.error("Sign up failed:", error);
      const message =
        error.code === "auth/email-already-in-use"
          ? "That email is already registered."
          : error.code === "auth/weak-password"
          ? "Password should be at least 6 characters."
          : "Sign up failed. Please try again.";
      notify("error", message);
    } finally {
      setIsLoading(false);
    }
  };

  const logIn = async (email, password) => {
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchProfile(cred.user).catch(() => null);
      const admin = isAdminRole(profile?.role);
      setIsAdmin(admin);
      notify("success", "Logged in successfully");
      navigate(admin ? "/admin/dashboard" : "/");
    } catch (error) {
      console.error("Sign in failed:", error);
      notify("error", "Wrong email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      notify("success", "Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      notify("error", "Could not log out. Please try again.");
    }
  };

  /** Sends a password-reset email. Always reports success to avoid leaking which emails exist. */
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      if (error.code !== "auth/user-not-found") console.error("Password reset failed:", error);
    }
  };

  /** Changes the display name in both Firebase Auth and the Firestore profile. */
  const updateName = async (name) => {
    await updateProfile(auth.currentUser, { displayName: name });
    await updateDoc(doc(fireDB, "users", auth.currentUser.uid), { name });
    // auth.currentUser is updated in place; bump state so consumers re-render
    setProfileVersion((v) => v + 1);
  };

  /** Changes the password after re-checking the current one. */
  const changePassword = async (currentPassword, newPassword) => {
    const user = auth.currentUser;
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
    await updatePassword(user, newPassword);
  };

  return (
    <authContextAPI.Provider
      value={{
        signUp,
        logIn,
        logout,
        resetPassword,
        updateName,
        changePassword,
        currentUser,
        isLoggedIn: !!currentUser,
        isAdmin,
        authLoading,
      }}
    >
      {props.children}
    </authContextAPI.Provider>
  );
}

export default AuthContext;
