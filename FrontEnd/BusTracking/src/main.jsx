import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppWrap from "./App.jsx";

const id =
  "490152701214-21l47u05r51eph6anptnpnfe7vi0t6q3.apps.googleusercontent.com";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={id}>
      <AppWrap />
    </GoogleOAuthProvider>
  </StrictMode>
);
