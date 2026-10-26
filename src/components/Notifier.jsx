import React, { useState, useEffect } from "react";
import "./Notifier.css";

function Notifier({
  type = "info",
  message,
  isVisible,
  onClose,
  timeout = 3000,
}) {
  const [show, setShow] = useState(!!isVisible);

  const handleClose = () => {
    setShow(false);
    if (onClose) onClose();
  };

  // Auto-dismiss after timeout. Depends on `message` too so that a new toast
  // restarts the timer even if the previous one is still on screen.
  useEffect(() => {
    if (!isVisible) {
      setShow(false);
      return undefined;
    }
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
      if (onClose) onClose();
    }, timeout);
    return () => clearTimeout(timer);
  }, [isVisible, message, timeout, onClose]);

  const typeClasses = {
    success: "fox-blog-notifier-success",
    error: "fox-blog-notifier-error",
    warning: "fox-blog-notifier-warning",
    info: "fox-blog-notifier-info",
  };

  return (
    <div
      className={`fox-blog-notifier ${typeClasses[type] || typeClasses.info} ${
        show ? "fox-blog-notifier-show" : "fox-blog-notifier-hide"
      }`}
      role="status"
    >
      <span>{message}</span>
      <button
        className="fox-blog-notifier-close-btn"
        onClick={handleClose}
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
}

export default Notifier;
