import React, { useEffect } from "react";
import "./ConfirmationOverlay.css";
import Portal from "./Portal";

const ConfirmationOverlay = ({
  isOpen,
  status,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && onCancel?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <Portal>
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel?.()}>
      <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <h3 className="modal-title" id="confirm-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button
            className={`btn ${status === "danger" ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
    </Portal>
  );
};

export default ConfirmationOverlay;
