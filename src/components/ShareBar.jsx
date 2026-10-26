import React, { useContext } from "react";
import loadingContextAPI from "../contexts/loading_context/loadingContextAPI";

function ShareBar({ title }) {
  const { setNotification } = useContext(loadingContextAPI);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const enc = encodeURIComponent;

  const links = [
    { label: "Share on LinkedIn", icon: "fa-brands fa-linkedin-in", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { label: "Share on X", icon: "fa-brands fa-x-twitter", href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}` },
    { label: "Share on Facebook", icon: "fa-brands fa-facebook-f", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { label: "Share on WhatsApp", icon: "fa-brands fa-whatsapp", href: `https://wa.me/?text=${enc(`${title} ${url}`)}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setNotification({ type: "success", message: "Link copied to clipboard", isVisible: true });
    } catch {
      setNotification({ type: "error", message: "Could not copy the link", isVisible: true });
    }
  };

  return (
    <div className="share-bar" role="group" aria-label="Share this post">
      <span className="share-bar__label">Share</span>
      {links.map((l) => (
        <a key={l.label} className="icon-btn" href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} title={l.label}>
          <i className={l.icon}></i>
        </a>
      ))}
      <button type="button" className="icon-btn" onClick={copy} aria-label="Copy link" title="Copy link">
        <i className="fa-solid fa-link"></i>
      </button>
    </div>
  );
}

export default ShareBar;
