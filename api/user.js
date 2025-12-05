const express = require("express");
const router = express.Router();
const UserService = require("../user-service");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const result = await UserService.registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const result = await UserService.loginUser(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
