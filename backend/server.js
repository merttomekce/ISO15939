import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import measurementRoutes from "./routes/measurementRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// API route
app.use("/api/measurements", measurementRoutes);

// Frontend klasörünü statik olarak servise aç
app.use(express.static(path.join(__dirname, "../frontend")));

// Özel sayfa route'ları (SPA mantığına göre tek tek)
app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/measurement.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/measurement.html"));
});

app.get("/simulator.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/simulator.html"));
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
