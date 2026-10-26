import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import authContextAPI from "../contexts/auth_context/authContextAPI";
import usePageTitle from "../hooks/usePageTitle";

function ForgotPassword() {
  usePageTitle("Reset password");
  const { resetPassword } = useContext(authContextAPI);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    await resetPassword(email.trim());
    setBusy(false);
    setSent(true);
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to choose a new password."
      footer={<Link to="/signin"><i className="fa-solid fa-arrow-left"></i> Back to sign in</Link>}
    >
      {sent ? (
        <div className="card" style={{ padding: "1.25rem", boxShadow: "none" }} role="status">
          <strong>Check your inbox</strong>
          <p style={{ color: "var(--muted)", marginTop: "0.35rem" }}>
            If an account exists for <b>{email}</b>, a reset link is on its way. It may take a minute — check spam too.
          </p>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

export default ForgotPassword;
