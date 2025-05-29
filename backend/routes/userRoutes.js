const express = require("express");
const router = express.Router();
const User = require("../models/user");

// Create a user
router.post("/", async (req, res) => {
  try {
    const { name, role, subject, classInfo, teachingAssignments } = req.body;

    if (!name || !role) {
      return res.status(400).json({ message: "Name and role are required" });
    }

    let userData = { name, role };

    if (role === "student") {
      if (!subject || !classInfo) {
        return res.status(400).json({
          message: "Subject and classInfo are required for students",
        });
      }
      userData.subject = subject;
      userData.classInfo = classInfo;
    } else if (role === "teacher") {
      if (
        !Array.isArray(teachingAssignments) ||
        teachingAssignments.length === 0 ||
        teachingAssignments.some((ta) => !ta.subject || !ta.classInfo)
      ) {
        return res.status(400).json({
          message:
            "At least one valid teaching assignment (subject and classInfo) is required for teachers",
        });
      }
      userData.teachingAssignments = teachingAssignments;
    }

    const user = new User(userData);
    await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Get users with optional filters
router.get("/", async (req, res) => {
  try {
    const { role, classInfo, subject } = req.query;
    const filter = {};

    if (role?.trim()) filter.role = role.trim();

    if (role === "teacher") {
      if (classInfo?.trim())
        filter["teachingAssignments.classInfo"] = classInfo.trim();
      if (subject?.trim())
        filter["teachingAssignments.subject"] = subject.trim();
    } else if (role === "student") {
      if (classInfo?.trim()) filter.classInfo = classInfo.trim();
      if (subject?.trim()) filter.subject = subject.trim();
    }

    const users = await User.find(filter);
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isStudent = user.role === "student";
    const isTeacher = user.role === "teacher";

    if (
      isStudent &&
      (updateData.subject !== user.subject ||
        updateData.classInfo !== user.classInfo)
    ) {
      if (user.assignedTeacher) {
        await User.findByIdAndUpdate(user.assignedTeacher, {
          $pull: { assignedStudents: user._id },
        });
        user.assignedTeacher = undefined;
      }
    }

    if (isTeacher && updateData.teachingAssignments) {
      await User.updateMany(
        { _id: { $in: user.assignedStudents } },
        { $unset: { assignedTeacher: "" } }
      );
      user.assignedStudents = [];
    }

    Object.assign(user, updateData);
    await user.save();

    res.json({ message: "User updated successfully", user });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "student" && user.assignedTeacher) {
      await User.findByIdAndUpdate(user.assignedTeacher, {
        $pull: { assignedStudents: id },
      });
    }

    if (user.role === "teacher" && user.assignedStudents?.length > 0) {
      await User.updateMany(
        { _id: { $in: user.assignedStudents } },
        { $unset: { assignedTeacher: "" } }
      );
    }

    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Assign student to teacher
router.post("/assign", async (req, res) => {
  try {
    const { studentId, teacherId } = req.body;
    if (!studentId || !teacherId) {
      return res
        .status(400)
        .json({ message: "Student ID and Teacher ID are required" });
    }

    const student = await User.findById(studentId);
    const teacher = await User.findById(teacherId);
    if (!student || !teacher) {
      return res.status(404).json({ message: "Student or teacher not found" });
    }

    if (student.role !== "student" || teacher.role !== "teacher") {
      return res.status(400).json({ message: "Invalid roles for assignment" });
    }

    if (
      !Array.isArray(teacher.teachingAssignments) ||
      teacher.teachingAssignments.length === 0
    ) {
      return res.status(400).json({
        message: "Teacher has no valid teaching assignments.",
      });
    }

    const canTeach = teacher.teachingAssignments.some(
      (assignment) =>
        assignment.subject === student.subject &&
        assignment.classInfo === student.classInfo
    );
    if (!canTeach) {
      return res.status(400).json({
        message:
          "This teacher is not assigned to teach the student's subject and class",
      });
    }

    if (student.assignedTeacher?.toString() === teacherId) {
      return res
        .status(400)
        .json({ message: "Student is already assigned to this teacher" });
    }

    if (student.assignedTeacher) {
      const oldTeacher = await User.findById(student.assignedTeacher);
      if (oldTeacher) {
        oldTeacher.assignedStudents = oldTeacher.assignedStudents.filter(
          (id) => id.toString() !== studentId
        );
        await oldTeacher.save();
      }
    }

    student.assignedTeacher = teacher._id;
    await student.save();

    if (!teacher.assignedStudents.includes(student._id)) {
      teacher.assignedStudents.push(student._id);
      await teacher.save();
    }

    res.json({ message: "Student assigned successfully", student, teacher });
  } catch (err) {
    console.error("Error assigning student:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Table: Teachers
router.get("/table/teachers", async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).populate({
      path: "assignedStudents",
      select: "name classInfo subject",
    });
    res.json(teachers);
  } catch (err) {
    console.error("Error fetching teachers:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Table: Students
router.get("/table/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).populate({
      path: "assignedTeacher",
      select: "name",
    });
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Table: Subjects
router.get("/table/subjects", async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).populate({
      path: "assignedStudents",
      select: "name classInfo subject",
    });

    const groups = {};
    teachers.forEach((teacher) => {
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

    const result = Object.values(groups).map((group) => ({
      subject: group.subject,
      classInfo: group.classInfo,
      students: group.students,
      teachers: Array.from(group.teachers),
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching subject data:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
