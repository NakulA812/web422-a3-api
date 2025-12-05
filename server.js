const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const userRoutes = require("./api/user");

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));


// API routes
app.use("/api/user", userRoutes);

// Root test
app.get("/", (req, res) => {
  res.json({ message: "User API is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
