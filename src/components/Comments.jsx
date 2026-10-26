import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { fireDB } from "../firebase/FirebaseConfig";
import authContextAPI from "../contexts/auth_context/authContextAPI";
import loadingContextAPI from "../contexts/loading_context/loadingContextAPI";
import { initials, timeAgo, toDate } from "../utils/text";
import "./Comments.css";

const MAX = 1000;

/** Small textarea form used for new comments, replies and edits. */
function CommentForm({ initial = "", placeholder, submitLabel, busy, onSubmit, onCancel, autoFocus }) {
  const [text, setText] = useState(initial);
  return (
    <form
      className="comments__form"
      onSubmit={async (e) => {
        e.preventDefault();
        const ok = await onSubmit(text.trim());
        if (ok && !onCancel) setText("");
      }}
    >
      <textarea
        className="textarea"
        aria-label={placeholder || "Your comment"}
        placeholder={placeholder}
        maxLength={MAX}
        value={text}
        autoFocus={autoFocus}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <div className="comments__form-foot">
        <span className="hint">{text.length}/{MAX}</span>
        <span style={{ display: "flex", gap: "0.5rem" }}>
          {onCancel && <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>}
          <button className="btn btn-primary btn-sm" disabled={busy || !text.trim()}>{busy ? "Saving…" : submitLabel}</button>
        </span>
      </div>
    </form>
  );
}

function Comments({ postId }) {
  const { currentUser, isAdmin } = useContext(authContextAPI);
  const { setNotification } = useContext(loadingContextAPI);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // comment being replied to
  const [editingId, setEditingId] = useState(null);

  const notifyError = (message) => setNotification({ type: "error", message, isVisible: true });

  const load = useCallback(async () => {
    try {
      // Single-field filter + client-side sort keeps this index-free.
      const snap = await getDocs(query(collection(fireDB, "comments"), where("postId", "==", postId)));
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Could not load comments:", error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // top-level comments (newest first) with their replies (oldest first)
  const { threads, visibleCount } = useMemo(() => {
    const byDate = (a, b) => (toDate(a.createdAt) || 0) - (toDate(b.createdAt) || 0);
    const tops = comments.filter((c) => !c.parentId).sort((a, b) => byDate(b, a));
    const replies = {};
    comments.filter((c) => c.parentId).sort(byDate).forEach((r) => (replies[r.parentId] ||= []).push(r));
    const list = tops.map((t) => ({ ...t, replies: replies[t.id] || [] }));
    return { threads: list, visibleCount: comments.filter((c) => !c.deleted && (!c.parentId || tops.some((t) => t.id === c.parentId))).length };
  }, [comments]);

  const author = () => currentUser.displayName || currentUser.email.split("@")[0];

  const add = async (text, parentId = null) => {
    setBusy(true);
    try {
      await addDoc(collection(fireDB, "comments"), {
        postId,
        parentId,
        uid: currentUser.uid,
        name: author(),
        text,
        createdAt: serverTimestamp(),
      });
      setReplyingTo(null);
      await load();
      return true;
    } catch (error) {
      console.error("Could not post comment:", error);
      notifyError("Could not post your comment.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async (comment, text) => {
    setBusy(true);
    try {
      await updateDoc(doc(fireDB, "comments", comment.id), { text, editedAt: serverTimestamp() });
      setEditingId(null);
      await load();
      return true;
    } catch (error) {
      console.error("Could not edit comment:", error);
      notifyError("Could not save your edit.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const remove = async (comment) => {
    const children = comments.filter((c) => c.parentId === comment.id);
    try {
      if (isAdmin) {
        // moderators remove the whole thread
        await Promise.all([...children, comment].map((c) => deleteDoc(doc(fireDB, "comments", c.id))));
      } else if (children.length > 0) {
        // keep the replies readable: blank this comment instead of deleting it
        await updateDoc(doc(fireDB, "comments", comment.id), { deleted: true, text: "" });
      } else {
        await deleteDoc(doc(fireDB, "comments", comment.id));
      }
      await load();
    } catch (error) {
      console.error("Could not delete comment:", error);
      notifyError("Could not delete the comment.");
    }
  };

  const renderComment = (c, root) => {
    const mine = currentUser?.uid === c.uid;
    const isReply = !!c.parentId;
    return (
      <li key={c.id} className={`comment ${isReply ? "comment--reply" : ""}`} id={`comment-${c.id}`}>
        <span className="avatar avatar--sm" aria-hidden="true">{c.deleted ? "–" : initials(c.name)}</span>
        <div className="comment__main">
          {c.deleted ? (
            <p className="comment__deleted">This comment was deleted.</p>
          ) : editingId === c.id ? (
            <CommentForm initial={c.text} submitLabel="Save" busy={busy} autoFocus onSubmit={(t) => saveEdit(c, t)} onCancel={() => setEditingId(null)} />
          ) : (
            <>
              <div className="comment__head">
                <strong>{c.name}</strong>
                <span>{timeAgo(c.createdAt)}{c.editedAt && " · edited"}</span>
              </div>
              <p>{c.text}</p>
              <div className="comment__actions">
                {currentUser && (
                  <button type="button" onClick={() => setReplyingTo(replyingTo?.id === c.id ? null : c)}>
                    <i className="fa-solid fa-reply"></i> Reply
                  </button>
                )}
                {mine && <button type="button" onClick={() => setEditingId(c.id)}><i className="fa-regular fa-pen-to-square"></i> Edit</button>}
                {(mine || isAdmin) && (
                  <button type="button" className="is-danger" onClick={() => remove(c)} aria-label="Delete comment">
                    <i className="fa-regular fa-trash-can"></i> Delete
                  </button>
                )}
              </div>
            </>
          )}

          {replyingTo?.id === c.id && (
            <div className="comment__reply-form">
              <CommentForm
                initial={isReply ? `@${c.name} ` : ""}
                placeholder={`Reply to ${c.name}…`}
                submitLabel="Reply"
                busy={busy}
                autoFocus
                onSubmit={(t) => add(t, root.id)}
                onCancel={() => setReplyingTo(null)}
              />
            </div>
          )}
        </div>
      </li>
    );
  };

  return (
    <section className="comments" aria-labelledby="comments-title">
      <h2 id="comments-title">Comments {visibleCount > 0 && <span>({visibleCount})</span>}</h2>

      {currentUser ? (
        <CommentForm placeholder="Share your thoughts…" submitLabel="Post comment" busy={busy && !replyingTo && !editingId} onSubmit={(t) => add(t)} />
      ) : (
        <div className="comments__login card">
          <p><Link to="/signin" className="comments__link">Sign in</Link> or <Link to="/signup" className="comments__link">create a free account</Link> to join the conversation.</p>
        </div>
      )}

      {loading ? (
        <div className="skeleton" style={{ height: 72, marginTop: "1.5rem" }}></div>
      ) : threads.length === 0 ? (
        <p className="comments__empty">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <ul className="comments__list">
          {threads.map((t) => (
            <React.Fragment key={t.id}>
              {renderComment(t, t)}
              {t.replies.length > 0 && (
                <li className="comment__replies">
                  <ul>{t.replies.map((r) => renderComment(r, t))}</ul>
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Comments;
