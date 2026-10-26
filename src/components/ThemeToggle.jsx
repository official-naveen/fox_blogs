import React from "react";
import useTheme from "../hooks/useTheme";

function ThemeToggle({ className = "" }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className={`icon-btn ${className}`}
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <i className={`fa-solid ${isDark ? "fa-sun" : "fa-moon"}`}></i>
    </button>
  );
}

export default ThemeToggle;
