import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import DesktopApp from "./renderer/DesktopApp";
import "./renderer/DesktopApp.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DesktopApp />
  </StrictMode>,
);
