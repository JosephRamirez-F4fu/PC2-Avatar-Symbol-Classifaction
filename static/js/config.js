const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let painting = false;
const symbols_alphabets = ['ma', 'mb', 'mc', 'md', 'me', 'mf', 'mg', 'mh', 'mi', 'mj', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq',
    'mr', 'ms', 'mt', 'mu', 'mv', 'mw', 'mx', 'my', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'bg', 'bh', 'bi', 'bj', 'bk', 'bl', 'bm', 'bn',
    'bo', 'bp', 'bq', 'br', 'bs', 'bt', 'bu', 'bv', 'bw', 'bx', 'by', 'bz'];
let random_symbol = symbols_alphabets[Math.floor(Math.random() * symbols_alphabets.length)];
let message = document.getElementById('message');
if (message != null) {
    if (random_symbol[0] === 'm') {
        message.innerHTML = 'Draw ' + 'morse '+ random_symbol[1].toUpperCase() + ' symbol';
    }else{
        message.innerHTML = 'Draw ' + 'braille '+ random_symbol[1] + ' symbol';
    }

}


canvas.addEventListener('mousedown', (e) => {
    painting = true;
    draw(e);
});

canvas.addEventListener('mouseup', () => {
    painting = false;
    ctx.beginPath();
});

canvas.addEventListener('mousemove', (e) => {
    if (!painting) return;
    draw(e);
});

function draw(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


function getCanvas() {
    const imageDataURL = canvas.toDataURL('image/png');
    const formData = new FormData();
    formData.append('myImage', imageDataURL);
    formData.append('symbol', random_symbol);
    fetch('/upload', {

        method: 'POST',
        body: formData
    }).then(response => {
        if (response.status === 200) {
            random_symbol = symbols_alphabets[Math.floor(Math.random() * symbols_alphabets.length)];
            if (message != null) {
                if (random_symbol[0] === 'm') {
                    message.innerHTML = 'Draw ' + 'morse ' + random_symbol[1].toUpperCase() + ' symbol';
                } else {
                    message.innerHTML = 'Draw ' + 'braille ' + random_symbol[1].toUpperCase() + ' symbol';
                }

            }

            clearCanvas();

        } else {
            alert('Error al guardar la imagen.');
        }
    });

}

function prepare_model() {
    fetch('/prepare', {
        method: 'GET',
    }).then(response => {
        if (response.status === 200) {
            alert('Modelo preparado exitosamente.');
        } else {
            alert('Error al preparar el modelo.');
        }
    });
}

function predict() {
    const imageDataURL = canvas.toDataURL('image/png');

    const formData = new FormData();
    formData.append('myImage', imageDataURL);
    fetch('/predict', {
        method: 'POST',
        body: formData
    }).then(response => response.text())
        .then(html => {
            document.body.innerHTML = html;
        })
        .catch(
            error => console.error('Error:', error)
        )

}