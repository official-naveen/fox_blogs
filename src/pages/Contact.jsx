import React, { useContext, useState } from "react";
import "./Contact.css";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { fireDB } from "../firebase/FirebaseConfig";
import loadingContextAPI from "../contexts/loading_context/loadingContextAPI";
import usePageTitle from "../hooks/usePageTitle";
import { SITE } from "../config/site";

const FAQS = [
  { q: "How often do you publish new posts?", a: "Whenever I have something worth saying — usually a few times a month. Subscribe to the newsletter to hear about new posts first." },
  { q: "Can I write a guest post?", a: "Yes! Send me a message with a short pitch and a link to your writing, and I'll get back to you." },
  { q: "Can I share or quote your articles?", a: "Absolutely. Share the link anywhere you like, and if you quote a section please credit the post and link back to it." },
  { q: "I found a mistake — how do I report it?", a: "Use the form on this page or leave a comment on the post. Corrections are always welcome." },
];

const Contact = () => {
  usePageTitle("Contact");
  const { setNotification } = useContext(loadingContextAPI);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(0);

  const update = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await addDoc(collection(fireDB, "messages"), {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        read: false,
        createdAt: serverTimestamp(),
      });
      setForm({ name: "", email: "", message: "" });
      setNotification({ type: "success", message: "Thanks! Your message has been sent.", isVisible: true });
    } catch (error) {
      console.error("Could not send message:", error);
      setNotification({ type: "error", message: "Could not send your message. Please try again.", isVisible: true });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page">
      <section className="page-hero container">
        <span className="eyebrow">Contact</span>
        <h1>Get in touch</h1>
        <p>Have a question, feedback or just want to say hi? I&apos;d love to hear from you.</p>
      </section>

      <section className="container contact-layout">
        <form className="card contact-form" onSubmit={handleSubmit}>
          <div className="contact-form__row">
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" className="input" type="text" placeholder="Your name" required maxLength={100} value={form.name} onChange={update} />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" className="input" type="email" placeholder="you@example.com" required maxLength={200} value={form.email} onChange={update} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea id="message" className="textarea" placeholder="How can I help?" rows="6" required maxLength={2000} value={form.message} onChange={update}></textarea>
            <span className="hint">{form.message.length}/2000</span>
          </div>
          <button type="submit" className="btn btn-primary" disabled={sending}>
            {sending ? "Sending…" : <>Send message <i className="fa-regular fa-paper-plane"></i></>}
          </button>
        </form>

        <aside className="contact-side">
          <div className="card contact-info">
            <span className="category-card__icon"><i className="fa-regular fa-envelope"></i></span>
            <h2>Prefer email?</h2>
            <p>Reach me directly at</p>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </div>
          <div className="card contact-info">
            <span className="category-card__icon"><i className="fa-solid fa-share-nodes"></i></span>
            <h2>Find me online</h2>
            <div className="contact-info__links">
              <a className="icon-btn" href={SITE.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i className="fa-brands fa-github"></i></a>
              <a className="icon-btn" href={SITE.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
              <a className="icon-btn" href={SITE.social.twitter} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"><i className="fa-brands fa-x-twitter"></i></a>
            </div>
          </div>
        </aside>
      </section>

      <section className="container-narrow faq">
        <h2>Frequently asked questions</h2>
        {FAQS.map((f, i) => (
          <div key={f.q} className={`faq__item ${open === i ? "is-open" : ""}`}>
            <h3>
              <button type="button" aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => setOpen(open === i ? -1 : i)}>
                {f.q}
                <i className="fa-solid fa-plus"></i>
              </button>
            </h3>
            <div id={`faq-${i}`} className="faq__answer" role="region">
              <p>{f.a}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Contact;
