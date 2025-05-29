import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/tableview.css";

const TableView = () => {
  const [selectedType, setSelectedType] = useState("teacher");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData([]); // Reset data before new fetch

      try {
        let endpoint = "";
        switch (selectedType) {
          case "teacher":
            endpoint = "/api/users/table/teachers";
            break;
          case "student":
            endpoint = "/api/users/table/students";
            break;
          case "subject":
            endpoint = "/api/users/table/subjects";
            break;
          default:
            endpoint = "/api/users/table/teachers";
        }

        const response = await axios.get(endpoint);

        // Ensure we always get an array
        const responseData = Array.isArray(response.data) ? response.data : [];
        console.log(response.data);
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

  const renderTable = () => {
    if (loading) {
      return <div className="loading">Loading data...</div>;
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    if (selectedType === "teacher") {
      return (
        <table>
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Teaching Assignments</th>
              <th>Assigned Students</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((teacher) => (
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
                        {student.name} <br />
                        <small>
                          (Class: {student.classInfo}, Subject:{" "}
                          {student.subject})
                        </small>
                      </div>
                    )) || "None"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-data">
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
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.subject}</td>
                  <td>{student.classInfo}</td>
                  <td>{student.assignedTeacher?.name || "Not Assigned"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data">
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
                    {group.students.map((student, idx) => (
                      <div key={idx}>{student}</div>
                    ))}
                  </td>
                  <td>
                    {[...(group.teachers || [])].map((teacher, idx) => (
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
      </div>

      <div className="table-wrapper">{renderTable()}</div>
    </div>
  );
};

export default TableView;
