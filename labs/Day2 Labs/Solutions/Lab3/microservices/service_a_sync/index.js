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