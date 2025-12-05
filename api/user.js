const express = require("express");
const router = express.Router();
const UserService = require("../user-service");

//
// GET FAVOURITES
//
router.get("/favourites", async (req, res) => {
  try {
    const { userName } = req.query;
    const favs = await UserService.getFavourites(userName);
    res.json(favs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//
// ADD FAVOURITE
//
router.post("/favourites/add", async (req, res) => {
  try {
    const { userName, workId } = req.body;
    const favs = await UserService.addFavourite(userName, workId);
    res.json(favs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//
// REMOVE FAVOURITE
//
router.post("/favourites/remove", async (req, res) => {
  try {
    const { userName, workId } = req.body;
    const favs = await UserService.removeFavourite(userName, workId);
    res.json(favs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
