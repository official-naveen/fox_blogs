import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import authContextAPI from "../contexts/auth_context/authContextAPI";
import ThemeToggle from "./ThemeToggle";
import { SITE } from "../config/site";
import { initials } from "../utils/text";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/blog", label: "Blog" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

function Header() {
  const { isLoggedIn, isAdmin, currentUser, logout } = useContext(authContextAPI);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const userRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // close menus on navigation
  useEffect(() => {
    setMenuOpen(false);
    setUserOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the user dropdown when clicking elsewhere or pressing Escape
  useEffect(() => {
    const onClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && (setUserOpen(false), setMenuOpen(false));
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/blog?q=${encodeURIComponent(q)}` : "/blog");
    setMenuOpen(false);
  };

  const name = currentUser?.displayName || currentUser?.email || "";

  const searchForm = (idSuffix) => (
    <form className="site-search" onSubmit={handleSearch} role="search">
      <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
      <input
        type="search"
        id={`search-${idSuffix}`}
        placeholder="Search posts…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search posts"
      />
    </form>
  );

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="container site-header__inner">
        <Link to="/" className="brand" aria-label={`${SITE.name} home`}>
          <span className="brand__logo" aria-hidden="true">🦊</span>
          <span className="brand__name">{SITE.name}</span>
        </Link>

        <nav className="site-nav" aria-label="Main">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="site-nav__link">
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <div className="site-header__search-desktop">{searchForm("d")}</div>
          <ThemeToggle />

          {isLoggedIn ? (
            <div className="user-menu" ref={userRef}>
              <button
                type="button"
                className="avatar"
                onClick={() => setUserOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={userOpen}
                aria-label="Account menu"
              >
                {initials(name)}
              </button>
              {userOpen && (
                <div className="user-menu__panel card" role="menu">
                  <div className="user-menu__who">
                    <strong>{currentUser?.displayName || "Reader"}</strong>
                    <span>{currentUser?.email}</span>
                  </div>
                  <Link role="menuitem" to="/profile"><i className="fa-regular fa-user"></i> My profile</Link>
                  <Link role="menuitem" to="/profile?tab=saved"><i className="fa-regular fa-bookmark"></i> Saved posts</Link>
                  {isAdmin && (
                    <Link role="menuitem" to="/admin/dashboard"><i className="fa-solid fa-gauge"></i> Admin dashboard</Link>
                  )}
                  <button role="menuitem" type="button" onClick={logout}>
                    <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="site-header__auth">
              <Link to="/signin" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Join free</Link>
            </div>
          )}

          <button
            type="button"
            className="icon-btn site-header__burger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`}></i>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-drawer">
          <div className="container">
            {searchForm("m")}
            <nav aria-label="Mobile">
              {NAV.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className="mobile-drawer__link">
                  {item.label}
                </NavLink>
              ))}
              {isLoggedIn ? (
                <>
                  <NavLink to="/profile" className="mobile-drawer__link">My profile</NavLink>
                  {isAdmin && <NavLink to="/admin/dashboard" className="mobile-drawer__link">Admin dashboard</NavLink>}
                  <button type="button" className="mobile-drawer__link" onClick={logout}>Log out</button>
                </>
              ) : (
                <div className="mobile-drawer__auth">
                  <Link to="/signin" className="btn btn-outline btn-block">Sign in</Link>
                  <Link to="/signup" className="btn btn-primary btn-block">Join free</Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
