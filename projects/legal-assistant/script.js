const API_URL = "https://legal-ccq-assistant.up.railway.app/ask";
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

async function sendMessage() {
    const question = userInput.value.trim();
    if (!question) return;

    // Display user message
    addMessage(question, 'user');
    userInput.value = '';
    sendBtn.disabled = true;

    // Show loading indicator
    const loadingId = addLoadingMessage();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: question, language: 'auto' })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        // Remove loading indicator
        removeLoadingMessage(loadingId);

        // Build assistant message with citations
        let articlesText = '';
        if (data.articles_used && data.articles_used.length) {
            articlesText = `\n\nArticles cités : ${data.articles_used.join(', ')}`;
        }
        addMessage(data.answer + articlesText, 'assistant');
    } catch (error) {
        removeLoadingMessage(loadingId);
        addMessage(`Erreur : ${error.message}`, 'assistant');
    } finally {
        sendBtn.disabled = false;
        userInput.focus();
    }
}

function addMessage(text, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addLoadingMessage() {
    const id = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = id;
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon> Réflexion en cours...';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
}

function removeLoadingMessage(id) {
    const elem = document.getElementById(id);
    if (elem) elem.remove();
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});