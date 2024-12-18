// App.js
import React, { useEffect, useState } from 'react';
import { Container, Typography, Alert } from '@mui/material';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api')
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <Container className="mt-5">
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="h4">{message}</Typography>
      </Alert>
    </Container>
  );
}

export default App;