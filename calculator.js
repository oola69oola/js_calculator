document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const historyDisplay = document.getElementById('history-display'); // History display element
    const buttons = document.querySelectorAll('.buttons button');

    let currentInput = '';
    let operator = null;
    let previousValue = null;
    let currentExpression = '';

    // --- Core Calculation Logic ---
    function calculate(prev, op, current) {
        const num1 = parseFloat(prev);
        const num2 = parseFloat(current);
        if (isNaN(num1) || isNaN(num2)) return current;

        switch (op) {
            case 'add': return num1 + num2;
            case 'subtract': return num1 - num2;
            case 'multiply': return num1 * num2;
            case 'divide': 
                if (num2 === 0) return 'Error'; // Division by zero handling
                return num1 / num2;
            case 'calculate-mod': return num1 % num2;
            default: return current;
        }
    }

    // --- Core Action Handler (Unified logic for clicks and keys) ---
    function handleAction(action, value) {
        // --- 1. NUMBER / DECIMAL HANDLER ---
        if (action === 'number' || action === 'decimal') {
            if (action === 'decimal' && currentInput.includes('.')) return;
            
            // Logic to prevent multiple leading zeros or replacing zero if typing a number
            const textToAppend = value;
            currentInput = (currentInput === '' && textToAppend === '0') ? '0' : 
                           (currentInput === '0' && textToAppend !== '.') ? textToAppend : 
                           currentInput + textToAppend;
            
            display.value = currentInput;
            return;
        }

        // --- 2. SPECIAL ACTIONS (Clear, Delete, Equals) ---
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
                // Get the operator symbol for the display
                const opSymbol = document.querySelector(`[data-action="${operator}"]`).innerText;
                currentExpression = `${previousValue} ${opSymbol} ${currentInput} =`;
                
                // Perform calculation
                const result = calculate(previousValue, operator, currentInput).toString();
                
                // Update displays
                historyDisplay.textContent = currentExpression;
                display.value = result;
                
                // Reset state, but set result as currentInput for immediate reuse
                currentInput = result; 
                previousValue = null;
                operator = null;
            }
            return;
        }

        // --- 3. ARITHMETIC OPERATORS ---
        if (['add', 'subtract', 'multiply', 'divide', 'calculate-mod'].includes(action)) {
            
            // If the user has just finished a calculation (previousValue is null)
            // or if the user is typing the first number (currentInput is set)
            if (currentInput || previousValue) { 
                
                if (currentInput) {
                    // Chained calculation: Execute pending calculation first
                    if (previousValue && operator) {
                        previousValue = calculate(previousValue, operator, currentInput);
                    } else {
                        // Start of a new calculation
                        previousValue = currentInput;
                    }
                } else if (previousValue && !currentInput) {
                    // User is changing the operator, no need to recalculate
                }
                
                // Update the state and display
                operator = action;
                currentInput = '';
                
                // Update history display
                const opSymbol = document.querySelector(`[data-action="${operator}"]`).innerText;
                currentExpression = `${previousValue} ${opSymbol}`;

                historyDisplay.textContent = currentExpression;
                display.value = previousValue; 
            }
            return;
        }
    }


    // --- Event Listener for Mouse Clicks ---
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            const value = button.innerText;

            if (button.classList.contains('number') || button.classList.contains('decimal')) {
                // Pass 'number' or 'decimal' as the action type
                handleAction(button.classList.contains('decimal') ? 'decimal' : 'number', value);
            } else {
                handleAction(action, value);
            }
        });
    });

    // --- Event Listener for Keyboard Input ---
    document.addEventListener('keydown', (e) => {
        const key = e.key;

        // Map keyboard keys to calculator actions
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
            handleAction(mappedAction.action, mappedAction.value);
            
            // Visual feedback: Find and 'press' the corresponding button
            const pressedButton = document.querySelector(
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