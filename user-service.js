const bcrypt = require("bcryptjs");
const User = require("./models/User");

//
// REGISTER USER
//
async function registerUser({ userName, password }) {
  if (!userName || !password) {
    throw new Error("Missing userName or password");
  }

  // Check duplicate
  const existing = await User.findOne({ userName });
  if (existing) {
    throw new Error("User already exists");
  }

  // Hash password
  const hash = await bcrypt.hash(password, 10);

  // Save user
  const newUser = new User({
    userName,
    passwordHash: hash,
    favourites: []
  });

  await newUser.save();

  return { message: "User registered successfully" };
}

//
// LOGIN USER
//
async function loginUser({ userName, password }) {
  if (!userName || !password) {
    throw new Error("Missing userName or password");
  }

  const user = await User.findOne({ userName });
  if (!user) {
    throw new Error("User not found");
  }

  // Compare password
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error("Incorrect password");
  }

  return { message: "Login successful", userName: user.userName };
}

//
// GET FAVOURITES
//
async function getFavourites(userName) {
  const user = await User.findOne({ userName });
  if (!user) throw new Error("User not found");

  return user.favourites;
}

//
// ADD FAVOURITE
//
async function addFavourite(userName, workId) {
  const user = await User.findOne({ userName });
  if (!user) throw new Error("User not found");

  if (!user.favourites.includes(workId)) {
    user.favourites.push(workId);
    await user.save();
  }

  return user.favourites;
}

//
// REMOVE FAVOURITE
//
async function removeFavourite(userName, workId) {
  const user = await User.findOne({ userName });
  if (!user) throw new Error("User not found");

  user.favourites = user.favourites.filter(id => id !== workId);
  await user.save();

  return user.favourites;
}

module.exports = {
  registerUser,
  loginUser,
  getFavourites,
  addFavourite,
  removeFavourite
};
