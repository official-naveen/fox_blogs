import React, { useState } from "react";

/** Password input with a show/hide toggle. */
function PasswordInput({ id, ...props }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="password-field">
      <input id={id} className="input" type={shown ? "text" : "password"} {...props} />
      <button type="button" onClick={() => setShown((s) => !s)} aria-label={shown ? "Hide password" : "Show password"}>
        <i className={`fa-regular ${shown ? "fa-eye-slash" : "fa-eye"}`}></i>
      </button>
    </div>
  );
}

export default PasswordInput;
