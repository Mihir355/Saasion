const express = require("express");
const router = express.Router();
const User = require("../models/user");

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

router.get("/", async (req, res) => {
  try {
    const { role, classInfo, subject } = req.query;

    const filter = {};

    if (role) filter.role = role;

    if (role === "teacher" && (subject || classInfo)) {
      filter.teachingAssignments = {};
      if (subject) filter["teachingAssignments.subject"] = subject;
      if (classInfo) filter["teachingAssignments.classInfo"] = classInfo;
    }

    if (role !== "teacher") {
      if (classInfo) filter.classInfo = classInfo;
      if (subject) filter.subject = subject;
    }

    const users = await User.find(filter);
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isStudent = user.role === "student";
    const isTeacher = user.role === "teacher";

    // If student and subject/class changed, unassign from old teacher
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

    // If teacher and assignments changed, clear assigned students
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

    const alreadyAssigned = student.assignedTeacher?.toString() === teacherId;
    if (alreadyAssigned) {
      return res
        .status(400)
        .json({ message: "Student is already assigned to this teacher" });
    }

    if (student.assignedTeacher) {
      await User.findByIdAndUpdate(student.assignedTeacher, {
        $pull: { assignedStudents: student._id },
      });
    }

    student.assignedTeacher = teacher._id;
    await student.save();

    if (!teacher.assignedStudents.includes(student._id)) {
      teacher.assignedStudents.push(student._id);
      await teacher.save();
    }

    res.json({
      message: "Student assigned successfully",
      student,
      teacher,
    });
  } catch (err) {
    console.error("Error assigning student:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
