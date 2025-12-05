const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./api/user");

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/user", userRoutes);

// Root test
app.get("/", (req, res) => {
  res.json({ message: "User API is running" });
});

// Start server (Vercel ignores this locally, but useful for local dev)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // REQUIRED for Vercel
