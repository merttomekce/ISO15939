import express from "express";
import jwt from "jsonwebtoken";
import Simulation from "../models/Simulation.js";

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

    const simData = { ...req.body, userId };
    const sim = new Simulation(simData);
    await sim.save();
    res.status(201).json({ message: "Simulation saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get History
router.get("/history", async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const simulations = await Simulation.find({ userId: decoded.userId }).sort({ createdAt: -1 });
    res.json(simulations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Single
router.get("/:id", async (req, res) => {
  try {
    const simulation = await Simulation.findById(req.params.id);
    if (!simulation) return res.status(404).json({ error: "Not found" });
    res.json(simulation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;