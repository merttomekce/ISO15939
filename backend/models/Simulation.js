import mongoose from "mongoose";

const simulationSchema = new mongoose.Schema({
  projectName: String,
  description: String,
  overallScore: Number,
  qualityRating: String,
  selectedDimensions: [String],
  weights: { type: Map, of: Number },
  metrics: { type: Map, of: Number },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Simulation", simulationSchema);