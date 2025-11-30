## Employee Attendance System

A full-stack web application designed to automate and simplify employee attendance tracking.
The system provides role-based access, allowing employees to mark check-in/check-out and managers to monitor attendance through dashboards and reports.

## 📌 1. Setup Instructions
   ## 🔧 Prerequisites

        Node.js & npm
        
        MongoDB (local or cloud)
        
        VS Code
        
        Git
        
        Browser (Chrome recommended)

## 📂 Project Structure
/frontend  → React, TypeScript, Zustand
/backend   → Node.js, Express.js
/database  → MongoDB

##  📥 Installation Steps
# 1️⃣ Clone the Repository
    git clone <your-repo-url>
    cd project-folder

# 2️⃣ Install Backend Dependencies
    cd backend
    npm install

# 3️⃣ Install Frontend Dependencies
    cd ../frontend
    npm install

## 🚀 2. How to Run the Project
    Start Backend
    cd backend
    npm start


## The backend will typically run on:

        http://localhost:5000
        
        Start Frontend
        cd frontend
        npm start


## The frontend will run on:

        http://localhost:3000

## 🔐 3. Environment Variables

# Create a .env file inside the backend folder and add the following variables:


# Sample .env File
MONGO_URI=mongodb://127.0.0.1:27017/attendanceDB
JWT_SECRET=supersecretkey123
PORT=5000

# How Environment Variables Are Used

MONGO_URI connects the backend server to MongoDB.

JWT_SECRET is used for login authentication and token verification.

PORT defines where your Node.js backend runs.

##  4. Screenshots

🖼️ 4. Screenshots

Below are descriptions of screens based on the project (screenshot_project.pdf)
