import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "./user.js"; // Import User model
import Tea from "./tea.js"; // Import Tea model

dotenv.config();
const router = express.Router();

// ✅ Middleware: Verify JWT & Attach User ID
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1]; // Extract token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Attach userId to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ **Signup Route (Now Generates a 5-Digit User ID)**
router.post("/signup", async (req, res) => {
  try {
    const { phone, password } = req.body;

    let user = await User.findOne({ phone });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Math.floor(10000 + Math.random() * 90000); // Generate 5-digit User ID
    user = new User({ phone, password: hashedPassword, userId });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ **Login Route (Includes User ID in Token)**
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.userId, _id: user._id }, // Include both IDs
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ **Get User Info (Returns the 5-Digit User ID)**
router.get("/user-info", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("userId");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ userId: user.userId });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user info" });
  }
});

// ✅ **Create Tea (User-Specific)**
router.post("/teas", authenticateUser, async (req, res) => {
  try {
    const { name, price } = req.body;
    const userId = req.userId; // Get user ID from token

    const newTea = new Tea({ name, price, userId }); // Include userId
    await newTea.save();

    res.status(201).json(newTea);
  } catch (error) {
    res.status(500).json({ message: "Error creating tea" });
  }
});

// ✅ **Get Teas (Only User's Own Teas)**
router.get("/teas", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId; // Get user ID from token
    const teas = await Tea.find({ userId }); // Filter by userId
    res.json(teas);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teas" });
  }
});

// ✅ **Delete Tea (Only Owner Can Delete)**
router.delete("/teas/:id", authenticateUser, async (req, res) => {
  try {
    const teaId = req.params.id;
    const userId = req.userId; // Get user ID from token

    const tea = await Tea.findOneAndDelete({ _id: teaId, userId }); // Filter by userId
    if (!tea) return res.status(404).json({ message: "Tea not found" });

    res.json({ message: "Tea deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting tea" });
  }
});

export default router;
