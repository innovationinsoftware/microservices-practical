require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const OAuth2Strategy = require('passport-google-oauth20').Strategy;

// Check for required environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new TypeError('OAuth2Strategy requires a clientID option');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new TypeError('OAuth2Strategy requires a clientSecret option');
}
if (!process.env.SESSION_SECRET) {
  throw new TypeError('Session requires a secret option');
}

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

// Add a route to instruct users to access the login route
app.get('/', (req, res) => {
  res.send('Please login by accessing /auth/google or visit /data to sync with Service B');
});

// Protect /data route
app.get('/data', isAuthenticated, (req, res) => {
  res.send('Hello from Service B (Sync)');
});

app.listen(port, () => {
  console.log(`Service B (Sync) is running on port ${port}`);
});