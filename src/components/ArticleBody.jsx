import React, { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-sql";
import "./ArticleBody.css";

/** Renders post HTML with syntax highlighting and "Copy" buttons on code blocks. */
function ArticleBody({ html }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    Prism.highlightAllUnder(root);

    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(".copy-code-button")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-code-button";
      button.textContent = "Copy";
      button.onclick = async () => {
        try {
          await navigator.clipboard.writeText(pre.querySelector("code")?.textContent ?? pre.textContent);
          button.textContent = "Copied!";
        } catch {
          button.textContent = "Press Ctrl+C";
        }
        setTimeout(() => (button.textContent = "Copy"), 1500);
      };
      pre.appendChild(button);
    });
  }, [html]);

  return (
    <div
      className="prose"
      ref={ref}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default ArticleBody;
