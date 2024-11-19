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

// קבלת הודעות מתור ושליחת אימייל
async function consumeQueue() {
  if (channel) {
    channel.consume('newsQueue', async (msg) => {
      const { news } = JSON.parse(msg.content.toString());
      const emailContent = news.map(article => `${article.title} - ${article.url}`).join('\n');

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.NOTIFICATION_EMAIL,
          subject: 'Your Personalized News Update',
          text: emailContent,
        });
        console.log('Email sent successfully');
        channel.ack(msg);
      } catch (error) {
        console.error('Failed to send email:', error);
      }
    });
  }
}
consumeQueue();

// התחלת השרת
const port = process.env.PORT || 5002;
app.listen(port, () => {
  console.log(`Notification Service listening on port ${port}`);
});
