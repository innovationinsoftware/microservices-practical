const amqp = require('amqplib');
const passport = require('passport');
const session = require('express-session');
const express = require('express');
const OAuth2Strategy = require('passport-google-oauth20').Strategy;

const amqpUrl = process.env.AMQP_URL || 'amqp://rabbitmq:5672';

// Initialize Express for OAuth (if needed)
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