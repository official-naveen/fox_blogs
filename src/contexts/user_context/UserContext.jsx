// UserContext.jsx
import React, { useContext, useState } from "react";
import userContextAPI from "./userContextAPI";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";
import loadingContextAPI from "../loading_context/loadingContextAPI";

function UserContext({ children }) {
  const { setIsLoading, setNotification } = useContext(loadingContextAPI);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const [newUser, setNewUser] = useState({ name: "", email: "", role: "" });
  const [overlayDetails, setOverlayDetails] = useState({
    title: "",
    message: "",
    status: "",
    onConfirm: null,
    actionType: "",
  });

  /**
   * Fetch all users from Firestore.
   */
  const getUsers = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(fireDB, "users"));
      setUsers(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete a user from Firestore.
   * @param {string} userId - ID of the user to delete.
   */
  const deleteUser = async (userId) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      await deleteDoc(doc(fireDB, "users", userId));
      setNotification({
        type: "success",
        message: "User deleted successfully!",
        isVisible: true,
      });
      getUsers(); // Refresh users after deletion
    } catch (error) {
      setNotification({
        type: "error",
        message: "Failed to delete user!",
        isVisible: true,
      });
      console.error("Error deleting user:", error);
    } finally {
      setIsLoading(false);
      setIsOverlayOpen(false); // Close overlay after action
    }
  };

  /**
   * Edit user details in Firestore.
   */
  const editUser = async () => {
    if (!newUser.id) return;
    const userRef = doc(fireDB, "users", newUser.id);
    setIsLoading(true);
    try {
      await updateDoc(userRef, {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      });
      setNotification({
        type: "success",
        message: "User updated successfully!",
        isVisible: true,
      });
      getUsers();
    } catch (error) {
      setNotification({
        type: "error",
        message: "Failed to update user!",
        isVisible: true,
      });
      console.error("Error updating user:", error);
    } finally {
      setIsLoading(false);
      setIsOverlayOpen(false);
      setIsModalOpen(false);
      setNewUser({ name: "", email: "", role: "" });
    }
  };

  /**
   * Create user in Firestore.
   */
  const createUser = async (newUser) => {
    if (!newUser.email || !newUser.name || !newUser.role) return;

    setIsLoading(true);
    try {
      await addDoc(collection(fireDB, "users"), newUser);
      setNotification({
        type: "success",
        message: "User created successfully!",
        isVisible: true,
      });
      getUsers();
    } catch (error) {
      setNotification({
        type: "error",
        message: "Failed to creation user!",
        isVisible: true,
      });
      console.error("Error updating user:", error);
    } finally {
      setIsLoading(false);
      setIsOverlayOpen(false);
      setIsModalOpen(false);
      setNewUser({ name: "", email: "", role: "" });
    }
  };

  /**
   * Set user data when clicking an existing user.
   * @param {Object} user - The user object.
   */
  const onUserClick = (user) => {
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      id: user.id,
    });
  };

  return (
    <userContextAPI.Provider
      value={{
        getUsers,
        users,
        isModalOpen,
        setIsModalOpen,
        newUser,
        setNewUser,
        overlayDetails,
        setOverlayDetails,
        isOverlayOpen,
        setIsOverlayOpen,
        onUserClick,
        editUser,
        deleteUser,
        createUser,
      }}
    >
      {children}
    </userContextAPI.Provider>
  );
}

export default UserContext;
