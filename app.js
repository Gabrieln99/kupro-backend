import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// MongoDB konekcija
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/marketplace",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Osnovne rute
app.get("/", (req, res) => {
  res.json({ message: "Marketplace API je aktivan" });
});

export default app;
