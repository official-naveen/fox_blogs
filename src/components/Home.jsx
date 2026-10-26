import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import foxArt from "../assets/hero.png";
import { SITE } from "../config/site";

/** Landing-page hero. `stats` = [{value, label}] shown under the buttons. */
function Home({ stats = [] }) {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__copy">
          <span className="eyebrow">Welcome to {SITE.name}</span>
          <h1>
            Stories, ideas &amp; lessons for <em>curious minds.</em>
          </h1>
          <p>{SITE.description}</p>
          <div className="hero__cta">
            <Link to="/blog" className="btn btn-primary">
              Start reading <i className="fa-solid fa-arrow-right"></i>
            </Link>
            <Link to="/about" className="btn btn-outline">About the author</Link>
          </div>
          {stats.length > 0 && (
            <dl className="hero__stats">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="hero__art" aria-hidden="true">
          <div className="hero__blob"></div>
          <img src={foxArt} alt="" width="700" height="700" />
        </div>
      </div>
    </section>
  );
}

export default Home;
