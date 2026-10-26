import React, { useContext, useEffect, useMemo, useState } from "react";
import userContextAPI from "../contexts/user_context/userContextAPI";
import ConfirmationOverlay from "../components/ConfirmationOverlay";
import Portal from "../components/Portal";
import { initials } from "../utils/text";

const UserManagement = () => {
  const {
    getUsers, users, isModalOpen, setIsModalOpen, newUser, setNewUser,
    isOverlayOpen, setIsOverlayOpen, overlayDetails, setOverlayDetails,
    onUserClick, editUser, deleteUser, createUser,
  } = useContext(userContextAPI);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useMemo(() => {
    const t = filter.trim().toLowerCase();
    return t ? users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(t)) : users;
  }, [users, filter]);

  const confirmAction = (title, message, actionType, onConfirm, status = "danger") => {
    setOverlayDetails({ title, message, status, actionType, onConfirm });
    setIsOverlayOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewUser({ name: "", email: "", role: "" });
  };

  const isAdminRole = (r) => String(r || "").toLowerCase() === "admin";

  return (
    <>
      <ConfirmationOverlay
        isOpen={isOverlayOpen}
        status={overlayDetails.status}
        title={overlayDetails.title}
        message={overlayDetails.message}
        onConfirm={overlayDetails.onConfirm}
        onCancel={() => setIsOverlayOpen(false)}
      />

      <div className="admin-title">
        <div><h1>Users</h1><p>{users.length} registered {users.length === 1 ? "user" : "users"}.</p></div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <i className="fa-solid fa-user-plus"></i> Add user
        </button>
      </div>

      <div className="toolbar">
        <input className="input" type="search" placeholder="Search by name or email…" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Search users" />
      </div>

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>User</th><th>Email</th><th>Role</th><th aria-label="Actions"></th></tr>
          </thead>
          <tbody>
            {visible.length === 0 && <tr><td colSpan="4" className="cell-muted">No users found.</td></tr>}
            {visible.map((user) => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span className="avatar avatar--sm">{initials(user.name)}</span>
                    <strong>{user.name}</strong>
                  </div>
                </td>
                <td className="cell-wrap">{user.email}</td>
                <td><span className={`badge ${isAdminRole(user.role) ? "" : "badge-muted"}`}>{isAdminRole(user.role) ? "Admin" : "Reader"}</span></td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" aria-label={`Edit ${user.name}`} title="Edit" onClick={() => { setIsModalOpen(true); onUserClick(user); }}>
                      <i className="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button
                      className="icon-btn danger"
                      aria-label={`Delete ${user.name}`}
                      title="Delete"
                      onClick={() => {
                        confirmAction("Delete user?", `Remove ${user.name} (${user.email})? Their sign-in account is not deleted.`, "deletion", () => deleteUser(user.id));
                        setNewUser({ name: "", email: "", role: "" });
                      }}
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Portal><div className="admin-modal-overlay">
          <div className="admin-modal" role="dialog" aria-modal="true">
            <h3>{newUser.id ? "Edit user" : "Add user"}</h3>
            <div className="field">
              <label htmlFor="u-name">Name</label>
              <input id="u-name" className="input" type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="u-email">Email</label>
              <input id="u-email" className="input" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="u-role">Role</label>
              <select id="u-role" className="select" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                <option value="">Select role</option>
                <option value="admin">Admin</option>
                <option value="user">Reader</option>
              </select>
            </div>
            <div className="admin-modal__actions">
              <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
              <button
                className="btn btn-primary"
                disabled={!newUser.name || !newUser.email || !newUser.role}
                onClick={() =>
                  newUser.id
                    ? confirmAction("Save changes?", "Update this user's details and role?", "updation", editUser, "safe")
                    : confirmAction("Add user?", "Create this user record?", "creation", () => createUser(newUser), "safe")
                }
              >
                {newUser.id ? "Save changes" : "Add user"}
              </button>
            </div>
          </div>
        </div></Portal>
      )}
    </>
  );
};

export default UserManagement;
