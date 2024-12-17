## Adding OAuth Authentication and Authorization to Your Application

In this guide, we'll add OAuth authentication and authorization to your React frontend and Express backend. We'll use Google's OAuth 2.0 as an example, but you can adapt this to other providers like Facebook or GitHub.

### Overview

- **Concepts Covered:**
  - OAuth 2.0 fundamentals
  - Implementing OAuth in a React application
  - Securing Express backend routes with OAuth tokens
- **Prerequisites:**
  - Existing React frontend (App.js)
  - Existing Express backend (`index.js`)
  - A Google Cloud project with OAuth credentials

---

### Steps

#### 1. Set Up OAuth Credentials with Google

Before implementing OAuth, you must register your application with Google to obtain the **Client ID** and **Client Secret**.

- **Create a Google Cloud Project:**
  - Visit the [Google Cloud Console](https://console.cloud.google.com/).
  - Create a new project or select an existing one.
- **Enable APIs and Services:**
  - Navigate to **APIs & Services** > **Dashboard**.
  - Click **Enable APIs and Services**.
  - Enable the **Google+ API** or **Google People API**.
- **Create OAuth Credentials:**
  - Go to **APIs & Services** > **Credentials**.
  - Click **Create Credentials** > **OAuth client ID**.
  - If required, complete the **consent screen**.
    - Choose **External**
    - App name: **oauthms**
    - User support email: **Select your email from the drop-down menu**
    - Provide the same email for **Developer contact information**
  - After saving, click **Clients** on the left side menu. 
  - If you see a message saying you must complete the consent form, refresh your page. 
  - For **Application type**, select **Web application**.
  - Set the **Name** to **oauth-client**
  - Under **Authorized JavaScript origins**, click **ADD URI**
  - Set **Authorized JavaScript origins** to `http://localhost:3000`.
  - Create an **Authorized redirect URI**
  - Set **Authorized redirect URIs** to `http://localhost:3001/auth/google/callback`.
  - Click **Create** and save the **Client ID** and **Client Secret**.

**Concept:** OAuth 2.0 allows users to grant limited access to their resources on one site to another site, without having to expose their credentials.

---

#### 2. Install Dependencies

Use Chocolatey to install `nodejs`

NOTE: Remember to restart VSCode with Admin permissions

```powershell
choco install -y nodejs
```

After installing `nodejs`, restart VSCode without Admin permissions.


##### Backend Dependencies

Ensure you have the latest lab files.

If not already done, clone the lab repository
```bash
cd /c/labs/
git clone https://github.com/innovationinsoftware/microservices-practical.git
```
If you have cloned the repository and want the latest files, `cd` to the lab directory (most likely cd /c/labs//microservices-practical) and run `git pull`

Enter the cloned lab solution directory and navigate to your backend directory:

```bash
cd "labs/day2/solutions/lab1/backend"
```

Install the required packages:

```bash
npm install passport passport-google-oauth20 express-session dotenv
```

**Concepts:**

- **Passport.js:** A popular library for authentication in Node.js applications.
- **Passport strategies:** Modular authentication mechanisms (e.g., `passport-google-oauth20` for Google OAuth 2.0).
- **Express Session:** Middleware for managing user sessions.

---

#### 3. Configure the Backend

##### 3.1. Set Up Environment Variables

Update   `backend/.env` file to include your oAuth credentials:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Note:** Replace `your-google-client-id` and `your-google-client-secret` with the actual values from Google.

##### 3.2. Update index.js

Modify your backend `index.js` to include your OAuth Client secret.

```javascript
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const port = process.env.PORT || 3001;

// Configure session middleware
app.use(session({
  secret: 'your-session-secret', // REPLACE WITH YOUR CLIENT SECRET
  resave: false,
  saveUninitialized: true,
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

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

**Concepts:**

- **Session Management:** Using 

express-session

 to handle user sessions.
- **Authentication Flow:** Redirecting users to Google for authentication and handling callbacks.
- **Protecting Routes:** Middleware checks if the user is authenticated before granting access.

---

#### 4. Configure the Frontend

Enter the `frontend` folder
```
cd ../frontend
```

##### 4.1. Create Environment Variable

Review `frontend/.env`file:

Update it with your Google Client ID 

```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

**Note:** Replace `your-google-client-id` with your actual Client ID.

##### 4.2. Review App.js

Run the following to add styling:

```bash
npm install @mui/material @emotion/react @emotion/styled
```

Review `src/App.js` to see the Google Login functionality.

```javascript
import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Alert } from '@mui/material';

function App() {
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    fetch('http://localhost:3001/api', {
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 401) {
          setMessage('Please log in');
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data && data.message) {
          setMessage(data.message);
          setUser(data.user);
        }
      });
  }, []);

  const onSuccess = () => {
    // Redirect to the backend for Google OAuth
    window.location.href = 'http://localhost:3001/auth/google';
  };

  const handleLogout = () => {
    window.location.href = 'http://localhost:3001/logout';
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="h4">{message}</Typography>
      </Alert>
      {!user ? (
        <Button variant="contained" color="primary" onClick={onSuccess}>
          Login with Google
        </Button>
      ) : (
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      )}
    </Container>
  );
}

export default App;

```

**Concepts:**

- **OAuth Flow in React:** Redirecting the user to the backend's OAuth route.
- **State Management:** Using React state to manage the user's authentication status.

---

#### 5. Test the Application

- **Start the Backend:**

  ```bash
  cd "../backend"
  node index.js
  ```

- **Start the Frontend:**

  ```bash
  cd "../frontend"
  npm start
  ```

- **Test the Flow:**
  
  - A browser should open to `http://localhost:3000`.
  - Click **Login with Google**.
  - Log in with your Google credentials.
  - You should see a personalized greeting message.

**Concepts:**

- **Authentication Flow:**
  1. User clicks login button.
  2. User is redirected to `/auth/google` on the backend.
  3. Backend redirects user to Google for authentication.
  4. After authentication, Google redirects back to `/auth/google/callback`.
  5. User session is established, and frontend updates accordingly.

---

#### 6. Secure API Endpoints

Confirm `backend/inde.js` routes are protected.

```javascript
// In index.js

// Protect this route
app.get('/api', isLoggedIn, (req, res) => {
  res.json({ message: `Hello, ${req.user.displayName}!` });
});

// Additional protected routes can be added similarly
```

**Concept:** Middleware functions like `isLoggedIn` check if the user is authenticated before proceeding.

---

#### 7. Production Considerations

- **Secure Session Secret:**
  - Store secrets securely, e.g., using Vaults.
  
- **HTTPS:**
  - Use HTTPS in production to secure communications.

- **Persistent Sessions:**
  - Consider using a session store (e.g., Redis) for session persistence.

---

### Summary

You've successfully integrated OAuth authentication and authorization into your React and Express application. Users can now log in with Google, and your backend API is protected, allowing access only to authenticated users.

**Key Concepts Recap:**

- **OAuth 2.0:** Allows secure authorization in a simple and standardized way from web, mobile, and desktop applications.
- **Passport.js:** An authentication middleware for Node.js supporting various strategies.
- **Sessions and Cookies:** Used to persist user authentication state between requests.
- **CORS:** Essential for enabling cross-origin requests between your frontend and backend.

---

### Next Steps

- **Explore Refresh Tokens:**
  - Implement token refresh to maintain user sessions without requiring frequent logins.

- **Extend to Other OAuth Providers:**
  - Add additional Passport strategies for providers like Facebook or GitHub.

- **Deploy to Production:**
  - Set up secure environments for your app using services like Heroku, AWS, or Azure.

---

**Note:** Always ensure you're handling user data securely and complying with the OAuth provider's policies and terms of service.

---
