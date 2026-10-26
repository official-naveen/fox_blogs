import React, { useContext } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Link } from "react-router-dom";
import "./PostManager.css";
import postContextAPI from "../contexts/post_context/postContextAPI";
import ConfirmationOverlay from "../components/ConfirmationOverlay";
import AdminPosts from "../components/AdminPosts";
import Portal from "../components/Portal";
import TagInput from "../components/TagInput";
import { CATEGORIES } from "../config/site";

const SAVE_LABEL = { draft: "Save draft", published: "Publish", scheduled: "Schedule" };
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const PostsManager = () => {
  const {
    handleSaveToFirebase,
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
    previewUrl,
    isOverlayOpen,
    setIsOverlayOpen,
    overlayDetails,
    setOverlayDetails,
  } = useContext(postContextAPI);

  const isEditing = !!editingId;
  const dark = document.documentElement.dataset.theme === "dark";

  const save = () => {
    // Drafts save straight away; going public asks first.
    if (postStatus === "draft") {
      handleSaveToFirebase();
      return;
    }
    setOverlayDetails({
      status: "safe",
      title: postStatus === "scheduled" ? "Schedule this post?" : isEditing ? "Save changes?" : "Publish post?",
      message:
        postStatus === "scheduled"
          ? "It will appear on the site automatically at the time you picked."
          : "This post will be visible to everyone on the site right away.",
      onConfirm: handleSaveToFirebase,
      actionType: "save",
    });
    setIsOverlayOpen(true);
  };

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
        <div>
          <h1>Posts</h1>
          <p>Write drafts, schedule posts and publish your articles.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsTitleModalOpen(true)}>
          <i className="fa-solid fa-plus"></i> Create new post
        </button>
      </div>

      <AdminPosts />

      {/* Step 1: details */}
      {isTitleModalOpen && (
        <Portal>
          <div className="admin-modal-overlay">
            <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="post-details-title">
              <h3 id="post-details-title">{isEditing ? "Edit post details" : "New post details"}</h3>

              <div className="field">
                <span className="label">Thumbnail <span className="hint">(needed to publish, optional for drafts)</span></span>
                <div className="dropzone" onDragOver={handleDragOver} onDrop={handleDrop}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Thumbnail preview" />
                  ) : (
                    <p><i className="fa-regular fa-image"></i><br />Drag &amp; drop an image, or click to choose</p>
                  )}
                  <input type="file" accept="image/*" onChange={handleThumbnailChange} aria-label="Choose thumbnail image" />
                </div>
              </div>

              <div className="field">
                <label htmlFor="post-title">Title</label>
                <input id="post-title" type="text" className="input" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="A great headline" maxLength={140} />
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="post-category">Category</label>
                  <select id="post-category" className="select" value={postCategory} onChange={(e) => setPostCategory(e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="post-tags">Tags <span className="hint">(up to 5)</span></label>
                  <TagInput id="post-tags" value={postTags} onChange={setPostTags} />
                </div>
              </div>

              <div className="field">
                <label htmlFor="post-excerpt">Short summary <span className="hint">(optional)</span></label>
                <textarea id="post-excerpt" className="textarea" style={{ minHeight: 80 }} value={postExcerpt} onChange={(e) => setPostExcerpt(e.target.value)} placeholder="One or two sentences shown on post cards. Leave blank to use the start of the article." maxLength={240} />
              </div>

              <label className="check" style={{ marginBottom: "1.25rem" }}>
                <input type="checkbox" checked={postFeatured} onChange={(e) => setPostFeatured(e.target.checked)} />
                Feature this post on the home page
              </label>

              <div className="admin-modal__actions">
                <button className="btn btn-outline" onClick={cancelPostModal}>Cancel</button>
                <button className="btn btn-primary" onClick={handleNext} disabled={!postTitle.trim()}>
                  Next: write <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Step 2: editor */}
      {isModalOpen && (
        <Portal>
          <div className="editor-screen">
            <div className="editor-screen__bar">
              <button className="btn btn-ghost btn-sm" onClick={() => { setIsTitleModalOpen(true); setIsModalOpen(false); }}>
                <i className="fa-solid fa-arrow-left"></i> <span className="hide-sm">Details</span>
              </button>
              <strong className="editor-screen__title">{postTitle || "Untitled post"}</strong>

              <div className="editor-screen__actions">
                <label className="sr-only" htmlFor="post-status">Post status</label>
                <select id="post-status" className="select select-sm" value={postStatus} onChange={(e) => setPostStatus(e.target.value)}>
                  <option value="draft">Draft (hidden)</option>
                  <option value="published">Publish now</option>
                  <option value="scheduled">Schedule…</option>
                </select>
                {postStatus === "scheduled" && (
                  <>
                    <label className="sr-only" htmlFor="post-schedule">Publish date and time</label>
                    <input
                      id="post-schedule"
                      type="datetime-local"
                      className="input select-sm"
                      value={postScheduleAt}
                      onChange={(e) => setPostScheduleAt(e.target.value)}
                      title={`Your local time (${timeZone})`}
                    />
                  </>
                )}
                <Link to="/preview-blog" className="btn btn-outline btn-sm"><i className="fa-regular fa-eye"></i> <span className="hide-sm">Preview</span></Link>
                <button className="btn btn-primary btn-sm" onClick={save}>{SAVE_LABEL[postStatus]}</button>
              </div>
            </div>

            <div className="editor-screen__body">
              <Editor
                apiKey={import.meta.env.VITE_Editor_API}
                value={content}
                onEditorChange={handleEditorChange}
                init={{
                  height: "100%",
                  menubar: true,
                  skin: dark ? "oxide-dark" : "oxide",
                  content_css: dark ? "dark" : "default",
                  plugins: [
                    "quickbars",
                    "advlist autolink lists link image charmap preview anchor",
                    "searchreplace visualblocks code fullscreen",
                    "insertdatetime media table help wordcount",
                    "codesample",
                    "emoticons",
                  ],
                  quickbars_selection_toolbar: "bold italic underline | forecolor backcolor | quicklink h2 h3 blockquote",
                  quickbars_insert_toolbar: "table codesample bullist numlist",
                  toolbar:
                    "undo redo | blocks | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link codesample image | code fullscreen | emoticons",
                  file_picker_callback: (callback, value, meta) => {
                    if (meta.filetype === "image") {
                      const input = document.createElement("input");
                      input.setAttribute("type", "file");
                      input.setAttribute("accept", "image/*");
                      input.onchange = () => {
                        const file = input.files[0];
                        if (file) callback(URL.createObjectURL(file), { alt: file.name });
                      };
                      input.click();
                    }
                  },
                  content_style: `
                    body { font-family: Inter, system-ui, sans-serif; font-size: 17px; line-height: 1.7; max-width: 760px; margin: 1.5rem auto; padding: 0 1rem; }
                    pre, code { border-radius: 6px; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 0.9rem; }
                    img { max-width: 100%; height: auto; }
                  `,
                }}
              />
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};

export default PostsManager;
