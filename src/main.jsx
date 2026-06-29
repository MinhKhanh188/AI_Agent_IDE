import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R')) {
    e.preventDefault();
  }
});

document.addEventListener('contextmenu', e => e.preventDefault());

document.documentElement.style.setProperty('--app-font-size', '13px');
document.documentElement.style.setProperty('--app-icon-size', '17px');

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
