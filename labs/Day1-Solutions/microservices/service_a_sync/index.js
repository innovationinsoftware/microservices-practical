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