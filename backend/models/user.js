const mongoose = require("mongoose");
const { Schema } = mongoose;

const allowedSubjects = ["english", "math", "science", "hindi"];

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
    classInfo: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      enum: allowedSubjects,
      required: true,
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
