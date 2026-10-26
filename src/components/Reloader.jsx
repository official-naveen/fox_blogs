import React from "react";
import "./Reloader.css";

function Reloader() {
  return (
    <div className="reloader" role="status" aria-live="polite">
      <div className="reloader__box">
        <span className="reloader__fox" aria-hidden="true">🦊</span>
        <div className="reloader__bar"><span></span></div>
        <p>Loading…</p>
      </div>
    </div>
  );
}

export default Reloader;
