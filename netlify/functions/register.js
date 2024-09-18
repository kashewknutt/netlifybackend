const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { username, password } = JSON.parse(event.body);
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User registered successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'User already exists' }),
    };
  }
};
