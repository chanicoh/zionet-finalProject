const express = require('express');
const axios = require('axios'); // To fetch news
const cors = require('cors');
const amqp = require('amqplib'); // RabbitMQ module
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// חיבור ל-RabbitMQ
let channel;
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672');  // חיבור ל-RabbitMQ
    channel = await connection.createChannel();
    await channel.assertQueue('newsQueue', { durable: true });  // יצירת תור בשם 'newsQueue'
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
  }
}
// קריאה ל-RabbitMQ בעת התחלת השרת
connectRabbitMQ();

// Function to fetch news based on user preferences
const fetchNews = async (preferences) => {
  const apiKey = process.env.NEWS_API_KEY; // Set your API key here
  const url = `https://newsapi.org/v2/top-headlines?category=${preferences}&apiKey=${apiKey}`;
  try {
    const response = await axios.get(url);
    return response.data.articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw new Error('Unable to fetch news');
  }
};

// שליחה ל-RabbitMQ
async function sendToQueue(message) {
    if (channel) {
      channel.sendToQueue('newsQueue', Buffer.from(JSON.stringify(message)), { persistent: true });
      console.log('Message sent to RabbitMQ:', message);
    }
  }
  

// Endpoint to get news based on user preferences
app.post('/get-news', async (req, res) => {
  const { preferences } = req.body;
  try {
    const news = await fetchNews(preferences);
    // שליחה ל-RabbitMQ לאחר קבלת החדשות
    await sendToQueue({ type: 'newsFetched', news });
    res.status(200).send(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`News Service listening on port ${port}`);
});
