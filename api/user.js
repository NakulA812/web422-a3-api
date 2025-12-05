const express = require("express");
const router = express.Router();

router.post("/register", async (req, res) => {
  res.json({ message: "register working" });
});

module.exports = router;
