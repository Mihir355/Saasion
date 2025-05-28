import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreateUser from "./components/CreateUser";
import Details from "./components/Details";
import EditUser from "./components/EditUser";
import AssignStudent from "./components/AssignStudent";
import TableView from "./components/TableView";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateUser />} />
        <Route path="/details" element={<Details />} />
        <Route path="/edit" element={<EditUser />} />
        <Route path="/assign" element={<AssignStudent />} />
        <Route path="/tables" element={<TableView />} />
      </Routes>
    </Router>
  );
}

export default App;
