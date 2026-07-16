import dotenv from "dotenv";
dotenv.config();

console.log("ENV CHECK:", {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS ? "LOADED" : "MISSING",
});


import express from "express";
import session from "express-session";
import nocache from "nocache";
import connectDB from "./config/db.js";
import MongoStore from "connect-mongo";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminOrderRoutes from './routes/adminOrderRoutes.js'
import userProductRoutes from "./routes/userProductRoutes.js" 
import userCartRoutes from './routes/userCartRoutes.js';
import userWishlistRoutes from './routes/userWishlistRoutes.js';
import userCheckoutRoutes from './routes/userCheckoutRoutes.js';
import userOrderRoutes from './routes/userOrderRoutes.js';
import userPaymentRoutes from './routes/userPaymentRoutes.js';
import adminCouponRoutes from './routes/adminCouponRoutes.js';
import userCouponRoutes from './routes/userCouponRoutes.js';
import adminOfferRoutes from './routes/adminOfferRoutes.js';
import adminAnalyticsRoutes from './routes/adminAnalyticsRoutes.js'
import passport from "./config/passport.js";
import cors from "cors";
import { cartCountMiddleware } from "./middlewares/cartMiddleware.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.set("trust proxy", 1);

// Database connection
connectDB();

// Middleware
app.use(
  cors({
    origin: `http://localhost:${PORT}`,
    credentials: true,
  }),
);

app.use(nocache());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions"
    }),
    
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use(cartCountMiddleware)
app.use("/", userRoutes);
app.use('/',userProductRoutes)
app.use('/',userCartRoutes)
app.use('/',userWishlistRoutes);
app.use('/',userCheckoutRoutes);
app.use('/',userOrderRoutes);
app.use('/',userPaymentRoutes)
app.use('/',userCouponRoutes)
app.use("/admin", adminRoutes);
app.use('/admin',adminOrderRoutes)
app.use('/admin',adminCouponRoutes)
app.use('/admin',adminOfferRoutes)
app.use('/admin',adminAnalyticsRoutes)



// 404 Handler
app.use((req, res) => {
  res.status(404).render("userViews/404page", {
    message: "Page Not Found",
  });
});

//error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
