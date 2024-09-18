const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
  const user = await User.findOne({ username });
  
  if (!user) {
    return { statusCode: 400, body: JSON.stringify({ message: 'User not found' }) };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Password is wrong' }) };
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://rajatdisawal.vercel.app',
      'Access-Control-Allow-Credentials': 'true',
    },
    body: JSON.stringify({ token }),
  };
};
