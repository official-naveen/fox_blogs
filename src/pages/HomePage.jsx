import React, { useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import Home from "../components/Home";
import PostCard, { PostCardSkeleton } from "../components/PostCard";
import NewsletterForm from "../components/NewsletterForm";
import postContextAPI from "../contexts/post_context/postContextAPI";
import usePageTitle from "../hooks/usePageTitle";
import { readingTime } from "../utils/text";
import aboutImg from "../assets/fox_goody_img.webp";
import { CATEGORIES, SITE } from "../config/site";

function HomePage() {
  usePageTitle();
  const { posts, postsLoading, getPosts } = useContext(postContextAPI);

  useEffect(() => {
    getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const featured = useMemo(() => posts.find((p) => p.featured) || posts[0], [posts]);
  const latest = useMemo(
    () => posts.filter((p) => p.id !== featured?.id).slice(0, 6),
    [posts, featured]
  );
  const counts = useMemo(() => {
    const map = {};
    posts.forEach((p) => (map[p.category] = (map[p.category] || 0) + 1));
    return map;
  }, [posts]);

  const stats = postsLoading
    ? []
    : [
        { value: posts.length, label: "Articles" },
        { value: Object.keys(counts).length || 0, label: "Topics" },
        { value: posts.reduce((sum, p) => sum + readingTime(p.content), 0), label: "Minutes of reading" },
      ];

  return (
    <div className="page">
      <Home stats={stats} />

      <section className="container topics-strip" aria-label="Browse by topic">
        {CATEGORIES.filter((c) => c.name !== "Other").map((c) => (
          <Link key={c.name} to={`/blog?category=${encodeURIComponent(c.name)}`} className="topic-pill">
            <i className={`fa-solid ${c.icon}`}></i> {c.name}
          </Link>
        ))}
      </section>

      {postsLoading ? (
        <section className="section">
          <div className="container">
            <div className="posts-grid">
              {[1, 2, 3].map((n) => <PostCardSkeleton key={n} />)}
            </div>
          </div>
        </section>
      ) : posts.length === 0 ? (
        <section className="section">
          <div className="container empty">
            <div className="emoji">🦊</div>
            <h3>No posts yet</h3>
            <p>Fresh stories are on the way — check back soon!</p>
          </div>
        </section>
      ) : (
        <>
          {featured && (
            <section className="section" style={{ paddingBottom: "2rem" }}>
              <div className="container">
                <div className="section-head"><div><span className="eyebrow">Featured</span><h2>Editor&apos;s pick</h2></div></div>
                <PostCard post={featured} variant="featured" />
              </div>
            </section>
          )}

          {latest.length > 0 && (
            <section className="section">
              <div className="container">
                <div className="section-head">
                  <div><span className="eyebrow">Fresh off the press</span><h2>Latest posts</h2></div>
                  <Link to="/blog" className="btn btn-outline btn-sm">View all posts <i className="fa-solid fa-arrow-right"></i></Link>
                </div>
                <div className="posts-grid">
                  {latest.map((p) => <PostCard key={p.id} post={p} />)}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <section className="section section-alt">
        <div className="container author-teaser">
          <img src={aboutImg} alt={SITE.author.name} width="360" height="360" loading="lazy" />
          <div>
            <span className="eyebrow">Meet the author</span>
            <h2>Hi, I&apos;m {SITE.author.name}.</h2>
            <p>{SITE.author.bio}</p>
            <Link to="/about" className="btn btn-primary">Read my story</Link>
          </div>
        </div>
      </section>

      <section className="container cta-band">
        <div className="cta-band__inner">
          <h2>Never miss a story</h2>
          <p>Join the newsletter and get new articles delivered straight to your inbox.</p>
          <NewsletterForm className="cta-band__form" />
        </div>
      </section>
    </div>
  );
}

export default HomePage;
