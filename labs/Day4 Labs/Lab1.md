**Lab Exercises: Day 4 - Testing Microservices**

**General Prerequisites**
*   **Node.js and npm (for Lab 1 & 2):**
    *   **Windows:** Download the installer from [https://nodejs.org/](https://nodejs.org/). Run the installer with default settings.
    *   **Linux (Debian/Ubuntu):** Open a terminal and run `sudo apt update && sudo apt install nodejs npm`
*   **Python (for Lab 3):**
    *   **Windows:** Download the installer from [https://www.python.org/downloads/](https://www.python.org/downloads/). Run the installer and make sure to check the option to "Add Python to PATH" during installation.
    *   **Linux (Debian/Ubuntu):** Open a terminal and run `sudo apt update && sudo apt install python3 python3-pip`

**Lab 1: Advanced Unit Testing and Code Quality (Node.js)**

*   **Title:** Lab 1: Advanced Unit Testing and Code Quality (Node.js)
*   **Objective:** Deepen understanding of TDD, unit testing, code coverage and refactoring.
*   **Concepts Introduced:**
    *   **Test Driven Development (TDD) Cycle**: Write tests first, then the implementation, then refactor the code.
    *   **Unit Testing**: Writing unit tests that test different aspects of your code, including positive, and negative cases.
    *   **Code Coverage**: Measure how much of your code is covered with tests.
   *   **Code Quality Analysis:** Measure code quality using static analysis tools.
    *   **Refactoring:** Improve code structure, readability and maintainability while keeping the tests passing.
*   **Description:** You will create a more robust Node.js microservice that performs basic arithmetic operations, then extend the unit test suite. You will then measure code quality using an automated tool, and refactor the code to improve the quality.
  
*   **Steps:**

    1.  **Create Project Directory:** Open a terminal or command prompt.
        *   Create a new directory: `mkdir advanced-unit-tests && cd advanced-unit-tests`
    2.  **Initialize npm:** Run `npm init -y`. This creates a `package.json` file.
    3. **Install Dependencies:** Install the `jest` testing framework by running `npm install --save-dev jest`, and also install `nyc`, a code coverage tool by running `npm install --save-dev nyc`
    4. **Create a `calculator.js` Module:** Create a file called `calculator.js` and paste the following code, which includes exception cases
   ```javascript
   class Calculator {
    add(x, y) {
        if (typeof x !== 'number' || typeof y !== 'number') {
            throw new Error('Both inputs must be numbers.');
        }
        return x + y;
    }
    subtract(x, y) {
        if (typeof x !== 'number' || typeof y !== 'number') {
          throw new Error('Both inputs must be numbers.');
        }
        return x - y;
    }
        multiply(x, y) {
        if (typeof x !== 'number' || typeof y !== 'number') {
            throw new Error('Both inputs must be numbers.');
        }
        return x * y;
    }
    divide(x, y) {
        if (typeof x !== 'number' || typeof y !== 'number') {
            throw new Error('Both inputs must be numbers.');
        }
       if (y === 0) {
         throw new Error('Cannot divide by zero.');
       }
        return x / y;
      }
    }
    module.exports = Calculator
   ```

  **Explanation:**  This adds several functions to our calculator and also implements basic validation checks before performing math operations, such as validating if the input are numbers or checking for division by zero.


1. **Create `calculator.test.js`:** Create a file called `calculator.test.js` and paste the following code to test all of the functions, and implement tests for various edge cases.
    

    ```javascript
    const Calculator = require('./calculator');

    describe('Calculator class', () => {
      let calculator;

      beforeEach(() => {
        calculator = new Calculator();
      });

      describe('add function', () => {
        it('adds two positive numbers correctly', () => {
         expect(calculator.add(2, 3)).toBe(5);
        });

        it('adds a positive and a negative number correctly', () => {
          expect(calculator.add(-5, 10)).toBe(5);
        });

        it('adds two negative numbers correctly', () => {
         expect(calculator.add(-5, -10)).toBe(-15);
        });

        it('throws an error if inputs are not numbers', () => {
          expect(() => calculator.add('abc', 5)).toThrow(Error);
        });

      });

        describe('subtract function', () => {
            it('subtracts two positive numbers correctly', () => {
              expect(calculator.subtract(5, 2)).toBe(3);
          });

          it('subtracts a positive and a negative number correctly', () => {
            expect(calculator.subtract(-5, 10)).toBe(-15);
          });

          it('subtracts two negative numbers correctly', () => {
           expect(calculator.subtract(-5, -10)).toBe(5);
         });
          it('throws an error if inputs are not numbers', () => {
           expect(() => calculator.subtract('abc', 5)).toThrow(Error);
          });
      });

    describe('multiply function', () => {
        it('multiplies two positive numbers correctly', () => {
            expect(calculator.multiply(2, 3)).toBe(6);
        });
        it('multiplies a positive and a negative number correctly', () => {
            expect(calculator.multiply(-5, 10)).toBe(-50);
        });
        it('multiplies two negative numbers correctly', () => {
          expect(calculator.multiply(-5, -10)).toBe(50);
        });
        it('throws an error if inputs are not numbers', () => {
        expect(() => calculator.multiply('abc', 5)).toThrow(Error);
          });
    });

      describe('divide function', () => {
        it('divides two positive numbers correctly', () => {
          expect(calculator.divide(6, 3)).toBe(2);
          });

        it('divides a positive and a negative number correctly', () => {
            expect(calculator.divide(-10, 2)).toBe(-5);
        });

        it('divides two negative numbers correctly', () => {
            expect(calculator.divide(-10, -2)).toBe(5);
        });

         it('throws an error if divisor is zero', () => {
            expect(() => calculator.divide(10, 0)).toThrow(Error);
         });

           it('throws an error if inputs are not numbers', () => {
            expect(() => calculator.divide(10, 'abc')).toThrow(Error);
           });
        });
    });
    ```

    **Explanation**: You see different kinds of test cases: positive, negative and edge cases. You will also notice the use of the `describe` blocks which are used to group the test cases.
    1.  **Update `package.json`:** Add a test script to the `"scripts"` section, also include nyc to measure code coverage ` "test": "nyc jest"`. Your section should look like this:
         ```json
            "scripts": {
                "test": "nyc jest"
            }
          ```
    2.  **Run tests and see code coverage:** Run `npm test` in your terminal. You should see the test results and a code coverage report, which shows the percentage of code that has been tested.
    3.  **Refactor:** Now, refactor the code so that it has better readability and better organization. Once you are done with the refactoring, run the tests again to ensure everything works as before.

    
2. **Modify the Code to Make Tests Fail:** 
   
   Introduce some intentional errors in the calculator.js file to make the tests fail. For example, change the add function to return `x - y` instead of `x + y`.

    ```javascript
    // filepath: Day4 Labs/Solutions/advanced-unit-tests/calculator.js
    class Calculator {
        add(x, y) {
            if (typeof x !== 'number' || typeof y !== 'number') {
                throw new Error('Both inputs must be numbers.');
            }
            return x - y; // Intentional error
        }
        // ...existing code...
    }
    ```

1. **Run the Tests:** Run `npm test` in your terminal. Observe the failing tests and understand why they are failing.

2. **Fix the Failures:** 

Correct the intentional errors in the calculator.js file to make the tests pass again.

 ```javascript
    // filepath: /Day4 Labs/Solutions/advanced-unit-tests/calculator.js
    class Calculator {
        add(x, y) {
            if (typeof x !== 'number' || typeof y !== 'number') {
                throw new Error('Both inputs must be numbers.');
            }
            return x + y; // Fix the error
        }
        // ...existing code...
    }
```

- **Throw in Curve Balls:** Introduce more complex scenarios and edge cases in your tests. For example, test for very large numbers, very small numbers, and non-integer numbers.

    ```javascript
    // filepath: Day4 Labs/Solutions/advanced-unit-tests/calculator.test.js
    describe('add function', () => {
        // ...existing tests...
        it('adds very large numbers correctly', () => {
            expect(calculator.add(1e10, 1e10)).toBe(2e10);
        });

        it('adds very small numbers correctly', () => {
            expect(calculator.add(1e-10, 1e-10)).toBe(2e-10);
        });

        it('adds non-integer numbers correctly', () => {
            expect(calculator.add(1.5, 2.5)).toBe(4);
        });
    });
    ```

2. **Refactor the Code:** 
   Refactor the calculator.js file to improve readability and organization. For example, you can extract the validation logic into a separate method.

    ```javascript
    // filepath: Day4 Labs/Solutions/advanced-unit-tests/calculator.js
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
    }

    module.exports = Calculator;
    ```

1. **Add More Complex Behavior and Tests:** 
   Extend the Calculator class to include more complex operations, such as exponentiation and square root, and write tests for these new operations.

    ```javascript
    // filepath: Day4 Labs/Solutions/advanced-unit-tests/calculator.js
    class Calculator {
        // ...existing code...

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
    ```

    ```javascript
    // filepath: Day4 Labs/Solutions/advanced-unit-tests/calculator.test.js
    describe('exponentiate function', () => {
        it('exponentiates two positive numbers correctly', () => {
            expect(calculator.exponentiate(2, 3)).toBe(8);
        });

        it('throws an error if inputs are not numbers', () => {
            expect(() => calculator.exponentiate('abc', 5)).toThrow(Error);
        });
    });

    describe('sqrt function', () => {
        it('calculates the square root of a positive number correctly', () => {
            expect(calculator.sqrt(4)).toBe(2);
        });

        it('throws an error if input is not a number', () => {
            expect(() => calculator.sqrt('abc')).toThrow(Error);
        });

        it('throws an error if input is a negative number', () => {
            expect(() => calculator.sqrt(-4)).toThrow(Error);
        });
    });
    ```

1. **Update `package.json`:** Add a test script to the `"scripts"` section, also include nyc to measure code coverage ` "test": "nyc jest"`. Your section should look like this:
    ```json
    "scripts": {
        "test": "nyc jest"
    }
    ```

2. **Run Tests and See Code Coverage:** Run `npm test` in your terminal. You should see the test results and a code coverage report, which shows the percentage of code that has been tested.

3. **Refactor:** Now, refactor the code so that it has better readability and better organization. Once you are done with the refactoring, run the tests again to ensure everything works as before.