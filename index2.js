import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Updated CORS settings
const allowedOrigins = ["http://127.0.0.1:5500", "https://brewnest.vercel.app"];

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

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ User Schema & Model
const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// ✅ Signup Route
app.post("/auth/signup", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ phone, password: hashedPassword });
    await newUser.save();

    res
      .status(201)
      .json({ message: "Signup successful! Redirecting to login..." });
  } catch (err) {
    res.status(500).json({ error: "Error signing up" });
  }
});

// ✅ Login Route
app.post("/auth/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    console.log("Login attempt for:", phone);

    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("✅ Login successful");
    res.status(200).json({ token, message: "Login successful" });
  } catch (err) {
    console.error("❌ Error logging in:", err);
    res.status(500).json({ error: "Error logging in" });
  }
});

// ✅ Tea Schema & Model
const teaSchema = new mongoose.Schema({
  name: String,
  price: Number,
});

const Tea = mongoose.model("Tea", teaSchema);

// ✅ Home Route
app.get("/", (req, res) => {
  res.send("Hello Express");
});

// ✅ Create a new Tea
app.post("/teas", async (req, res) => {
  try {
    const { name, price } = req.body;
    const newTea = new Tea({ name, price });
    await newTea.save();
    res.status(201).json(newTea);
  } catch (err) {
    res.status(500).json({ error: "Error saving tea" });
  }
});

// ✅ Get all Teas
app.get("/teas", async (req, res) => {
  try {
    const teas = await Tea.find();
    res.status(200).json(teas);
  } catch (err) {
    res.status(500).json({ error: "Error fetching teas" });
  }
});

// ✅ Get a Tea by ID
app.get("/teas/:id", async (req, res) => {
  try {
    const tea = await Tea.findById(req.params.id);
    if (!tea) return res.status(404).json({ message: "Tea not found" });
    res.status(200).json(tea);
  } catch (err) {
    res.status(500).json({ error: "Error fetching tea" });
  }
});

// ✅ Update a Tea by ID
app.put("/teas/:id", async (req, res) => {
  try {
    const { name, price } = req.body;
    const tea = await Tea.findByIdAndUpdate(
      req.params.id,
      { name, price },
      { new: true }
    );
    if (!tea) return res.status(404).json({ message: "Tea not found" });
    res.status(200).json(tea);
  } catch (err) {
    res.status(500).json({ error: "Error updating tea" });
  }
});

// ✅ Delete a Tea by ID
app.delete("/teas/:id", async (req, res) => {
  try {
    const tea = await Tea.findByIdAndDelete(req.params.id);
    if (!tea) return res.status(404).json({ message: "Tea not found" });
    res
      .status(200)
      .json({ message: "Tea deleted successfully", deletedTea: tea });
  } catch (err) {
    res.status(500).json({ error: "Error deleting tea" });
  }
});

// ✅ Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server is listening at port ${port}`);
});
