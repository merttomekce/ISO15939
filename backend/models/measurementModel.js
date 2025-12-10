import fs from "fs/promises";

const filePath = "./backend/db/measurements.json";


export async function saveMeasurement(measurement) {
  try {
    const fileData = await fs.readFile(filePath, "utf8").catch(() => "[]");
    const data = JSON.parse(fileData);
    measurement.id = Date.now();
    data.push(measurement);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return measurement;
  } catch (error) {
    throw new Error("Error saving measurement");
  }
}


export async function getMeasurements() {
  try {
    const fileData = await fs.readFile(filePath, "utf8").catch(() => "[]");
    const data = JSON.parse(fileData);
    return data;
  } catch (error) {
    throw new Error("Error reading measurements");
  }
}
