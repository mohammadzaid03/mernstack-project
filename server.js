const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Connect MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// Task Schema
const Task = require("./models/Task");

// Routes
app.get("/", (req, res) => {
  res.render("login");
});

// Handle login
app.post("/login", (req, res) => {
  const username = req.body.username.trim().toLowerCase();
  if(username === "admin"){
    res.redirect("/admin");
  } else {
    res.redirect(`/employee/${username}`);
  }
});

// Admin Dashboard
app.get("/admin", async (req, res) => {
  const tasks = await Task.find();
  res.render("admin", { tasks });
});

// Add Task
app.post("/add-task", async (req, res) => {
  const { title, assignedTo } = req.body;
  await new Task({ title, assignedTo }).save();
  res.redirect("/admin");
});

// Employee Dashboard
app.get("/employee/:name", async (req, res) => {
  const name = req.params.name;
  const tasks = await Task.find({ assignedTo: name });
  res.render("employee", { name, tasks });
});

// Mark Task Completed
app.post("/complete-task/:id", async (req, res) => {
  await Task.findByIdAndUpdate(req.params.id, { status: "Completed" });
  res.redirect("back");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
