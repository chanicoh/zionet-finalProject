const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const amqp = require('amqplib');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(express.json());

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST','PUT'],
  allowedHeaders: ['Content-Type'], 
}));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));


let channel;
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672');  
    channel = await connection.createChannel();
    await channel.assertQueue('userQueue', { durable: true });  // 'userQueue'
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
  }
}
connectRabbitMQ();

async function sendToQueue(queue,message) {
  if (channel) {
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log(`Message sent to RabbitMQ: ${message}`);
  }
}

// Register User
app.post('/register', async (req, res) => {
  console.log(req.body);  // הדפסת בקשה בצד השרת
  const { name, email, password, preferences } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ fullName: name, email, password: hashedPassword, preferences });

  try {
    await user.save();
    await sendToQueue('userQueue', { type: 'userRegistered', user });
    res.status(201).send(user);
  } catch (error) {
    res.status(400).json({ error: 'The email already exists in the system' }); // שליחת הודעת שגיאה בצורת JSON
  }
});

// Login User
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (user && await bcrypt.compare(password, user.password)) {
    await sendToQueue('userQueue',{ type: 'userLoggedIn', user });//
    res.send(user);
  } else {
    res.status(401).json({ error: 'The email or password is incorrect' }); // שליחת שגיאה עם פירוט בצורת JSON
  }
});

// Get Email of User (from database)
app.get('/email', async (req, res) => {
  const  {id}  = req.query;
  
  try {
    const user = await User.findById(id);
    if (user) {
      res.status(200).json({ email: user.email });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});


// Get Preferences of User
app.get('/preferences', async (req, res) => {
  const  {id}  = req.query;
  
  try {
    const user = await User.findById(id);
    if (user) {
      res.status(200).json({ preferences: user.preferences });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});
// Set Preferences of User
app.put('/preferences', async (req, res) => {
  const  {id}  = req.query;
  const { preferences } = req.body;
  console.log(preferences);
  
  try {
    const user = await User.findById(id );
    if (user) {
      user.preferences = preferences;
      await user.save();
      await sendToQueue('userQueue', { type: 'preferencesUpdated', user });
      res.status(200).json({ message: 'Preferences updated successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});
//Get Name of User
app.get('/name', async (req, res) => {
  const  {id}  = req.query;
  try {
    const user = await User.findById(id);
    if (user) {
      res.status(200).json({ fullName: user.fullName });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
    }
});




// connect toMongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });



// התחלת השרת
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`User Service listening on port ${port}`);
});
