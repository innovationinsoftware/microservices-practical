# **Lab 2: Integration Testing a REST API and Edge Cases (Node.js)**

##  **Objective:** Enhance understanding of integration testing and API contracts, with a focus on edge case handling.
##   **Concepts Introduced:**
*   **Integration Testing:** Testing interactions between different modules or services.
*   **RESTful API Design:** Best practices for designing RESTful services.
*   **Edge Case Handling:** Testing unusual or boundary conditions of an API.
**Description:** You will extend the API from the previous lab, and add more advanced features, such as handling errors and specific edge cases.

## **Steps:**
### **Create Project Directory** 
1.  Open a terminal or command prompt.
2.  Create a new directory: `mkdir advanced-integration-tests && cd advanced-integration-tests`
3.  **Initialize npm:** Run `npm init -y`.
4.  **Install dependencies:** Run `npm install express supertest body-parser`.
5. **Install dev dependencies:** Run `npm install --save-dev jest`
6.  **Create `server.js`:** Create a file called `server.js` and paste the following code that includes a new `/math` route which accepts JSON data to perform the operation.

```javascript
    const express = require('express');
    const app = express();
    const bodyParser = require('body-parser');
    const port = 3000;

    app.use(bodyParser.json());

    app.get('/hello', (req, res) => {
        res.json({ message: 'Hello, World!' });
    });

    app.get('/hello/:name', (req, res) => {
    res.json({ message: `Hello, ${req.params.name}!` });
    });

    app.post('/math', (req, res) => {
    const { operation, x, y } = req.body;

        if (typeof x !== 'number' || typeof y !== 'number')
    {
        res.status(400).json({ error: 'X and Y values must be a number' })
        return
    }


    try {
        let result
        if(operation === 'add') {
            result = x + y
        } else if (operation == 'subtract') {
        result = x - y;
        } else if (operation == 'multiply') {
        result = x * y;
        }
        else if (operation == 'divide') {
            if (y === 0) {
                    return res.status(400).json({error: 'Can not divide by zero'})
            }
            result = x / y
        }else {
            return res.status(400).json({error: 'Operation must be add, subtract, multiply or divide'})
        }
        res.status(200).json({result});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});


app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});

module.exports = app;
```

**Explanation**: The server now has a new route that can use JSON to perform an operation with two numbers. This route can return both successful and failure results, and also checks input data.

### **Create `server.test.js`** 

- Create a file called `server.test.js` and paste the following code:

```javascript
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
```

**Explanation:** We will be testing the various end points and their expected behaviours including errors

### **Update `package.json`:** 
 
- Add a test script to the `"scripts"` section: `"test": "jest"`. Your section should look like this:
    ```json
        "scripts": {
        "test": "jest"
        }
    ```
1.  **Run Tests:** Run `npm test` in your terminal. All tests should pass.
