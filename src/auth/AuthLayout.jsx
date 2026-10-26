import React from "react";
import { Link } from "react-router-dom";
import "./Auth.css";
import ThemeToggle from "../components/ThemeToggle";
import foxArt from "../assets/hero.png";
import { SITE } from "../config/site";

/** Split-screen shell shared by sign in, sign up and forgot-password. */
function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth page">
      <aside className="auth__panel" aria-hidden="true">
        <Link to="/" className="brand"><span className="brand__logo">🦊</span><span className="brand__name">{SITE.name}</span></Link>
        <img src={foxArt} alt="" />
        <p>&ldquo;{SITE.tagline}&rdquo;</p>
      </aside>
      <main className="auth__main">
        <div className="auth__top">
          <Link to="/" className="btn btn-ghost btn-sm"><i className="fa-solid fa-arrow-left"></i> Back to site</Link>
          <ThemeToggle />
        </div>
        <div className="auth__card">
          <h1>{title}</h1>
          <p className="auth__sub">{subtitle}</p>
          {children}
          <div className="auth__footer">{footer}</div>
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
