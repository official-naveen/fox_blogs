import React, { useContext, useEffect, useState } from "react";
import { Routes, Route, NavLink, Link, Navigate, useLocation } from "react-router-dom";
import "./AdminDashboard.css";
import { collection, getDocs } from "firebase/firestore";
import { fireDB } from "../firebase/FirebaseConfig";
import authContextAPI from "../contexts/auth_context/authContextAPI";
import ThemeToggle from "./ThemeToggle";
import Admin from "../pages/Admin.jsx";
import PostManager from "../pages/PostManager.jsx";
import UserManagement from "../pages/UserManagement.jsx";
import AdminMessages from "../pages/AdminMessages.jsx";
import AdminSubscribers from "../pages/AdminSubscribers.jsx";
import AdminComments from "../pages/AdminComments.jsx";
import NotFound from "../pages/NotFound.jsx";
import usePageTitle from "../hooks/usePageTitle";

function AdminDashboard() {
  usePageTitle("Admin");
  const { logout } = useContext(authContextAPI);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  // unread-message badge in the sidebar
  useEffect(() => {
    getDocs(collection(fireDB, "messages"))
      .then((snap) => setUnread(snap.docs.filter((d) => d.data().read === false).length))
      .catch(() => {});
  }, [location.pathname]);

  return (
    <div className={`admin ${open ? "is-open" : ""}`}>
      <div className="admin-scrim" onClick={() => setOpen(false)}></div>

      <aside className="admin-sidebar" aria-label="Admin navigation">
        <Link to="/admin/dashboard" className="brand">
          <span className="brand__logo" aria-hidden="true">🦊</span>
          <span className="brand__name">Fox Admin</span>
        </Link>

        <nav className="admin-nav">
          <NavLink to="/admin/dashboard"><i className="fa-solid fa-gauge"></i> Dashboard</NavLink>
          <p className="admin-sidebar__label">Content</p>
          <NavLink to="/admin/post-manager"><i className="fa-solid fa-pen-to-square"></i> Posts</NavLink>
          <NavLink to="/admin/comments"><i className="fa-regular fa-comments"></i> Comments</NavLink>
          <p className="admin-sidebar__label">Audience</p>
          <NavLink to="/admin/messages">
            <i className="fa-regular fa-envelope"></i> Messages
            {unread > 0 && <span className="count">{unread}</span>}
          </NavLink>
          <NavLink to="/admin/subscribers"><i className="fa-solid fa-paper-plane"></i> Subscribers</NavLink>
          <NavLink to="/admin/users-management"><i className="fa-solid fa-users"></i> Users</NavLink>
        </nav>

        <div className="admin-sidebar__foot">
          <nav className="admin-nav">
            <Link to="/"><i className="fa-solid fa-arrow-up-right-from-square"></i> View site</Link>
            <button type="button" onClick={logout}><i className="fa-solid fa-arrow-right-from-bracket"></i> Log out</button>
          </nav>
        </div>
      </aside>

      <div className="admin-body">
        <div className="admin-topbar">
          <button type="button" className="icon-btn" onClick={() => setOpen(true)} aria-label="Open menu">
            <i className="fa-solid fa-bars"></i>
          </button>
          <strong>Fox Admin</strong>
          <span style={{ marginLeft: "auto" }}><ThemeToggle /></span>
        </div>

        <div className="admin-main page" key={location.pathname}>
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Admin />} />
            <Route path="post-manager" element={<PostManager />} />
            <Route path="comments" element={<AdminComments />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="subscribers" element={<AdminSubscribers />} />
            <Route path="users-management" element={<UserManagement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
