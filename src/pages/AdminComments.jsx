import React, { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { fireDB } from "../firebase/FirebaseConfig";
import ConfirmationOverlay from "../components/ConfirmationOverlay";
import postContextAPI from "../contexts/post_context/postContextAPI";
import loadingContextAPI from "../contexts/loading_context/loadingContextAPI";
import { formatDateTime, toDate } from "../utils/text";

function AdminComments() {
  const { posts, getPosts } = useContext(postContextAPI);
  const { setNotification } = useContext(loadingContextAPI);
  const [comments, setComments] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      const snap = await getDocs(collection(fireDB, "comments"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (toDate(b.createdAt) || 0) - (toDate(a.createdAt) || 0));
      setComments(list);
    } catch (error) {
      console.error(error);
      setComments([]);
      setNotification({ type: "error", message: "Could not load comments.", isVisible: true });
    }
  }, [setNotification]);

  useEffect(() => {
    load();
    if (posts.length === 0) getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const titleOf = (id) => posts.find((p) => p.id === id)?.title;

  const remove = async () => {
    const c = toDelete;
    setToDelete(null);
    try {
      // deleting a comment also removes the replies under it
      const gone = [c, ...(comments || []).filter((x) => x.parentId === c.id)];
      await Promise.all(gone.map((x) => deleteDoc(doc(fireDB, "comments", x.id))));
      setComments((list) => list.filter((x) => !gone.some((g) => g.id === x.id)));
      setNotification({ type: "success", message: "Comment deleted.", isVisible: true });
    } catch (error) {
      console.error(error);
      setNotification({ type: "error", message: "Could not delete the comment.", isVisible: true });
    }
  };

  return (
    <>
      <ConfirmationOverlay
        isOpen={!!toDelete}
        status="danger"
        title="Delete comment?"
        message="This comment (and any replies to it) will be permanently removed."
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
      <div className="admin-title">
        <div><h1>Comments</h1><p>Moderate what readers are saying.</p></div>
      </div>

      {comments === null ? (
        <div className="skeleton" style={{ height: 120 }}></div>
      ) : comments.length === 0 ? (
        <div className="empty card"><div className="emoji">💬</div><h3>No comments yet</h3><p>Reader comments will appear here for moderation.</p></div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>Author</th><th>Comment</th><th>On post</th><th>Posted</th><th aria-label="Actions"></th></tr></thead>
            <tbody>
              {comments.map((c) => (
                <tr key={c.id}>
                  <td className="cell-title">{c.name}</td>
                  <td className="cell-wrap">{c.parentId && <span className="badge badge-muted" style={{ marginRight: "0.4rem" }}>Reply</span>}{c.deleted ? <em className="cell-muted">(deleted by author)</em> : c.text}</td>
                  <td>{titleOf(c.postId) ? <Link to={`/post/${c.postId}`} style={{ color: "var(--accent)", fontWeight: 600 }}>{titleOf(c.postId)}</Link> : <span className="cell-muted">(deleted post)</span>}</td>
                  <td className="cell-muted">{formatDateTime(c.createdAt)}</td>
                  <td><div className="row-actions"><button className="icon-btn danger" onClick={() => setToDelete(c)} aria-label="Delete comment" title="Delete"><i className="fa-regular fa-trash-can"></i></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default AdminComments;
