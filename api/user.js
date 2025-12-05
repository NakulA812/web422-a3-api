import serverless from "serverless-http";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import passport from "passport";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";

import userService from "../user-service.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());

const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;

await userService.connect(MONGO_URL);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("JWT"),
      secretOrKey: JWT_SECRET
    },
    (jwt_payload, done) => done(null, jwt_payload)
  )
);

app.post("/register", async (req, res) => {
  try {
    const { userName, password, password2 } = req.body;
    if (!(userName && password && password2)) {
      return res.status(400).json({ message: "Missing fields" });
    }
    if (password !== password2) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    await userService.createUser(userName, password);
    res.json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { userName, password } = req.body;
    const user = await userService.checkUser(userName, password);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { _id: user._id, userName: user.userName },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token });
  } catch {
    res.status(400).json({ message: "Login failed" });
  }
});

const auth = passport.authenticate("jwt", { session: false });

app.get("/favourites", auth, async (req, res) => {
  const favs = await userService.getFavourites(req.user._id);
  res.json(favs);
});

app.put("/favourites/:id", auth, async (req, res) => {
  const favs = await userService.addFavourite(req.user._id, req.params.id);
  res.json(favs);
});

app.delete("/favourites/:id", auth, async (req, res) => {
  const favs = await userService.removeFavourite(req.user._id, req.params.id);
  res.json(favs);
});

export default serverless(app);
