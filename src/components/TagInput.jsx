import React, { useState } from "react";
import "./TagInput.css";
import { normalizeTag } from "../utils/text";

/** Type a tag and press Enter or comma. Backspace removes the last one. */
function TagInput({ value = [], onChange, max = 5, id }) {
  const [text, setText] = useState("");

  const add = (raw) => {
    const tag = normalizeTag(raw);
    setText("");
    if (!tag || value.includes(tag) || value.length >= max) return;
    onChange([...value, tag]);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(text);
    } else if (e.key === "Backspace" && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="tag-input">
      {value.map((t) => (
        <span key={t} className="tag-input__tag">
          #{t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove tag ${t}`}>
            &times;
          </button>
        </span>
      ))}
      {value.length < max && (
        <input
          id={id}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => text && add(text)}
          placeholder={value.length ? "Add another…" : "react, firebase, tips…"}
          maxLength={30}
        />
      )}
    </div>
  );
}

export default TagInput;
