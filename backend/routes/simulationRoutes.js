import express from "express";
import Simulation from "../models/Simulation.js";

const router = express.Router();

// Save
router.post("/save", async (req, res) => {
  try {
    const sim = new Simulation(req.body);
    await sim.save();
    res.status(201).json({ message: "Simulation saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;