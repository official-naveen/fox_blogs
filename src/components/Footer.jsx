import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import NewsletterForm from "./NewsletterForm";
import { SITE, CATEGORIES } from "../config/site";

const SOCIALS = [
  { key: "github", icon: "fa-brands fa-github", label: "GitHub" },
  { key: "linkedin", icon: "fa-brands fa-linkedin-in", label: "LinkedIn" },
  { key: "twitter", icon: "fa-brands fa-x-twitter", label: "X (Twitter)" },
  { key: "instagram", icon: "fa-brands fa-instagram", label: "Instagram" },
];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__about">
            <Link to="/" className="brand">
              <span className="brand__logo" aria-hidden="true">🦊</span>
              <span className="brand__name">{SITE.name}</span>
            </Link>
            <p>{SITE.description}</p>
            <div className="social-links">
              {SOCIALS.map((s) => (
                <a key={s.key} href={SITE.social[s.key]} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label={s.label}>
                  <i className={s.icon}></i>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="site-footer__heading">Explore</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/blog">All posts</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="site-footer__heading">Topics</h3>
            <ul>
              {CATEGORIES.slice(0, 5).map((c) => (
                <li key={c.name}><Link to={`/blog?category=${encodeURIComponent(c.name)}`}>{c.name}</Link></li>
              ))}
            </ul>
          </div>

          <div className="site-footer__news">
            <h3 className="site-footer__heading">Get new posts in your inbox</h3>
            <p>One thoughtful email when something new is published. No spam, unsubscribe anytime.</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <div>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
