import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AboutSection.css";
import profilePic from "../assets/fox_goody_img.webp";
import usePageTitle from "../hooks/usePageTitle";
import postContextAPI from "../contexts/post_context/postContextAPI";
import { CATEGORIES, SITE } from "../config/site";

const VALUES = [
  { icon: "fa-lightbulb", title: "Curiosity first", text: "Every post starts with a question I couldn't stop thinking about." },
  { icon: "fa-pen-nib", title: "Written with care", text: "Clear, honest writing — no filler, no clickbait, no jargon for jargon's sake." },
  { icon: "fa-people-group", title: "Built for readers", text: "Join the conversation in the comments and tell me what to write next." },
];

function AboutSection() {
  usePageTitle("About");
  const { posts, getPosts } = useContext(postContextAPI);

  useEffect(() => {
    if (posts.length === 0) getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <section className="container about-hero">
        <div className="about-hero__photo">
          <img src={profilePic} alt={SITE.author.name} width="480" height="480" />
        </div>
        <div>
          <span className="eyebrow">About</span>
          <h1>Hi, I&apos;m {SITE.author.name} — the voice behind <em>{SITE.name}</em>.</h1>
          <p>
            I created {SITE.name} as a space for curious minds to explore, learn and be inspired.
            Whether you&apos;re here for thought-provoking articles or just to connect with a
            like-minded community, you&apos;ve come to the right place.
          </p>
          <p>
            This isn&apos;t just a blog — it&apos;s a journey. Every post is crafted with care,
            every idea sparked by curiosity, and every conversation fuelled by a love for
            creativity. So stay a while, browse the latest topics and share your thoughts.
          </p>
          <div className="about-hero__cta">
            <Link to="/blog" className="btn btn-primary">Read the blog</Link>
            <Link to="/contact" className="btn btn-outline">Get in touch</Link>
          </div>
        </div>
      </section>

      <section className="container about-stats">
        <div className="card"><strong>{posts.length}</strong><span>Articles published</span></div>
        <div className="card"><strong>{CATEGORIES.length - 1}</strong><span>Topics covered</span></div>
        <div className="card"><strong>Free</strong><span>To read, always</span></div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head"><div><span className="eyebrow">What I believe</span><h2>The ideas behind the blog</h2></div></div>
          <div className="values-grid">
            {VALUES.map((v) => (
              <div key={v.title} className="card value-card">
                <span className="category-card__icon"><i className={`fa-solid ${v.icon}`}></i></span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "1rem" }}>
        <div className="card about-connect">
          <div>
            <h2>Let&apos;s connect</h2>
            <p>Questions, ideas or collaboration? I&apos;d love to hear from you.</p>
          </div>
          <div className="about-connect__links">
            <a className="icon-btn" href={SITE.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i className="fa-brands fa-github"></i></a>
            <a className="icon-btn" href={SITE.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
            <a className="icon-btn" href={SITE.social.twitter} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"><i className="fa-brands fa-x-twitter"></i></a>
            <Link to="/contact" className="btn btn-primary">Send a message</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutSection;
