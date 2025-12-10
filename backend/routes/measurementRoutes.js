import express from "express";
import Measurement from "../models/Measurement.js";

const router = express.Router();

// Save
router.post("/save", async (req, res) => {
  try {
    const newMeasurement = new Measurement(req.body);
    const saved = await newMeasurement.save();
    res.status(201).json({ message: "Saved", id: saved._id });
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