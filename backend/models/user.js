const mongoose = require("mongoose");
const { Schema } = mongoose;

const allowedSubjects = ["english", "math", "science", "hindi"];

const teachingAssignmentSchema = new Schema({
  classInfo: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    enum: allowedSubjects,
    required: true,
  },
});

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "teacher"],
      required: true,
    },
    // For students only
    classInfo: {
      type: String,
      required: function () {
        return this.role === "student";
      },
    },
    subject: {
      type: String,
      enum: allowedSubjects,
      required: function () {
        return this.role === "student";
      },
    },
    // For teachers only
    teachingAssignments: {
      type: [teachingAssignmentSchema],
      required: function () {
        return this.role === "teacher";
      },
      validate: {
        validator: function (assignments) {
          return assignments.length > 0;
        },
        message: "Teachers must have at least one teaching assignment",
      },
    },
    assignedStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        validate: {
          validator: function () {
            return this.role === "teacher";
          },
          message: "Only teachers can have assigned students.",
        },
      },
    ],
    assignedTeacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: function (value) {
          if (!value) return true;
          return this.role === "student";
        },
        message: "Only students can have an assigned teacher.",
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
