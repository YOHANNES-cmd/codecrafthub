The CodeCraftHub learning management system (LMS)
A simple REST API to track your personal learning goals and courses.

Overview
CodeCraftHub helps developers keep track of courses they want to learn. Built with Node.js and Express, the platform provides a straightforward REST API for managing your learner's journey.

Features
Full CRUD operations for course management
JSON file-based storage (no database needed)
RESTful API design
Proper error handling
Installation
Clone or download the project
Install Node.js dependencies:
bash

npm install
Run
Running the application
Start the Express server:

bash

npm start
Run
The API will be available at http://localhost:5000

API Endpoints
1. Add a Course
POST /api/courses

Request body:

json

{
  "name": "Python Basics",
  "description": "Learn Python fundamentals",
  "target_date": "2025-12-31",
  "status": "Not Started"
}
2. Get all courses
GET /api/courses

3. Get a specific course
GET /api/courses/<id>

4. Update a course
PUT /api/courses/<id>

Request body (all fields optional):

json

{
  "status": "In Progress"
}
5. Delete a course
DELETE /api/courses/<id>

Testing
Use the provided curl commands or import the Postman collection to test all endpoints.

Troubleshooting
Problem: "Cannot find module 'express'"
Solution: Run npm install

Problem: "Port already in use"
Solution: Stop other applications using port 5000 or change the PORT in app.js

Project structure
plaintext

codecrafthub/
├── app.js           # Main Express application
├── courses.json     # Data storage (auto-created)
└── package.json     # Dependencies