import dotenv from "dotenv";
dotenv.config();

console.log("ENV CHECK:", {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS ? "LOADED" : "MISSING"
});


import express from "express";
import session from "express-session";
import nocache from "nocache";
import connectDB from "./config/db.js";
import userRoutes from './routes/userRoutes.js'

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
connectDB();

// Middleware
app.use(nocache());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");




app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));


app.use('/',userRoutes);

//error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});


// Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
