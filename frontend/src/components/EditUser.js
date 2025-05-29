import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/edituser.css";

const SUBJECT_OPTIONS = ["english", "math", "science", "hindi"];

const EditUser = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    role: "student",
    classInfo: "",
    subject: "",
  });

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedData, setEditedData] = useState(null);

  const fetchUsers = async () => {
    const queryObj = {};
    if (filters.role) queryObj.role = filters.role;
    if (filters.classInfo.trim() !== "")
      queryObj.classInfo = filters.classInfo.trim();
    if (filters.subject.trim() !== "")
      queryObj.subject = filters.subject.trim();

    const query = new URLSearchParams(queryObj).toString();

    try {
      const res = await fetch(
        `https://saasion-backend.onrender.com/api/users?${query}`
      );
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    if (user.role === "teacher") {
      setEditedData({
        name: user.name,
        role: user.role,
        teachingAssignments: user.teachingAssignments || [],
      });
    } else {
      setEditedData({
        name: user.name,
        role: user.role,
        classInfo: user.classInfo,
        subject: user.subject,
      });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignmentChange = (index, field, value) => {
    const newAssignments = [...editedData.teachingAssignments];
    newAssignments[index][field] = value;
    setEditedData((prev) => ({
      ...prev,
      teachingAssignments: newAssignments,
    }));
  };

  const addAssignment = () => {
    setEditedData((prev) => ({
      ...prev,
      teachingAssignments: [
        ...(prev.teachingAssignments || []),
        { subject: "", classInfo: "" },
      ],
    }));
  };

  const removeAssignment = (index) => {
    const newAssignments = [...editedData.teachingAssignments];
    newAssignments.splice(index, 1);
    setEditedData((prev) => ({
      ...prev,
      teachingAssignments: newAssignments,
    }));
  };

  const handleSave = async () => {
    if (!editedData.name.trim()) {
      alert("Name is required.");
      return;
    }

    if (editedData.role === "student") {
      if (!editedData.classInfo.trim()) {
        alert("Class information is required.");
        return;
      }
      if (!editedData.subject.trim()) {
        alert("Please select a subject.");
        return;
      }
    }

    if (editedData.role === "teacher") {
      if (
        !editedData.teachingAssignments ||
        editedData.teachingAssignments.length === 0 ||
        editedData.teachingAssignments.some(
          (ta) => !ta.subject || !ta.classInfo
        )
      ) {
        alert("All teaching assignments must have subject and class.");
        return;
      }
    }

    try {
      const res = await fetch(
        `https://saasion-backend.onrender.com/api/users/${selectedUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedData),
        }
      );

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Update failed");

      alert("User updated successfully!");
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  return (
    <div className="edituser-container">
      <h2 className="edituser-title">Edit User</h2>

      {!selectedUser && (
        <div className="edituser-filter-section">
          <div className="edituser-filter-group">
            <label className="edituser-filter-label">Role:</label>
            <select
              className="edituser-filter-select"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
            >
              <option value="">--Select Role--</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <div className="edituser-filter-group">
            <label className="edituser-filter-label">Class:</label>
            <input
              type="text"
              className="edituser-filter-input"
              name="classInfo"
              value={filters.classInfo}
              onChange={handleFilterChange}
              placeholder="Class (optional)"
            />
          </div>

          <div className="edituser-filter-group">
            <label className="edituser-filter-label">Subject:</label>
            <select
              className="edituser-filter-select"
              name="subject"
              value={filters.subject}
              onChange={handleFilterChange}
            >
              <option value="">--Select Subject--</option>
              {SUBJECT_OPTIONS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <h3 className="edituser-subtitle">Matching Users:</h3>
          {users.length === 0 ? (
            <p className="edituser-no-results">No users found.</p>
          ) : (
            <ul className="edituser-user-list">
              {users.map((user) => (
                <li className="edituser-user-item" key={user._id}>
                  <button
                    className="edituser-user-button"
                    onClick={() => selectUser(user)}
                  >
                    {user.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selectedUser && editedData && (
        <div className="edituser-edit-section">
          <h3 className="edituser-editing-title">
            Editing: {selectedUser.name}
          </h3>
          <div className="edituser-form-group">
            <label className="edituser-label">Name:</label>
            <input
              type="text"
              className="edituser-input"
              name="name"
              value={editedData.name}
              onChange={handleEditChange}
            />
          </div>

          {editedData.role === "student" && (
            <>
              <div className="edituser-form-group">
                <label className="edituser-label">Class:</label>
                <input
                  type="text"
                  className="edituser-input"
                  name="classInfo"
                  value={editedData.classInfo}
                  onChange={handleEditChange}
                />
              </div>
              <div className="edituser-form-group">
                <label className="edituser-label">Subject:</label>
                <select
                  className="edituser-select"
                  name="subject"
                  value={editedData.subject}
                  onChange={handleEditChange}
                >
                  <option value="">Select a subject</option>
                  {SUBJECT_OPTIONS.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {editedData.role === "teacher" && (
            <>
              <h4>Teaching Assignments:</h4>
              {editedData.teachingAssignments.map((assignment, index) => (
                <div key={index} className="edituser-form-group">
                  <input
                    type="text"
                    placeholder="Class"
                    value={assignment.classInfo}
                    onChange={(e) =>
                      handleAssignmentChange(index, "classInfo", e.target.value)
                    }
                  />
                  <select
                    value={assignment.subject}
                    onChange={(e) =>
                      handleAssignmentChange(index, "subject", e.target.value)
                    }
                  >
                    <option value="">Select subject</option>
                    {SUBJECT_OPTIONS.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => removeAssignment(index)}>
                    Remove
                  </button>
                </div>
              ))}
              <button onClick={addAssignment}>Add Assignment</button>
            </>
          )}

          <div className="edituser-action-buttons">
            <button className="edituser-save-button" onClick={handleSave}>
              Save
            </button>
            <button
              className="edituser-cancel-button"
              onClick={() => setSelectedUser(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <button className="edituser-goback-button" onClick={() => navigate("/")}>
        Go Back
      </button>
    </div>
  );
};

export default EditUser;
