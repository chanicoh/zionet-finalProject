const express = require('express');
const axios = require('axios');
const amqp = require('amqplib');
require('dotenv').config();

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'], 
}));

let channel;

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672');
    channel = await connection.createChannel();
    await channel.assertQueue('newsQueue', { durable: true });
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
  }
}
connectRabbitMQ();

async function sendToQueue(queue, message) {
  if (channel) {
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log(`News sent to RabbitMQ: ${message}`);
  }
}

const DAPR_HOST = process.env.DAPR_HOST || 'http://dapr_user';
const DAPR_PORT = process.env.DAPR_PORT || 3500;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

const daprUrl = `${DAPR_HOST}:${DAPR_PORT}/v1.0/invoke/service-user/method/preferences`;

// Endpoint to get news based on user preferences
// איסוף חדשות
app.post('/fetch-news', async (req, res) => {
  const { userId } = req.query;
  console.log("userId: ",userId);

  try {

    const preferencesResponse = await axios.get(`${DAPR_HOST}:${DAPR_PORT}/v1.0/invoke/service-user/method/preferences`,{  params: { id: userId },  });
    console.log("preferences: ",preferences);
    if (preferencesResponse.status === 200) {
      const preferences = preferencesResponse.data.preferences;

    const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        apiKey: process.env.NEWS_API_KEY,
        category: preferences.category,
        language: 'en',
      },
    });
    const news = newsResponse.data.articles;
      await sendToQueue('newsQueue', { type: 'newsFetched', news });
      res.status(202).json({ message: 'News fetch initiated. Results will be sent via email.', news });
    } else {
      res.status(400).json({ error: 'Failed to fetch preferences' });
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Start server
const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`News Service listening on port ${port}`);
});
