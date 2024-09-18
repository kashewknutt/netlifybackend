const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const BlogSchema = new mongoose.Schema({
  title: String,
  body: String,
  date: { type: Date, default: Date.now },
});

const Blog = mongoose.model('Blog', BlogSchema);

const auth = (event) => {
  const token = event.headers.authorization;

  if (!token) {
    return { authorized: false, message: 'No token, authorization denied' };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { authorized: true, user: decoded };
  } catch (e) {
    return { authorized: false, message: 'Token is not valid' };
  }
};

exports.handler = async (event, context) => {
  if (event.httpMethod === 'GET') {
    const blogs = await Blog.find({});
    return {
      statusCode: 200,
      body: JSON.stringify(blogs),
    };
  } else if (event.httpMethod === 'POST') {
    const { authorized, message } = auth(event);
    
    if (!authorized) {
      return { statusCode: 401, body: JSON.stringify({ message }) };
    }

    const newBlog = new Blog(JSON.parse(event.body));
    await newBlog.save();
    return {
      statusCode: 201,
      body: JSON.stringify(newBlog),
    };
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
