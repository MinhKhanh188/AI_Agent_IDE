import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

document.documentElement.style.setProperty('--app-font-size', '13px');
document.documentElement.style.setProperty('--app-icon-size', '17px');

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
