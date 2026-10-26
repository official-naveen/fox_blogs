import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";
import usePageTitle from "../hooks/usePageTitle";

function NotFound() {
  usePageTitle("Page not found");
  return (
    <div className="notfound page">
      <div className="notfound__fox" aria-hidden="true">🦊</div>
      <p className="eyebrow">Error 404</p>
      <h1>This page wandered off into the woods</h1>
      <p>The link may be broken, or the post may have been removed.</p>
      <div className="notfound__actions">
        <Link to="/" className="btn btn-primary">Back to home</Link>
        <Link to="/blog" className="btn btn-outline">Browse posts</Link>
      </div>
    </div>
  );
}

export default NotFound;
