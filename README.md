# Saasion

A MERN stack application for managing students and teachers. The app allows you to:

- Create and edit student or teacher profiles
- Assign students to a teacher
- View details of teachers, including:
  - Subject they teach
  - Number of students in their class
  - Detailed list of those students

---

## 🛠 Tech Stack

**Frontend:**
- React
- Plain CSS
- Axios

**Backend:**
- Node.js
- Express.js
- Mongoose
- CORS

**Database:**
- MongoDB

---

## 🚀 Setup Instructions

### 1. Clone the Repository

git clone https://github.com/Mihir355/Saasion.git
cd Saasion

### 2. Set Up the Backend

cd backend
npm init -y
npm install
node server.js

### 3. Set Up the Frontend

cd ../frontend
npm install
npm start

### 4. Assumptions Made

A teacher can have multiple students.
Each student can be assigned to only one teacher.
Subjects are tied to teachers.
Entities have basic details like name, class, subject, etc.
Simple plain CSS is used for styling instead of frameworks.


