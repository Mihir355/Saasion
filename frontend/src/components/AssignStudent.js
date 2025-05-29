import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/assignstudents.css";

const SUBJECT_OPTIONS = ["english", "math", "science", "hindi"];

const AssignStudent = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    classInfo: "",
    subject: "",
  });

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.classInfo) params.append("classInfo", filters.classInfo);
      if (filters.subject) params.append("subject", filters.subject);

      const studentRes = await fetch(
        `https://saasion-backend.onrender.com/api/users?role=student&${params.toString()}`
      );
      const teacherRes = await fetch(
        `https://saasion-backend.onrender.com/api/users?role=teacher&${params.toString()}`
      );

      const studentData = await studentRes.json();
      const teacherData = await teacherRes.json();

      const unassignedStudents = studentData.filter(
        (student) => !student.assignedTeacher
      );

      setStudents(unassignedStudents);
      setTeachers(teacherData);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleAssign = async () => {
    if (!selectedStudentId || !selectedTeacherId) {
      alert("Please select both a student and a teacher.");
      return;
    }

    try {
      const res = await fetch(
        "https://saasion-backend.onrender.com/api/users/assign",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: selectedStudentId,
            teacherId: selectedTeacherId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Assignment failed");
      }

      alert("Student successfully assigned to the teacher.");
      setSelectedStudentId("");
      setSelectedTeacherId("");
      fetchUsers();
    } catch (err) {
      console.error("Error assigning student:", err);
      alert("Assignment failed: " + err.message);
    }
  };

  useEffect(() => {
    if (filters.classInfo && filters.subject) {
      fetchUsers();
    }
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="assignstudent-container">
      <button
        className="assignstudent-goback-button"
        onClick={() => navigate(-1)}
      >
        Go Back
      </button>

      <h2 className="assignstudent-title">Assign Student to Teacher</h2>

      <div className="assignstudent-filters">
        <div className="assignstudent-filter-group">
          <input
            type="text"
            className="assignstudent-input"
            name="classInfo"
            placeholder="Enter Class"
            value={filters.classInfo}
            onChange={handleFilterChange}
          />
        </div>

        <div className="assignstudent-filter-group">
          <select
            className="assignstudent-select"
            name="subject"
            value={filters.subject}
            onChange={handleFilterChange}
          >
            <option value="">Select Subject</option>
            {SUBJECT_OPTIONS.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="assignstudent-selection-section">
        {students.length > 0 && (
          <div className="assignstudent-select-group">
            <h3 className="assignstudent-subtitle">Unassigned Students</h3>
            <select
              className="assignstudent-select"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.classInfo}) - {student.subject}
                </option>
              ))}
            </select>
          </div>
        )}

        {teachers.length > 0 && (
          <div className="assignstudent-select-group">
            <h3 className="assignstudent-subtitle">Available Teachers</h3>
            <select
              className="assignstudent-select"
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
            >
              <option value="">Select Teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name} -{" "}
                  {teacher.teachingAssignments
                    .map((ta) => `${ta.classInfo}/${ta.subject}`)
                    .join(", ")}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <button onClick={handleAssign} className="assignstudent-action-button">
        Assign Student to Teacher
      </button>
    </div>
  );
};

export default AssignStudent;
