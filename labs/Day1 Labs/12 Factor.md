## Lab Exercise: Building a 12-Factor Application with Node.js and React

### Overview

In this lab, you will create a web application that adheres to the 12-factor app methodology using Node.js for the backend and React.js for the frontend. You will containerize the application using Docker and manage it with Docker Compose.

### Prerequisites

- Node.js and npm installed
- Docker and Docker Compose installed

### Steps

#### 1. Set Up the Project Directory

Create the `12factor` project directory:

```bash
mkdir 12factor
cd 12factor
```

**Explanation:** Organizing your code in a single repository adheres to **Factor I: Codebase**, which states that a codebase is tracked in version control and multiple deployments can be made from it.

#### 2. Create the Backend Application

Create the backend directory and initialize a new Node.js project:

```bash
mkdir backend
cd backend
npm init -y
```

Install Express.js:

```bash
npm install express
```

Create the `index.js` file at `12factor/backend/index.js`:

```javascript
// index.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3001; // Config via environment variable

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
```

Add a start script to `package.json` at `12factor/backend/package.json`:

```json
{
  // ...existing code...
  "scripts": {
    "start": "node index.js"
  },
  // ...existing code...
}
```

**Explanation:**

- **Factor II: Dependencies** — Dependencies are explicitly declared via `npm` and `package.json`.
- **Factor III: Config** — The application uses environment variables for configuration (`process.env.PORT`).
- **Factor VII: Port Binding** — The app binds to a port to serve requests.

#### 3. Create the Frontend Application

Navigate back to the root directory and create the React app:

```bash
cd ..
npx create-react-app frontend
```

Install React Bootstrap:

```bash
cd frontend
npm install react-bootstrap bootstrap
```

Update `src/App.js` at `12factor/frontend/src/App.js`:

```javascript
// App.js
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Alert } from 'react-bootstrap';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api')
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <Container className="mt-5">
      <Alert variant="success">
        <h1>{message}</h1>
      </Alert>
    </Container>
  );
}

export default App;
```

**Explanation:**

- **Factor II: Dependencies** — The frontend dependencies are explicitly declared.
- **Factor III: Config** — The proxy configuration is set via `package.json`.
- **Factor IV: Backing Services** — The frontend connects to the backend service over HTTP.

#### 4. Dockerize the Applications

Create a `Dockerfile` for the backend at `12factor/backend/Dockerfile`:

```dockerfile
# Use official Node.js LTS image
FROM node:14

# Set the working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Expose the port
EXPOSE 3001

# Start the application
CMD [ "npm", "start" ]
```

Create a `Dockerfile` for the frontend at `12factor/frontend/Dockerfile`:

```dockerfile
# Use official Node.js LTS image
FROM node:14

# Set the working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Expose the port
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]
```

**Explanation:**

- **Factor V: Build, Release, Run** — Dockerfiles define a strict separation between build and run stages.
- **Factor VI: Processes** — The app runs as one or more stateless processes inside containers.
- **Factor VIII: Concurrency** — The frontend and backend services can be scaled independently.

#### 5. Create a Docker Compose File

In the root `12factor` directory, create `docker-compose.yml` at `12factor/docker-compose.yml`:

```yaml
version: '3'
services:
  backend:
    build: ./backend
    ports:
      - '3001:3001'
    environment:
      - PORT=3001
    volumes:
      - ./backend:/app
    networks:
      - app-network

  frontend:
    build: ./frontend
    ports:
      - '3000:3000'
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

**Explanation:**

- **Factor III: Config** — Environment variables are defined in `docker-compose.yml`.
- **Factor IV: Backing Services** — Services are attached resources, connected over the network.
- **Factor VIII: Concurrency** — Process types are declared for each service.
- **Factor X: Dev/Prod Parity** — Docker ensures consistency between development and production environments.

**Tip:** Volumes enable hot-reloading, facilitating rapid development cycles.

#### 6. Run the Application

From the root directory, start the application:

```bash
docker-compose up
```

**Explanation:**

- **Factor VI: Processes** — The application is executed as one or more stateless processes.
- **Factor IX: Disposability** — Containers are disposable; they start up and shut down gracefully.

#### 7. Access the Application

Open your browser and navigate to `http://localhost:3000`. You should see the message from the backend displayed in the frontend.

**Explanation:**

- **Factor VII: Port Binding** — The app self-contains web services that are accessible via specified ports.

#### 8. Modify Environment Variables

To adhere to **Factor III: Config**, change the backend message via an environment variable.

Update `docker-compose.yml` at `12factor/docker-compose.yml`:

```yaml
services:
  backend:
    # ...existing code...
    environment:
      - PORT=3001
      - MESSAGE=Greetings from the Twelve-Factor App!
    # ...existing code...
```

Update `index.js` in the backend at `12factor/backend/index.js`:

```javascript
// index.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const message = process.env.MESSAGE || 'Hello from the backend!';

app.get('/api', (req, res) => {
  res.json({ message });
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
```

Rebuild and run the containers:

```bash
docker-compose up --build
```

**Explanation:**

- **Factor III: Config** — Configuration is stored in the environment, separate from code.
- **Factor XII: Admin Processes** — One-off admin tasks like rebuilding containers are done separately from the app's regular processes.

#### 9. Implement Logging

The applications already output logs to the console.

**Explanation:**

- **Factor XI: Logs** — Treat logs as event streams; Docker captures stdout and stderr, which can be redirected as needed.

#### 10. Graceful Shutdown and Startup

Test stopping and starting the containers:

```bash
docker-compose down
docker-compose up
```

**Explanation:**

- **Factor IX: Disposability** — Fast startup and graceful shutdown increase robustness.

### Conclusion

You've successfully built and run a web application that follows the 12-factor app methodology, utilizing Node.js, React.js, React Bootstrap, Docker, and Docker Compose.

**Tip:** To explore **Factor IV: Backing Services** further, consider integrating a database like MongoDB or PostgreSQL.