import React, { useCallback, useContext, useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { fireDB } from "../firebase/FirebaseConfig";
import ConfirmationOverlay from "../components/ConfirmationOverlay";
import loadingContextAPI from "../contexts/loading_context/loadingContextAPI";
import { formatDateTime, toDate } from "../utils/text";

function AdminMessages() {
  const { setNotification } = useContext(loadingContextAPI);
  const [messages, setMessages] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    try {
      const snap = await getDocs(collection(fireDB, "messages"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (toDate(b.createdAt) || 0) - (toDate(a.createdAt) || 0));
      setMessages(list);
    } catch (error) {
      console.error(error);
      setMessages([]);
      setNotification({ type: "error", message: "Could not load messages.", isVisible: true });
    }
  }, [setNotification]);

  useEffect(() => {
    load();
  }, [load]);

  const setRead = async (m, read) => {
    setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, read } : x)));
    try {
      await updateDoc(doc(fireDB, "messages", m.id), { read });
    } catch (error) {
      console.error(error);
      load();
    }
  };

  const toggleOpen = (m) => {
    const opening = openId !== m.id;
    setOpenId(opening ? m.id : null);
    if (opening && m.read === false) setRead(m, true);
  };

  const remove = async () => {
    const m = toDelete;
    setToDelete(null);
    try {
      await deleteDoc(doc(fireDB, "messages", m.id));
      setMessages((list) => list.filter((x) => x.id !== m.id));
      setNotification({ type: "success", message: "Message deleted.", isVisible: true });
    } catch (error) {
      console.error(error);
      setNotification({ type: "error", message: "Could not delete the message.", isVisible: true });
    }
  };

  const shown = (messages || []).filter((m) => filter === "all" || m.read === false);
  const unread = (messages || []).filter((m) => m.read === false).length;

  return (
    <>
      <ConfirmationOverlay
        isOpen={!!toDelete}
        status="danger"
        title="Delete message?"
        message={toDelete ? `The message from ${toDelete.name} will be permanently deleted.` : ""}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
      <div className="admin-title">
        <div><h1>Messages</h1><p>{unread} unread of {messages?.length ?? 0} total.</p></div>
      </div>

      <div className="toolbar">
        <button className={`chip ${filter === "all" ? "is-active" : ""}`} onClick={() => setFilter("all")}>All</button>
        <button className={`chip ${filter === "unread" ? "is-active" : ""}`} onClick={() => setFilter("unread")}>Unread ({unread})</button>
      </div>

      {messages === null ? (
        <div className="skeleton" style={{ height: 120 }}></div>
      ) : shown.length === 0 ? (
        <div className="empty card"><div className="emoji">📭</div><h3>No messages</h3><p>Messages from your contact form will show up here.</p></div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>From</th><th>Message</th><th>Received</th><th aria-label="Actions"></th></tr></thead>
            <tbody>
              {shown.map((m) => (
                <React.Fragment key={m.id}>
                  <tr className={m.read === false ? "is-unread" : ""} onClick={() => toggleOpen(m)} style={{ cursor: "pointer" }}>
                    <td className="cell-title">{m.name}<br /><span className="cell-muted" style={{ fontWeight: 400 }}>{m.email}</span></td>
                    <td className="cell-wrap">{openId === m.id ? "" : (m.message || "").slice(0, 90) + ((m.message || "").length > 90 ? "…" : "")}</td>
                    <td className="cell-muted">{formatDateTime(m.createdAt)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions">
                        <a className="icon-btn" href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to Fox Blogs")}`} aria-label={`Reply to ${m.name}`} title="Reply"><i className="fa-solid fa-reply"></i></a>
                        <button className="icon-btn" onClick={() => setRead(m, m.read === false)} aria-label={m.read === false ? "Mark as read" : "Mark as unread"} title={m.read === false ? "Mark as read" : "Mark as unread"}>
                          <i className={`fa-regular ${m.read === false ? "fa-envelope-open" : "fa-envelope"}`}></i>
                        </button>
                        <button className="icon-btn danger" onClick={() => setToDelete(m)} aria-label="Delete message" title="Delete"><i className="fa-regular fa-trash-can"></i></button>
                      </div>
                    </td>
                  </tr>
                  {openId === m.id && (
                    <tr><td colSpan="4" style={{ background: "var(--surface-2)", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{m.message}</td></tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default AdminMessages;
