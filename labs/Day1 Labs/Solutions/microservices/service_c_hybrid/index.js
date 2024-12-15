const express = require('express');
const axios = require('axios');
const amqp = require('amqplib');

const app = express();
const port = process.env.PORT || 5000;
const amqpUrl = process.env.AMQP_URL || 'amqp://rabbitmq:5672';

app.get('/hybrid', async (req, res) => {
  try {
    // Synchronous call
    const response = await axios.get('http://service_b_sync:3001/data');

    // Asynchronous message
    const connection = await amqp.connect(amqpUrl);
    const channel = await connection.createChannel();
    const queue = 'messages';
    const msg = 'Hello from Service C (Hybrid)';
    await channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(msg));
    await channel.close();
    await connection.close();

    res.send(`Hybrid service received: ${response.data} and sent async message`);
  } catch (error) {
    res.status(500).send('Error in hybrid service');
  }
});

app.listen(port, () => {
  console.log(`Service C (Hybrid) is running on port ${port}`);
});