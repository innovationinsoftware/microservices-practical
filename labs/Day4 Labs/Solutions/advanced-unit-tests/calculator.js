class Calculator {
    validateInputs(x, y) {
        if (typeof x !== 'number' || typeof y !== 'number') {
            throw new Error('Both inputs must be numbers.');
        }
    }

    add(x, y) {
        this.validateInputs(x, y);
        return x + y;
    }

    subtract(x, y) {
        this.validateInputs(x, y);
        return x - y;
    }

    multiply(x, y) {
        this.validateInputs(x, y);
        return x * y;
    }

    divide(x, y) {
        this.validateInputs(x, y);
        if (y === 0) {
            throw new Error('Cannot divide by zero.');
        }
        return x / y;
    }

    exponentiate(x, y) {
        this.validateInputs(x, y);
        return Math.pow(x, y);
    }

    sqrt(x) {
        if (typeof x !== 'number') {
            throw new Error('Input must be a number.');
        }
        if (x < 0) {
            throw new Error('Cannot take square root of a negative number.');
        }
        return Math.sqrt(x);
    }
}

module.exports = Calculator;