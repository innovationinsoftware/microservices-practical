const express = require('express');
const amqp = require('amqplib');

const app = express();
const port = process.env.PORT || 4000;
const amqpUrl = process.env.AMQP_URL || 'amqp://rabbitmq:5672';

app.get('/async', async (req, res) => {
  try {
    const connection = await amqp.connect(amqpUrl);
    const channel = await connection.createChannel();

    const queue = 'messages';
    const msg = 'Hello from Service A (Async)';
    await channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(msg));

    await channel.close();
    await connection.close();

    res.send('Message sent to Service B (Async)');
  } catch (error) {
    res.status(500).send('Error sending message');
  }
});

app.listen(port, () => {
  console.log(`Service A (Async) is running on port ${port}`);
});