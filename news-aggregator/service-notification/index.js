const express = require('express');
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());

let channel;

// חיבור ל-RabbitMQ
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

// הגדרת nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function consumeQueue() {
  if (!channel) {
    console.error('RabbitMQ channel is not initialized');
    return;
  }

  try {
    // מאזין לתור 'newsQueue'
    await channel.consume('newsQueue', async (msg) => {
      if (!msg) {
        console.error('Received empty message');
        return;
      }

      try {
        const { news } = JSON.parse(msg.content.toString());
        if (!news || !Array.isArray(news)) {
          console.error('Invalid message format:', msg.content.toString());
          channel.nack(msg, false, false); // דוחה את ההודעה (לא מחזיר לתור)
          return;
        }

        // יצירת תוכן המייל
        const emailContent = news
          .map(article => `${article.title} - ${article.url}`)
          .join('\n');

        // שליחת המייל
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.NOTIFICATION_EMAIL,
          subject: 'Your Personalized News Update',
          text: emailContent,
        });

        console.log('Email sent successfully');
        channel.ack(msg); // אישור הודעה
      } catch (error) {
        console.error('Error processing message:', error);
        channel.nack(msg, false, true); // מחזיר את ההודעה לתור לצריכה מחדש
      }
    });

    console.log('Waiting for messages from newsQueue...');
  } catch (error) {
    console.error('Error consuming messages from queue:', error);
  }
}

consumeQueue();

app.post('/send-email', async (req, res) => {
    const { email} = req.query;
    const { news} = req.body;
    console.log(news);
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Daily News Update',
        text: Array.isArray(Array) ? formatEmail(news) : news
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        res.send('Email sent: ' + info.response);
    });
});

function formatEmail(articles) {
  let formattedText = "";
  articles.forEach(article => {
      formattedText += `${article.title}\n`;
      formattedText += `${article.link}\n\n`;
  });
  console.log(formattedText);
  return formattedText.trim(); // Remove trailing newline
}



// התחלת השרת
const port = process.env.PORT || 5002;
app.listen(port, () => {
  console.log(`Notification Service listening on port ${port}`);
});
