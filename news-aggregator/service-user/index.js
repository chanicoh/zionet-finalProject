const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const amqp = require('amqplib');//
const User = require('./models/user');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // הגדרת כתובת הלקוח שלך
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'], // אם אתה שולח כותרת Content-Type
}));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));


  // חיבור ל-RabbitMQ
let channel;
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672');  // חיבור ל-RabbitMQ
    channel = await connection.createChannel();
    await channel.assertQueue('userQueue', { durable: true });  // יצירת תור בשם 'userQueue'
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
  }
}
// קריאה ל-RabbitMQ בעת התחלת השרת
connectRabbitMQ();
// שליחת הודעה ל-RabbitMQ
async function sendToQueue(message) {
  if (channel) {
    channel.sendToQueue('userQueue', Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log('Message sent to RabbitMQ:', message);
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
    await sendToQueue({ type: 'userRegistered', user });//
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
    await sendToQueue({ type: 'userLoggedIn', user });//
    res.send(user);
  } else {
    res.status(401).json({ error: 'The email or password is incorrect' }); // שליחת שגיאה עם פירוט בצורת JSON
  }
});

// התחברות לבסיס נתונים MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// התחלת השרת
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`User Service listening on port ${port}`);
});
