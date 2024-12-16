const request = require('supertest');
const app = require('./server');

describe('Test GET /hello end points', () => {

it('responds to GET /hello with 200', async () => {
    const response = await request(app).get('/hello');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: 'Hello, World!' });
    });

it('responds to GET /hello/<name> with 200', async () => {
    const response = await request(app).get('/hello/john');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: 'Hello, john!' });
});
});

describe('Test POST /math endpoints', () => {
it('responds to POST /math add with 200', async () => {
    const response = await request(app).post('/math').send({ operation: 'add', x: 2, y: 3})
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({result: 5 });
});

it('responds to POST /math subtract with 200', async () => {
    const response = await request(app).post('/math').send({ operation: 'subtract', x: 5, y: 3})
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({result: 2 });
});

it('responds to POST /math multiply with 200', async () => {
    const response = await request(app).post('/math').send({ operation: 'multiply', x: 5, y: 3})
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({result: 15 });
});

it('responds to POST /math divide with 200', async () => {
    const response = await request(app).post('/math').send({ operation: 'divide', x: 6, y: 3})
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({result: 2 });
});

it('responds to POST /math divide with error message', async () => {
    const response = await request(app).post('/math').send({ operation: 'divide', x: 6, y: 0})
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: 'Can not divide by zero' });
});

it('responds to POST /math with invalid input', async () => {
    const response = await request(app).post('/math').send({ operation: 'divide', x: 6, y: 'abc'})
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: 'X and Y values must be a number' });
});


it('responds to POST /math with invalid operation', async () => {
    const response = await request(app).post('/math').send({ operation: 'invalid', x: 6, y: 3})
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: 'Operation must be add, subtract, multiply or divide' });
    });
});