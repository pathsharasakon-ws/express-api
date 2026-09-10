import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./MongoUsersApp.jsx";
import "./mongo-users.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
