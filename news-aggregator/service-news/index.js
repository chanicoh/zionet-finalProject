const express = require('express');
const axios = require('axios');
const amqp = require('amqplib');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

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
    const connection = await amqp.connect('amqp://localhost');
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
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log(`News sent to RabbitMQ: ${message}`);
  }
}

const DAPR_HOST = process.env.DAPR_HOST || 'http://localhost';
const DAPR_PORT = process.env.DAPR_PORT || 3500;
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//const daprUrl = `${DAPR_HOST}:${DAPR_PORT}/v1.0/invoke/service-user/method/preferences`;//get the preferences by the dapr

// Endpoint to get news based on user preferences
// איסוף חדשות
app.post('/fetch-news', async (req, res) => {
  const { userId } = req.query;
  
  try {

    const preferences =/*await axios.get(`http://localhost:5000/preferences`, { params: { id: userId } }); preferencesResponse.data.preferences||*/'Technology';
    //console.log(preferences.data.preferences);
    const newsArticles = await fetchArticles(preferences);
    const summarizedNews = await createNewsSummaries(newsArticles);
    /*const preferencesResponse = await axios.get(`${DAPR_HOST}:${DAPR_PORT}/v1.0/invoke/service-user/method/preferences`,
      {  params: { id: userId } });
     */
      await sendToQueue('newsQueue', { type: 'newsFetched', summarizedNews });
      res.status(200).json({ message: 'News fetch initiated. Results will be sent via email.', summarizedNews });
    } catch (error) {
        console.error('Error processing news and sending email:', error.message);
        res.status(500).send('Error processing news and sending email');
    }
});


async function fetchArticles(preferences) {
   const preferencesApi = Array.isArray(preferences) 
   ? preferences.join(',') // אם זה מערך, חיבור לערכים במחרוזת אחת
   : preferences; // אם זה ערך בודד, השתמש בו ישירות
      const apiUrl = `https://newsdata.io/api/1/latest?apikey=pub_59894c085bd72389bac1a949ae685381498b8&q=${preferencesApi}`;

  try {
      const response = await axios.get(apiUrl);
      return response.data.results;
  } catch (error) {
      console.error('Error fetching news:', error.message);
      throw error;
  }
}
async function createNewsSummaries(newsArticles) {
  const aiModel = genAI.getGenerativeModel({ model: "gemini-pro" });
  const summarizedArticles = await Promise.all(newsArticles.map(async (article) => {
    const { title, link, description } = article;
      //const summaryPrompt = `Title: ${article.title} url: ${article.link} Content: ${article.description}`;
      
      /*const response =  aiModel.generateContent(description);  
      const articleSummary = response.response.text();*/

      return {
        title,
        link,
        //summary: articleSummary,
      };
  }));

  return summarizedArticles;
}


// Start server
const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`News Service listening on port ${port}`);
});
