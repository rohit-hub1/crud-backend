import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


const app = express();
app.use(cors());
app.use(express.json()); // Enables JSON parsing

const port = 3000;

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


// ✅ Define Tea Schema & Model
const teaSchema = new mongoose.Schema({
  name: String,
  price: Number,
});

const Tea = mongoose.model("Tea", teaSchema);

// ✅ Home Route
app.get("/", (req, res) => {
  res.send("Hello Express");
});

// ✅ Create a new Tea (POST)
app.post("/teas", async (req, res) => {
  try {
    const { name, price } = req.body;
    const newTea = new Tea({ name, price });
    await newTea.save();
    res.status(201).send(newTea);
  } catch (err) {
    res.status(500).send({ error: "Error saving tea" });
  }
});

// ✅ Get all Teas (GET)
app.get("/teas", async (req, res) => {
  try {
    const teas = await Tea.find();
    res.status(200).send(teas);
  } catch (err) {
    res.status(500).send({ error: "Error fetching teas" });
  }
});

// ✅ Get a Tea by ID (GET)
app.get("/teas/:id", async (req, res) => {
  try {
    const tea = await Tea.findById(req.params.id);
    if (!tea) return res.status(404).send("Tea not found");
    res.status(200).send(tea);
  } catch (err) {
    res.status(500).send({ error: "Error fetching tea" });
  }
});

// ✅ Update a Tea by ID (PUT)
app.put("/teas/:id", async (req, res) => {
  try {
    const { name, price } = req.body;
    const tea = await Tea.findByIdAndUpdate(
      req.params.id,
      { name, price },
      { new: true }
    );
    if (!tea) return res.status(404).send("Tea not found");
    res.status(200).send(tea);
  } catch (err) {
    res.status(500).send({ error: "Error updating tea" });
  }
});

// ✅ Delete a Tea by ID (DELETE)
app.delete("/teas/:id", async (req, res) => {
  try {
    const tea = await Tea.findByIdAndDelete(req.params.id);
    if (!tea) return res.status(404).send({ message: "Tea not found" });
    res
      .status(200)
      .send({ message: "Tea deleted successfully", deletedTea: tea });
  } catch (err) {
    res.status(500).send({ error: "Error deleting tea" });
  }
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`🚀 Server is listening at port ${port}`);
});
