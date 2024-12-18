const amqp = require('amqplib');

const amqpUrl = process.env.AMQP_URL || 'amqp://rabbitmq:5672';

(async () => {
  try {
    const connection = await amqp.connect(amqpUrl);
    const channel = await connection.createChannel();

    const queue = 'messages';
    await channel.assertQueue(queue, { durable: false });

    console.log('Service B (Async) is waiting for messages...');

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        console.log(`Received message: ${msg.content.toString()}`);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Error in Service B (Async):', error);
  }
})();