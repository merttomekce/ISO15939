import express from "express";
import { saveMeasurement, getMeasurements } from "../models/measurementModel.js";

const router = express.Router();

// Yeni ölçüm kaydet
router.post("/", async (req, res) => {
  try {
    const saved = await saveMeasurement(req.body);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: "Error saving measurement" });
  }
});

// Tüm ölçümleri getir
router.get("/", async (req, res) => {
  try {
    const data = await getMeasurements();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

export default router;
