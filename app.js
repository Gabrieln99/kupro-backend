import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// MongoDB konekcija
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/marketplace"
);

// Database connection events
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Osnovne rute
app.get("/", (req, res) => {
  res.json({
    message: "Kupro Marketplace API je aktivan",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

console.log("Starting server with all routes...");

export default app;
