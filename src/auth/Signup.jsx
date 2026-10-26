import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import PasswordInput from "./PasswordInput";
import authContextAPI from "../contexts/auth_context/authContextAPI";
import loadingContextAPI from "../contexts/loading_context/loadingContextAPI";
import usePageTitle from "../hooks/usePageTitle";

const SignUp = () => {
  usePageTitle("Create account");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signUp } = useContext(authContextAPI);
  const { setNotification } = useContext(loadingContextAPI);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setNotification({ type: "warning", message: "Passwords do not match.", isVisible: true });
      return;
    }
    signUp(email.trim(), password, name.trim());
  };

  return (
    <AuthLayout
      title="Join Fox Blogs"
      subtitle="Create a free account to comment and save your favourite posts."
      footer={<>Already have an account? <Link to="/signin">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" className="input" type="text" placeholder="Your name" autoComplete="name" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" className="input" type="email" placeholder="you@example.com" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <PasswordInput id="password" placeholder="At least 6 characters" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="confirm">Confirm password</label>
          <PasswordInput id="confirm" placeholder="Repeat your password" autoComplete="new-password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary btn-block">Create account</button>
        <p className="hint" style={{ marginTop: "1rem", textAlign: "center" }}>
          By signing up you agree to the <Link to="/terms" style={{ textDecoration: "underline" }}>Terms</Link> and <Link to="/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</Link>.
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
