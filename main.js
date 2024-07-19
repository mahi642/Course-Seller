const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const mongoUrl = process.env.MONGO_DB_URL;
const secret = process.env.JWT_SECRET;

const app = express();
app.use(express.json());
//schemas
const adminSchema = new mongoose.Schema({
  username: String,

  password: String,
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  imageUrl: String,
  published: Boolean,
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});

// models

const Admin = mongoose.model("Admin", adminSchema);
const User = mongoose.model("User", userSchema);
const Course = mongoose.model("Course", courseSchema);

//auth

const authenticateJwt = (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(400);
      }
      req.user = user;
      next();
    });
  } else {
    res.status(400);
  }
};

// connect mongoDB

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "courses",
});

app.post("/admin/signup", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (admin) {
    return res.status(400).send("Admin already exists");
  } else {
    const newAdmin = new Admin({ username, password });
    await newAdmin.save();
    const token = jwt.sign({ username, role: "admin" }, secret, {
      expiresIn: "12h",
    });
    res.json({ message: "Admin created", token });
  }
});

app.post("/admin/login", async (req, res) => {
  const { username, password } = req.headers;
  const admin = await Admin.findOne({ username, password });
  if (admin) {
    const token = jwt.sign({ username, role: "admin" }, SECRET, {
      expiresIn: "12h",
    });
    res.json({ message: "Logged in successfully", token });
  } else {
    res.status(400).json({ message: "Invalid credentials" });
  }
});

app.post("/admin/courses",authenticateJwt,async (req,res)=>{
    const course =new Course(req.body)
    await course.save();
    res.json({message:"Course created successfully"})
})

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
