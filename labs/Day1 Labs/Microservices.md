## Lab Exercise: Implementing Synchronous, Asynchronous, and Hybrid Microservices

### Overview

In this lab, you will build microservices to understand the differences between synchronous, asynchronous, and hybrid communication patterns. You'll use Node.js and Express.js to create services, RabbitMQ for messaging, and Docker with Docker Compose for containerization and orchestration.

### Objectives

- **Understand** the concepts of synchronous, asynchronous, and hybrid microservice communication
- **Implement** services that communicate synchronously via HTTP requests
- **Implement** services that communicate asynchronously using RabbitMQ
- **Combine** both methods in a hybrid approach
- **Use** Docker and Docker Compose to containerize and manage the services

### Prerequisites

- Node.js and npm installed
- Docker and Docker Compose installed

### Technologies Used

- **Node.js**
- **Express.js**
- **RabbitMQ**
- **Docker**
- **Docker Compose**

### Lab Setup

Create a project directory named `microservices_lab`:

```bash
mkdir microservices_lab
cd microservices_lab
```

### Steps

#### 1. Create Synchronous Microservices

##### 1.1. Service A (Sync)

This service will make synchronous HTTP requests to Service B.

- Create the directory:

  ```bash
  mkdir service_a_sync
  cd service_a_sync
  ```

- Initialize a Node.js project:

  ```bash
  npm init -y
  ```

- Install dependencies:

  ```bash
  npm install express axios
  ```

- Create `index.js` at `/path/to/microservices_lab/service_a_sync/index.js`:

  ```javascript
  // filepath: /path/to/microservices_lab/service_a_sync/index.js

  const express = require('express');
  const axios = require('axios');

  const app = express();
  const port = process.env.PORT || 3000; // Config via environment variable

  app.get('/sync', async (req, res) => {
    try {
      const response = await axios.get('http://service_b_sync:3001/data');
      res.send(`Service A (Sync) received: ${response.data}`);
    } catch (error) {
      res.status(500).send('Error communicating with Service B');
    }
  });

  app.listen(port, () => {
    console.log(`Service A (Sync) is running on port ${port}`);
  });
  ```

- Create a `Dockerfile` at `/path/to/microservices_lab/service_a_sync/Dockerfile`:

  ```dockerfile
  # filepath: /path/to/microservices_lab/service_a_sync/Dockerfile

  FROM node:14

  WORKDIR /app

  COPY package*.json ./
  RUN npm install

  COPY . .

  EXPOSE 3000

  CMD [ "node", "index.js" ]
  ```

##### 1.2. Service B (Sync)

This service will handle requests from Service A.

- Navigate back and create the directory:

  ```bash
  cd ../
  mkdir service_b_sync
  cd service_b_sync
  ```

- Initialize a Node.js project:

  ```bash
  npm init -y
  ```

- Install Express.js:

  ```bash
  npm install express
  ```

- Create `index.js` at `/path/to/microservices_lab/service_b_sync/index.js`:

  ```javascript
  // filepath: /path/to/microservices_lab/service_b_sync/index.js

  const express = require('express');

  const app = express();
  const port = process.env.PORT || 3001;

  app.get('/data', (req, res) => {
    res.send('Hello from Service B (Sync)');
  });

  app.listen(port, () => {
    console.log(`Service B (Sync) is running on port ${port}`);
  });
  ```

- Create a `Dockerfile` at `/path/to/microservices_lab/service_b_sync/Dockerfile`:

  ```dockerfile
  # filepath: /path/to/microservices_lab/service_b_sync/Dockerfile

  FROM node:14

  WORKDIR /app

  COPY package*.json ./
  RUN npm install

  COPY . .

  EXPOSE 3001

  CMD [ "node", "index.js" ]
  ```

#### 2. Create Asynchronous Microservices

##### 2.1. Service A (Async)

This service will send messages to a RabbitMQ queue.

- Navigate back and create the directory:

  ```bash
  cd ../../
  mkdir service_a_async
  cd service_a_async
  ```

- Initialize a Node.js project:

  ```bash
  npm init -y
  ```

- Install dependencies:

  ```bash
  npm install express amqplib
  ```

- Create `index.js` at `/path/to/microservices_lab/service_a_async/index.js`:

  ```javascript
  // filepath: /path/to/microservices_lab/service_a_async/index.js

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
  ```

- Create a `Dockerfile` at `/path/to/microservices_lab/service_a_async/Dockerfile`:

  ```dockerfile
  # filepath: /path/to/microservices_lab/service_a_async/Dockerfile

  FROM node:14

  WORKDIR /app

  COPY package*.json ./
  RUN npm install

  COPY . .

  EXPOSE 4000

  CMD [ "node", "index.js" ]
  ```

##### 2.2. Service B (Async)

This service will consume messages from the RabbitMQ queue.

- Navigate back and create the directory:

  ```bash
  cd ../
  mkdir service_b_async
  cd service_b_async
  ```

- Initialize a Node.js project:

  ```bash
  npm init -y
  ```

- Install dependencies:

  ```bash
  npm install amqplib
  ```

- Create `index.js` at `/path/to/microservices_lab/service_b_async/index.js`:

  ```javascript
  // filepath: /path/to/microservices_lab/service_b_async/index.js

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
  ```

- Create a `Dockerfile` at `/path/to/microservices_lab/service_b_async/Dockerfile`:

  ```dockerfile
  # filepath: /path/to/microservices_lab/service_b_async/Dockerfile

  FROM node:14

  WORKDIR /app

  COPY package*.json ./
  RUN npm install

  COPY . .

  CMD [ "node", "index.js" ]
  ```

#### 3. Set Up RabbitMQ

We'll use the official RabbitMQ Docker image with the management plugin.

#### 4. Create Docker Compose Configuration

Create `docker-compose.yml` at `/path/to/microservices_lab/docker-compose.yml`:

```yaml


version: '3'
services:
  service_a_sync:
    build: ./service_a_sync
    ports:
      - '3000:3000'
    depends_on:
      - service_b_sync
    networks:
      - sync-network

  service_b_sync:
    build: ./service_b_sync
    ports:
      - '3001:3001'
    networks:
      - sync-network

  service_a_async:
    build: ./service_a_async
    ports:
      - '4000:4000'
    depends_on:
      - rabbitmq
    environment:
      - AMQP_URL=amqp://rabbitmq:5672
    networks:
      - async-network

  service_b_async:
    build: ./service_b_async
    depends_on:
      - rabbitmq
    environment:
      - AMQP_URL=amqp://rabbitmq:5672
    networks:
      - async-network

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - '5672:5672'
      - '15672:15672' # RabbitMQ Management UI
    networks:
      - async-network

networks:
  sync-network:
  async-network:
```

#### 5. Run the Services

From the root directory, build and start the containers:

```bash
docker-compose up --build
```

**Note:** Use `docker-compose down` to stop the services when finished.

#### 6. Test Synchronous Communication

- **Send a Request to Service A (Sync):**

  ```bash
  curl http://localhost:3000/sync
  ```

- **Expected Output:**

  ```
  Service A (Sync) received: Hello from Service B (Sync)
  ```

This shows that Service A synchronously calls Service B and waits for the response.

#### 7. Test Asynchronous Communication

- **Send a Request to Service A (Async):**

  ```bash
  curl http://localhost:4000/async
  ```

- **Expected Output:**

  ```
  Message sent to Service B (Async)
  ```

- **Check Service B (Async) Logs:**

  ```bash
  docker-compose logs service_b_async
  ```

- **Expected Log Output:**

  ```
  service_b_async_1  | Received message: Hello from Service A (Async)
  ```

This demonstrates that messages are sent to a queue and processed asynchronously by Service B.

#### 8. Implement a Hybrid Microservice

##### 8.1. Service C (Hybrid)

This service will use both synchronous and asynchronous communication.

- Navigate back and create the directory:

  ```bash
  cd ../
  mkdir service_c_hybrid
  cd service_c_hybrid
  ```

- Initialize a Node.js project:

  ```bash
  npm init -y
  ```

- Install dependencies:

  ```bash
  npm install express axios amqplib
  ```

- Create `index.js` at `/path/to/microservices_lab/service_c_hybrid/index.js`:

  ```javascript
  // filepath: /path/to/microservices_lab/service_c_hybrid/index.js

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
  ```

- Create a `Dockerfile` at `/path/to/microservices_lab/service_c_hybrid/Dockerfile`:

  ```dockerfile
  # filepath: /path/to/microservices_lab/service_c_hybrid/Dockerfile

  FROM node:14

  WORKDIR /app

  COPY package*.json ./
  RUN npm install

  COPY . .

  EXPOSE 5000

  CMD [ "node", "index.js" ]
  ```

- Update `docker-compose.yml` to include Service C:

  ```yaml
  # filepath: /path/to/microservices_lab/docker-compose.yml

  services:
    # ...existing services...

    service_c_hybrid:
      build: ./service_c_hybrid
      ports:
        - '5000:5000'
      depends_on:
        - service_b_sync
        - rabbitmq
      environment:
        - AMQP_URL=amqp://rabbitmq:5672
      networks:
        - sync-network
        - async-network
  ```

#### 9. Test Hybrid Communication

- **Send a Request to Service C (Hybrid):**

  ```bash
  curl http://localhost:5000/hybrid
  ```

- **Expected Output:**

  ```
  Hybrid service received: Hello from Service B (Sync) and sent async message
  ```

- **Check Service B (Async) Logs:**

  ```bash
  docker-compose logs service_b_async
  ```

- **Expected Log Output:**

  ```
  service_b_async_1  | Received message: Hello from Service C (Hybrid)
  ```

This demonstrates that Service C successfully uses both synchronous and asynchronous methods.

#### 10. Clean Up

When finished, stop and remove the containers:

```bash
docker-compose down
```

### Conclusion

You've built microservices demonstrating synchronous, asynchronous, and hybrid communication patterns. This hands-on experience illustrates how different communication methods affect service interaction and architecture.

### Notes

- **File Paths:** Full file paths are provided in the instructions to ensure clarity.
- **Environment Variables:** Configuration is managed via environment variables, adhering to best practices.
- **Docker Networks:** Separate networks (`sync-network` and `async-network`) are used to isolate communication channels.

### Tips

- **RabbitMQ Management UI:** Access it at `http://localhost:15672` with username `guest` and password `guest`.
- **Logs:** Use `docker-compose logs [service_name]` to troubleshoot issues.
- **Extensibility:** Try adding more services or expanding functionality to deepen your understanding.

---

This lab provides practical insight into microservice communication patterns, equipping you with skills to design and implement scalable and efficient microservices architectures.