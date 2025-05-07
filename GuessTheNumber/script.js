document.getElementById('startBtn').addEventListener('click', function() {
    document.getElementById('startScreen').style.display = 'none';

    document.querySelector('.buttons').style.display = 'flex';
    document.querySelector('.main-buttons').style.display = 'flex';
    document.querySelector('.number1').style.display = 'block';
    document.querySelector('.number999').style.display = 'block';
    document.querySelector('.numberTurns').style.display = 'block';
    document.querySelector('.question-mark').style.display = 'block';
    document.querySelector('.lessThan1up').style.display = 'block';
    document.querySelector('.lessThan1down').style.display = 'block';
    document.querySelector('.lessThan2up').style.display = 'block';
    document.querySelector('.lessThan2down').style.display = 'block';
    document.querySelector('.turns').style.display = 'block';

    startGame();
});

function startGame() {
    let secretNumber = Math.floor(Math.random() * 10) + 1;
    let currentGuess = '';
    let turns = 0;
    let min = 1;
    let max = 10;

    const buttons = document.querySelectorAll('.buttons button');
    const guessBtn = document.querySelector('.main-buttons button:nth-child(1)');
    const clearBtn = document.querySelector('.main-buttons button:nth-child(2)');
    const questionMark = document.querySelector('.question-mark');
    const numberLeft = document.querySelector('.number1');
    const numberRight = document.querySelector('.number999');
    const turnsNumber = document.querySelector('.numberTurns');

    function updateQuestionMark(value) {
        questionMark.style.backgroundImage = 'none';
        questionMark.textContent = value;
        questionMark.style.fontSize = '120px';
        questionMark.style.color = 'cadetblue';
        questionMark.style.display = 'flex';
        questionMark.style.alignItems = 'center';
        questionMark.style.justifyContent = 'center';
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentGuess.length < 3) {
                currentGuess += button.textContent;
                updateQuestionMark(currentGuess);
            }
        });
    });

    clearBtn.addEventListener('click', () => {
        currentGuess = '';
        questionMark.style.backgroundImage = 'url("questionMark.png")';
        questionMark.textContent = '';
    });

    guessBtn.addEventListener('click', () => {
        const guess = parseInt(currentGuess);
        turns++;
        turnsNumber.textContent = `${turns}`;

        if (guess === secretNumber) {
            showCongratulations(turns);
            return;
        } else if (guess < secretNumber) {
            min = Math.max(min, guess);
            numberLeft.textContent = min;
        } else {
            max = Math.min(max, guess);
            numberRight.textContent = max;
        }

        // Проверка за минимална разлика между min и max
        if ((max - min) === 2) {
            if (guess < secretNumber) {
                min = guess; // Ако номерът е по-малък, задаваме min да е равно на guess + 1
                numberLeft.textContent = min;
            } else {
                max = guess; // Ако номерът е по-голям, задаваме max да е равно на guess - 1
                numberRight.textContent = max;
            }
        }

        resetGuess();
    });

    function resetGuess() {
        currentGuess = '';
        questionMark.style.backgroundImage = 'url("questionMark.png")';
        questionMark.textContent = '';
    }

    function showCongratulations(turns) {
        document.body.innerHTML = `
            <div style="
                font-family: fantasy; 
                font-size: 100px; 
                font-weight: bold; 
                color: rgba(12, 226, 155, 0.737); 
                margin-top: 100px; 
                margin-left: -200px;
                text-align: center;">
                CONGRATULATIONS! <br> ${turns} TURNS
            </div>
            <button class="replay-button" style="
                margin-top: 40px; 
                margin-left: 440px; 
                padding: 15px 30px; 
                font-family: fantasy; 
                font-weight: bold; 
                font-size: 50px;
                width: 200px;
                height: 80px;
                border-radius: 10px;
                padding: 20px;
                display: flex;
                justify-content: center; 
                align-items: center; 
                color:white;
                box-shadow: 2px 4px aquamarine;
                border: solid rgba(127, 255, 212, 0.642);
                background-color: rgba(12, 226, 155, 0.737);">
                Replay
                </button>
        `;

        document.querySelector('.replay-button').addEventListener('click', () => {
            location.reload();
        });
    }
}