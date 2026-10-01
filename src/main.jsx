import React from "react";
import { createRoot } from "react-dom/client";
import StudyNotebook from "../StudyNotebook.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StudyNotebook />
  </React.StrictMode>
);
