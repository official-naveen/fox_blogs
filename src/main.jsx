import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/theme.css";
import App from "./App.jsx";
import AuthContext from "./contexts/auth_context/AuthContext.jsx";
import { BrowserRouter } from "react-router-dom";
import PostContext from "./contexts/post_context/PostContext.jsx";
import LoadingContext from "./contexts/loading_context/LoadingContext.jsx";
import UserContext from "./contexts/user_context/UserContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <LoadingContext>
        <AuthContext>
          <PostContext>
            <UserContext>
              <App />
            </UserContext>
          </PostContext>
        </AuthContext>
      </LoadingContext>
    </BrowserRouter>
  </StrictMode>
);
