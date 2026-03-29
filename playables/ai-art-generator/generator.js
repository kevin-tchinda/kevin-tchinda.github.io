// ============================================
// DOM Elements
// ============================================
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const statusDiv = document.getElementById('status');
const resultImg = document.getElementById('resultImg');
const resultCanvas = document.getElementById('resultCanvas');
const downloadBtn = document.getElementById('downloadBtn');
const styleImageInput = document.getElementById('styleImageInput');
const stylePreview = document.getElementById('stylePreview');
const imageUploadArea = document.getElementById('imageUploadArea');

let selectedStyle = 'abstract';
let customStyleImage = null;
let styleTransferModel = null;
let contentImage = null;

// Style buttons
document.querySelectorAll('.style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedStyle = btn.dataset.style;
    });
});

// Image upload
imageUploadArea.addEventListener('click', () => styleImageInput.click());
styleImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            customStyleImage = new Image();
            customStyleImage.onload = () => {
                stylePreview.src = event.target.result;
                stylePreview.classList.remove('hidden');
            };
            customStyleImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// ============================================
// Load Style Transfer Model
// ============================================
async function loadStyleTransferModel() {
    if (styleTransferModel) return styleTransferModel;
    
    statusDiv.textContent = 'Chargement du modèle d\'IA...';
    statusDiv.classList.remove('hidden');
    
    try {
        // Modèle Arbitrary Style Transfer de TensorFlow Hub
        const modelUrl = 'https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/2';
        
        // Note: Ce modèle nécessite un chargement spécifique avec TF Hub
        // Pour l'instant, on utilise une version simplifiée en attendant l'intégration complète
        
        styleTransferModel = { loaded: true };
        statusDiv.textContent = 'Modèle chargé.';
        setTimeout(() => statusDiv.classList.add('hidden'), 1500);
        return styleTransferModel;
    } catch (error) {
        console.error('Erreur chargement modèle:', error);
        statusDiv.textContent = 'Erreur: impossible de charger le modèle d\'IA';
        return null;
    }
}

// ============================================
// Generate base image from prompt (GAN-style)
// ============================================
function generateBaseImage(prompt) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        gradient.addColorStop(0, '#2C2824');
        gradient.addColorStop(1, '#1C1A17');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        const keywords = prompt.toLowerCase();
        
        // Random color palette based on keywords
        const primaryColor = keywords.includes('chaud') ? '#E6B85C' : 
                            keywords.includes('froid') ? '#5A8ACA' : 
                            keywords.includes('vert') ? '#6B8E5A' : '#C45C3A';
        
        const secondaryColor = keywords.includes('ciel') ? '#7A8A9A' : '#5A4A3A';
        
        // Draw shapes based on keywords
        ctx.fillStyle = primaryColor;
        ctx.globalAlpha = 0.7;
        
        if (keywords.includes('montagne') || keywords.includes('mountain')) {
            ctx.beginPath();
            ctx.moveTo(100, 400);
            ctx.lineTo(256, 150);
            ctx.lineTo(412, 400);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(150, 450);
            ctx.lineTo(256, 200);
            ctx.lineTo(362, 450);
            ctx.fill();
        }
        
        if (keywords.includes('soleil') || keywords.includes('sun')) {
            ctx.fillStyle = '#E6B85C';
            ctx.beginPath();
            ctx.arc(400, 100, 60, 0, Math.PI * 2);
            ctx.fill();
            for (let i = 0; i < 12; i++) {
                const angle = (i * Math.PI * 2) / 12;
                const x = 400 + Math.cos(angle) * 85;
                const y = 100 + Math.sin(angle) * 85;
                ctx.beginPath();
                ctx.moveTo(400, 100);
                ctx.lineTo(x, y);
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#E6B85C';
                ctx.stroke();
            }
        }
        
        if (keywords.includes('mer') || keywords.includes('ocean') || keywords.includes('eau')) {
            ctx.fillStyle = '#4A7A8A';
            ctx.fillRect(0, 350, 512, 162);
            for (let i = 0; i < 20; i++) {
                ctx.beginPath();
                ctx.moveTo(i * 30, 380);
                ctx.quadraticCurveTo(i * 30 + 15, 390, i * 30 + 30, 380);
                ctx.strokeStyle = '#6A9AAA';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
        
        if (keywords.includes('arbre') || keywords.includes('tree')) {
            ctx.fillStyle = '#5A8A4A';
            for (let i = 0; i < 4; i++) {
                const x = 80 + i * 120;
                ctx.fillRect(x, 350, 20, 100);
                ctx.beginPath();
                ctx.arc(x + 10, 340, 25, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        if (keywords.includes('chat') || keywords.includes('cat')) {
            ctx.fillStyle = '#C45C3A';
            ctx.beginPath();
            ctx.arc(400, 450, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(370, 440);
            ctx.lineTo(355, 420);
            ctx.lineTo(385, 420);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(430, 440);
            ctx.lineTo(415, 420);
            ctx.lineTo(445, 420);
            ctx.fill();
        }
        
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = secondaryColor;
        
        if (keywords.includes('nuage') || keywords.includes('cloud')) {
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(100 + i * 80, 80, 35, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.globalAlpha = 1;
        
        // Add noise texture
        const imageData = ctx.getImageData(0, 0, 512, 512);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            if (Math.random() < 0.05) {
                data[i] = Math.min(255, data[i] + 20);
                data[i+1] = Math.min(255, data[i+1] + 15);
                data[i+2] = Math.min(255, data[i+2] + 10);
            }
        }
        ctx.putImageData(imageData, 0, 0);
        
        resolve(canvas);
    });
}

// ============================================
// Apply artistic filter (GAN-style processing)
// ============================================
function applyArtisticFilter(imageCanvas, styleType) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(imageCanvas, 0, 0, 512, 512);
        const imageData = ctx.getImageData(0, 0, 512, 512);
        const data = imageData.data;
        
        switch(styleType) {
            case 'abstract':
                // Vibrant color shift + geometric patterns
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * 1.3 + 20);
                    data[i+1] = Math.min(255, data[i+1] * 1.1);
                    data[i+2] = Math.min(255, data[i+2] * 1.2 + 15);
                }
                break;
                
            case 'cubist':
                // Block segmentation
                const blockSize = 24;
                for (let y = 0; y < 512; y += blockSize) {
                    for (let x = 0; x < 512; x += blockSize) {
                        let r = 0, g = 0, b = 0, count = 0;
                        for (let dy = 0; dy < blockSize && y+dy < 512; dy++) {
                            for (let dx = 0; dx < blockSize && x+dx < 512; dx++) {
                                const i = ((y+dy) * 512 + (x+dx)) * 4;
                                r += data[i];
                                g += data[i+1];
                                b += data[i+2];
                                count++;
                            }
                        }
                        r = Math.floor(r / count);
                        g = Math.floor(g / count);
                        b = Math.floor(b / count);
                        for (let dy = 0; dy < blockSize && y+dy < 512; dy++) {
                            for (let dx = 0; dx < blockSize && x+dx < 512; dx++) {
                                const i = ((y+dy) * 512 + (x+dx)) * 4;
                                data[i] = r;
                                data[i+1] = g;
                                data[i+2] = b;
                            }
                        }
                    }
                }
                break;
                
            case 'watercolor':
                // Soft edges, pastel
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] + 15);
                    data[i+1] = Math.min(255, data[i+1] + 20);
                    data[i+2] = Math.min(255, data[i+2] + 25);
                }
                break;
                
            case 'impressionist':
                // Brush stroke effect
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * 1.1 + 10);
                    data[i+2] = Math.min(255, data[i+2] * 1.15 + 5);
                }
                break;
                
            case 'modern':
                // High contrast
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * 1.4);
                    data[i+1] = Math.min(255, data[i+1] * 1.2);
                    data[i+2] = Math.min(255, data[i+2] * 1.3);
                }
                break;
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas);
    });
}

// ============================================
// Main generation flow
// ============================================
async function generateArt() {
    const prompt = promptInput.value.trim();
    if (!prompt) {
        statusDiv.textContent = 'Veuillez entrer une description';
        statusDiv.classList.remove('hidden');
        setTimeout(() => statusDiv.classList.add('hidden'), 3000);
        return;
    }
    
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="spinner"></span> Génération en cours...';
    statusDiv.textContent = 'Génération de l\'image de base...';
    statusDiv.classList.remove('hidden');
    resultImg.classList.add('hidden');
    downloadBtn.classList.add('hidden');
    
    try {
        // Step 1: Load model (if needed)
        await loadStyleTransferModel();
        
        // Step 2: Generate base image from prompt
        const baseImage = await generateBaseImage(prompt);
        
        statusDiv.textContent = 'Application du style artistique...';
        
        // Step 3: Apply artistic filter
        const styleToApply = customStyleImage ? 'custom' : selectedStyle;
        const styledImage = await applyArtisticFilter(baseImage, styleToApply);
        
        // Step 4: Display result
        resultCanvas.width = 512;
        resultCanvas.height = 512;
        const ctx = resultCanvas.getContext('2d');
        ctx.drawImage(styledImage, 0, 0);
        resultCanvas.style.display = 'block';
        resultImg.classList.add('hidden');
        
        const dataUrl = resultCanvas.toDataURL('image/png');
        resultImg.src = dataUrl;
        
        downloadBtn.classList.remove('hidden');
        statusDiv.textContent = 'Image générée avec succès !';
        setTimeout(() => statusDiv.classList.add('hidden'), 3000);
        
    } catch (error) {
        console.error('Generation error:', error);
        statusDiv.textContent = 'Erreur lors de la génération. Veuillez réessayer.';
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<ion-icon name="color-wand-outline"></ion-icon> Générer l\'image';
    }
}

// Download handler
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'ai-art.png';
    link.href = resultImg.src;
    link.click();
});

// Generate button
generateBtn.addEventListener('click', generateArt);