import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import measurementRoutes from "./routes/measurementRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/measurements", measurementRoutes);
app.use("/api/ai", aiRoutes);

// Serve static files from the ROOT directory (one level up from backend)
// This serves index.html, styles.css, etc. directly
app.use(express.static(path.join(__dirname, "../")));

// Special Routes for specific HTML pages if needed (though static middleware handles them mostly)
// We keep these for explicit routing if users hit /index.html directly
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
