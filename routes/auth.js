import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Health check route to test database connection
router.get("/health", async (req, res) => {
  try {
    console.log("=== DATABASE HEALTH CHECK ===");
    console.log("MongoDB connection state:", mongoose.connection.readyState);
    console.log(
      "Connection states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting"
    );

    // Test database operation
    const userCount = await User.countDocuments();
    console.log("Total users in database:", userCount);

    // Test database ping
    const admin = mongoose.connection.db.admin();
    const pingResult = await admin.ping();
    console.log("Database ping result:", pingResult);

    res.json({
      success: true,
      message: "Database connection is healthy",
      data: {
        connectionState: mongoose.connection.readyState,
        userCount: userCount,
        databaseName: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        ping: pingResult,
      },
    });
  } catch (error) {
    console.error("=== DATABASE CONNECTION ERROR ===");
    console.error("Error details:", error.message);
    console.error("Full error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Get current user profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Update user profile
router.put("/profile", authenticate, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
