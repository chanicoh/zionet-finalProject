const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'], 
}));

const DAPR_HOST = process.env.DAPR_HOST || 'http://dapr_user';
const DAPR_PORT = process.env.DAPR_PORT || 3500;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

const daprUrl = `${DAPR_HOST}:${DAPR_PORT}/v1.0/invoke/service-user/method`;

// Endpoint to get news based on user preferences
app.get('/news', async (req, res) => {
  const { id } = req.query; 

  try {
    const preferences = await getUserPreferences(id);

    const news = await fetchNews(preferences);

    res.status(200).json({ id, preferences, news });
  } catch (error) {
    console.error('Error in /news endpoint:', error.message);
    res.status(500).json({ error: 'An error occurred while processing the news request' });
  }
});

// Fetch user preferences from service-user
async function getUserPreferences(userId) {
  try {
    const response = await axios.get(`${daprUrl}/preferences`, {
      params: { id: userId }, // Updated to match the service-user's endpoint
    });
    return response.data.preferences;
  } catch (error) {
    console.error('Error fetching user preferences:', error.response?.data || error.message);
    throw new Error('Failed to retrieve user preferences');
  }
}

// Fetch news based on preferences
async function fetchNews(preferences) {
  try {
    const newsResponse = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        category: preferences.category, // Assumes `preferences` has a `category` field
        apiKey: NEWS_API_KEY,
      },
    });
    return newsResponse.data.articles;
  } catch (error) {
    console.error('Error fetching news:', error.response?.data || error.message);
    throw new Error('Failed to fetch news');
  }
}


// Start server
const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`News Service listening on port ${port}`);
});
