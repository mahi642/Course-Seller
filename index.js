const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const USERS = [];
const ADMINS = [];
const COURSES = [];

//Authenticate Admin

const adminAuth = (req, res, next) => {
  const { username, password } = req.headers;
  const admin = ADMINS.find(
    (a) => a.username === username && a.password === password
  );

  if (admin) {
    next();
  } else {
    res.status(403).json({ message: "failed Authentication" });
  }
};

const userAuth = (req, res, next) => {
  const { username, password } = req.headers;
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    req.user = user;
    next();
  } else {
    res.status(403).json({ message: "failed user Authentication" });
  }
};

//Admin Routes

// Admin Signup

app.post("/admin/signup", (req, res) => {
  const admin = req.body;
  const alreadyExisted = ADMINS.find((a) => {
    a.username === admin.username;
  });

  if (alreadyExisted) {
    res.status(400).json({ message: "Admin already existed" });
  } else {
    ADMINS.push(admin);
    res.status(400).json({ message: "Admin created succesfully" });
  }
});

//Admin Login

app.post("/admin/login", adminAuth, (req, res) => {
  res.status(200).json({ message: "Admin login succesfull" });
});

//Admin get courses

app.get("/admin/courses", adminAuth, (req, res) => {
  res.json({ courses: COURSES });
});

//get couse by id

app.get("/admin/courses/:courseId", (req, res) => {
  const courseId = req.params.courseId;

  if (checkCourseById(courseId, courses) !== true) {
    res.status(404).send("Course not found");
  } else {
    res.status(200).json(courses[courseId]);
  }
});

//create new course

app.post("/admin/courses", adminAuth, (req, res) => {
  const course = req.body;
  course.id = Date.now();
  COURSES.push(course);
  res.json({ message: "course added", courseId: course.id });
});

// update course

app.put("/admin/courses/:courseId", adminAuth, (req, res) => {
  const courseId = parseInt(req.params.courseId);

  const course = COURSES.find((c) => c.id === courseId);
  if (course) {
    Object.assign(course, req.body);
    res.json({ message: "Course updated successfully" });
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

//User Routes

//user signUp

app.post("/user/signup", (req, res) => {
    const user = req.body;
    const alreadyUser = USERS.find((u)=>u.username === user.username && u.password === user.password);

    if(alreadyUser){
        res.status(400).json({message: "User already exists" })
    }
    else{
        const user1 = {
          username: req.body.username,
          password: req.body.password,
          purchasedCourses: [],
        };
        USERS.push(user1);
        res.json({ message: "User created successfully" });
        

    }
});

//user login

app.post("/user/login",userAuth, (req, res) => {
    const user = req.body;
   
    res.json({message: "User Login successfully", userId: user.id})
    
});

//get courses

app.get("/user/courses",userAuth,(req,res)=>{
    let filteredCourses = [];
    for(let i = 0;i<COURSES.length;i++){
        if(COURSES[i].published){
            filteredCourses.push(COURSES[i]);
        }
    }
    res.status(200).json({courses:filteredCourses})
})

// purchase course
app.post("/users/courses/:courseId", userAuth, (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = COURSES.find((c) => c.id === courseId && c.published);
  if (course) {
    req.user.purchasedCourses.push(courseId);
    res.json({ message: "Course purchased successfully" });
  } else {
    res.status(404).json({ message: "Course not found or not available" });
  }
});

// get purchased courses

app.get("/users/purchasedCourses",userAuth,(req,res)=>{
    var purchasedCourseIds = req.user.purchasedCourses;
    [1, 4];
    var purchasedCourses = [];
    for (let i = 0; i < COURSES.length; i++) {
      if (purchasedCourseIds.indexOf(COURSES[i].id) !== -1) {
        purchasedCourses.push(COURSES[i]);
      }
    }

    res.json({ purchasedCourses });

})



app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
