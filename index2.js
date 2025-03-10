import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt"; // For password hashing
import jwt from "jsonwebtoken"; // For authentication tokens

dotenv.config();

const app = express();
app.use(express.json()); // Enable JSON parsing

// ✅ Updated CORS settings
const allowedOrigins = [
  "http://127.0.0.1:5500", // Local development
  "https://brewnest.vercel.app", // Deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const port = 3000;

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* ─────────────────────────────────────
  🟢 USER AUTHENTICATION (Signup & Login)
   ───────────────────────────────────── */

// ✅ Define User Schema & Model
const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// ✅ User Signup
app.post("/auth/signup", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser)
      return res.status(400).send({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ phone, password: hashedPassword });
    await newUser.save();

    res
      .status(201)
      .send({ message: "Signup successful! Redirecting to login..." });
  } catch (err) {
    res.status(500).send({ error: "Error signing up" });
  }
});

// ✅ User Login
app.post("/auth/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).send({ message: "User not found" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).send({ message: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).send({ token, message: "Login successful" });
  } catch (err) {
    res.status(500).send({ error: "Error logging in" });
  }
});

/* ─────────────────────────────────────
  🟢 TEA CRUD OPERATIONS
   ───────────────────────────────────── */

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

/* ─────────────────────────────────────
  🟢 START SERVER
   ───────────────────────────────────── */
app.listen(port, () => {
  console.log(`🚀 Server is listening at port ${port}`);
});
