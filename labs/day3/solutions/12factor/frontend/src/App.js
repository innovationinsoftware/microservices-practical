// App.js
import React, { useEffect, useState } from 'react';
import { Container, Alert } from 'reactstrap';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api')
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <Container className="mt-5">
      <Alert variant="success">
        <h1>{message}</h1>
      </Alert>
    </Container>
  );
}

export default App;