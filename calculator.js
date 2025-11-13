// Encapsulate calculator logic in a function to make it reusable
function initializeCalculator(calculatorElement) {
    const display = calculatorElement.querySelector('.display-current'); // Use class
    const historyDisplay = calculatorElement.querySelector('.display-history'); // Use class
    const buttons = calculatorElement.querySelectorAll('.buttons button');

    let currentInput = '';
    let operator = null;
    let previousValue = null;
    let currentExpression = '';

    // --- Core Calculation Logic (Same as before) ---
    function calculate(prev, op, current) {
        const num1 = parseFloat(prev);
        const num2 = parseFloat(current);
        if (isNaN(num1) || isNaN(num2)) return 'Error'; // More robust error handling for display

        switch (op) {
            case 'add': return num1 + num2;
            case 'subtract': return num1 - num2;
            case 'multiply': return num1 * num2;
            case 'divide': 
                if (num2 === 0) return 'Error: Div by 0'; 
                return num1 / num2;
            case 'calculate-mod': return num1 % num2;
            default: return current;
        }
    }

    // --- Core Action Handler (Unified logic for clicks and keys) ---
    function handleAction(action, value) {
        if (action === 'number' || action === 'decimal') {
            if (action === 'decimal' && currentInput.includes('.')) return;
            
            const textToAppend = value;
            currentInput = (currentInput === '' && textToAppend === '0') ? '0' : 
                           (currentInput === '0' && textToAppend !== '.') ? textToAppend : 
                           currentInput + textToAppend;
            
            display.value = currentInput;
            return;
        }

        if (action === 'clear') {
            currentInput = '';
            operator = null;
            previousValue = null;
            currentExpression = '';
            display.value = '';
            historyDisplay.textContent = '';
            return;
        }

        if (action === 'delete') {
            currentInput = currentInput.slice(0, -1);
            display.value = currentInput || '';
            return;
        }

        if (action === 'equals') {
            if (previousValue && operator && currentInput) {
                // Get the operator symbol for the display from the data-action
                const opButton = calculatorElement.querySelector(`[data-action="${operator}"]`);
                const opSymbol = opButton ? opButton.innerText : operator; // Fallback if button not found
                
                currentExpression = `${previousValue} ${opSymbol} ${currentInput} =`;
                
                const result = calculate(previousValue, operator, currentInput);
                
                historyDisplay.textContent = currentExpression;
                display.value = result.toString();
                
                currentInput = result.toString(); 
                previousValue = null;
                operator = null;
            }
            return;
        }

        if (['add', 'subtract', 'multiply', 'divide', 'calculate-mod'].includes(action)) {
            if (currentInput || previousValue) { 
                if (currentInput) {
                    if (previousValue && operator) {
                        previousValue = calculate(previousValue, operator, currentInput);
                    } else {
                        previousValue = currentInput;
                    }
                } else if (previousValue && !currentInput) {
                    // Allows changing operator before entering second number
                }
                
                operator = action;
                currentInput = '';
                
                const opButton = calculatorElement.querySelector(`[data-action="${operator}"]`);
                const opSymbol = opButton ? opButton.innerText : operator;
                currentExpression = `${previousValue} ${opSymbol}`;

                historyDisplay.textContent = currentExpression;
                display.value = previousValue; 
            }
            return;
        }
    }

    // --- Event Listener for Mouse Clicks (specific to this calculator instance) ---
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            const value = button.innerText;

            if (button.classList.contains('number') || button.classList.contains('decimal')) {
                handleAction(button.classList.contains('decimal') ? 'decimal' : 'number', value);
            } else {
                handleAction(action, value);
            }
        });
    });

    // --- Event Listener for Keyboard Input (applied globally, but targets active calculator) ---
    // This part requires careful handling to ensure only the focused calculator reacts.
    // For simplicity, we'll keep the global listener but ensure it's not duplicating efforts
    // if multiple calculators are active. This might need more advanced focus management
    // if you want strict per-calculator keyboard input.
    // For now, it will apply to the 'last interacted with' calculator if states are separate.
}

document.addEventListener('DOMContentLoaded', () => {
    const calculators = document.querySelectorAll('.calculator');
    calculators.forEach(calc => {
        initializeCalculator(calc);
    });

    // --- Global Keyboard Input Listener (Now needs to be outside the function) ---
    // This listens for key presses on the entire document. 
    // You'll need to decide how to route keyboard input to a specific calculator 
    // if you have multiple on screen. A simple approach is to let it interact with
    // the first calculator, or the one that last received a mouse click if you track focus.
    // For this example, we'll just have it interact with the FIRST calculator instance.
    // To make it interact with the LAST FOCUSED, you would need to track which calculator 
    // element is currently "active" or "focused".

    // For now, let's keep the global keyboard listener. It will operate on the states 
    // that are *globally* available (which is not ideal for separate calculator instances).
    // To fix this, we need to pass the currently active calculator's display and state.

    // A more robust solution for keyboard input with multiple calculators:
    // We need to know which calculator is "active" for keyboard input.
    // Let's modify the initializeCalculator to also handle its own keyboard events IF it's focused.
    // Or, have the global keydown dispatch to the last clicked calculator.

    let activeCalculatorInstance = null; // Track the last clicked calculator instance

    // Re-initialize all calculators and add event listeners
    document.querySelectorAll('.calculator').forEach(calcElement => {
        const instance = new Calculator(calcElement); // Assuming a class-based Calculator now
        
        // Add a click listener to the calculator itself to mark it as active
        calcElement.addEventListener('click', () => {
            activeCalculatorInstance = instance;
        });
    });

    // Global keyboard listener
    document.addEventListener('keydown', (e) => {
        if (!activeCalculatorInstance) return; // Only process if an instance is active

        const key = e.key;
        const keyMap = {
            '0': {action: 'number', value: '0'}, '1': {action: 'number', value: '1'}, 
            '2': {action: 'number', value: '2'}, '3': {action: 'number', value: '3'},
            '4': {action: 'number', value: '4'}, '5': {action: 'number', value: '5'}, 
            '6': {action: 'number', value: '6'}, '7': {action: 'number', value: '7'},
            '8': {action: 'number', value: '8'}, '9': {action: 'number', value: '9'},
            '.': {action: 'decimal', value: '.'},
            '/': {action: 'divide', value: '÷'},
            '*': {action: 'multiply', value: '×'},
            '-': {action: 'subtract', value: '-'},
            '+': {action: 'add', value: '+'},
            '%': {action: 'calculate-mod', value: '%'},
            'Enter': {action: 'equals', value: '='},
            '=': {action: 'equals', value: '='},
            'Backspace': {action: 'delete', value: 'DEL'},
            'Delete': {action: 'clear', value: 'AC'}, 
        };

        const mappedAction = keyMap[key];

        if (mappedAction) {
            e.preventDefault(); 
            activeCalculatorInstance.handleAction(mappedAction.action, mappedAction.value);
            
            // Visual feedback: Find and 'press' the corresponding button within the active calculator
            const pressedButton = activeCalculatorInstance.calculatorElement.querySelector(
                `[data-action="${mappedAction.action}"], 
                 .number:not([data-action])[value="${mappedAction.value}"]`
            );
            if (pressedButton) {
                pressedButton.classList.add('active');
                setTimeout(() => {
                    pressedButton.classList.remove('active');
                }, 100);
            }
        }
    });
});

// To make the keyboard handling more robust for multiple instances,
// it's better to wrap the calculator logic in a Class.

class Calculator {
    constructor(calculatorElement) {
        this.calculatorElement = calculatorElement;
        this.display = calculatorElement.querySelector('.display-current');
        this.historyDisplay = calculatorElement.querySelector('.display-history');
        this.buttons = calculatorElement.querySelectorAll('.buttons button');

        this.currentInput = '';
        this.operator = null;
        this.previousValue = null;
        this.currentExpression = '';

        this.addEventListeners();
    }

    // --- Core Calculation Logic ---
    calculate(prev, op, current) {
        const num1 = parseFloat(prev);
        const num2 = parseFloat(current);
        if (isNaN(num1) || isNaN(num2)) return 'Error';

        switch (op) {
            case 'add': return num1 + num2;
            case 'subtract': return num1 - num2;
            case 'multiply': return num1 * num2;
            case 'divide': 
                if (num2 === 0) return 'Error: Div by 0'; 
                return num1 / num2;
            case 'calculate-mod': return num1 % num2;
            default: return current;
        }
    }

    // --- Core Action Handler ---
    handleAction(action, value) {
        if (action === 'number' || action === 'decimal') {
            if (action === 'decimal' && this.currentInput.includes('.')) return;
            
            const textToAppend = value;
            this.currentInput = (this.currentInput === '' && textToAppend === '0') ? '0' : 
                                (this.currentInput === '0' && textToAppend !== '.') ? textToAppend : 
                                this.currentInput + textToAppend;
            
            this.display.value = this.currentInput;
            return;
        }

        if (action === 'clear') {
            this.currentInput = '';
            this.operator = null;
            this.previousValue = null;
            this.currentExpression = '';
            this.display.value = '';
            this.historyDisplay.textContent = '';
            return;
        }

        if (action === 'delete') {
            this.currentInput = this.currentInput.slice(0, -1);
            this.display.value = this.currentInput || '';
            return;
        }

        if (action === 'equals') {
            if (this.previousValue && this.operator && this.currentInput) {
                const opButton = this.calculatorElement.querySelector(`[data-action="${this.operator}"]`);
                const opSymbol = opButton ? opButton.innerText : this.operator;
                
                this.currentExpression = `${this.previousValue} ${opSymbol} ${this.currentInput} =`;
                
                const result = this.calculate(this.previousValue, this.operator, this.currentInput);
                
                this.historyDisplay.textContent = this.currentExpression;
                this.display.value = result.toString();
                
                this.currentInput = result.toString(); 
                this.previousValue = null;
                this.operator = null;
            }
            return;
        }

        if (['add', 'subtract', 'multiply', 'divide', 'calculate-mod'].includes(action)) {
            if (this.currentInput || this.previousValue) { 
                if (this.currentInput) {
                    if (this.previousValue && this.operator) {
                        this.previousValue = this.calculate(this.previousValue, this.operator, this.currentInput);
                    } else {
                        this.previousValue = this.currentInput;
                    }
                }
                
                this.operator = action;
                this.currentInput = '';
                
                const opButton = this.calculatorElement.querySelector(`[data-action="${this.operator}"]`);
                const opSymbol = opButton ? opButton.innerText : this.operator;
                this.currentExpression = `${this.previousValue} ${opSymbol}`;

                this.historyDisplay.textContent = this.currentExpression;
                this.display.value = this.previousValue; 
            }
            return;
        }
    }

    addEventListeners() {
        this.buttons.forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                const value = button.innerText;

                if (button.classList.contains('number') || button.classList.contains('decimal')) {
                    this.handleAction(button.classList.contains('decimal') ? 'decimal' : 'number', value);
                } else {
                    this.handleAction(action, value);
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const calculatorElements = document.querySelectorAll('.calculator');
    let activeCalculatorInstance = null; // Track the last clicked calculator instance

    calculatorElements.forEach(calcElement => {
        const instance = new Calculator(calcElement);
        
        // Add a click listener to the calculator element itself to mark it as active
        calcElement.addEventListener('click', () => {
            activeCalculatorInstance = instance;
            // Optional: Add a visual cue for the active calculator
            calculatorElements.forEach(c => c.classList.remove('active-calculator'));
            calcElement.classList.add('active-calculator');
        });
    });

    // Global keyboard listener
    document.addEventListener('keydown', (e) => {
        if (!activeCalculatorInstance) return; // Only process if an instance is active

        const key = e.key;
        const keyMap = {
            '0': {action: 'number', value: '0'}, '1': {action: 'number', value: '1'}, 
            '2': {action: 'number', value: '2'}, '3': {action: 'number', value: '3'},
            '4': {action: 'number', value: '4'}, '5': {action: 'number', value: '5'}, 
            '6': {action: 'number', value: '6'}, '7': {action: 'number', value: '7'},
            '8': {action: 'number', value: '8'}, '9': {action: 'number', value: '9'},
            '.': {action: 'decimal', value: '.'},
            '/': {action: 'divide', value: '÷'},
            '*': {action: 'multiply', value: '×'},
            '-': {action: 'subtract', value: '-'},
            '+': {action: 'add', value: '+'},
            '%': {action: 'calculate-mod', value: '%'},
            'Enter': {action: 'equals', value: '='},
            '=': {action: 'equals', value: '='},
            'Backspace': {action: 'delete', value: 'DEL'},
            'Delete': {action: 'clear', value: 'AC'}, 
        };

        const mappedAction = keyMap[key];

        if (mappedAction) {
            e.preventDefault(); 
            activeCalculatorInstance.handleAction(mappedAction.action, mappedAction.value);
            
            const pressedButton = activeCalculatorInstance.calculatorElement.querySelector(
                `[data-action="${mappedAction.action}"], 
                 .number:not([data-action])[value="${mappedAction.value}"]`
            );
            // Handle number keys which might not have data-action
            if (!pressedButton && mappedAction.action === 'number') {
                const numberButtons = activeCalculatorInstance.calculatorElement.querySelectorAll('.number');
                for (let btn of numberButtons) {
                    if (btn.innerText === mappedAction.value) {
                        btn.classList.add('active');
                        setTimeout(() => {
                            btn.classList.remove('active');
                        }, 100);
                        break;
                    }
                }
            } else if (pressedButton) {
                pressedButton.classList.add('active');
                setTimeout(() => {
                    pressedButton.classList.remove('active');
                }, 100);
            }
        }
    });
});