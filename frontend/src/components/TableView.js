import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/tableview.css";

const TableView = () => {
  const [selectedType, setSelectedType] = useState("teacher");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiRole = selectedType === "subject" ? "teacher" : selectedType;
        const response = await axios.get(`/api/users?role=${apiRole}`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
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
            {data.map((teacher) => (
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
                        (Class: {student.classInfo}, Subject: {student.subject})
                      </small>
                    </div>
                  )) || "None"}
                </td>
              </tr>
            ))}
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
            {data.map((student) => (
              <tr key={student._id}>
                <td>{student.name}</td>
                <td>{student.subject}</td>
                <td>{student.classInfo}</td>
                <td>{student.assignedTeacher?.name || "Not Assigned"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (selectedType === "subject") {
      // Create subject-class groups
      const groups = {};

      data.forEach((teacher) => {
        teacher.assignedStudents?.forEach((student) => {
          const key = `${student.subject}-${student.classInfo}`;
          if (!groups[key]) {
            groups[key] = {
              subject: student.subject,
              classInfo: student.classInfo,
              students: [],
              teachers: new Set(),
            };
          }
          groups[key].students.push(student.name);
          groups[key].teachers.add(teacher.name);
        });
      });

      return Object.keys(groups).length > 0 ? (
        Object.values(groups).map((group, index) => (
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
                    {[...group.teachers].map((teacher, idx) => (
                      <div key={idx}>{teacher}</div>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p>No assignments found</p>
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
