import React, { useContext, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { fireDB } from "../firebase/FirebaseConfig";
import loadingContextAPI from "../contexts/loading_context/loadingContextAPI";

/** Email capture used in the footer and on the home page. */
function NewsletterForm({ className = "" }) {
  const { setNotification } = useContext(loadingContextAPI);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addDoc(collection(fireDB, "subscribers"), {
        email: email.trim().toLowerCase(),
        createdAt: serverTimestamp(),
      });
      setEmail("");
      setNotification({ type: "success", message: "You're in! Thanks for subscribing.", isVisible: true });
    } catch (error) {
      console.error("Subscribe failed:", error);
      setNotification({ type: "error", message: "Could not subscribe. Please try again.", isVisible: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={`newsletter-form ${className}`} onSubmit={handleSubmit}>
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <input
        id="newsletter-email"
        type="email"
        className="input"
        placeholder="you@example.com"
        required
        maxLength={200}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Subscribing…" : "Subscribe"}
      </button>
    </form>
  );
}

export default NewsletterForm;
