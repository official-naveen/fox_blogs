import React from "react";
import "./LegalPage.css";
import usePageTitle from "../hooks/usePageTitle";
import { SITE } from "../config/site";

const UPDATED = "October 2026";

const PAGES = {
  privacy: {
    title: "Privacy Policy",
    sections: [
      ["What we collect", `When you create an account we store your name, email address and a secure authentication record. If you comment, subscribe to the newsletter or use the contact form, we store what you submit (for example your comment text, email address and message).`],
      ["How we use it", `We use this information to run ${SITE.name}: to sign you in, show your comments, send the newsletter you asked for and reply to your messages. We do not sell your personal information.`],
      ["Third-party services", `${SITE.name} uses Google Firebase for authentication and data storage, and Cloudinary to host images. These providers process data on our behalf under their own privacy policies.`],
      ["Cookies & local storage", `We store your theme preference (light or dark) in your browser. Firebase may use browser storage to keep you signed in. We do not use advertising cookies.`],
      ["Your choices", `You can update your name or password from your profile at any time. To have your account, comments or newsletter subscription removed, contact us at ${SITE.email}.`],
      ["Contact", `Questions about this policy? Email ${SITE.email}.`],
    ],
  },
  terms: {
    title: "Terms of Use",
    sections: [
      ["Using the site", `By using ${SITE.name} you agree to these terms. The articles are provided for general information and education.`],
      ["Your account", `You are responsible for keeping your password safe and for activity under your account. Please provide accurate information when you sign up.`],
      ["Comments & conduct", `Be respectful. Comments that are abusive, hateful, spam or unlawful may be removed and accounts may be suspended. You keep ownership of what you write, and grant us permission to display it on the site.`],
      ["Our content", `Unless noted otherwise, the articles, images and design on ${SITE.name} belong to ${SITE.author.name}. You may share links and short quotes with credit, but please don't republish whole articles without permission.`],
      ["No warranty", `Content is provided “as is”. We do our best to be accurate but make no guarantees, and are not liable for decisions made based on what you read here.`],
      ["Changes", `We may update these terms from time to time. Continuing to use the site after a change means you accept the new terms.`],
    ],
  },
};

function LegalPage({ type }) {
  const page = PAGES[type];
  usePageTitle(page.title);
  return (
    <div className="page">
      <section className="page-hero container">
        <span className="eyebrow">Legal</span>
        <h1>{page.title}</h1>
        <p>Last updated {UPDATED}</p>
      </section>
      <section className="container-narrow legal">
        {page.sections.map(([heading, text]) => (
          <div key={heading}>
            <h2>{heading}</h2>
            <p>{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default LegalPage;
