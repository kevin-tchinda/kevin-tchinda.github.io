// ============================================
// DOM Elements
// ============================================
const textInput = document.getElementById('textInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const statusDiv = document.getElementById('status');
const resultArea = document.getElementById('resultArea');
const sentimentBadge = document.getElementById('sentimentBadge');
const confidenceFill = document.getElementById('confidenceFill');
const scoreValue = document.getElementById('scoreValue');
const interpretation = document.getElementById('interpretation');

let toxicityModel = null;

// ============================================
// Load Toxicity Model
// ============================================
async function loadToxicityModel() {
    if (toxicityModel) return toxicityModel;
    
    statusDiv.textContent = 'Chargement du modèle d\'IA...';
    statusDiv.classList.remove('hidden');
    
    try {
        toxicityModel = await toxicity.load(0.5);
        statusDiv.textContent = 'Modèle chargé.';
        setTimeout(() => statusDiv.classList.add('hidden'), 1500);
        return toxicityModel;
    } catch (error) {
        console.error('Erreur chargement modèle:', error);
        statusDiv.textContent = 'Erreur: impossible de charger le modèle d\'IA';
        return null;
    }
}

// ============================================
// Analyze sentiment using custom algorithm + toxicity model
// ============================================
async function analyzeSentiment(text) {
    if (!text.trim()) {
        return { score: 0, sentiment: 'neutral', confidence: 0, interpretation: 'Texte vide' };
    }
    
    const positiveWords = [
        'love', 'great', 'amazing', 'wonderful', 'excellent', 'beautiful', 'happy', 'joy',
        'good', 'nice', 'perfect', 'awesome', 'fantastic', 'brilliant', 'superb', 'glad',
        'aimer', 'super', 'génial', 'magnifique', 'excellent', 'heureux', 'bien', 'parfait'
    ];
    
    const negativeWords = [
        'hate', 'terrible', 'awful', 'bad', 'horrible', 'sad', 'angry', 'disappointed',
        'worst', 'poor', 'annoying', 'stupid', 'dumb', 'fail', 'détester', 'horrible',
        'mauvais', 'triste', 'énervé', 'déçu', 'pire', 'nul'
    ];
    
    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) positiveCount += matches.length;
    });
    
    negativeWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) negativeCount += matches.length;
    });
    
    let score = 0;
    let confidence = 0;
    let sentiment = 'neutral';
    
    if (positiveCount > 0 || negativeCount > 0) {
        const total = positiveCount + negativeCount;
        score = (positiveCount - negativeCount) / total;
        confidence = Math.min(0.9, total / 10);
    }
    
    if (toxicityModel) {
        try {
            const predictions = await toxicityModel.classify([text]);
            const toxicPrediction = predictions.find(p => p.label === 'toxicity');
            if (toxicPrediction && toxicPrediction.results[0].match) {
                score = Math.min(score, -0.5);
                confidence = Math.max(confidence, 0.7);
            }
        } catch (e) {
            console.warn('Erreur toxicity model:', e);
        }
    }
    
    if (score > 0.2) {
        sentiment = 'positive';
    } else if (score < -0.2) {
        sentiment = 'negative';
    } else {
        sentiment = 'neutral';
    }
    
    let interpretationText = '';
    if (sentiment === 'positive') {
        interpretationText = 'Le texte exprime un ton positif et enthousiaste.';
        if (score > 0.7) interpretationText += ' Le sentiment est très fort.';
    } else if (sentiment === 'negative') {
        interpretationText = 'Le texte exprime un ton négatif ou critique.';
        if (score < -0.7) interpretationText += ' Le sentiment est très marqué.';
    } else {
        interpretationText = 'Le texte semble neutre ou les émotions sont mitigées.';
    }
    
    const lengthFactor = Math.min(1, text.length / 100);
    confidence = Math.min(0.95, confidence + lengthFactor * 0.3);
    
    return {
        score: (score + 1) / 2,
        sentiment: sentiment,
        confidence: confidence,
        interpretation: interpretationText,
        rawScore: score
    };
}

// ============================================
// Update UI
// ============================================
function updateUI(result) {
    resultArea.classList.remove('hidden');
    
    if (result.sentiment === 'positive') {
        sentimentBadge.innerHTML = '<ion-icon name="happy-outline"></ion-icon> Sentiment Positif';
        sentimentBadge.className = 'sentiment-badge sentiment-positive';
        confidenceFill.className = 'confidence-fill positive';
    } else if (result.sentiment === 'negative') {
        sentimentBadge.innerHTML = '<ion-icon name="sad-outline"></ion-icon> Sentiment Négatif';
        sentimentBadge.className = 'sentiment-badge sentiment-negative';
        confidenceFill.className = 'confidence-fill negative';
    } else {
        sentimentBadge.innerHTML = '<ion-icon name="remove-circle-outline"></ion-icon> Sentiment Neutre';
        sentimentBadge.className = 'sentiment-badge sentiment-neutral';
        confidenceFill.className = 'confidence-fill neutral';
    }
    
    const displayScore = result.score;
    scoreValue.textContent = displayScore.toFixed(2);
    confidenceFill.style.width = `${result.confidence * 100}%`;
    
    interpretation.textContent = result.interpretation;
}

// ============================================
// Main analysis flow
// ============================================
async function analyze() {
    const text = textInput.value.trim();
    if (!text) {
        statusDiv.textContent = 'Veuillez entrer un texte à analyser';
        statusDiv.classList.remove('hidden');
        setTimeout(() => statusDiv.classList.add('hidden'), 3000);
        return;
    }
    
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<span class="spinner"></span> Analyse en cours...';
    statusDiv.textContent = 'Analyse du texte...';
    statusDiv.classList.remove('hidden');
    
    try {
        await loadToxicityModel();
        const result = await analyzeSentiment(text);
        updateUI(result);
        statusDiv.classList.add('hidden');
    } catch (error) {
        console.error('Analysis error:', error);
        statusDiv.textContent = 'Erreur lors de l\'analyse. Veuillez réessayer.';
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<ion-icon name="analytics-outline"></ion-icon> Analyser le sentiment';
    }
}

// ============================================
// Example buttons
// ============================================
document.querySelectorAll('.example-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        textInput.value = btn.dataset.text;
        analyze();
    });
});

// ============================================
// Initialize
// ============================================
analyzeBtn.addEventListener('click', analyze);
loadToxicityModel();