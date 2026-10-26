import React, { Suspense, lazy, useCallback, useContext, useEffect } from "react";
import { Routes, Route, useLocation, matchPath, Navigate } from "react-router-dom";
import "./App.css";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Reloader from "./components/Reloader.jsx";
import Notifier from "./components/Notifier.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import HomePage from "./pages/HomePage.jsx";
import BlogPosts from "./pages/BlogPosts.jsx";
import PostPage from "./pages/PostPage.jsx";
import PreviewBlog from "./pages/PreviewBlog.jsx";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import AboutSection from "./pages/AboutSection.jsx";
import Contact from "./pages/Contact.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import LegalPage from "./pages/LegalPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import Signin from "./auth/Signin.jsx";
import Signup from "./auth/Signup.jsx";
import ForgotPassword from "./auth/ForgotPassword.jsx";
import postContextAPI from "./contexts/post_context/postContextAPI.jsx";
import loadingContextAPI from "./contexts/loading_context/loadingContextAPI.jsx";
import authContextAPI from "./contexts/auth_context/authContextAPI.jsx";

// The admin area pulls in the TinyMCE editor, so load it only when needed.
const AdminDashboard = lazy(() => import("./components/AdminDashboard.jsx"));

const AUTH_PATHS = ["/signin", "/signup", "/forgot-password"];

/** Only lets admins through; everyone else is sent to the sign-in page. */
function RequireAdmin({ children }) {
  const { isAdmin, authLoading } = useContext(authContextAPI);
  if (authLoading) return <Reloader />;
  return isAdmin ? children : <Navigate to="/signin" replace />;
}

/** Only lets signed-in users through. */
function RequireAuth({ children }) {
  const { isLoggedIn, authLoading } = useContext(authContextAPI);
  if (authLoading) return <Reloader />;
  return isLoggedIn ? children : <Navigate to="/signin" replace />;
}

function App() {
  const location = useLocation();

  const isAdminArea =
    !!matchPath({ path: "/admin/*" }, location.pathname) ||
    location.pathname === "/preview-blog";
  const isAuthPage = AUTH_PATHS.includes(location.pathname);
  const showChrome = !isAdminArea && !isAuthPage;

  const { blogPreviewInfo } = useContext(postContextAPI);
  const { isLoading, setIsLoading, notification, setNotification } =
    useContext(loadingContextAPI);

  const closeNotification = useCallback(
    () => setNotification((n) => ({ ...n, isVisible: false })),
    [setNotification]
  );

  // Show the loader until the first full page load has finished.
  useEffect(() => {
    setIsLoading(true);
    const handlePageLoad = () => setIsLoading(false);
    if (document.readyState === "complete") {
      handlePageLoad();
    } else {
      window.addEventListener("load", handlePageLoad);
    }
    return () => window.removeEventListener("load", handlePageLoad);
  }, [setIsLoading]);

  // Start each page at the top (the post page handles its own scroll).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      {showChrome && <Header />}

      <div className="app-main">
        <Suspense fallback={<Reloader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogPosts />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/about" element={<AboutSection />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<LegalPage type="privacy" />} />
            <Route path="/terms" element={<LegalPage type="terms" />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              }
            />
            <Route
              path="/preview-blog"
              element={
                <RequireAdmin>
                  <PreviewBlog post={blogPreviewInfo} backTo="/admin/post-manager" backLabel="Back to editor" />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/*"
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>

      {isLoading && <Reloader />}
      <Notifier
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={closeNotification}
        timeout={4000}
      />

      {showChrome && <Footer />}
      {showChrome && <ScrollToTop />}
    </div>
  );
}

export default App;
