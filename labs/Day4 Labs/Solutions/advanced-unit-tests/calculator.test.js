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
});