import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { fireDB } from "../firebase/FirebaseConfig";
import { isLive, postDate, timeAgo, toDate } from "../utils/text";

const fetchAll = async (name) => {
  try {
    const snap = await getDocs(collection(fireDB, name));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error(`Could not load ${name}:`, error);
    return null;
  }
};

function Admin() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all(["posts", "users", "messages", "subscribers", "comments"].map(fetchAll)).then(
      ([posts, users, messages, subscribers, comments]) => {
        if (!cancelled) setData({ posts, users, messages, subscribers, comments });
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const n = (list) => (data ? (list ? list.length : "–") : "…");
  const drafts = (data?.posts || []).filter((p) => (p.status || "published") === "draft").length;
  const scheduled = (data?.posts || []).filter((p) => p.status === "scheduled" && !isLive(p)).length;

  const stats = [
    { label: "Live posts", value: data ? (data.posts ? data.posts.filter((p) => isLive(p)).length : "–") : "…", icon: "fa-newspaper", to: "/admin/post-manager", sub: data?.posts ? `${drafts} drafts · ${scheduled} scheduled` : "" },
    { label: "Users", value: n(data?.users), icon: "fa-users", to: "/admin/users-management" },
    { label: "Subscribers", value: n(data?.subscribers), icon: "fa-paper-plane", to: "/admin/subscribers" },
    { label: "Comments", value: n(data?.comments), icon: "fa-comments", to: "/admin/comments" },
  ];

  // posts per category
  const byCategory = {};
  (data?.posts || []).forEach((p) => {
    const c = p.category || "Other";
    byCategory[c] = (byCategory[c] || 0) + 1;
  });
  const catRows = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const maxCat = catRows[0]?.[1] || 1;

  // recent activity: newest posts, messages, comments, signups merged
  const activity = [];
  (data?.posts || []).filter((p) => isLive(p)).forEach((p) => activity.push({ key: `p${p.id}`, icon: "fa-pen", when: postDate(p), text: <>Post <strong>&ldquo;{p.title}&rdquo;</strong> published</> }));
  (data?.messages || []).forEach((m) => activity.push({ key: `m${m.id}`, icon: "fa-envelope", when: m.createdAt, text: <><strong>{m.name}</strong> sent a message</> }));
  (data?.comments || []).forEach((c) => activity.push({ key: `c${c.id}`, icon: "fa-comment", when: c.createdAt, text: <><strong>{c.name}</strong> commented</> }));
  (data?.subscribers || []).forEach((s) => activity.push({ key: `s${s.id}`, icon: "fa-user-plus", when: s.createdAt, text: <><strong>{s.email}</strong> subscribed</> }));
  activity.sort((a, b) => (toDate(b.when) || 0) - (toDate(a.when) || 0));

  const unread = (data?.messages || []).filter((m) => m.read === false).length;

  return (
    <>
      <div className="admin-title">
        <div>
          <h1>Dashboard</h1>
          <p>A quick look at how your blog is doing.</p>
        </div>
        <Link to="/admin/post-manager" className="btn btn-primary"><i className="fa-solid fa-plus"></i> New post</Link>
      </div>

      <section className="stat-grid">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="card stat-card">
            <span className="stat-card__icon"><i className={`fa-solid ${s.icon}`}></i></span>
            <div><strong>{s.value}</strong><span>{s.label}</span>{s.sub && <small className="stat-card__sub">{s.sub}</small>}</div>
          </Link>
        ))}
      </section>

      {unread > 0 && (
        <Link to="/admin/messages" className="card admin-card" style={{ display: "block", marginBottom: "1.25rem", background: "var(--accent-soft)" }}>
          <i className="fa-regular fa-envelope" style={{ color: "var(--accent)", marginRight: "0.6rem" }}></i>
          You have <strong>{unread}</strong> unread {unread === 1 ? "message" : "messages"}. <u>Read now</u>
        </Link>
      )}

      <div className="admin-two-col">
        <section className="card admin-card">
          <h2>Posts by category</h2>
          {catRows.length === 0 ? (
            <p className="hint">No posts yet.</p>
          ) : (
            <ul className="bar-list">
              {catRows.map(([name, count]) => (
                <li key={name}>
                  <div><span>{name}</span><strong>{count}</strong></div>
                  <div className="bar-list__track"><span style={{ width: `${(count / maxCat) * 100}%` }}></span></div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card admin-card">
          <h2>Recent activity</h2>
          {activity.length === 0 ? (
            <p className="hint">{data ? "Nothing yet — publish a post to get started." : "Loading…"}</p>
          ) : (
            <ul className="activity">
              {activity.slice(0, 7).map((a) => (
                <li key={a.key}>
                  <i className={`fa-solid ${a.icon}`}></i>
                  <span>{a.text}<small>{timeAgo(a.when)}</small></span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

export default Admin;
