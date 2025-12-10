import mongoose from "mongoose";

const measurementSchema = new mongoose.Schema({
  infoNeed: { type: String, default: "" },
  measurableConcept: { type: String, default: "" },
  entity: { type: String, default: "" },
  attribute: { type: String, default: "" },
  baseMeasure: { type: String, default: "" },
  derivedMeasure: { type: String, default: "" },
  indicator: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Measurement", measurementSchema);