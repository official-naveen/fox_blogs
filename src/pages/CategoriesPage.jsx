import React, { useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import "./CategoriesPage.css";
import postContextAPI from "../contexts/post_context/postContextAPI";
import usePageTitle from "../hooks/usePageTitle";
import { CATEGORIES } from "../config/site";

function CategoriesPage() {
  usePageTitle("Categories");
  const { posts, getPosts, postsLoading } = useContext(postContextAPI);

  useEffect(() => {
    getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const map = {};
    posts.forEach((p) => (map[p.category || "Other"] = (map[p.category || "Other"] || 0) + 1));
    return map;
  }, [posts]);

  const tags = useMemo(() => {
    const map = {};
    posts.forEach((p) => (p.tags || []).forEach((t) => (map[t] = (map[t] || 0) + 1)));
    return Object.entries(map).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 30);
  }, [posts]);

  return (
    <div className="page">
      <section className="page-hero container">
        <span className="eyebrow">Explore</span>
        <h1>Browse by topic</h1>
        <p>Pick a subject you&apos;re curious about and dive in.</p>
      </section>

      <section className="container category-grid">
        {CATEGORIES.map((c) => (
          <Link key={c.name} to={`/blog?category=${encodeURIComponent(c.name)}`} className="category-card card">
            <span className="category-card__icon"><i className={`fa-solid ${c.icon}`}></i></span>
            <h2>{c.name}</h2>
            <p>{c.blurb}</p>
            <span className="category-card__count">
              {postsLoading ? "…" : `${counts[c.name] || 0} ${(counts[c.name] || 0) === 1 ? "article" : "articles"}`}
              <i className="fa-solid fa-arrow-right"></i>
            </span>
          </Link>
        ))}
      </section>

      {tags.length > 0 && (
        <section className="container tag-cloud">
          <h2>Popular tags</h2>
          <div>
            {tags.map(([t, n]) => (
              <Link key={t} to={`/blog?tag=${encodeURIComponent(t)}`} className="tag">#{t} <span className="chip__count">{n}</span></Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default CategoriesPage;
