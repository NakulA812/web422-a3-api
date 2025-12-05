const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function connect(mongoUrl) {
  await mongoose.connect(mongoUrl, { });
  console.log('Connected to MongoDB');
}

async function createUser(userName, password) {
  const existing = await User.findOne({ userName });
  if (existing) throw new Error('User already exists');
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ userName, passwordHash: hash });
  await user.save();
  return { _id: user._id, userName: user.userName };
}

async function checkUser(userName, password) {
  const user = await User.findOne({ userName });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { _id: user._id.toString(), userName: user.userName };
}

async function getFavourites(userId) {
  const user = await User.findById(userId);
  if (!user) return [];
  return user.favourites || [];
}

async function addFavourite(userId, workId) {
  const user = await User.findById(userId);
  if (!user) return [];
  if (!user.favourites.includes(workId)) {
    user.favourites.push(workId);
    await user.save();
  }
  return user.favourites;
}

async function removeFavourite(userId, workId) {
  const user = await User.findById(userId);
  if (!user) return [];
  user.favourites = user.favourites.filter(w => w !== workId);
  await user.save();
  return user.favourites;
}

module.exports = {
  connect,
  createUser,
  checkUser,
  getFavourites,
  addFavourite,
  removeFavourite
};
