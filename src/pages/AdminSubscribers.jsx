import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { fireDB } from "../firebase/FirebaseConfig";
import ConfirmationOverlay from "../components/ConfirmationOverlay";
import loadingContextAPI from "../contexts/loading_context/loadingContextAPI";
import { formatDate, toDate } from "../utils/text";

function AdminSubscribers() {
  const { setNotification } = useContext(loadingContextAPI);
  const [subs, setSubs] = useState(null);
  const [filter, setFilter] = useState("");
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      const snap = await getDocs(collection(fireDB, "subscribers"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (toDate(b.createdAt) || 0) - (toDate(a.createdAt) || 0));
      setSubs(list);
    } catch (error) {
      console.error(error);
      setSubs([]);
      setNotification({ type: "error", message: "Could not load subscribers.", isVisible: true });
    }
  }, [setNotification]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const t = filter.trim().toLowerCase();
    return (subs || []).filter((s) => !t || s.email?.toLowerCase().includes(t));
  }, [subs, filter]);

  const exportCsv = () => {
    const rows = [["email", "subscribed_on"], ...visible.map((s) => [s.email, formatDate(s.createdAt)])];
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "subscribers.csv" });
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyEmails = async () => {
    try {
      await navigator.clipboard.writeText(visible.map((s) => s.email).join(", "));
      setNotification({ type: "success", message: `Copied ${visible.length} emails.`, isVisible: true });
    } catch {
      setNotification({ type: "error", message: "Could not copy to clipboard.", isVisible: true });
    }
  };

  const remove = async () => {
    const s = toDelete;
    setToDelete(null);
    try {
      await deleteDoc(doc(fireDB, "subscribers", s.id));
      setSubs((list) => list.filter((x) => x.id !== s.id));
    } catch (error) {
      console.error(error);
      setNotification({ type: "error", message: "Could not remove subscriber.", isVisible: true });
    }
  };

  return (
    <>
      <ConfirmationOverlay
        isOpen={!!toDelete}
        status="danger"
        title="Remove subscriber?"
        message={toDelete ? `${toDelete.email} will be removed from the list.` : ""}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
      <div className="admin-title">
        <div><h1>Subscribers</h1><p>{subs?.length ?? 0} people subscribed to your newsletter.</p></div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-outline btn-sm" onClick={copyEmails} disabled={!visible.length}><i className="fa-regular fa-copy"></i> Copy emails</button>
          <button className="btn btn-primary btn-sm" onClick={exportCsv} disabled={!visible.length}><i className="fa-solid fa-download"></i> Export CSV</button>
        </div>
      </div>

      <div className="toolbar">
        <input className="input" type="search" placeholder="Search emails…" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Search subscribers" />
      </div>

      {subs === null ? (
        <div className="skeleton" style={{ height: 120 }}></div>
      ) : visible.length === 0 ? (
        <div className="empty card"><div className="emoji">💌</div><h3>No subscribers yet</h3><p>People who join your newsletter will appear here.</p></div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>Email</th><th>Subscribed</th><th aria-label="Actions"></th></tr></thead>
            <tbody>
              {visible.map((s) => (
                <tr key={s.id}>
                  <td className="cell-title">{s.email}</td>
                  <td className="cell-muted">{formatDate(s.createdAt)}</td>
                  <td><div className="row-actions"><button className="icon-btn danger" onClick={() => setToDelete(s)} aria-label={`Remove ${s.email}`} title="Remove"><i className="fa-regular fa-trash-can"></i></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default AdminSubscribers;
