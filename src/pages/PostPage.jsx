import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./PostPage.css";
import ArticleBody from "../components/ArticleBody";
import ShareBar from "../components/ShareBar";
import Comments from "../components/Comments";
import LikeButton from "../components/LikeButton";
import PostCard from "../components/PostCard";
import NotFound from "./NotFound";
import postContextAPI from "../contexts/post_context/postContextAPI";
import authContextAPI from "../contexts/auth_context/authContextAPI";
import loadingContextAPI from "../contexts/loading_context/loadingContextAPI";
import usePageTitle from "../hooks/usePageTitle";
import { addBookmark, getBookmarkIds, removeBookmark } from "../services/bookmarks";
import { formatDate, formatDateTime, initials, isLive, postDate, readingTime } from "../utils/text";
import { SITE } from "../config/site";

/** Public page for one published post (/post/:id). */
function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPostById, posts, getPosts } = useContext(postContextAPI);
  const { currentUser, isAdmin, authLoading } = useContext(authContextAPI);
  const { setNotification } = useContext(loadingContextAPI);

  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | missing
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState(0);

  usePageTitle(post?.title);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    window.scrollTo(0, 0);
    getPostById(id)
      .then((found) => {
        if (cancelled) return;
        setPost(found);
        setStatus(found ? "ready" : "missing");
      })
      .catch((error) => {
        console.error("Error loading post:", error);
        if (!cancelled) setStatus("missing");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // posts list powers "related posts"
  useEffect(() => {
    if (posts.length === 0) getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // is this post bookmarked by the signed-in reader?
  useEffect(() => {
    if (!currentUser) {
      setSaved(false);
      return;
    }
    getBookmarkIds(currentUser.uid)
      .then((ids) => setSaved(ids.includes(id)))
      .catch(() => {});
  }, [currentUser, id]);

  // reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const related = useMemo(() => {
    if (!post) return [];
    const mine = new Set(post.tags || []);
    // rank: shared tags first, then same category, then newest
    const score = (p) =>
      (p.tags || []).filter((t) => mine.has(t)).length * 2 + (p.category === post.category ? 1 : 0);
    return posts
      .filter((p) => p.id !== post.id)
      .map((p, i) => ({ p, s: score(p), i }))
      .sort((a, b) => b.s - a.s || a.i - b.i)
      .slice(0, 3)
      .map((x) => x.p);
  }, [posts, post]);

  const toggleSave = async () => {
    if (!currentUser) {
      setNotification({ type: "info", message: "Sign in to save posts for later.", isVisible: true });
      navigate("/signin");
      return;
    }
    const next = !saved;
    setSaved(next);
    try {
      await (next ? addBookmark(currentUser.uid, id) : removeBookmark(currentUser.uid, id));
    } catch (error) {
      console.error("Bookmark failed:", error);
      setSaved(!next);
      setNotification({ type: "error", message: "Could not update saved posts.", isVisible: true });
    }
  };

  // Drafts and not-yet-due scheduled posts are only visible to admins.
  const hidden = status === "ready" && !isLive(post) && !isAdmin;

  if (status === "loading" || (status === "ready" && !isLive(post) && authLoading)) {
    return (
      <div className="container-narrow" style={{ padding: "4rem 1.25rem" }} aria-busy="true">
        <div className="skeleton" style={{ height: 22, width: 100, marginBottom: 20 }}></div>
        <div className="skeleton" style={{ height: 48, width: "90%", marginBottom: 16 }}></div>
        <div className="skeleton" style={{ height: 18, width: "50%", marginBottom: 40 }}></div>
        <div className="skeleton" style={{ height: 320 }}></div>
      </div>
    );
  }
  if (status === "missing" || hidden) return <NotFound />;

  return (
    <article className="post page">
      {!isLive(post) && (
        <div className="status-banner">
          {post.status === "scheduled"
            ? `Scheduled — goes live ${formatDateTime(post.publishAt)}. Only admins can see this page.`
            : "Draft — only admins can see this page."}
        </div>
      )}
      <div className="reading-progress" style={{ width: `${progress}%` }} aria-hidden="true"></div>

      <header className="container-narrow post__header">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/blog">Blog</Link>
          {post.category && (
            <>
              <i className="fa-solid fa-chevron-right"></i>
              <Link to={`/blog?category=${encodeURIComponent(post.category)}`}>{post.category}</Link>
            </>
          )}
        </nav>
        <h1>{post.title}</h1>
        <div className="post__byline">
          <span className="avatar">{initials(SITE.author.name)}</span>
          <div>
            <strong>{SITE.author.name}</strong>
            <span>{formatDate(postDate(post))} · {readingTime(post.content)} min read</span>
          </div>
          <button
            type="button"
            className={`btn btn-sm ${saved ? "btn-primary" : "btn-outline"} post__save`}
            onClick={toggleSave}
            aria-pressed={saved}
          >
            <i className={`${saved ? "fa-solid" : "fa-regular"} fa-bookmark`}></i> {saved ? "Saved" : "Save"}
          </button>
        </div>
      </header>

      <div className="container post__cover">
        <img src={post.thumbnail} alt={post.title} />
      </div>

      <div className="container-narrow post__content">
        <ArticleBody html={post.content} />

        {post.tags?.length > 0 && (
          <div className="post__tags" aria-label="Tags">
            {post.tags.map((t) => (
              <Link key={t} to={`/blog?tag=${encodeURIComponent(t)}`} className="tag">#{t}</Link>
            ))}
          </div>
        )}

        <div className="post__footer">
          <div className="post__actions">
            <LikeButton postId={id} />
            <ShareBar title={post.title} />
          </div>
          <Link to="/blog" className="btn btn-outline btn-sm">
            <i className="fa-solid fa-arrow-left"></i> All posts
          </Link>
        </div>

        <aside className="author-box card">
          <span className="avatar avatar--lg">{initials(SITE.author.name)}</span>
          <div>
            <p className="eyebrow">Written by</p>
            <h3>{SITE.author.name}</h3>
            <p>{SITE.author.bio}</p>
          </div>
        </aside>

        <Comments postId={id} />
      </div>

      {related.length > 0 && (
        <section className="section section-alt post__related">
          <div className="container">
            <div className="section-head"><h2>Keep reading</h2></div>
            <div className="posts-grid">
              {related.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

export default PostPage;
