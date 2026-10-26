import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./ProfilePage.css";
import authContextAPI from "../contexts/auth_context/authContextAPI";
import postContextAPI from "../contexts/post_context/postContextAPI";
import loadingContextAPI from "../contexts/loading_context/loadingContextAPI";
import PostCard from "../components/PostCard";
import PasswordInput from "../auth/PasswordInput";
import usePageTitle from "../hooks/usePageTitle";
import { getBookmarkIds } from "../services/bookmarks";
import { initials } from "../utils/text";

function ProfilePage() {
  usePageTitle("My profile");
  const { currentUser, isAdmin, updateName, changePassword, logout } = useContext(authContextAPI);
  const { posts, getPosts } = useContext(postContextAPI);
  const { setNotification } = useContext(loadingContextAPI);
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "saved" ? "saved" : "account";

  const [name, setName] = useState(currentUser?.displayName || "");
  const [savingName, setSavingName] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [savedIds, setSavedIds] = useState(null);

  useEffect(() => {
    if (posts.length === 0) getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getBookmarkIds(currentUser.uid)
      .then(setSavedIds)
      .catch(() => setSavedIds([]));
  }, [currentUser.uid]);

  const savedPosts = useMemo(
    () => (savedIds ? posts.filter((p) => savedIds.includes(p.id)) : []),
    [posts, savedIds]
  );

  const notify = (type, message) => setNotification({ type, message, isVisible: true });

  const saveName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      await updateName(name.trim());
      notify("success", "Your name has been updated.");
    } catch (error) {
      console.error(error);
      notify("error", "Could not update your name.");
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await changePassword(pw.current, pw.next);
      setPw({ current: "", next: "" });
      notify("success", "Password changed successfully.");
    } catch (error) {
      console.error(error);
      notify(
        "error",
        ["auth/wrong-password", "auth/invalid-credential"].includes(error.code)
          ? "Your current password is incorrect."
          : error.code === "auth/weak-password"
          ? "New password must be at least 6 characters."
          : "Could not change your password. Try signing in again."
      );
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="page">
      <section className="container profile-head">
        <span className="avatar avatar--xl">{initials(currentUser.displayName || currentUser.email)}</span>
        <div>
          <h1>{currentUser.displayName || "Your profile"}</h1>
          <p>{currentUser.email} {isAdmin && <span className="badge">Admin</span>}</p>
        </div>
        <div className="profile-head__actions">
          {isAdmin && <Link to="/admin/dashboard" className="btn btn-outline btn-sm">Admin dashboard</Link>}
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>Log out</button>
        </div>
      </section>

      <div className="container">
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === "account"} className={tab === "account" ? "is-active" : ""} onClick={() => setParams({}, { replace: true })}>
            <i className="fa-regular fa-user"></i> Account
          </button>
          <button role="tab" aria-selected={tab === "saved"} className={tab === "saved" ? "is-active" : ""} onClick={() => setParams({ tab: "saved" }, { replace: true })}>
            <i className="fa-regular fa-bookmark"></i> Saved posts {savedIds && <span className="chip__count">({savedIds.length})</span>}
          </button>
        </div>

        {tab === "account" ? (
          <div className="profile-grid">
            <form className="card profile-card" onSubmit={saveName}>
              <h2>Profile details</h2>
              <div className="field">
                <label htmlFor="p-name">Display name</label>
                <input id="p-name" className="input" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="p-email">Email</label>
                <input id="p-email" className="input" value={currentUser.email} disabled />
                <span className="hint">Your email can&apos;t be changed here.</span>
              </div>
              <button className="btn btn-primary" disabled={savingName || !name.trim() || name.trim() === currentUser.displayName}>
                {savingName ? "Saving…" : "Save changes"}
              </button>
            </form>

            <form className="card profile-card" onSubmit={savePassword}>
              <h2>Change password</h2>
              <div className="field">
                <label htmlFor="p-cur">Current password</label>
                <PasswordInput id="p-cur" autoComplete="current-password" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="p-new">New password</label>
                <PasswordInput id="p-new" autoComplete="new-password" required minLength={6} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
                <span className="hint">At least 6 characters.</span>
              </div>
              <button className="btn btn-primary" disabled={savingPw}>{savingPw ? "Updating…" : "Update password"}</button>
            </form>
          </div>
        ) : savedIds === null ? (
          <div className="skeleton" style={{ height: 220 }}></div>
        ) : savedPosts.length === 0 ? (
          <div className="empty">
            <div className="emoji">🔖</div>
            <h3>Nothing saved yet</h3>
            <p>Tap “Save” on any article to keep it here for later.</p>
            <Link to="/blog" className="btn btn-primary btn-sm" style={{ marginTop: "1rem" }}>Browse articles</Link>
          </div>
        ) : (
          <div className="posts-grid">{savedPosts.map((p) => <PostCard key={p.id} post={p} />)}</div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
