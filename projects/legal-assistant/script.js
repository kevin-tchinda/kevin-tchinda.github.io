// const API_URL = "http://localhost:8000/ask";   // for local testing
const API_URL = "https://legal-ccq-assistant.up.railway.app/ask";
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const charCounter = document.getElementById('charCounter');
const clearChatBtn = document.getElementById('clearChatBtn');

// Session management
let sessionId = localStorage.getItem('legal_session_id');
if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    localStorage.setItem('legal_session_id', sessionId);
}

// Conversation history (will be sent to backend)
let conversation = [];

// Store all displayed messages (for persistence and UI)
let storedMessages = [];

// Custom confirmation modal
function showConfirmationModal(message, onConfirm) {
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <p>${message}</p>
            <div class="modal-buttons">
                <button class="modal-btn confirm">Yes, clear chat</button>
                <button class="modal-btn cancel">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    setTimeout(() => modal.classList.add('active'), 10);
    
    const confirmBtn = modal.querySelector('.confirm');
    const cancelBtn = modal.querySelector('.cancel');
    
    const cleanup = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 200);
    };
    
    confirmBtn.addEventListener('click', () => {
        cleanup();
        onConfirm();
    });
    cancelBtn.addEventListener('click', cleanup);
}

// Load messages from localStorage on page load, with migration from legacy keys
function loadMessagesFromStorage() {
    // Migrate any existing chat_messages_* keys to current session
    const currentSession = sessionId;
    let saved = localStorage.getItem(`chat_messages_${currentSession}`);
    if (!saved) {
        // Look for any key starting with 'chat_messages_' not matching current session
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('chat_messages_') && key !== `chat_messages_${currentSession}`) {
                const oldMessages = localStorage.getItem(key);
                if (oldMessages) {
                    // Migrate to current session
                    localStorage.setItem(`chat_messages_${currentSession}`, oldMessages);
                    localStorage.removeItem(key);
                    saved = oldMessages;
                    break;
                }
            }
        }
    }
    if (saved) {
        try {
            storedMessages = JSON.parse(saved);
            // Clear chat container
            chatMessages.innerHTML = '';
            let lastDate = null;
            storedMessages.forEach(msg => {
                const msgDate = new Date(msg.timestampRaw).toDateString();
                if (lastDate !== msgDate) {
                    const separator = document.createElement('div');
                    separator.className = 'date-separator';
                    separator.textContent = new Date(msg.timestampRaw).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                    chatMessages.appendChild(separator);
                    lastDate = msgDate;
                }
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.role}`;
                messageDiv.innerHTML = `
                    <div class="message-avatar">
                        <ion-icon name="${msg.role === 'user' ? 'person-outline' : 'chatbubble-ellipses-outline'}"></ion-icon>
                    </div>
                    <div style="flex:1">
                        <div class="message-bubble">${msg.text.replace(/\n/g, '<br>')}</div>
                        <div class="message-timestamp">${msg.timestamp}</div>
                        ${msg.articleLinks ? `<div class="article-links">${msg.articleLinks}</div>` : ''}
                    </div>
                `;
                chatMessages.appendChild(messageDiv);
                // Rebuild conversation array for backend
                if (msg.role === 'user') {
                    conversation.push({ role: 'user', content: msg.text });
                } else if (msg.role === 'assistant' && !msg.articleLinks) {
                    conversation.push({ role: 'assistant', content: msg.text });
                }
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
            const welcome = document.getElementById('welcomeMessage');
            if (welcome) welcome.style.display = 'none';
        } catch (e) {
            console.error('Failed to load messages:', e);
        }
    } else {
        const welcome = document.getElementById('welcomeMessage');
        if (welcome) welcome.style.display = 'flex';
    }
}

// Save messages to localStorage
function saveMessagesToStorage() {
    localStorage.setItem(`chat_messages_${sessionId}`, JSON.stringify(storedMessages));
}

// Helper to add a message to UI and storage
function addMessageToUI(text, role, articleLinks = null, timestampRaw = null) {
    const now = timestampRaw ? new Date(timestampRaw) : new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' });
    const dateStr = now.toDateString();
    const avatarIcon = role === 'user' ? 'person-outline' : 'chatbubble-ellipses-outline';
    
    const lastMsg = storedMessages[storedMessages.length - 1];
    const lastDate = lastMsg ? new Date(lastMsg.timestampRaw).toDateString() : null;
    if (lastDate !== dateStr) {
        const separator = document.createElement('div');
        separator.className = 'date-separator';
        separator.textContent = now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        chatMessages.appendChild(separator);
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <ion-icon name="${avatarIcon}"></ion-icon>
        </div>
        <div style="flex:1">
            <div class="message-bubble">${text.replace(/\n/g, '<br>')}</div>
            <div class="message-timestamp">${timeStr}</div>
            ${articleLinks ? `<div class="article-links">${articleLinks}</div>` : ''}
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    const storedMsg = {
        role: role,
        text: text,
        timestamp: timeStr,
        timestampRaw: now.toISOString(),
        articleLinks: articleLinks || null
    };
    storedMessages.push(storedMsg);
    saveMessagesToStorage();
}

// Hide welcome message on first real message
function hideWelcomeMessage() {
    const welcome = document.getElementById('welcomeMessage');
    if (welcome) welcome.style.display = 'none';
}

// Clear all chat (and generate new session ID)
function clearChat() {
    showConfirmationModal("Are you sure you want to erase the entire conversation? This action cannot be undone.", () => {
        // Clear local storage for messages
        localStorage.removeItem(`chat_messages_${sessionId}`);
        // Generate a new session ID to start fresh on backend
        sessionId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
        localStorage.setItem('legal_session_id', sessionId);
        // Reset arrays
        storedMessages = [];
        conversation = [];
        // Clear DOM
        chatMessages.innerHTML = '';
        // Show welcome message again
        const welcomeDiv = document.createElement('div');
        welcomeDiv.id = 'welcomeMessage';
        welcomeDiv.className = 'welcome-message';
        welcomeDiv.textContent = 'Civil Code of Québec Legal Assistant';
        chatMessages.appendChild(welcomeDiv);
    });
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

    hideWelcomeMessage();
    
    addMessageToUI(question, 'user');
    conversation.push({ role: 'user', content: question });
    userInput.value = '';
    charCounter.textContent = '0 / 500';
    sendBtn.disabled = true;

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

        removeLoadingMessage(loadingId);
        
        addMessageToUI(data.answer, 'assistant');
        conversation.push({ role: 'assistant', content: data.answer });

        if (data.articles && data.articles.length) {
            const articleNumbers = data.articles.join(', ');
            const articleLinks = data.articles.map(num =>
                `<a href="/projects/legal-assistant/article.html?number=${num}" target="_blank" class="article-link">Article ${num}</a>`
            ).join(', ');
            addMessageToUI('', 'assistant', `<ion-icon name="document-text-outline"></ion-icon> Sources : ${articleLinks}`);
            conversation.push({ role: 'assistant', content: `Sources : Articles ${articleNumbers}` });
        }
    } catch (error) {
        removeLoadingMessage(loadingId);
        addMessageToUI(`Error: ${error.message}`, 'assistant');
    } finally {
        sendBtn.disabled = false;
        userInput.focus();
    }
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
clearChatBtn.addEventListener('click', clearChat);

// Load existing messages on page load
loadMessagesFromStorage();