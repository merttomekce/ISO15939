import express from "express";
import jwt from "jsonwebtoken";
import Measurement from "../models/Measurement.js";
import authMiddleware from "../middleware/authMiddleware.js";

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
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const measurements = await Measurement.find({ userId: req.user.userId }).sort({ createdAt: -1 });
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

// Delete Measurement
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const measurement = await Measurement.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!measurement) return res.status(404).json({ error: "Measurement not found or unauthorized" });
    res.json({ message: "Measurement deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bring the last record (User specific)
router.get("/latest", async (req, res) => {
  try {
    let query = {};
    const authHeader = req.headers['authorization'];

    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        query = { userId: decoded.userId };
      } catch (e) {
        // If token invalid, maybe return nothing or guest data? 
        // For now, let's assume guest data has no userId or specific logic.
        // But safer to just fail gracefully or return empty for now if invalid token.
        return res.status(200).json({});
      }
    } else {
      // Guest: maybe we shouldn't return anything for privacy, 
      // or return the latest guest draft? 
      // Let's return latest guest draft (userId is null/undefined)
      query = { userId: null };
    }

    const latest = await Measurement.findOne(query).sort({ createdAt: -1 });
    res.status(200).json(latest || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;