require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const serverless = require('serverless-http');

const userService = require('./user-service');

const JWTStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());

// ENV vars
const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

if (!MONGO_URL) {
  console.error('MONGO_URL missing in environment');
  process.exit(1);
}
if (!JWT_SECRET) {
  console.error('JWT_SECRET missing in environment');
  process.exit(1);
}

userService.connect(MONGO_URL).catch(err => {
  console.error('Mongo connection error:', err);
  process.exit(1);
});

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
      secretOrKey: JWT_SECRET
    },
    async (jwt_payload, done) => {
      try {
        const user = { _id: jwt_payload._id, userName: jwt_payload.userName };
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

app.post('/api/user/register', async (req, res) => {
  try {
    const { userName, password, password2 } = req.body;
    if (!userName || !password || !password2) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    if (password !== password2) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    await userService.createUser(userName, password);
    res.json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Error creating user' });
  }
});

app.post('/api/user/login', async (req, res) => {
  try {
    const { userName, password } = req.body;
    if (!userName || !password)
      return res.status(400).json({ message: 'Missing credentials' });

    const user = await userService.checkUser(userName, password);
    if (!user)
      return res.status(401).json({ message: 'Invalid username or password' });

    const payload = { _id: user._id, userName: user.userName };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: { token } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const auth = passport.authenticate('jwt', { session: false });

app.get('/api/user/favourites', auth, async (req, res) => {
  try {
    const favs = await userService.getFavourites(req.user._id);
    res.json(favs);
  } catch (err) {
    res.status(500).json([]);
  }
});

app.put('/api/user/favourites/:id', auth, async (req, res) => {
  try {
    const favs = await userService.addFavourite(req.user._id, req.params.id);
    res.json(favs);
  } catch (err) {
    res.status(500).json([]);
  }
});

app.delete('/api/user/favourites/:id', auth, async (req, res) => {
  try {
    const favs = await userService.removeFavourite(req.user._id, req.params.id);
    res.json(favs);
  } catch (err) {
    res.status(500).json([]);
  }
});

module.exports = app;
module.exports.handler = serverless(app);
