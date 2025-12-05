require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const serverless = require('serverless-http');

const userService = require('../user-service');

// Setup
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());

const JWTStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

// ENV
const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URL || !JWT_SECRET) {
  throw new Error("Missing environment vars");
}

// Connect DB only once
let connected = false;
async function connectDB() {
  if (!connected) {
    await userService.connect(MONGO_URL);
    connected = true;
  }
}
connectDB();

// JWT Strategy
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
      secretOrKey: JWT_SECRET
    },
    async (jwt_payload, done) => {
      return done(null, jwt_payload);
    }
  )
);

// Routes
app.post('/register', async (req, res) => {
  try {
    const { userName, password, password2 } = req.body;

    if (!userName || !password || !password2)
      return res.status(400).json({ message: "Missing fields" });

    if (password !== password2)
      return res.status(400).json({ message: "Passwords do not match" });

    await userService.createUser(userName, password);
    res.json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { userName, password } = req.body;

    const user = await userService.checkUser(userName, password);
    if (!user) return res.status(401).json({ message: "Invalid username or password" });

    const token = jwt.sign(
      { _id: user._id, userName: user.userName },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

const auth = passport.authenticate('jwt', { session: false });

app.get('/favourites', auth, async (req, res) => {
  const favs = await userService.getFavourites(req.user._id);
  res.json(favs);
});

app.put('/favourites/:id', auth, async (req, res) => {
  const favs = await userService.addFavourite(req.user._id, req.params.id);
  res.json(favs);
});

app.delete('/favourites/:id', auth, async (req, res) => {
  const favs = await userService.removeFavourite(req.user._id, req.params.id);
  res.json(favs);
});

// IMPORTANT: export serverless handler
module.exports = serverless(app);
