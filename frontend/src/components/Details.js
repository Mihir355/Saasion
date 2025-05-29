import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/details.css";

const SUBJECT_OPTIONS = ["english", "math", "science", "hindi"];

const Details = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    classInfo: "",
    subject: "",
  });

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);

    const query = new URLSearchParams({
      role: "teacher",
      ...(filters.classInfo.trim() && { classInfo: filters.classInfo.trim() }),
      ...(filters.subject.trim() && { subject: filters.subject.trim() }),
    }).toString();

    try {
      const res = await fetch(
        `https://saasion-backend.onrender.com/api/users?${query}`
      );
      if (!res.ok) throw new Error("Failed to fetch teachers");
      const data = await res.json();
      setTeachers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTeachers();
  };

  return (
    <div className="details-container">
      <button className="details-goback-button" onClick={() => navigate("/")}>
        Go Back
      </button>

      <h2 className="details-title">Find Teachers</h2>

      <form className="details-form" onSubmit={handleSearch}>
        <div className="details-filter-group">
          <label className="details-label">Class:</label>
          <input
            type="text"
            className="details-input"
            name="classInfo"
            value={filters.classInfo}
            onChange={handleFilterChange}
            placeholder="Class (optional)"
          />
        </div>

        <div className="details-filter-group">
          <label className="details-label">Subject:</label>
          <select
            className="details-select"
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

        <button type="submit" className="details-search-button">
          Search
        </button>
      </form>

      {loading && <p className="details-loading">Loading teachers...</p>}
      {error && <p className="details-error">Error: {error}</p>}

      {!loading && !error && (
        <div className="details-results">
          {teachers.length === 0 ? (
            <p className="details-no-results">No teachers found.</p>
          ) : (
            teachers.map((teacher) => (
              <div key={teacher._id} className="details-teacher-card">
                <h3 className="details-teacher-name">{teacher.name}</h3>

                <div className="details-teacher-info">
                  <h4>Teaching Assignments:</h4>
                  <ul className="details-assignments-list">
                    {teacher.teachingAssignments.map((assignment, index) => (
                      <li key={index} className="details-assignment-item">
                        <span>Class:</span> {assignment.classInfo} |{" "}
                        <span>Subject:</span> {assignment.subject}
                      </li>
                    ))}
                  </ul>

                  <p>
                    <span>Total Assigned Students:</span>{" "}
                    {teacher.assignedStudentsCount || 0}
                  </p>
                </div>

                {teacher.assignedStudentsCount > 0 && (
                  <div className="details-students-section">
                    <h4 className="details-students-heading">Students:</h4>
                    <ul className="details-student-list">
                      {teacher.assignedStudents.map((student) => (
                        <li key={student._id} className="details-student-item">
                          {student.name} - Class: {student.classInfo} | Subject:{" "}
                          {student.subject}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Details;
