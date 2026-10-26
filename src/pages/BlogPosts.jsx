import React, { useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./BlogPosts.css";
import PostCard, { PostCardSkeleton } from "../components/PostCard";
import postContextAPI from "../contexts/post_context/postContextAPI";
import usePageTitle from "../hooks/usePageTitle";
import { postDate, stripHtml, toDate } from "../utils/text";
import { CATEGORIES } from "../config/site";

const PAGE_SIZE = 9;

/** The /blog page: every post, with search, category filter and sorting. */
function BlogPosts() {
  usePageTitle("Blog");
  const { posts, postsLoading, getPosts } = useContext(postContextAPI);
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const category = params.get("category") || "";
  const tag = params.get("tag") || "";
  const sort = params.get("sort") || "newest";
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // restart pagination when filters change
  useEffect(() => setVisible(PAGE_SIZE), [q, category, tag, sort]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const categoryCounts = useMemo(() => {
    const map = {};
    posts.forEach((p) => (map[p.category || "Other"] = (map[p.category || "Other"] || 0) + 1));
    return map;
  }, [posts]);

  const results = useMemo(() => {
    const term = q.toLowerCase();
    let list = posts.filter((p) => {
      if (category && (p.category || "Other") !== category) return false;
      if (tag && !(p.tags || []).includes(tag)) return false;
      if (!term) return true;
      return (
        p.title?.toLowerCase().includes(term) ||
        p.excerpt?.toLowerCase().includes(term) ||
        (p.tags || []).some((t) => t.includes(term.replace(/\s+/g, "-"))) ||
        stripHtml(p.content).toLowerCase().includes(term)
      );
    });
    if (sort === "oldest") list = [...list].sort((a, b) => toDate(postDate(a)) - toDate(postDate(b)));
    if (sort === "title") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [posts, q, category, tag, sort]);

  const shown = results.slice(0, visible);
  const hasFilters = q || category || tag;

  return (
    <div className="page">
      <section className="page-hero container">
        <span className="eyebrow">The blog</span>
        <h1>{q ? <>Results for &ldquo;{q}&rdquo;</> : tag ? `#${tag}` : category ? category : "All articles"}</h1>
        <p>
          {category
            ? CATEGORIES.find((c) => c.name === category)?.blurb
            : "Browse everything I've written — filter by topic or search for something specific."}
        </p>
      </section>

      <div className="container blog-controls">
        <form
          className="blog-search"
          onSubmit={(e) => {
            e.preventDefault();
            setParam("q", new FormData(e.currentTarget).get("q").trim());
          }}
          role="search"
        >
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input key={q} name="q" type="search" className="input" placeholder="Search articles…" defaultValue={q} aria-label="Search articles" />
        </form>

        <div className="blog-filters" role="group" aria-label="Filter by category">
          <button type="button" className={`chip ${!category ? "is-active" : ""}`} onClick={() => setParam("category", "")}>
            All <span className="chip__count">{posts.length}</span>
          </button>
          {CATEGORIES.filter((c) => categoryCounts[c.name]).map((c) => (
            <button key={c.name} type="button" className={`chip ${category === c.name ? "is-active" : ""}`} onClick={() => setParam("category", c.name)}>
              {c.name} <span className="chip__count">{categoryCounts[c.name]}</span>
            </button>
          ))}
        </div>

        <label className="blog-sort">
          <span className="sr-only">Sort posts</span>
          <select className="select" value={sort} onChange={(e) => setParam("sort", e.target.value === "newest" ? "" : e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
          </select>
        </label>
      </div>

      {tag && (
        <div className="container blog-active">
          <span>Showing posts tagged</span>
          <button type="button" className="tag is-active" onClick={() => setParam("tag", "")} aria-label={`Remove tag filter ${tag}`}>
            #{tag} <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
      )}

      <section className="container blog-results" aria-live="polite">
        {postsLoading ? (
          <div className="posts-grid">{[1, 2, 3, 4, 5, 6].map((n) => <PostCardSkeleton key={n} />)}</div>
        ) : results.length === 0 ? (
          <div className="empty">
            <div className="emoji">{hasFilters ? "🔍" : "🦊"}</div>
            <h3>{hasFilters ? "No posts match your filters" : "No posts yet"}</h3>
            <p>{hasFilters ? "Try a different search term or category." : "Fresh stories are on the way."}</p>
            {hasFilters && (
              <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: "1rem" }} onClick={() => setParams({}, { replace: true })}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="blog-count">{results.length} {results.length === 1 ? "article" : "articles"}</p>
            <div className="posts-grid">
              {shown.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
            {results.length > visible && (
              <div className="blog-more">
                <button type="button" className="btn btn-outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Load more articles
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default BlogPosts;
