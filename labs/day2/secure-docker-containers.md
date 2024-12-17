## Securing Docker Containers and Configurations with Docker Compose and Secret Management

In this tutorial, we'll enhance the security of your Docker containers and configurations using Docker Compose and a secret manager. We'll cover best practices for securing APIs, protecting API keys, and using standard security frameworks.

## **Complete the lab on the Linux VM**

### Overview

- **Concepts Covered:**
  - Securing Docker containers
  - API authentication and access control
  - Encryption and activity monitoring
  - Protecting API keys with a secret manager
  - Using standard API security frameworks

### Prerequisites

- Complete solution from Day2 Lab1 - Adding OAuth
- Existing Docker setup for frontend and backend services
- OAuth credentials set up for Google authentication

---

### Steps

**SSH to the Linux lab VM**



Ensure you have the latest lab files. 
If not already done, clone the lab repository
 ```bash
 cd $HOME
 git clone https://github.com/innovationinsoftware/microservices-practical.git
 ```
 If you have cloned the repository and want the latest files, `cd` to the lab directory (most likely `cd $HOME/microservices-practical`) and run    `git pull`
 
Enter the lab directory: `cd $HOME/microservices-practical/labs/day2/solutions/lab2/`

#### 1. Secure Docker Containers

##### 1.1. Use Non-Root User

Running containers as a non-root user is a best practice to minimize security risks.

**Backend Dockerfile:**

Confirm the backend `Dockerfile` uses a non-root user.

```dockerfile


# Use official Node.js LTS image
FROM node:18

# Set the working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Create and use a non-root user
RUN useradd -ms /bin/bash appuser
USER appuser

# Expose the port
EXPOSE 3001

# Start the application
CMD [ "npm", "start" ]
```

**Frontend Dockerfile:**

Confirm the frontend `Dockerfile` uses a non-root user.

```dockerfile


# Use official Node.js LTS image
FROM node:18

# Set the working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Create and use a non-root user
RUN useradd -ms /bin/bash appuser
USER appuser

# Expose the port
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]
```

**Concept:** Running containers as a non-root user reduces the risk of privilege escalation attacks.

---

#### 2. API Authentication and Access Control

##### 2.1. Use OAuth for Authentication

Ensure that your backend is configured to use OAuth for authentication.

**Backend `index.js`:**

```javascript


require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const port = process.env.PORT || 3001;

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: true,
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Configure Passport.js to use the Google strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
},
(accessToken, refreshToken, profile, done) => {
  // In a production app, you'd save the user info to a database
  return done(null, profile);
}));

// Serialize and deserialize user instances to and from the session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Protect routes middleware
function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

// Define routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: 'http://localhost:3000', // Redirect to frontend on success
  })
);

app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('http://localhost:3000'); // Redirect to frontend on logout
  });
});

app.get('/api', isLoggedIn, (req, res) => {
  res.json({ message: `Hello, ${req.user.displayName}!`, user: req.user });
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
```

**Concept:** OAuth 2.0 provides secure authentication and authorization for your APIs.

---

#### 3. Encryption and Activity Monitoring

##### 3.1. Use HTTPS for Secure Communication

Ensure that your application uses HTTPS in production to encrypt data in transit.

**Concept:** HTTPS encrypts data between the client and server, protecting it from interception and tampering.

##### 3.2. Monitor API Activity

Use logging and monitoring tools to track API activity and detect potential security issues.

**Backend `index.js`:**

Add logging middleware to monitor API requests.

- Ensure you're in the `backend` directory in a terminal.
- Run `npm install morgan`

The `index.js` file has the following to enable logging:

```javascript
const morgan = require('morgan');

app.use(morgan('combined'));
```

**Concept:** Monitoring API activity helps detect and respond to security incidents.

---

#### 4. Protect API Keys with Secret Manager

##### 4.1. Use Docker Secrets

Store API keys and other sensitive information using Docker secrets.

**Create Secrets:**

Create secrets replacing the values below with your OAuth app's **Client ID** and **Client secret**

Run the following one line at a time. NOTE: replaace `your-google-client-id`, and `your-google-client-secret` with the OAuth secrets you created previously. 
```bash
docker swarm init
echo "your-google-client-id" | docker secret create google_client_id -
echo "your-google-client-secret" | docker secret create google_client_secret -
```

**Docker Compose:**

Confirm `docker-compose.yml` is using Docker secrets.

```yaml
services:
  backend:
    build: ./backend
    ports:
      - '3001:3001'
    environment:
      - PORT=3001
      - HOST=0.0.0.0
    secrets:
      - google_client_id
      - google_client_secret
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

secrets:
  google_client_id:
    external: true
  google_client_secret:
    external: true

networks:
  app-network:
    driver: bridge
```

**Backend is configured to Use Secrets:**

The backend is configured to read secrets from the Docker secrets files.

**Backend `index.js`:**

```javascript


const fs = require('fs');

// Read secrets from Docker secrets files
const GOOGLE_CLIENT_ID = fs.readFileSync('/run/secrets/google_client_id', 'utf8').trim();
const GOOGLE_CLIENT_SECRET = fs.readFileSync('/run/secrets/google_client_secret', 'utf8').trim();

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const port = process.env.PORT || 3001;

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Configure Passport.js to use the Google strategy
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
},
(accessToken, refreshToken, profile, done) => {
  // In a production app, you'd save the user info to a database
  return done(null, profile);
}));

// Serialize and deserialize user instances to and from the session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Protect routes middleware
function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

// Define routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: 'http://localhost:3000', // Redirect to frontend on success
  })
);

app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('http://localhost:3000'); // Redirect to frontend on logout
  });
});

app.get('/api', isLoggedIn, (req, res) => {
  res.json({ message: `Hello, ${req.user.displayName}!`, user: req.user });
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
```

**Concept:** Docker secrets provide a secure way to manage sensitive information in your containers.

---

#### 5. Use Standard API Security Frameworks

##### 5.1. Use Helmet for Security Headers

Review `index.js` to see Helmet enables your Express application to set secure HTTP headers.

**Backend `index.js`:**

```javascript
const helmet = require('helmet');

app.use(helmet());
```

**Concept:** Helmet helps secure your Express app by setting various HTTP headers.

##### 5.2. Use Rate Limiting

The following code enables rate limiting to protect your APIs from abuse.

**Backend `index.js`:**

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
});

// Apply rate limiting to all requests
app.use(limiter);
```

**Concept:** Rate limiting helps prevent abuse and denial-of-service attacks.



In the `frontend` directory, Install `react-scripts`

```
npm install react-scripts
```



---

## Testing the Secured Docker Containers and Configurations

After making the necessary changes to secure your Docker containers and configurations, it's important to test the setup to ensure everything is working correctly. Follow these steps to test the changes:

### Step-by-Step Instructions

#### 1. Build and Start the Docker Containers

Navigate to the root directory of your project and use Docker Compose to build and start the containers.

```bash
cd "$HOME/microservices-practical/labs/day2/solutions/lab2/"
docker-compose build
```

**Concept:** Building the Docker containers ensures that the latest changes are included, and starting the containers runs the application with the updated configurations.

#### 2. Verify Docker Secrets

Ensure that the Docker secrets are correctly created and accessible by the containers.

**Create Secrets:**

```bash
docker secret ls
```

**Concept:** Docker secrets provide a secure way to manage sensitive information in your containers.

#### 3. Ensure docker-compose.yml is configured for Swarm

Ensure your `docker-compose.yml` is configured correctly for Docker Swarm.

```yaml
services:
  backend:
    image: backend:latest
    build: ./backend
    ports:
      - '3001:3001'
    environment:
      - PORT=3001
      - HOST=0.0.0.0
    secrets:
      - google_client_id
      - google_client_secret
    volumes:
      - ./backend:/app
    networks:
      - app-network
    deploy:
      replicas: 1
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure

  frontend:
    image: frontend:latest
    build: ./frontend
    ports:
      - '3000:3000'
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
    networks:
      - app-network
    deploy:
      replicas: 1
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure

secrets:
  google_client_id:
    external: true
  google_client_secret:
    external: true

networks:
  app-network:
    driver: overlay
```

#### 4. Deploy the Stack

Deploy the stack using `docker-compose.yml` file. For this example, we'll use `myapp` as the stack name:

```bash
docker stack deploy -c docker-compose.yml myapp
```

#### 5. Verify the Deployment

Check the status of the services to ensure they are running correctly:

```bash
docker stack services myapp
```

You should see the `backend` and `frontend` services listed with their respective statuses.

---
If the services are replicated but not running, it could be due to several reasons such as incorrect configurations, missing dependencies, or issues with the Docker secrets. Let's go through a step-by-step process to troubleshoot and resolve the issue.

##### Step-by-Step Troubleshooting

##### 1. Check Service Logs

First, check the logs of the services to identify any errors or issues.

```bash
docker service logs myapp_backend
docker service logs myapp_frontend
```

##### 2. Verify Docker Secrets

Ensure that the Docker secrets are correctly created and accessible by the services.

```bash
docker secret ls
```

You should see the secrets `google_client_id`, `google_client_secret` listed.

##### 3. Verify External Access

Verify the app-network overlay network is created and attached to your services:

```bash
docker network ls
docker network myapp_inspect app-network
```
You can verify the frontend service's published ports with:

```bash
docker service inspect myapp_frontend --format '{{json .Endpoint.Ports}}' | jq
```

The output should confirm port 3000 is exposed. For example:

```json
[
  {
    "Protocol": "tcp",
    "TargetPort": 3000,
    "PublishedPort": 3000
  }
]
```

If you don't see PublishedPort, the service isn’t exposing the port correctly.


### Summary

- **Non-Root User:** Run containers as a non-root user to minimize security risks.
- **OAuth Authentication:** Use OAuth 2.0 for secure authentication and authorization.
- **HTTPS:** Use HTTPS in production to encrypt data in transit.
- **Activity Monitoring:** Monitor API activity to detect and respond to security incidents.
- **Protect API Keys:** Store API keys using Docker secrets and do not reuse them.
- **Security Frameworks:** Use Helmet for security headers and rate limiting to protect your APIs.
