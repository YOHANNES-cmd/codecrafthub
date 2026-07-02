const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Path to the JSON file that stores courses
const DATA_FILE = path.join(__dirname, "courses.json");

// Allowed status values
const VALID_STATUSES = [
  "Not Started",
  "In Progress",
  "Completed"
];

/**
 * Create courses.json automatically if it does not exist.
 */
async function initializeDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
    console.log("courses.json created successfully.");
  }
}

/**
 * Read all courses from the JSON file.
 */
async function readCourses() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");

    if (!data.trim()) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    throw new Error("Failed to read courses file.");
  }
}

/**
 * Save courses to the JSON file.
 */
async function writeCourses(courses) {
  try {
    await fs.writeFile(
      DATA_FILE,
      JSON.stringify(courses, null, 2)
    );
  } catch (error) {
    throw new Error("Failed to write courses file.");
  }
}

/**
 * Validate date format YYYY-MM-DD.
 */
function isValidDate(dateString) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

/**
 * Validate course input.
 */
function validateCourse(course) {
  const errors = [];

  if (!course.name) {
    errors.push("name is required");
  }

  if (!course.description) {
    errors.push("description is required");
  }

  if (!course.target_date) {
    errors.push("target_date is required");
  } else if (!isValidDate(course.target_date)) {
    errors.push("target_date must be in YYYY-MM-DD format");
  }

  if (!course.status) {
    errors.push("status is required");
  } else if (!VALID_STATUSES.includes(course.status)) {
    errors.push(
      `status must be one of: ${VALID_STATUSES.join(", ")}`
    );
  }

  return errors;
}

/**
 * POST /api/courses
 * Add a new course
 */
app.post("/api/courses", async (req, res) => {
  try {
    const errors = validateCourse(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    const courses = await readCourses();

    const nextId =
      courses.length > 0
        ? Math.max(...courses.map(c => c.id)) + 1
        : 1;

    const newCourse = {
      id: nextId,
      name: req.body.name,
      description: req.body.description,
      target_date: req.body.target_date,
      status: req.body.status,
      created_at: new Date().toISOString()
    };

    courses.push(newCourse);

    await writeCourses(courses);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/courses
 * Retrieve all courses
 */
app.get("/api/courses", async (req, res) => {
  try {
    const courses = await readCourses();

    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/courses/:id
 * Retrieve one course by ID
 */
app.get("/api/courses/:id", async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);

    const courses = await readCourses();

    const course = courses.find(
      c => c.id === courseId
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /api/courses/:id
 * Update an existing course
 */
app.put("/api/courses/:id", async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);

    const errors = validateCourse(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    const courses = await readCourses();

    const index = courses.findIndex(
      c => c.id === courseId
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    courses[index] = {
      ...courses[index],
      name: req.body.name,
      description: req.body.description,
      target_date: req.body.target_date,
      status: req.body.status
    };

    await writeCourses(courses);

    res.json({
      success: true,
      message: "Course updated successfully",
      data: courses[index]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * DELETE /api/courses/:id
 * Delete a course
 */
app.delete("/api/courses/:id", async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);

    const courses = await readCourses();

    const index = courses.findIndex(
      c => c.id === courseId
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const deletedCourse = courses[index];

    courses.splice(index, 1);

    await writeCourses(courses);

    res.json({
      success: true,
      message: "Course deleted successfully",
      data: deletedCourse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

 /**
 * GET /api/courses/stats
 * Returns statistics about courses
 */
app.get("/api/courses/stats", async (req, res) => {
  try {
    const courses = await readCourses();

    // Initialize counters
    let total = courses.length;

    let stats = {
      "Not Started": 0,
      "In Progress": 0,
      "Completed": 0
    };

    // Count courses by status
    courses.forEach(course => {
      if (stats[course.status] !== undefined) {
        stats[course.status]++;
      }
    });

    // Final response
    res.json({
      success: true,
      data: {
        total_courses: total,
        by_status: stats
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to calculate statistics",
      error: error.message
    });
  }
});
/**
 * Global handler for unknown routes
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/**
 * Start the server after ensuring
 * courses.json exists.
 */
initializeDataFile()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `CodeCraftHub API running on http://localhost:${PORT}`
      );
    });
  })
  .catch(error => {
    console.error(
      "Failed to start application:",
      error.message
    );
  });