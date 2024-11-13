const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Register User
app.post('/register', async (req, res) => {
  const { name, email, password, preferences } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ fullName: name, email, password: hashedPassword, preferences });

  try {
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Login User
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (user && await bcrypt.compare(password, user.password)) {
    res.send(user);
  } else {
    res.status(401).send('Invalid credentials');
  }
});

// התחברות לבסיס נתונים MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// התחלת השרת
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`User Service listening on port ${port}`);
});
