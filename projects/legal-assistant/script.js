const API_URL = "http://localhost:8000/ask";   // for local testing
// const API_URL = "https://legal-ccq-assistant.up.railway.app/ask";
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const charCounter = document.getElementById('charCounter');

// Session management
let sessionId = localStorage.getItem('legal_session_id');
if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    localStorage.setItem('legal_session_id', sessionId);
}

// Conversation history (will be sent to backend)
let conversation = [];

// Hide welcome message when first message is sent
function hideWelcomeMessage() {
    const welcome = document.getElementById('welcomeMessage');
    if (welcome) welcome.style.display = 'none';
}

// Character counter
userInput.addEventListener('input', () => {
    const len = userInput.value.length;
    charCounter.textContent = `${len} / 500`;
    if (len > 450) {
        charCounter.classList.add('warning');
    } else {
        charCounter.classList.remove('warning');
    }
});

async function sendMessage() {
    const question = userInput.value.trim();
    if (!question) return;

    hideWelcomeMessage(); // Remove welcome message on first user interaction

    // Add user message to UI and conversation
    addMessage(question, 'user');
    conversation.push({ role: 'user', content: question });
    userInput.value = '';
    charCounter.textContent = '0 / 500';
    sendBtn.disabled = true;

    // Show loading indicator
    const loadingId = addLoadingMessage();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: question,
                session_id: sessionId,
                conversation: conversation
            })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        // Remove loading indicator
        removeLoadingMessage(loadingId);

        // Add assistant message to UI and conversation
        addMessage(data.answer, 'assistant');
        conversation.push({ role: 'assistant', content: data.answer });

        // If the assistant returned article numbers, add clickable links
        if (data.articles && data.articles.length) {
            const articleNumbers = data.articles.join(', ');
            // FIX: link to article.html in the same directory
            const articleLinks = data.articles.map(num =>
                `<a href="/projects/legal-assistant/article.html?number=${num}" target="_blank" class="article-link">Article ${num}</a>`
            ).join(', ');
            addMessage('', 'assistant', `<ion-icon name="document-text-outline"></ion-icon> Sources : ${articleLinks}`);
            // Store plain text in conversation history
            conversation.push({ role: 'assistant', content: `Sources : Articles ${articleNumbers}` });
        }

    } catch (error) {
        removeLoadingMessage(loadingId);
        addMessage(`Erreur : ${error.message}`, 'assistant');
    } finally {
        sendBtn.disabled = false;
        userInput.focus();
    }
}

function addMessage(text, role, articleLinks = null) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' });
    const avatarIcon = role === 'user' ? 'person-outline' : 'chatbubble-ellipses-outline';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <ion-icon name="${avatarIcon}"></ion-icon>
        </div>
        <div style="flex:1">
            <div class="message-bubble">${text.replace(/\n/g, '<br>')}</div>
            <div class="message-timestamp">${timestamp}</div>
            ${articleLinks ? `<div class="article-links">${articleLinks}</div>` : ''}
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addLoadingMessage() {
    const id = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = id;
    loadingDiv.className = 'typing-indicator';
    loadingDiv.innerHTML = `
        <div class="typing-dots">
            <span></span><span></span><span></span>
        </div>
        <span>Assistant is typing...</span>
    `;
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
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});