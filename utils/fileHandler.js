const fs = require("fs").promises;
const path = require("path");

const filePath = path.join(__dirname, "../data/courses.json");

async function readCourses() {
  const data = await fs.readFile(filePath, "utf8");
  return JSON.parse(data);
}

async function writeCourses(courses) {
  await fs.writeFile(
    filePath,
    JSON.stringify(courses, null, 2)
  );
}

module.exports = {
  readCourses,
  writeCourses
};