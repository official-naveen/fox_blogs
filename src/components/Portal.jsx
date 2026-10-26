import { createPortal } from "react-dom";

/** Renders children straight into <body>, so full-screen modals can never be clipped by a parent. */
function Portal({ children }) {
  return createPortal(children, document.body);
}

export default Portal;
