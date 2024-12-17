require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const fs = require('fs');

const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Read secrets from Docker secrets files
const GOOGLE_CLIENT_ID = fs.readFileSync('/run/secrets/google_client_id', 'utf8').trim();
const GOOGLE_CLIENT_SECRET = fs.readFileSync('/run/secrets/google_client_secret', 'utf8').trim();
const SESSION_SECRET = fs.readFileSync('/run/secrets/session_secret', 'utf8').trim();

const app = express();
const port = process.env.PORT || 3001;

// Configure session middleware
app.use(session({
  secret: SESSION_SECRET, // Replace with a secure secret
  resave: false,
  saveUninitialized: true,
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan('combined'));
app.use(helmet());
// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Add this near the top of index.js
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
});

// Apply rate limiting to all requests
app.use(limiter);

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