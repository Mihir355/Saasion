import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/createuser.css";

const SUBJECT_OPTIONS = [
  { value: "english", label: "English" },
  { value: "math", label: "Maths" },
  { value: "science", label: "Science" },
  { value: "hindi", label: "Hindi" },
];

const CreateUser = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    role: "student",
    subjects: [],
    classInfo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData((prev) => ({
      ...prev,
      role,
      subjects: [],
    }));
  };

  const handleSubjectChange = (e) => {
    const selected = e.target.value;
    setFormData((prev) => ({
      ...prev,
      subjects: selected ? [selected] : [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Name is required.");
      return;
    }
    if (!formData.classInfo) {
      alert("Class information is required.");
      return;
    }
    if (formData.subjects.length !== 1) {
      alert("Please select exactly one subject.");
      return;
    }

    try {
      const response = await fetch(
        "https://saasion-backend.onrender.com/api/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            role: formData.role,
            subject: formData.subjects[0],
            classInfo: formData.classInfo,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to create user"}`);
        return;
      }

      const data = await response.json();
      alert("User created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="createuser-container">
      <h2 className="createuser-title">Create User</h2>

      <form className="createuser-form" onSubmit={handleSubmit}>
        <div className="createuser-form-group">
          <label className="createuser-label">Name:</label>
          <input
            type="text"
            name="name"
            className="createuser-input"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="createuser-form-group">
          <label className="createuser-label">Role:</label>
          <select
            className="createuser-select"
            name="role"
            value={formData.role}
            onChange={handleRoleChange}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        <div className="createuser-form-group">
          <label className="createuser-label">Subject:</label>
          <select
            className="createuser-select"
            name="subjects"
            value={formData.subjects[0] || ""}
            onChange={handleSubjectChange}
            required
          >
            <option value="">Select Subject</option>
            {SUBJECT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="createuser-form-group">
          <label className="createuser-label">
            {formData.role === "teacher"
              ? "Class Being Taught:"
              : "Class Being Studied:"}
          </label>
          <input
            type="number"
            name="classInfo"
            className="createuser-input"
            value={formData.classInfo}
            onChange={handleChange}
            required
            min={1}
          />
        </div>

        <button type="submit" className="createuser-submit-button">
          Create
        </button>
      </form>

      <button
        className="createuser-goback-button"
        onClick={() => navigate("/")}
      >
        Go Back
      </button>
    </div>
  );
};

export default CreateUser;
