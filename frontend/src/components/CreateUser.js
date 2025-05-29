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
    subject: "",
    classInfo: "",
    teachingAssignments: [{ classInfo: "", subject: "" }],
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
      subject: "",
      classInfo: "",
      teachingAssignments:
        role === "teacher" ? [{ classInfo: "", subject: "" }] : [],
    }));
  };

  const handleSubjectChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      subject: e.target.value,
    }));
  };

  const handleAssignmentChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedAssignments = [...prev.teachingAssignments];
      updatedAssignments[index] = {
        ...updatedAssignments[index],
        [field]: value,
      };
      return {
        ...prev,
        teachingAssignments: updatedAssignments,
      };
    });
  };

  const addAssignment = () => {
    setFormData((prev) => ({
      ...prev,
      teachingAssignments: [
        ...prev.teachingAssignments,
        { classInfo: "", subject: "" },
      ],
    }));
  };

  const removeAssignment = (index) => {
    setFormData((prev) => {
      const updatedAssignments = [...prev.teachingAssignments];
      updatedAssignments.splice(index, 1);
      return {
        ...prev,
        teachingAssignments: updatedAssignments,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Name is required.");
      return;
    }

    if (formData.role === "student") {
      if (!formData.classInfo) {
        alert("Class information is required for students.");
        return;
      }
      if (!formData.subject) {
        alert("Subject is required for students.");
        return;
      }
    } else {
      if (
        formData.teachingAssignments.some((ta) => !ta.classInfo || !ta.subject)
      ) {
        alert("All teaching assignments must have class and subject.");
        return;
      }
    }

    try {
      const requestData = {
        name: formData.name.trim(),
        role: formData.role,
      };

      if (formData.role === "student") {
        requestData.classInfo = formData.classInfo;
        requestData.subject = formData.subject;
      } else {
        requestData.teachingAssignments = formData.teachingAssignments;
      }

      const response = await fetch(
        "https://saasion-backend.onrender.com/api/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
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

        {formData.role === "student" ? (
          <>
            <div className="createuser-form-group">
              <label className="createuser-label">Subject:</label>
              <select
                className="createuser-select"
                name="subject"
                value={formData.subject}
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
              <label className="createuser-label">Class Being Studied:</label>
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
          </>
        ) : (
          <div className="createuser-assignments">
            <h3 className="createuser-subtitle">Teaching Assignments</h3>
            {formData.teachingAssignments.map((assignment, index) => (
              <div key={index} className="createuser-assignment-group">
                <div className="createuser-form-group">
                  <label className="createuser-label">Subject:</label>
                  <select
                    className="createuser-select"
                    value={assignment.subject}
                    onChange={(e) =>
                      handleAssignmentChange(index, "subject", e.target.value)
                    }
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
                    Class Being Taught:
                  </label>
                  <input
                    type="number"
                    className="createuser-input"
                    value={assignment.classInfo}
                    onChange={(e) =>
                      handleAssignmentChange(index, "classInfo", e.target.value)
                    }
                    required
                    min={1}
                  />
                </div>

                {formData.teachingAssignments.length > 1 && (
                  <button
                    type="button"
                    className="createuser-remove-button"
                    onClick={() => removeAssignment(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="createuser-add-button"
              onClick={addAssignment}
            >
              + Add Another Assignment
            </button>
          </div>
        )}

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
