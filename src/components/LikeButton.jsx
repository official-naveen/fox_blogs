import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, deleteDoc, doc, getCountFromServer, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { fireDB } from "../firebase/FirebaseConfig";
import authContextAPI from "../contexts/auth_context/authContextAPI";
import loadingContextAPI from "../contexts/loading_context/loadingContextAPI";

/** Heart button. Likes are stored at posts/{postId}/likes/{uid}, so one like per person. */
function LikeButton({ postId }) {
  const { currentUser } = useContext(authContextAPI);
  const { setNotification } = useContext(loadingContextAPI);
  const navigate = useNavigate();
  const [count, setCount] = useState(null);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setCount(null);
    getCountFromServer(collection(fireDB, "posts", postId, "likes"))
      .then((s) => !cancelled && setCount(s.data().count))
      .catch(() => !cancelled && setCount(0));
    return () => {
      cancelled = true;
    };
  }, [postId]);

  useEffect(() => {
    if (!currentUser) {
      setLiked(false);
      return;
    }
    getDoc(doc(fireDB, "posts", postId, "likes", currentUser.uid))
      .then((s) => setLiked(s.exists()))
      .catch(() => {});
  }, [currentUser, postId]);

  const toggle = async () => {
    if (!currentUser) {
      setNotification({ type: "info", message: "Sign in to like posts.", isVisible: true });
      navigate("/signin");
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next);
    setCount((c) => Math.max(0, (c || 0) + (next ? 1 : -1)));
    try {
      const ref = doc(fireDB, "posts", postId, "likes", currentUser.uid);
      await (next ? setDoc(ref, { uid: currentUser.uid, createdAt: serverTimestamp() }) : deleteDoc(ref));
    } catch (error) {
      console.error("Like failed:", error);
      setLiked(!next);
      setCount((c) => Math.max(0, (c || 0) + (next ? -1 : 1)));
      setNotification({ type: "error", message: "Could not update your like.", isVisible: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" className={`btn btn-sm like-btn ${liked ? "is-liked" : "btn-outline"}`} onClick={toggle} aria-pressed={liked} aria-label={liked ? "Unlike this post" : "Like this post"}>
      <i className={`${liked ? "fa-solid" : "fa-regular"} fa-heart`}></i>
      <span>{count === null ? "…" : count}</span>
    </button>
  );
}

export default LikeButton;
