// models/User.js
const mongoose = require('mongoose');

const FavouriteSchema = new mongoose.Schema({
  workId: { type: String, required: true }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  favourites: { type: [String], default: [] } 
});

module.exports = mongoose.model('User', UserSchema);
