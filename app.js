import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import nocache from "nocache";
import connectDB from "./config/db.js";
import userRoutes from './routes/userRoutes.js'

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(nocache());

// Database connection
connectDB();

app.use('/',userRoutes)

// Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
