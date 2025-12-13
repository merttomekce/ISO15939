import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Route Imports
import measurementRoutes from "./routes/measurementRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import simulationRoutes from "./routes/simulationRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/iso15939_db";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/simulation", simulationRoutes);

// Static Files
app.use(express.static(path.join(__dirname, "../")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));