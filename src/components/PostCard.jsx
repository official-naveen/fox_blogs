import React from "react";
import { Link } from "react-router-dom";
import "./PostCard.css";
import { formatDate, makeExcerpt, postDate, readingTime } from "../utils/text";

/** Blog post teaser used in grids. `variant="featured"` renders a large hero card. */
function PostCard({ post, variant = "default" }) {
  const featured = variant === "featured";
  return (
    <article className={`post-card ${featured ? "post-card--featured" : ""}`}>
      <Link to={`/post/${post.id}`} className="post-card__media" tabIndex={-1} aria-hidden="true">
        <img src={post.thumbnail} alt="" loading="lazy" />
      </Link>
      <div className="post-card__body">
        <div className="post-card__meta">
          {post.category && (
            <Link
              to={`/blog?category=${encodeURIComponent(post.category)}`}
              className="badge"
            >
              {post.category}
            </Link>
          )}
          <span>{formatDate(postDate(post))}</span>
          <span aria-hidden="true">·</span>
          <span>{readingTime(post.content)} min read</span>
        </div>
        <h3 className="post-card__title">
          <Link to={`/post/${post.id}`}>{post.title}</Link>
        </h3>
        <p className="post-card__excerpt">{makeExcerpt(post, featured ? 220 : 130)}</p>
        <Link to={`/post/${post.id}`} className="post-card__link">
          Read article <i className="fa-solid fa-arrow-right"></i>
        </Link>
      </div>
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="post-card" aria-hidden="true">
      <div className="post-card__media skeleton" style={{ borderRadius: 0 }}></div>
      <div className="post-card__body">
        <div className="skeleton" style={{ height: 14, width: "55%" }}></div>
        <div className="skeleton" style={{ height: 22, width: "90%" }}></div>
        <div className="skeleton" style={{ height: 14, width: "100%" }}></div>
        <div className="skeleton" style={{ height: 14, width: "70%" }}></div>
      </div>
    </div>
  );
}

export default PostCard;
