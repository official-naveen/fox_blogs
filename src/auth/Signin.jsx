import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import PasswordInput from "./PasswordInput";
import authContextAPI from "../contexts/auth_context/authContextAPI";
import usePageTitle from "../hooks/usePageTitle";

const Signin = () => {
  usePageTitle("Sign in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { logIn } = useContext(authContextAPI);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    logIn(email, password);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to comment, save posts and manage your account."
      footer={<>New here? <Link to="/signup">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" className="input" type="email" placeholder="you@example.com" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <PasswordInput id="password" placeholder="Your password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="auth__row"><span></span><Link to="/forgot-password">Forgot password?</Link></div>
        <button type="submit" className="btn btn-primary btn-block">Sign in</button>
      </form>
    </AuthLayout>
  );
};

export default Signin;
