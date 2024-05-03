// matrix-rain.js

function generateMatrixRain() {
    var canvas = document.getElementById('matrix-rain');
    var context = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var katakana = 'ァアカサタナハマヤラワン';
    var latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var nums = '0123456789';

    var characters = katakana + latin + nums;
    characters = characters.split('');

    var fontSize = 10;
    var columns = canvas.width / fontSize;
    var drops = [];

    for (var x = 0; x < columns; x++) {
        drops[x] = 1;
    }

    function draw() {
        context.fillStyle = 'rgba(0, 0, 0, 0.05)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = '#0F0';
        context.font = fontSize + 'px monospace';

        for (var i = 0; i < drops.length; i++) {
            var text = characters[Math.floor(Math.random() * characters.length)];
            context.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 33);
}

window.onresize = function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};

generateMatrixRain();

// Typing effect for the "Game Over" text
const gameOverText = document.getElementById('gameOverText');
const text = 'GAME OVER';
let index = 0;

function typeGameover() {
    if (index < text.length) {
        gameOverText.textContent += text[index++];
        setTimeout(typeGameover, 500); // Delay between each character
    }
}

// Call the typing effect function
typeGameover();
