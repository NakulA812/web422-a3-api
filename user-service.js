const bcrypt = require("bcryptjs");
const User = require("./models/User");

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

module.exports = { registerUser, loginUser };
