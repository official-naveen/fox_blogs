import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import postContextAPI from "../contexts/post_context/postContextAPI";
import { formatDate, formatDateTime, isLive, postDate } from "../utils/text";

const FILTERS = [
  ["all", "All"],
  ["published", "Published"],
  ["scheduled", "Scheduled"],
  ["draft", "Drafts"],
];

/** "published" | "scheduled" | "draft" | "due" (scheduled but time has passed → already live) */
const kindOf = (post) =>
  post.status === "scheduled" ? (isLive(post) ? "published" : "scheduled") : post.status || "published";

function AdminPosts() {
  const { adminPosts, adminLoading, getAdminPosts, setIsOverlayOpen, deletePost, editPost, setOverlayDetails, setPostDetails, setPostStatusQuick } =
    useContext(postContextAPI);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getAdminPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const c = { all: adminPosts.length, published: 0, scheduled: 0, draft: 0 };
    adminPosts.forEach((p) => (c[kindOf(p)] += 1));
    return c;
  }, [adminPosts]);

  const shown = adminPosts.filter((p) => filter === "all" || kindOf(p) === filter);

  if (!adminLoading && adminPosts.length === 0) {
    return (
      <div className="empty card">
        <div className="emoji">✍️</div>
        <h3>No posts yet</h3>
        <p>Click “Create new post” to write your first story. You can save it as a draft first.</p>
      </div>
    );
  }

  return (
    <>
      <div className="toolbar" role="tablist" aria-label="Filter posts by status">
        {FILTERS.map(([key, label]) => (
          <button key={key} role="tab" aria-selected={filter === key} className={`chip ${filter === key ? "is-active" : ""}`} onClick={() => setFilter(key)}>
            {label} <span className="chip__count">{counts[key]}</span>
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Title</th>
              <th>Status</th>
              <th>Date</th>
              <th aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody>
            {adminLoading && adminPosts.length === 0 && (
              <tr><td colSpan="5"><div className="skeleton" style={{ height: 40 }}></div></td></tr>
            )}
            {!adminLoading && shown.length === 0 && (
              <tr><td colSpan="5" className="cell-muted">No posts in this view.</td></tr>
            )}
            {shown.map((post) => {
              const kind = kindOf(post);
              return (
                <tr key={post.id}>
                  <td>
                    {post.thumbnail ? (
                      <img className="admin-thumb" src={post.thumbnail} alt="" />
                    ) : (
                      <span className="admin-thumb admin-thumb--empty"><i className="fa-regular fa-image"></i></span>
                    )}
                  </td>
                  <td className="cell-title">
                    {post.featured && <i className="fa-solid fa-star" style={{ color: "var(--warning)", marginRight: "0.4rem" }} title="Featured"></i>}
                    {post.title}
                    <div className="cell-sub">
                      <span className="badge badge-muted">{post.category || "Other"}</span>
                      {(post.tags || []).slice(0, 3).map((t) => <span key={t} className="cell-tag">#{t}</span>)}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${kind === "published" ? "badge-success" : kind === "scheduled" ? "" : "badge-muted"}`}>
                      {kind === "published" ? "Published" : kind === "scheduled" ? "Scheduled" : "Draft"}
                    </span>
                  </td>
                  <td className="cell-muted">
                    {kind === "scheduled" ? (
                      <>Goes live<br />{formatDateTime(post.publishAt)}</>
                    ) : kind === "draft" ? (
                      <>Edited<br />{formatDate(post.updatedAt || post.createdAt)}</>
                    ) : (
                      formatDate(postDate(post))
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/post/${post.id}`} className="icon-btn" aria-label={`View ${post.title}`} title={kind === "draft" ? "Preview draft" : "View"}>
                        <i className="fa-regular fa-eye"></i>
                      </Link>
                      <button type="button" className="icon-btn" aria-label={`Edit ${post.title}`} title="Edit" onClick={() => { setPostDetails(post); editPost(post); }}>
                        <i className="fa-regular fa-pen-to-square"></i>
                      </button>
                      {kind === "draft" ? (
                        <button type="button" className="icon-btn" aria-label={`Publish ${post.title}`} title="Publish now" onClick={() => setPostStatusQuick(post, "published")} disabled={!post.thumbnail || !post.content}>
                          <i className="fa-solid fa-upload"></i>
                        </button>
                      ) : (
                        <button type="button" className="icon-btn" aria-label={`Unpublish ${post.title}`} title="Unpublish (make a draft)" onClick={() => setPostStatusQuick(post, "draft")}>
                          <i className="fa-solid fa-eye-slash"></i>
                        </button>
                      )}
                      <button
                        type="button"
                        className="icon-btn danger"
                        aria-label={`Delete ${post.title}`}
                        title="Delete"
                        onClick={() => {
                          setOverlayDetails({
                            status: "danger",
                            title: "Delete post?",
                            message: `“${post.title}” will be permanently deleted. This cannot be undone.`,
                            onConfirm: () => deletePost(post),
                            actionType: "deletion",
                          });
                          setPostDetails(post);
                          setIsOverlayOpen(true);
                        }}
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AdminPosts;
