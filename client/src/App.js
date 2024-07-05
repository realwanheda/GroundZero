import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import TextEditor from "./TextEditor";
import Login from "./pages/login.js";
import Dashboard from "./pages/dashboard.js";
import { v4 as uuidV4 } from "uuid";

function App() {
  // Generate a UUID
  const fullUuid = uuidV4();

  // Truncate the UUID to desired length
  const shortUuid = fullUuid.replace(/-/g, "").substring(0, 24);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/document"
          element={<Navigate to={`/document/${shortUuid}`} />}
        />
        <Route path="/document/:id" element={<TextEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
