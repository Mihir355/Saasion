import React from "react";
import "../styles/homepage.css";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="homepage-container">
      <h1 className="homepage-title">User Management</h1>
      <div className="homepage-button-group">
        <button
          className="homepage-create-button"
          onClick={() => navigate("/create")}
        >
          Create User
        </button>
        <button
          className="homepage-edit-button"
          onClick={() => navigate("/edit")}
        >
          Edit User
        </button>
        <button
          className="homepage-details-button"
          onClick={() => navigate("/details")}
        >
          Details
        </button>
        <button
          className="homepage-assign-button"
          onClick={() => navigate("/assign")}
        >
          Assign
        </button>
      </div>
    </div>
  );
};

export default HomePage;
