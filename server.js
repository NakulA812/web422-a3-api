const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const userService = require('./user-service');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());

const { Strategy: JWTStrategy, ExtractJwt } = passportJWT;

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
      secretOrKey: process.env.JWT_SECRET
    },
    (payload, done) => done(null, { _id: payload._id, userName: payload.userName })
  )
);

userService.connect(process.env.MONGO_URL);

// routes
app.post('/api/user/register', async (req, res) => {
  try {
    const { userName, password, password2 } = req.body;
    if (!userName || !password || !password2)
      return res.status(400).json({ message: 'Missing fields' });

    if (password !== password2)
      return res.status(400).json({ message: 'Passwords do not match' });

    await userService.createUser(userName, password);
    res.json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/user/login', async (req, res) => {
  try {
    const { userName, password } = req.body;
    const user = await userService.checkUser(userName, password);

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { _id: user._id, userName: user.userName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: { token } });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

const auth = passport.authenticate('jwt', { session: false });

app.get('/api/user/favourites', auth, async (req, res) => {
  res.json(await userService.getFavourites(req.user._id));
});

app.put('/api/user/favourites/:id', auth, async (req, res) => {
  res.json(await userService.addFavourite(req.user._id, req.params.id));
});

app.delete('/api/user/favourites/:id', auth, async (req, res) => {
  res.json(await userService.removeFavourite(req.user._id, req.params.id));
});

module.exports = app;
