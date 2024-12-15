### Lab Exercise: Securing Microservices with OAuth and Deploying with Minikube

#### Overview

In this lab, you will secure your microservices using OAuth authentication and deploy them to a Kubernetes cluster using Minikube. This exercise builds upon previous labs where OAuth was integrated into your services. You will modify existing files to enhance security and create Kubernetes manifests for deployment.

#### Prerequisites

- **Minikube Installed:** Ensure you have Minikube installed on your machine. [Minikube Installation Guide](https://minikube.sigs.k8s.io/docs/start/)
- **Kubectl Configured:** Install and configure `kubectl` to interact with your Kubernetes cluster.
- **Docker Installed:** Docker should be installed and running.
- **Existing Microservices Setup:** Completed Lab1 and Lab2 with OAuth integration and Docker configurations.

---

### Step-by-Step Instructions

#### 1. Secure Microservices with OAuth

- Copy `/Labs/Day1/Solutions/microservices` to `/Labs/Day2/Solutions/Lab3`
- Ensure all your microservices are secured using OAuth authentication as outlined in Lab1 and Lab2.

##### File Modifications

##### `/Lab3/microservices/service_b_async/Dockerfile`

**Add Environment Variables for OAuth**

```dockerfile
// ...existing code...
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV SESSION_SECRET=${SESSION_SECRET}
ENV AMQP_URL=${AMQP_URL}
// ...existing code...
```
---

##### `/microservices/service_a_sync/index.js`

**Integrate OAuth Authentication and Protect `/sync` Endpoint**

```javascript

const express = require('express');
const axios = require('axios');
const passport = require('passport');
const session = require('express-session');

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('Error: Missing Google OAuth2 client ID or secret.');
  process.exit(1);
}

const OAuth2Strategy = require('passport-google-oauth20').Strategy;

const app = express();
const port = process.env.PORT || 5000; // Config via environment variable

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.use(new OAuth2Strategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
},
(accessToken, refreshToken, profile, done) => {
  // In a production app, you'd save the user info to a database
  return done(null, profile);
}
));

// Serialize and deserialize user instances to and from the session
passport.serializeUser((user, done) => {
done(null, user);
});

passport.deserializeUser((obj, done) => {
done(null, obj);
});

// Protect routes middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/google');
}

// Auth routes
app.get('/auth/google',
passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
passport.authenticate('google', { failureRedirect: '/' }),
(req, res) => {
  res.redirect('/');
}
);

app.get('/', (req, res) => {
  res.send('Please login by accessing /auth/google or visit /sync to sync with Service B');
});

app.get('/sync', isAuthenticated, async (req, res) => {
try {
  const response = await axios.get('http://service_b_sync:5001/data', {
    headers: {
      Authorization: `Bearer ${req.session.passport.user.accessToken}`,
    },
  });
  res.send(`Service A (Sync) received: ${response.data}`);
} catch (error) {
  res.status(500).send('Error communicating with Service B');
}
});


app.listen(port, () => {
console.log(`Service A (Sync) is running on port ${port}`);
});
```

---

##### `/microservices/service_a_sync/Dockerfile`

**Add Environment Variables for OAuth**

```dockerfile


Made changes.

FROM node:14

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 3000

ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV SESSION_SECRET=${SESSION_SECRET}

CMD [ "node", "index.js" ]
```

---

##### `/microservices/service_a_async/Dockerfile`

**Add Environment Variables for OAuth**

```dockerfile


Made changes.

FROM node:14

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 4000

ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV SESSION_SECRET=${SESSION_SECRET}
ENV AMQP_URL=${AMQP_URL}

CMD [ "node", "index.js" ]
```

---

##### `/microservices/docker-compose.yml`

**Configure Environment Variables and Secrets for OAuth**

```docker
version: '3'
services:
  service_a_sync:
    build: ./service_a_sync
    ports:
      - '5000:5000'
    depends_on:
      - service_b_sync
    networks:
      - sync-network
    environment:
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - SESSION_SECRET=${SESSION_SECRET}

  service_b_sync:
    build: ./service_b_sync
    ports:
      - '5001:5001'
    networks:
      - sync-network
    environment:
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - SESSION_SECRET=${SESSION_SECRET}

  service_a_async:
    build: ./service_a_async
    ports:
      - '4000:4000'
    depends_on:
      - rabbitmq
    environment:
      - AMQP_URL=amqp://rabbitmq:5672
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - SESSION_SECRET=${SESSION_SECRET}
    networks:
      - async-network

  service_b_async:
    build: ./service_b_async
    depends_on:
      - rabbitmq
    environment:
      - AMQP_URL=amqp://rabbitmq:5672
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - SESSION_SECRET=${SESSION_SECRET}
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

---

##### `/microservices/service_b_async/index.js`

**Protect Message Consumption with OAuth Authentication**

```javascript

const amqp = require('amqplib');
const passport = require('passport');
const session = require('express-session');
const OAuth2Strategy = require('passport-google-oauth20').Strategy;

const amqpUrl = process.env.AMQP_URL || 'amqp://rabbitmq:5672';

// Initialize Express for OAuth (if needed)
const express = require('express');
const app = express();

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport.js to use the Google strategy
passport.use(new OAuth2Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

// Serialize and deserialize user instances to and from the session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Protect routes middleware
function isAuthenticated(req, res, next) {
  req.isAuthenticated() ? next() : res.sendStatus(401);
}

// Auth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

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

---

##### `/microservices/service_b_sync/index.js`

**Protect Endpoints with OAuth Authentication**

```javascript

const express = require('express');
const passport = require('passport');
const session = require('express-session');
const OAuth2Strategy = require('passport-google-oauth20').Strategy;

const app = express();
const port = process.env.PORT || 5001;

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport.js to use the Google strategy
passport.use(new OAuth2Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  },
  (accessToken, refreshToken, profile, done) => {
    // In a production app, you'd save the user info to a database
    return done(null, profile);
  }
));

// Serialize and deserialize user instances to and from the session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Protect routes middleware
function isAuthenticated(req, res, next) {
  req.isAuthenticated() ? next() : res.sendStatus(401);
}

// Auth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Protect /data route
app.get('/data', isAuthenticated, (req, res) => {
  res.send('Hello from Service B (Sync)');
});

app.listen(port, () => {
  console.log(`Service B (Sync) is running on port ${port}`);
});
```

---
### Things to remember

#### Testing your docker deployment
- Open a terminal and run open the `Labs/Day2/Solutions/Lab3/microservices` directory
- Run `docker-compose up --build` in a terminal
- Test your services
- Press `Ctrl + C` to stop the services

#### Google OAuth Configuration

1. **Authorized Redirect URIs**:
   - `http://localhost:5000/auth/google/callback` (Service A Sync)
   - `http://localhost:5001/auth/google/callback` (Service B Sync)
   - `http://localhost:4000/auth/google/callback` (Service A Async)
   - `http://localhost:5002/auth/google/callback` (Service B Async, assuming port 5002)

2. **Authorized JavaScript Origins**:
   - `http://localhost:5000` (Service A Sync)
   - `http://localhost:5001` (Service B Sync)
   - `http://localhost:4000` (Service A Async)
   - `http://localhost:5002` (Service B Async, assuming port 5002)

#### API Calls

1. **Service A (Sync)**:
   - URL: `http://localhost:5000/sync`
   - Method: GET
   - Authentication: Required

2. **Service B (Sync)**:
   - URL: `http://localhost:5001/data`
   - Method: GET
   - Authentication: Required

3. **Service A (Async)**:
   - URL: `http://localhost:4000/async`
   - Method: GET

4. **Service B (Async)**:
   - Interaction: Send a message to RabbitMQ queue `messages`

#### Authentication Middleware

Ensure that the `isAuthenticated` middleware is correctly applied and that users are redirected to the login page if they are not authenticated.

#### Example for Service B (Sync)
```javascript
// Protect routes middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/google');
}

// Protect /data route
app.get('/data', isAuthenticated, (req, res) => {
  res.send('Hello from Service B (Sync)');
});
```

#### Example for Service A (Sync)
```javascript
// Protect routes middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/google');
}

// Protect /sync route
app.get('/sync', isAuthenticated, async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5001/data', {
      headers: {
        Authorization: `Bearer ${req.session.passport.user.accessToken}`,
      },
    });
    res.send(`Service A (Sync) received: ${response.data}`);
  } catch (error) {
    res.status(500).send('Error communicating with Service B');
  }
});
```

#### Common Issues

1. **Unauthorized Access**:
   - Ensure that the `isAuthenticated` middleware is applied to protected routes.
   - Ensure that users are redirected to the login page if they are not authenticated.

2. **Environment Variables**:
   - Ensure that all required environment variables (e.g., `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`) are set correctly.

3. **RabbitMQ Connection**:
   - Ensure that the RabbitMQ server is running and accessible at the specified `AMQP_URL`.

4. **Service Communication**:
   - Ensure that the services can communicate with each other (e.g., `service_a_sync` can reach `service_b_sync`).
5. **Google OAUthFlow Error**
    You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy for keeping apps secure.

    You can let the app developer know that this app doesn't comply with one or more Google validation rules. Learn more Request Details The content in this section has been provided by the app developer. This content has not been reviewed or verified by Google. If you’re the app developer, make sure that these request details comply with Google policies. redirect_uri: http://service_b_sync:5001/auth/google/callback flowName: GeneralOAuthFlow

    This error is due to the fact that Google OAuth 2.0 requires the redirect URIs to be registered and to use a valid domain. Using localhost or internal service names like service_b_sync is not allowed for production applications.

    To resolve this issue, you need to use a valid domain name for your redirect URIs. Here are the steps to fix this:

    Use a Valid Domain: If you are testing locally, you can use a service like ngrok to create a public URL that tunnels to your local server.

    Update Redirect URIs: Update your Google OAuth 2.0 client configuration to include the new public URL as the redirect URI.

    Update Your Code: Update the callback URLs in your code to match the new public URL.



---
### 2. Deploying Services with Minikube

Now that your microservices are secured, deploy them to a Kubernetes cluster using Minikube.

 **Build and Push Docker Images**:
   Ensure that you have built and pushed the Docker images for all your services to a container registry that Kubernetes can access.

   ```sh
   docker build -t <your-registry>/service_a_sync:latest ./service_a_sync
   docker build -t <your-registry>/service_b_sync:latest ./service_b_sync
   docker build -t <your-registry>/service_a_async:latest ./service_a_async
   docker build -t <your-registry>/service_b_async:latest ./service_b_async

   docker push <your-registry>/service_a_sync:latest
   docker push <your-registry>/service_b_sync:latest
   docker push <your-registry>/service_a_async:latest
   docker push <your-registry>/service_b_async:latest
   ```

 **Update Deployment YAML Files**:
   Update the image fields in your deployment YAML files to use the correct image names from your registry.


#### 2.1. Start Minikube

```bash
minikube start
```

#### 2.2. Create Kubernetes Manifests

##### Create a Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: microservices
```

##### Deploy RabbitMQ

`Labs/Day2/Solutions/Lab3/deployments/rabbitmq-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rabbitmq
  namespace: microservices
spec:
  replicas: 1
  selector:
    matchLabels:
      app: rabbitmq
  template:
    metadata:
      labels:
        app: rabbitmq
    spec:
      containers:
        - name: rabbitmq
          image: rabbitmq:3-management
          ports:
            - containerPort: 5672
            - containerPort: 15672
---
apiVersion: v1
kind: Service
metadata:
  name: rabbitmq
  namespace: microservices
spec:
  ports:
    - port: 5672
      targetPort: 5672
    - port: 15672
      targetPort: 15672
  selector:
    app: rabbitmq
```

##### Deploy Service A Sync

`Labs/Day2/Solutions/Lab3/deployments/service_a_sync-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: service-a-sync
  namespace: microservices
spec:
  replicas: 1
  selector:
    matchLabels:
      app: service-a-sync
  template:
    metadata:
      labels:
        app: service-a-sync
    spec:
      containers:
        - name: service-a-sync
          image: your-docker-repo/service_a_sync:latest
          ports:
            - containerPort: 5000
          env:
            - name: GOOGLE_CLIENT_ID
              valueFrom:
                secretKeyRef:
                  name: google-client-id
                  key: client_id
            - name: GOOGLE_CLIENT_SECRET
              valueFrom:
                secretKeyRef:
                  name: google-client-secret
                  key: client_secret
            - name: SESSION_SECRET
              valueFrom:
                secretKeyRef:
                  name: session-secret
                  key: session_secret
---
apiVersion: v1
kind: Service
metadata:
  name: service-a-sync
  namespace: microservices
spec:
  ports:
    - port: 5000
      targetPort: 5000
  selector:
    app: service-a-sync
```

##### Deploy Service B Sync

`Labs/Day2/Solutions/Lab3/deployments/service_b_sync-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: service-b-sync
  namespace: microservices
spec:
  replicas: 1
  selector:
    matchLabels:
      app: service-b-sync
  template:
    metadata:
      labels:
        app: service-b-sync
    spec:
      containers:
        - name: service-b-sync
          image: your-docker-repo/service_b_sync:latest
          ports:
            - containerPort: 5001
          env:
            - name: GOOGLE_CLIENT_ID
              valueFrom:
                secretKeyRef:
                  name: google-client-id
                  key: client_id
            - name: GOOGLE_CLIENT_SECRET
              valueFrom:
                secretKeyRef:
                  name: google-client-secret
                  key: client_secret
            - name: SESSION_SECRET
              valueFrom:
                secretKeyRef:
                  name: session-secret
---
apiVersion: v1
kind: Service
metadata:
  name: service-b-sync
  namespace: microservices
spec:
  ports:
    - port: 5001
      targetPort: 5001
  selector:
    app: service-b-sync
```

##### Deploy Service A Async

`Labs/Day2/Solutions/Lab3/deployments/service_a_async-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: service-a-async
  namespace: microservices
spec:
  replicas: 1
  selector:
    matchLabels:
      app: service-a-async
  template:
    metadata:
      labels:
        app: service-a-async
    spec:
      containers:
        - name: service-a-async
          image: your-docker-repo/service_a_async:latest
          ports:
            - containerPort: 4000
          env:
            - name: GOOGLE_CLIENT_ID
              valueFrom:
                secretKeyRef:
                  name: google-client-id
                  key: client_id
            - name: GOOGLE_CLIENT_SECRET
              valueFrom:
                secretKeyRef:
                  name: google-client-secret
                  key: client_secret
            - name: SESSION_SECRET
              valueFrom:
                secretKeyRef:
                  name: session-secret
            - name: AMQP_URL
              value: amqp://rabbitmq:5672
---
apiVersion: v1
kind: Service
metadata:
  name: service-a-async
  namespace: microservices
spec:
  ports:
    - port: 4000
      targetPort: 4000
  selector:
    app: service-a-async
```

##### Deploy Service B Async

`Labs/Day2/Solutions/Lab3/deployments/service_b_async-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: service-b-async
  namespace: microservices
spec:
  replicas: 1
  selector:
    matchLabels:
      app: service-b-async
  template:
    metadata:
      labels:
        app: service-b-async
    spec:
      containers:
        - name: service-b-async
          image: your-docker-repo/service_b_async:latest
          env:
            - name: GOOGLE_CLIENT_ID
              valueFrom:
                secretKeyRef:
                  name: google-client-id
                  key: client_id
            - name: GOOGLE_CLIENT_SECRET
              valueFrom:
                secretKeyRef:
                  name: google-client-secret
                  key: client_secret
            - name: SESSION_SECRET
              valueFrom:
                secretKeyRef:
                  name: session-secret
            - name: AMQP_URL
              value: amqp://rabbitmq:5672
---
apiVersion: v1
kind: Service
metadata:
  name: service-b-async
  namespace: microservices
spec:
  ports:
    - port: 4000
      targetPort: 4000
  selector:
    app: service-b-async
```



**Replace** `your-google-client-id`, `your-google-client-secret`, and `your-session-secret` with your actual credentials.

---

#### 2.3. Apply Kubernetes Manifests

Apply all the Kubernetes manifests to deploy your services.

```bash
kubectl apply -f Labs/Day2/Solutions/Lab3/deployments/rabbitmq-deployment.yaml
kubectl apply -f Labs/Day2/Solutions/Lab3/deployments/service_a_sync-deployment.yaml
kubectl apply -f Labs/Day2/Solutions/Lab3/deployments/service_b_sync-deployment.yaml
kubectl apply -f Labs/Day2/Solutions/Lab3/deployments/service_a_async-deployment.yaml
kubectl apply -f Labs/Day2/Solutions/Lab3/deployments/service_b_async-deployment.yaml
kubectl apply -f Labs/Day2/Solutions/Lab3/network-policies/network-policies.yaml
```

---

#### 2.4. Expose Services

To access your services from outside the cluster, use `NodePort` or `Ingress`.

##### Example: Expose Service A Sync using MiniKube

```bash
minikube service service-a-sync
minikube service service-b-sync
minikube service service-a-async
minikube service service-b-async
minikube service rabbitmq
```

Access RabbitMQ Management UI::

```bash
minikube service rabbitmq --url
```

---

#### 2.5. Verify Deployment

Check the status of your deployments and services.

```bash
kubectl get deployments -n microservices
kubectl get services -n microservices
```

---

#### 2.6. Access the Application

1. **Find Minikube IP:**

   ```bash
   minikube ip
   ```

2. **Access Services:**

   - **Service A Sync:** `http://<minikube-ip>:30001`
   - **RabbitMQ Management UI:** `http://<minikube-ip>:15672` (Default credentials: guest/guest)

---

### Additional Notes

- **Ensure Secrets Are Secure:** Keep your secret values safe and avoid exposing them in version control.
- **Monitor Logs:** Use `kubectl logs` to monitor the logs of your pods for any issues.
  
  ```bash
  kubectl logs deployment/service-a-sync -n microservices
  ```

- **Scaling Services:** Adjust the number of replicas in your deployment YAML files as needed.

---

### Summary

- **OAuth Integration:** Secured all microservices using OAuth.
- **Environment Variables:** Managed sensitive information using Docker secrets and Kubernetes secrets.
- **Kubernetes Deployment:** Deployed microservices to a Minikube Kubernetes cluster.
- **Security Enhancements:** Implemented security best practices including non-root users, HTTPS, Helmet, and rate limiting.

