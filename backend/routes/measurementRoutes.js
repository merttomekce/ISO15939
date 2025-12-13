import express from "express";
import jwt from "jsonwebtoken";
import Measurement from "../models/Measurement.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_do_not_use_in_production";

const router = express.Router();

// Save
router.post("/save", async (req, res) => {
  try {
    let userId = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (e) {
        console.log("Invalid token during save (continuing as guest)");
      }
    }

    const measurementData = { ...req.body, userId };
    const newMeasurement = new Measurement(measurementData);
    const saved = await newMeasurement.save();
    res.status(201).json({ message: "Saved", id: saved._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get History (Protected)
router.get("/history", async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const measurements = await Measurement.find({ userId: decoded.userId }).sort({ createdAt: -1 });
    res.json(measurements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Single by ID
router.get("/:id", async (req, res) => {
  try {
    const measurement = await Measurement.findById(req.params.id);
    if (!measurement) return res.status(404).json({ error: "Not found" });
    res.json(measurement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bring the last record
router.get("/latest", async (req, res) => {
  try {
    const latest = await Measurement.findOne().sort({ createdAt: -1 });
    res.status(200).json(latest || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;