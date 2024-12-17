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
