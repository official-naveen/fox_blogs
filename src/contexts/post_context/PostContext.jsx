import React, { useContext, useEffect, useState } from "react";
import postContextAPI from "./postContextAPI";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";
import { parse } from "node-html-parser";
import loadingContextAPI from "../loading_context/loadingContextAPI";
import authContextAPI from "../auth_context/authContextAPI";
import { isLive, postDate, toDate, toLocalInput } from "../../utils/text";

const newestFirst = (a, b) => (toDate(postDate(b)) || 0) - (toDate(postDate(a)) || 0);

/**
 * Posts: loading, editing and saving.
 *
 * Every post has a `status`:
 *   "draft"      – only admins can see it
 *   "scheduled"  – goes live on its `publishAt` date
 *   "published"  – live now
 * (Posts created before statuses existed have no status and count as published;
 *  they are upgraded automatically the first time an admin opens the Posts page.)
 */
function PostContext(props) {
  const { setIsLoading, setNotification } = useContext(loadingContextAPI);
  const { isAdmin } = useContext(authContextAPI);

  // ----- lists -----
  const [posts, setPosts] = useState([]); // what the public sees
  const [postsLoading, setPostsLoading] = useState(true);
  const [adminPosts, setAdminPosts] = useState([]); // everything, incl. drafts
  const [adminLoading, setAdminLoading] = useState(true);

  // ----- editor form -----
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postThumbnail, setPostThumbnail] = useState(null); // File (new) or URL string (existing)
  const [previewUrl, setPreviewUrl] = useState("");
  const [postCategory, setPostCategory] = useState("Technology");
  const [postExcerpt, setPostExcerpt] = useState("");
  const [postFeatured, setPostFeatured] = useState(false);
  const [postTags, setPostTags] = useState([]);
  const [postStatus, setPostStatus] = useState("published");
  const [postScheduleAt, setPostScheduleAt] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [blogPreviewInfo, setBlogPreviewInfo] = useState({});

  // ----- confirmation overlay (delete etc.) -----
  const [postDetails, setPostDetails] = useState();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [overlayDetails, setOverlayDetails] = useState({
    title: "",
    message: "",
    status: "",
    onConfirm: null,
    actionType: "",
  });

  const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

  const notify = (type, message) => setNotification({ type, message, isVisible: true });

  const formatFirebaseTimestamp = (timestamp) => {
    const date = toDate(timestamp);
    if (!date) return { date: "", time: "" };
    return {
      date: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      time: date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
  };

  // ------------------------------------------------------------------ loading

  /** Public posts: published, or scheduled and already due. */
  const getPosts = async () => {
    setPostsLoading(true);
    try {
      // One equality-style filter and no orderBy → no composite index needed.
      // Drafts are excluded here, and blocked by the Firestore rules too.
      const snap = await getDocs(
        query(collection(fireDB, "posts"), where("status", "in", ["published", "scheduled"]))
      );
      const now = new Date();
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => isLive(p, now))
        .sort(newestFirst);
      setPosts(list);
    } catch (error) {
      console.error("Error fetching posts: ", error);
      notify("error", "Could not load posts.");
    } finally {
      setPostsLoading(false);
    }
  };

  /** Admin list: every post including drafts. Also upgrades pre-status posts. */
  const getAdminPosts = async () => {
    setAdminLoading(true);
    try {
      const snap = await getDocs(collection(fireDB, "posts"));
      let list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const legacy = list.filter((p) => !p.status);
      if (legacy.length > 0) {
        await Promise.all(
          legacy.map((p) =>
            updateDoc(doc(fireDB, "posts", p.id), {
              status: "published",
              publishAt: p.createdAt || serverTimestamp(),
            })
          )
        );
        list = list.map((p) => (p.status ? p : { ...p, status: "published", publishAt: p.createdAt }));
        getPosts(); // older posts are now visible to the public query
      }

      setAdminPosts(list.sort(newestFirst));
    } catch (error) {
      console.error("Error fetching admin posts: ", error);
      notify("error", "Could not load posts.");
    } finally {
      setAdminLoading(false);
    }
  };

  const refreshPosts = () => {
    getPosts();
    if (isAdmin) getAdminPosts();
  };

  /** One post by id. Callers decide whether the viewer may see it (see isLive). */
  const getPostById = async (id) => {
    const snap = await getDoc(doc(fireDB, "posts", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  };

  // ------------------------------------------------------------------ editor

  const handleEditorChange = (value) => setContent(value);

  // keep the admin "Preview" page in sync with the form
  useEffect(() => {
    setBlogPreviewInfo({
      content,
      title: postTitle,
      thumbnail: previewUrl,
      category: postCategory,
      excerpt: postExcerpt,
      tags: postTags,
      createdAt: new Date(),
    });
  }, [content, postTitle, previewUrl, postCategory, postExcerpt, postTags]);

  const uploadImage = async (file) => {
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", UPLOAD_PRESET);
      data.append("folder", `posts/${postTitle}`);
      const res = await fetch(CLOUDINARY_URL, { method: "POST", body: data });
      if (!res.ok) throw new Error("Image upload failed");
      return (await res.json()).secure_url;
    } catch (error) {
      console.error("Error uploading image: ", error);
      return null;
    }
  };

  /** Uploads images picked from the computer (blob:/data:) and swaps in their hosted URLs. */
  const replaceTempUrlsWithActualUrls = async (html) => {
    try {
      const root = parse(html);
      for (const img of root.querySelectorAll("img")) {
        const src = img.getAttribute("src");
        if (src && /^(blob:|data:)/.test(src)) {
          const blob = await (await fetch(src)).blob();
          const url = await uploadImage(blob);
          if (url) img.setAttribute("src", url);
        }
      }
      return root.toString();
    } catch (error) {
      console.error("Error replacing image URLs: ", error);
      return html;
    }
  };

  const resetState = () => {
    setIsModalOpen(false);
    setIsTitleModalOpen(false);
    setContent("");
    setPostThumbnail(null);
    setPostTitle("");
    setPostCategory("Technology");
    setPostExcerpt("");
    setPostFeatured(false);
    setPostTags([]);
    setPostStatus("published");
    setPostScheduleAt("");
    setEditingId(null);
    setPreviewUrl("");
    setIsOverlayOpen(false);
    setPostDetails(undefined);
  };

  /**
   * Saves the current form as a draft, a scheduled post or a published post
   * (depending on `postStatus`), creating or updating as needed.
   */
  const handleSaveToFirebase = async () => {
    const needsFullPost = postStatus !== "draft";
    const scheduledFor = postStatus === "scheduled" ? new Date(postScheduleAt) : null;

    // ----- validation -----
    let problem = "";
    if (!postTitle.trim()) problem = "Please add a title.";
    else if (postStatus === "scheduled" && (!scheduledFor || isNaN(scheduledFor)))
      problem = "Pick a date and time to schedule this post.";
    else if (postStatus === "scheduled" && scheduledFor <= new Date())
      problem = "The scheduled time must be in the future.";
    else if (needsFullPost && !content.trim()) problem = "Write some content before publishing.";
    else if (needsFullPost && !postThumbnail) problem = "Add a thumbnail before publishing.";
    if (problem) {
      setIsOverlayOpen(false);
      notify("warning", problem);
      return;
    }

    setIsLoading(true);
    try {
      const updatedContent = await replaceTempUrlsWithActualUrls(content);

      let thumbnailURL = "";
      if (typeof postThumbnail === "string") thumbnailURL = postThumbnail;
      else if (postThumbnail) {
        thumbnailURL = await uploadImage(postThumbnail);
        if (!thumbnailURL) {
          setIsOverlayOpen(false);
          notify("error", "Thumbnail upload failed. Check your Cloudinary settings.");
          return;
        }
      }

      const existing = editingId ? adminPosts.find((p) => p.id === editingId) : null;
      const data = {
        title: postTitle.trim(),
        content: updatedContent,
        thumbnail: thumbnailURL,
        category: postCategory,
        excerpt: postExcerpt.trim(),
        featured: postFeatured,
        tags: postTags,
        status: postStatus,
        updatedAt: serverTimestamp(),
      };

      if (postStatus === "draft") data.publishAt = null;
      else if (postStatus === "scheduled") data.publishAt = scheduledFor;
      else if (!(existing?.status === "published" && existing.publishAt)) data.publishAt = serverTimestamp();
      // (already-published posts keep their original publish date)

      if (editingId) {
        await updateDoc(doc(fireDB, "posts", editingId), data);
      } else {
        await addDoc(collection(fireDB, "posts"), { ...data, createdAt: serverTimestamp() });
      }

      notify(
        "success",
        postStatus === "draft"
          ? "Draft saved."
          : postStatus === "scheduled"
          ? `Scheduled for ${scheduledFor.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}.`
          : editingId
          ? "Post updated."
          : "Post published!"
      );
      refreshPosts();
      resetState();
    } catch (error) {
      console.error("Error saving content: ", error);
      notify("error", "Something went wrong! Try again");
    } finally {
      setIsLoading(false);
    }
  };

  /** One-click publish / unpublish from the posts table. */
  const setPostStatusQuick = async (post, status) => {
    try {
      const data = { status, updatedAt: serverTimestamp() };
      if (status === "draft") data.publishAt = null;
      else if (!post.publishAt || post.status === "draft") data.publishAt = serverTimestamp();
      await updateDoc(doc(fireDB, "posts", post.id), data);
      notify("success", status === "draft" ? "Post unpublished (now a draft)." : "Post published!");
      refreshPosts();
    } catch (error) {
      console.error("Status change failed:", error);
      notify("error", "Could not change the post status.");
    }
  };

  const handleThumbnailChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPostThumbnail(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (event) => event.preventDefault();

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setPostThumbnail(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleNext = () => {
    setIsTitleModalOpen(false);
    setIsModalOpen(true);
  };

  const deletePost = async (post) => {
    setIsLoading(true);
    try {
      await deleteDoc(doc(fireDB, "posts", post.id));
      refreshPosts();
      setIsOverlayOpen(false);
      notify("success", "Deleted post successfully!");
    } catch (error) {
      notify("error", "Failed post deletion!");
      console.error("Error deleting document: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelPostModal = () => resetState();

  /** Opens the editor flow pre-filled with an existing post. */
  const editPost = (post) => {
    setIsOverlayOpen(false);
    setEditingId(post.id);
    setPreviewUrl(post.thumbnail || "");
    setPostThumbnail(post.thumbnail || null);
    setPostTitle(post.title || "");
    setPostCategory(post.category || "Other");
    setPostExcerpt(post.excerpt || "");
    setPostFeatured(!!post.featured);
    setPostTags(post.tags || []);
    setPostStatus(post.status || "published");
    setPostScheduleAt(post.status === "scheduled" ? toLocalInput(post.publishAt) : "");
    setContent(post.content || "");
    setIsTitleModalOpen(true);
  };

  return (
    <postContextAPI.Provider
      value={{
        posts,
        postsLoading,
        getPosts,
        adminPosts,
        adminLoading,
        getAdminPosts,
        getPostById,
        refreshPosts,
        handleSaveToFirebase,
        setPostStatusQuick,
        handleEditorChange,
        isModalOpen,
        setIsModalOpen,
        content,
        handleNext,
        handleDrop,
        handleDragOver,
        handleThumbnailChange,
        isTitleModalOpen,
        setIsTitleModalOpen,
        cancelPostModal,
        postTitle,
        setPostTitle,
        postThumbnail,
        previewUrl,
        postCategory,
        setPostCategory,
        postExcerpt,
        setPostExcerpt,
        postFeatured,
        setPostFeatured,
        postTags,
        setPostTags,
        postStatus,
        setPostStatus,
        postScheduleAt,
        setPostScheduleAt,
        editingId,
        isOverlayOpen,
        setIsOverlayOpen,
        deletePost,
        editPost,
        overlayDetails,
        setOverlayDetails,
        postDetails,
        setPostDetails,
        formatFirebaseTimestamp,
        blogPreviewInfo,
      }}
    >
      {props.children}
    </postContextAPI.Provider>
  );
}

export default PostContext;
