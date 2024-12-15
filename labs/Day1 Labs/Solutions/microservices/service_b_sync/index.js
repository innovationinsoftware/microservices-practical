const express = require('express');

const app = express();
const port = process.env.PORT || 3001;

app.get('/data', (req, res) => {
  res.send('Hello from Service B (Sync)');
});

app.listen(port, () => {
  console.log(`Service B (Sync) is running on port ${port}`);
});