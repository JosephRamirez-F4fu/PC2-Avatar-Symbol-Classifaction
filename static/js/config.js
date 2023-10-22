const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let painting = false;
const symbols_chinese = ['air', 'fire', 'water', 'earth'];

let random_symbol = symbols_chinese[Math.floor(Math.random() * symbols_chinese.length)];

let message = document.getElementById('message');
if(message != null){
    message.innerHTML = 'Draw ' + random_symbol + ' symbol';
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

    ctx.lineWidth = 5;
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
            random_symbol = symbols_chinese[Math.floor(Math.random() * symbols_chinese.length)];
            message.innerHTML = 'Draw ' + random_symbol + ' symbol';
            clearCanvas();

        } else {
            alert('Error al guardar la imagen.');
        }
    });

}

function prepare_model(){
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
        .then(html=>{
            document.body.innerHTML = html;
        })
        .catch(
            error => console.error('Error:', error)
        )

}