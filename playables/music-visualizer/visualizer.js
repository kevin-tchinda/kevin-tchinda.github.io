const canvas = document.getElementById('visualizerCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    const container = canvas.parentElement;
    const width = Math.min(container.clientWidth - 40, 1000);
    canvas.width = width;
    canvas.height = width * 0.5;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Audio context and analyser
let audioContext = null;
let analyser = null;
let source = null;
let animationId = null;
let isActive = false;
let currentSource = null;

// Visualization mode
let currentMode = 'bars';

// Mode buttons
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
    });
});

// Stop current audio
async function stopAudio() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    if (source) {
        try {
            source.disconnect();
        } catch(e) {}
        source = null;
    }
    
    if (audioContext) {
        await audioContext.close();
        audioContext = null;
    }
    
    isActive = false;
    analyser = null;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Setup analyser and start visualization with audio output
function setupAudioSource(sourceNode, sourceType) {
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    sourceNode.connect(analyser);
    
    // Connect to speakers to hear the audio
    sourceNode.connect(audioContext.destination);
    
    isActive = true;
    currentSource = sourceType;
    startVisualization();
}

// Start visualization loop
function startVisualization() {
    if (animationId) cancelAnimationFrame(animationId);
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
        if (!isActive || !analyser) {
            if (animationId) cancelAnimationFrame(animationId);
            return;
        }
        
        analyser.getByteFrequencyData(dataArray);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1C1A17');
        gradient.addColorStop(1, '#2C2824');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (currentMode === 'bars') {
            drawBars(dataArray, bufferLength);
        } else if (currentMode === 'circle') {
            drawCircle(dataArray, bufferLength);
        } else if (currentMode === 'wave') {
            drawWave(dataArray, bufferLength);
        }
        
        animationId = requestAnimationFrame(draw);
    }
    
    draw();
}

// Request microphone access
document.getElementById('requestMicBtn').addEventListener('click', async () => {
    try {
        await stopAudio();
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        source = audioContext.createMediaStreamSource(stream);
        
        await audioContext.resume();
        
        setupAudioSource(source, 'mic');
        document.getElementById('statusMsg').innerHTML = '<ion-icon name="mic-outline"></ion-icon> Microphone actif';
        
    } catch (err) {
        console.error('Microphone error:', err);
        document.getElementById('statusMsg').innerHTML = '<ion-icon name="alert-circle-outline"></ion-icon> Impossible d\'accéder au microphone';
        isActive = false;
    }
});

// Import audio file
const audioFileInput = document.getElementById('audioFile');
audioFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
        await stopAudio();
        
        const arrayBuffer = await file.arrayBuffer();
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true;
        
        await audioContext.resume();
        
        setupAudioSource(source, 'file');
        source.start();
        
        const fileName = file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name;
        document.getElementById('statusMsg').innerHTML = `<ion-icon name="musical-notes-outline"></ion-icon> Lecture: ${fileName}`;
        
    } catch (err) {
        console.error('Audio file error:', err);
        document.getElementById('statusMsg').innerHTML = '<ion-icon name="alert-circle-outline"></ion-icon> Fichier audio non supporté';
        isActive = false;
    }
});

// Drawing functions
function drawBars(data, length) {
    const barWidth = canvas.width / length;
    let x = 0;
    
    for (let i = 0; i < length; i++) {
        const value = data[i];
        const percent = value / 255;
        const barHeight = canvas.height * percent;
        
        const hue = 25 + (value / 255) * 15;
        
        ctx.fillStyle = `hsl(${hue}, 80%, 55%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        
        x += barWidth;
    }
}

function drawCircle(data, length) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.3;
    
    for (let i = 0; i < length; i++) {
        const value = data[i];
        const percent = value / 255;
        const angle = (i / length) * Math.PI * 2;
        const barHeight = radius * percent * 0.8;
        
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);
        
        const hue = 25 + (value / 255) * 15;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = `hsl(${hue}, 80%, 60%)`;
        ctx.stroke();
    }
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#E6B85C';
    ctx.fill();
}

function drawWave(data, length) {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    
    const step = canvas.width / length;
    let x = 0;
    
    for (let i = 0; i < length; i++) {
        const value = data[i];
        const percent = value / 255;
        const y = canvas.height / 2 + (percent - 0.5) * canvas.height * 0.6;
        
        ctx.lineTo(x, y);
        x += step;
    }
    
    ctx.lineTo(canvas.width, canvas.height / 2);
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#C45C3A');
    gradient.addColorStop(0.5, '#E6B85C');
    gradient.addColorStop(1, '#F6B626');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#E6B85C';
    ctx.stroke();
    ctx.shadowBlur = 0;
}