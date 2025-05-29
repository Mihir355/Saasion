import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/tableview.css";

const TableView = () => {
  const [selectedType, setSelectedType] = useState("teacher");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData([]);

      try {
        let endpoint = "";
        switch (selectedType) {
          case "teacher":
            endpoint =
              "https://saasion-backend.onrender.com/api/users/table/teachers";
            break;
          case "student":
            endpoint =
              "https://saasion-backend.onrender.com/api/users/table/students";
            break;
          case "subject":
            endpoint =
              "https://saasion-backend.onrender.com/api/users/table/subjects";
            break;
          default:
            endpoint =
              "https://saasion-backend.onrender.com/api/users/table/teachers";
        }

        const response = await axios.get(endpoint);
        const responseData = Array.isArray(response.data) ? response.data : [];
        setData(responseData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedType]);

  const handleEdit = async (user) => {
    const newName = prompt("Enter new name:", user.name);
    if (!newName || newName.trim() === "" || newName === user.name) return;

    try {
      await axios.put(
        `https://saasion-backend.onrender.com/api/users/${user._id}`,
        { ...user, name: newName }
      );
      alert("User updated successfully.");
      setData((prev) =>
        prev.map((item) =>
          item._id === user._id ? { ...item, name: newName } : item
        )
      );
    } catch (err) {
      alert("Failed to update user.");
      console.error(err);
    }
  };

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://saasion-backend.onrender.com/api/users/${userId}`
      );
      alert("User deleted.");
      setData((prev) => prev.filter((item) => item._id !== userId));
    } catch (err) {
      alert("Failed to delete user.");
      console.error(err);
    }
  };

  const getFilteredData = () => {
    if (!filterText.trim()) return data;

    const lower = filterText.toLowerCase();

    const startsWith = data.filter((item) =>
      item.name?.toLowerCase().startsWith(lower)
    );
    const rest = data.filter(
      (item) =>
        item.name?.toLowerCase().includes(lower) &&
        !item.name?.toLowerCase().startsWith(lower)
    );

    return [...startsWith, ...rest];
  };

  const renderTable = () => {
    if (loading) return <div className="loading">Loading data...</div>;
    if (error) return <div className="error">{error}</div>;

    const filteredData = getFilteredData();

    if (selectedType === "teacher") {
      return (
        <table>
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Teaching Assignments</th>
              <th>Assigned Students</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((teacher) => (
                <tr key={teacher._id}>
                  <td>{teacher.name}</td>
                  <td>
                    {teacher.teachingAssignments?.map((ta, index) => (
                      <div key={index} className="assignment-item">
                        <strong>Class:</strong> {ta.classInfo} <br />
                        <strong>Subject:</strong> {ta.subject}
                      </div>
                    )) || "None"}
                  </td>
                  <td>
                    {teacher.assignedStudents?.map((student) => (
                      <div key={student._id} className="student-item">
                        {student.name}
                        <br />
                        <small>
                          (Class: {student.classInfo}, Subject:{" "}
                          {student.subject})
                        </small>
                      </div>
                    )) || "None"}
                  </td>
                  <td className="action-cell">
                    <button
                      className="table-action-button edit-action-button"
                      onClick={() => handleEdit(teacher)}
                    >
                      Edit
                    </button>
                    <button
                      className="table-action-button delete-action-button"
                      onClick={() => handleDelete(teacher._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data">
                  No teachers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      );
    }

    if (selectedType === "student") {
      return (
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Subject</th>
              <th>Class</th>
              <th>Assigned Teacher</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.subject}</td>
                  <td>{student.classInfo}</td>
                  <td>{student.assignedTeacher?.name || "Not Assigned"}</td>
                  <td className="action-cell">
                    <button
                      className="table-action-button edit-action-button"
                      onClick={() => handleEdit(student)}
                    >
                      Edit
                    </button>
                    <button
                      className="table-action-button delete-action-button"
                      onClick={() => handleDelete(student._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      );
    }

    if (selectedType === "subject") {
      return data.length > 0 ? (
        data.map((group, index) => (
          <div key={index} className="subject-group">
            <h3>
              {group.subject} - Class {group.classInfo}
            </h3>
            <table>
              <thead>
                <tr>
                  <th>Students</th>
                  <th>Teachers</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {(group.students || []).map((student, idx) => (
                      <div key={idx}>{student}</div>
                    ))}
                  </td>
                  <td>
                    {(group.teachers || []).map((teacher, idx) => (
                      <div key={idx}>{teacher}</div>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p className="no-data">No subject assignments found</p>
      );
    }

    return null;
  };

  return (
    <div className="table-view-container">
      <h2>Data View</h2>
      <div className="controls">
        <label htmlFor="typeSelect">Select View: </label>
        <select
          id="typeSelect"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="teacher">Teacher View</option>
          <option value="student">Student View</option>
          <option value="subject">Subject View</option>
        </select>

        {(selectedType === "teacher" || selectedType === "student") && (
          <input
            type="text"
            placeholder={`Filter by ${selectedType} name...`}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{
              padding: "0.5rem",
              borderRadius: "6px",
              border: "2px solid #e2e8f0",
              flex: "1",
            }}
          />
        )}
      </div>

      <div className="table-wrapper">{renderTable()}</div>
    </div>
  );
};

export default TableView;
