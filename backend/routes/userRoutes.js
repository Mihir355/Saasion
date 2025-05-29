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
    if (role && role.trim() !== "") filter.role = role.trim();
    if (classInfo && classInfo.trim() !== "")
      filter.classInfo = classInfo.trim();
    if (subject && subject.trim() !== "") filter.subject = subject.trim();

    if (filter.role === "teacher") {
      const teachers = await User.find(filter).populate({
        path: "assignedStudents",
        select: "name classInfo subject",
      });

      const result = teachers.map((teacher) => ({
        ...teacher.toObject(),
        assignedStudentsCount: teacher.assignedStudents.length,
      }));

      return res.json(result);
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

    const existingUser = await User.findById(id);

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const subjectChanged =
      updateData.subject && updateData.subject !== existingUser.subject;

    const classChanged =
      updateData.classInfo && updateData.classInfo !== existingUser.classInfo;

    if (subjectChanged || classChanged) {
      if (existingUser.role === "teacher") {
        await User.updateMany(
          { _id: { $in: existingUser.assignedStudents } },
          { $unset: { assignedTeacher: "" } }
        );

        existingUser.assignedStudents = [];
      }

      if (existingUser.role === "student" && existingUser.assignedTeacher) {
        const oldTeacher = await User.findById(existingUser.assignedTeacher);

        const teacherClassMatch =
          oldTeacher && oldTeacher.classInfo === existingUser.classInfo;
        const teacherSubjectMatch =
          oldTeacher && oldTeacher.subject === existingUser.subject;

        if (!teacherClassMatch || !teacherSubjectMatch) {
          await User.findByIdAndUpdate(existingUser.assignedTeacher, {
            $pull: { assignedStudents: existingUser._id },
          });

          existingUser.assignedTeacher = undefined;
        }
      }
    }

    Object.assign(existingUser, updateData);
    await existingUser.save();

    res.json({ message: "User updated successfully", user: existingUser });
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
