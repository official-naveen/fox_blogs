import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./PostPage.css";
import ArticleBody from "../components/ArticleBody";
import { formatDate, readingTime } from "../utils/text";

/**
 * Presentational article view. Used for the admin's live preview
 * (backTo="/admin/post-manager"); PostPage adds comments, sharing, etc.
 */
function PreviewBlog({ post, backTo = "/", backLabel = "Go back" }) {
  const { title, content, thumbnail, createdAt, category } = post;
  const navigate = useNavigate();
  const incomplete = !title || !content || !createdAt;

  useEffect(() => {
    if (incomplete) navigate(backTo);
  }, [incomplete, navigate, backTo]);

  if (incomplete) return null;

  return (
    <article className="post page">
      <div className="preview-banner">
        <i className="fa-regular fa-eye"></i> Preview — this is how readers will see your post.
        <Link to={backTo} className="btn btn-outline btn-sm">{backLabel}</Link>
      </div>
      <header className="container-narrow post__header">
        {category && <span className="badge">{category}</span>}
        <h1>{title}</h1>
        <p className="post__meta">
          {formatDate(createdAt)} · {readingTime(content)} min read
        </p>
      </header>
      {thumbnail && (
        <div className="container post__cover">
          <img src={thumbnail} alt={title} />
        </div>
      )}
      <div className="container-narrow post__content">
        <ArticleBody html={content} />
      </div>
    </article>
  );
}

export default PreviewBlog;
