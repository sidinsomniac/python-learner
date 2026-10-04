import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./ui/App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Offline support: only in real builds, so `npm run dev` always serves fresh files.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const url = `${import.meta.env.BASE_URL}sw.js?pyodide=${__PYODIDE_VERSION__}`;
    navigator.serviceWorker.register(url).catch(() => undefined);
  });
}
