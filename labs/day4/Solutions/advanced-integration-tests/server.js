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