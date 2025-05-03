const display = document.querySelector('.display');
const buttons = document.querySelectorAll('button');
let current = '';
let operator = '';
let previous = '';

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const value = button.textContent;

    if (value === 'AC') {
      current = '';
      operator = '';
      previous = '';
      display.value = '';
    } else if (value === '+/-') {
      current = (parseFloat(current) * -1).toString();
      display.value = current;
    } else if (value === '%') {
      current = (parseFloat(current) / 100).toString();
      display.value = current;
    } else if (value === '+' || value === '-' || value === '*' || value === '/') {
      if (current === '') return;
      operator = value;
      previous = current;
      current = '';
    } else if (value === '=') {
      if (operator === '' || current === '' || previous === '') return;
      const result = eval(`${parseFloat(previous)} ${operator} ${parseFloat(current)}`);
      current = result.toString();
      operator = '';
      previous = '';
      display.value = current;
    } else if (value === '√') {
        const num = parseFloat(current);
        if (isNaN(num)) {
            display.value = 'Error';
            current = '';
            return;
        }
        if (num < 0) {
            display.value = 'Invalid';
            current = '';
            return;
        }
        current = Math.sqrt(num).toString();
        display.value = current;
    } else {
      current += value;
      display.value = current;
    }
  });
});