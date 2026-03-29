// ============================================
// Global State
// ============================================
let currentView = 'whoami';
let projectsData = [];
let i18n = null;
let currentLanguage = 'en';
let currentFilter = 'all';

// AI Assistant intent responses (fallback)
const intentResponses = {
    about: "Kevin is an AI Developer and Software Engineer who builds custom AI tools that help people work smarter.",
    projects: "You can view my projects in the Projects section. They include Image Captioning, Churn Prediction, Language Detection, and more.",
    tech: "I work with Python, TensorFlow, PyTorch, FastAPI, Docker, React, Next.js, and many other technologies.",
    contact: "You can reach me at kevin.tchinda@kevs.qinsera.ca or via GitHub and LinkedIn links in the footer.",
    working: "I'm currently building interactive AI demos and expanding my portfolio with new projects.",
    default: "I'm not sure I understand. Try asking about my projects, tech stack, or how to contact me."
};

// ============================================
// Playables Data
// ============================================
const playablesData = [
    // TF.js models doesn't expose efficient GAN / Diffusion models
    // Through their API, would need to create it from scratch later...

    // {
    //     id: 1,
    //     title: "AI Art Generator",
    //     description: "Create unique artwork using TensorFlow.js style transfer",
    //     type: "ml",
    //     icon: "color-palette-outline",
    //     path: "/playables/ai-art-generator/"
    // },
    {
        id: 2,
        title: "Asteroid Dodger",
        description: "Avoid asteroids and survive as long as you can",
        type: "game",
        icon: "game-controller-outline",
        path: "/playables/asteroid-dodger/"
    },
    {
        id: 3,
        title: "Text Sentiment Analyzer",
        description: "Analyze the emotional tone of any text using AI",
        type: "tool",
        icon: "analytics-outline",
        path: "/playables/sentiment-analyzer/"
    },
    {
        id: 4,
        title: "ML Color Guesser",
        description: "Train a neural net to guess colors from text",
        type: "ml",
        icon: "color-filter-outline",
        path: "/playables/color-guesser/"
    },
    {
        id: 5,
        title: "Music Visualizer",
        description: "Real-time audio visualization with Web Audio API",
        type: "tool",
        icon: "musical-notes-outline",
        path: "/playables/music-visualizer/"
    },
    {
        id: 6,
        title: "Pixel Art Studio",
        description: "Create pixel art with AI-assisted coloring",
        type: "game",
        icon: "brush-outline",
        path: "/playables/pixel-art-studio/"
    },
    {
        id: 7,
        title: "Classic Snake Game",
        description: "Retro snake game with growing difficulty",
        type: "game",
        icon: "game-controller-outline",
        path: "/playables/snake-game/"
    },
];

// ============================================
// Language Detection
// ============================================
function detectLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('fr')) {
        return 'fr';
    }
    return 'en';
}

// ============================================
// Fetch Data
// ============================================
async function fetchData() {
    const [projectsRes, i18nRes] = await Promise.all([
        fetch('assets/json/projects.json'),
        fetch('assets/json/i18n.json')
    ]);

    projectsData = await projectsRes.json();
    i18n = await i18nRes.json();

    currentLanguage = detectLanguage();

    renderCurrentView();
}

// ============================================
// Render Functions
// ============================================
function renderCurrentView() {
    const container = document.getElementById('viewContainer');
    if (!container) return;

    const t = i18n?.[currentLanguage] || i18n?.en;

    if (currentView === 'whoami') {
        container.innerHTML = `
            <div class="command-header">
                <span class="command-text">>_ ${t?.whoami?.command || 'whoami'}</span>
            </div>
            <div class="whoami-name">${t?.whoami?.name || 'Kevin Tchinda'}</div>
            <div class="whoami-title">${t?.whoami?.title || 'AI Developer / Software Engineer'}</div>
            <div class="whoami-tagline">>_ ${t?.whoami?.tagline || 'Building intelligent tools that make people work smarter, not harder.'}</div>
        `;
        updateNavButtons(false);
    }
    else if (currentView === 'projects') {
        renderProjectsView(container, t);
        updateNavButtons(true);
    }
    else if (currentView === 'tech') {
        renderTechView(container, t);
        updateNavButtons(true);
    }
    else if (currentView === 'about') {
        renderAboutView(container, t);
        updateNavButtons(true);
    }
}

function renderProjectsView(container, t) {
    const filteredProjects = projectsData.filter(project => {
        if (currentFilter === 'demo') return project.demo;
        if (currentFilter === 'github') return project.github;
        return true;
    });

    let projectsHtml = `
        <div class="command-header">
            <span class="command-text">>_ ${t?.projects?.command || 'projects --list'}</span>
        </div>
        <div class="filter-bar">
            <button class="filter-chip ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">${t?.projects?.filters?.all || 'All'}</button>
            <button class="filter-chip ${currentFilter === 'demo' ? 'active' : ''}" data-filter="demo">${t?.projects?.filters?.demo || 'Demo'}</button>
            <button class="filter-chip ${currentFilter === 'github' ? 'active' : ''}" data-filter="github">${t?.projects?.filters?.github || 'GitHub'}</button>
        </div>
        <ul class="project-list">
    `;

    filteredProjects.forEach(project => {
        projectsHtml += `
            <li class="project-item">
                <div class="project-name">
                    <ion-icon name="document-text-outline"></ion-icon>
                    ${project.name}
                </div>
                <div class="project-links">
                    ${project.github ? `<a href="${project.github}" target="_blank" class="project-link"><ion-icon name="logo-github"></ion-icon> GitHub</a>` : '<span class="project-link disabled"><ion-icon name="logo-github"></ion-icon> GitHub</span>'}
                    ${project.demo ? `<a href="${project.demo}" target="_blank" class="project-link"><ion-icon name="play-outline"></ion-icon> Demo</a>` : '<span class="project-link disabled"><ion-icon name="play-outline"></ion-icon> Demo</span>'}
                </div>
            </li>
        `;
    });

    projectsHtml += `
        </ul>
        <div class="items-count">>_ ${filteredProjects.length} ${t?.projects?.items_count?.replace('{{count}}', '') || 'items'}</div>
    `;

    container.innerHTML = projectsHtml;

    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            currentFilter = chip.dataset.filter;
            renderCurrentView();
        });
    });
}

function renderTechView(container, t) {
    const techCategories = {
        languages: ['Python', 'TypeScript', 'JavaScript', 'SQL'],
        ai_ml: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Hugging Face'],
        backend: ['FastAPI', 'Docker', 'Kubernetes', 'PostgreSQL'],
        frontend: ['React', 'Next.js', 'Tailwind CSS', 'Ionic']
    };

    let techHtml = `
        <div class="command-header">
            <span class="command-text">>_ ${t?.tech?.command || 'tech --stack'}</span>
        </div>
    `;

    Object.entries(techCategories).forEach(([key, items]) => {
        const categoryName = t?.tech?.categories?.[key] || key.replace('_', ' & ').toUpperCase();
        techHtml += `
            <div class="tech-category">
                <h3>${categoryName}</h3>
                <div class="tech-badges">
                    ${items.map(item => `<span class="tech-badge">${item}</span>`).join('')}
                </div>
            </div>
        `;
    });

    const totalItems = Object.values(techCategories).flat().length;
    techHtml += `<div class="items-count">>_ ${totalItems} ${t?.tech?.items_count?.replace('{{count}}', '') || 'items'}</div>`;

    container.innerHTML = techHtml;
}

function renderAboutView(container, t) {
    const resumePath = 'assets/docs/Kevin_Tchinda_Resume.pdf';

    container.innerHTML = `
        <div class="command-header">
            <span class="command-text">>_ ${t?.about?.command || 'about --me'}</span>
        </div>
        <div class="about-name">${t?.whoami?.name || 'Kevin Tchinda'}</div>
        <div class="about-title">${t?.whoami?.title || 'AI Developer / Software Engineer'}</div>
        <div class="about-bio">${t?.about?.bio || 'AI Developer with a software engineering background. I build custom AI tools that fit into existing workflows, helping people work smarter.'}</div>
        <div class="about-details">
            <div>${t?.about?.location || 'Based in Ottawa, Canada.'}</div>
            <div>${t?.about?.interests || 'Interests: reading, swimming, anime, series.'}</div>
            <div>${t?.about?.contact || 'Contact: kevin.tchinda@kevs.qinsera.ca'}</div>
        </div>
        <a href="${resumePath}" class="resume-button" target="_blank" rel="noopener noreferrer">
            <ion-icon name="document-text-outline"></ion-icon>
            ${t?.about?.resume_button || 'Download Resume'}
        </a>
    `;
}

function updateNavButtons(showBack) {
    const navContainer = document.getElementById('navButtons');
    if (!navContainer) return;

    const t = i18n?.[currentLanguage] || i18n?.en;

    if (showBack) {
        navContainer.innerHTML = `
            <button class="nav-btn back-btn" data-view="back">${t?.navigation?.back || 'Back'}</button>
            <button class="nav-btn" data-view="projects">${t?.navigation?.projects || 'Projects'}</button>
            <button class="nav-btn" data-view="tech">${t?.navigation?.tech || 'Tech Stack'}</button>
            <button class="nav-btn" data-view="about">${t?.navigation?.about || 'About'}</button>
        `;
    } else {
        navContainer.innerHTML = `
            <button class="nav-btn" data-view="projects">${t?.navigation?.projects || 'Projects'}</button>
            <button class="nav-btn" data-view="tech">${t?.navigation?.tech || 'Tech Stack'}</button>
            <button class="nav-btn" data-view="about">${t?.navigation?.about || 'About'}</button>
        `;
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = btn.dataset.view;
            if (view === 'back') {
                currentView = 'whoami';
                currentFilter = 'all';
            } else if (view === 'projects' || view === 'tech' || view === 'about') {
                currentView = view;
                currentFilter = 'all';
            }
            renderCurrentView();
        });
    });
}

// ============================================
// Render Playables
// ============================================
function renderPlayables() {
    const grid = document.getElementById('playablesGrid');
    const countSpan = document.getElementById('playablesCount');

    if (!grid) return;

    grid.innerHTML = playablesData.map(playable => `
        <div class="playable-card" data-playable-id="${playable.id}">
            <div class="playable-icon">
                <ion-icon name="${playable.icon}"></ion-icon>
            </div>
            <div class="playable-title">${playable.title}</div>
            <div class="playable-description">${playable.description}</div>
            <div class="playable-badge ${playable.type}">${playable.type.toUpperCase()}</div>
            <button class="play-button" data-playable="${playable.id}">
                <ion-icon name="play-outline"></ion-icon>
                Play
            </button>
        </div>
    `).join('');

    countSpan.innerHTML = `>_ ${playablesData.length} playables available`;

    document.querySelectorAll('.play-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const playableId = parseInt(btn.dataset.playable);
            openPlayableModal(playableId);
        });
    });
}

// ============================================
// Playable Modal
// ============================================
let currentModal = null;

function openPlayableModal(playableId) {
    const playable = playablesData.find(p => p.id === playableId);
    if (!playable) return;

    // if (currentModal) {
    //     currentModal.remove();
    // }

    // const modal = document.createElement('div');
    // modal.className = 'playable-modal';
    // modal.innerHTML = `
    //     <div class="playable-modal-content">
    //         <button class="playable-modal-close">
    //             <ion-icon name="close-outline"></ion-icon>
    //         </button>
    //         <div class="command-header">
    //             <span class="command-text">>_ play ${playable.title.toLowerCase().replace(/\s/g, '-')}</span>
    //         </div>
    //         <div id="playable-embed" style="min-height: 400px;">
    //             <div style="text-align: center; padding: 2rem;">
    //                 <div class="playable-icon" style="font-size: 4rem;">
    //                     <ion-icon name="${playable.icon}"></ion-icon>
    //                 </div>
    //                 <h3 style="margin: 1rem 0;">${playable.title}</h3>
    //                 <p style="color: var(--text-muted);">Interactive demo coming soon.</p>
    //                 <p style="font-size: 11px; margin-top: 1rem; color: var(--accent-secondary);">TensorFlow.js integration in progress</p>
    //             </div>
    //         </div>
    //     </div>
    // `;

    // document.body.appendChild(modal);
    // currentModal = modal;

    // setTimeout(() => modal.classList.add('active'), 10);

    // const closeBtn = modal.querySelector('.playable-modal-close');
    // closeBtn.addEventListener('click', () => {
    //     modal.classList.remove('active');
    //     setTimeout(() => modal.remove(), 300);
    //     currentModal = null;
    // });

    // modal.addEventListener('click', (e) => {
    //     if (e.target === modal) {
    //         modal.classList.remove('active');
    //         setTimeout(() => modal.remove(), 300);
    //         currentModal = null;
    //     }
    // });

    // Redirect to the playable page
    window.location.href = playable.path;
}

// ============================================
// AI Assistant
// ============================================
function processUserInput(input) {
    const lowerInput = input.toLowerCase();
    const t = i18n?.[currentLanguage]?.assistant?.responses || intentResponses;

    if (lowerInput.includes('about') || lowerInput.includes('who') || lowerInput.includes('background') || lowerInput.includes('bio')) {
        return t.about || intentResponses.about;
    }
    if (lowerInput.includes('project') || lowerInput.includes('work') || lowerInput.includes('portfolio') || lowerInput.includes('demo')) {
        return t.projects || intentResponses.projects;
    }
    if (lowerInput.includes('tech') || lowerInput.includes('stack') || lowerInput.includes('language') || lowerInput.includes('framework')) {
        return t.tech || intentResponses.tech;
    }
    if (lowerInput.includes('contact') || lowerInput.includes('email') || lowerInput.includes('reach') || lowerInput.includes('hire')) {
        return t.contact || intentResponses.contact;
    }
    if (lowerInput.includes('working') || lowerInput.includes('current') || lowerInput.includes('building')) {
        return t.working || intentResponses.working;
    }

    return t.default || intentResponses.default;
}

async function searchWeb(query) {
    return `I searched for "${query}" but web search is not fully integrated yet. Try asking about my projects, tech stack, or how to contact me.`;
}

async function sendMessage() {
    const input = document.getElementById('aiInput');
    const messagesContainer = document.getElementById('aiMessages');
    const question = input.value.trim();

    if (!question) return;

    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'ai-message user';
    userMessageDiv.textContent = question;
    messagesContainer.appendChild(userMessageDiv);

    input.value = '';

    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message assistant';
    typingDiv.innerHTML = '<span class="prompt">>_</span> Thinking...';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    setTimeout(async () => {
        typingDiv.remove();

        const intentResponse = processUserInput(question);

        const responseDiv = document.createElement('div');
        responseDiv.className = 'ai-message assistant';
        responseDiv.innerHTML = `<span class="prompt">>_</span> ${intentResponse}`;
        messagesContainer.appendChild(responseDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 300);
}

// ============================================
// Footer Swipe Detection
// ============================================
let touchStartY = 0;
let footerVisible = false;

function initSwipeFooter() {
    const footer = document.getElementById('footer');
    if (!footer) return;

    footer.classList.add('hidden');
    footerVisible = false;

    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchEndY - touchStartY;

        if (diff < -50) {
            footer.classList.remove('hidden');
            footerVisible = true;
        } else if (diff > 50) {
            footer.classList.add('hidden');
            footerVisible = false;
        }
    });
}

// ============================================
// AI Panel Toggle
// ============================================
function initAIPanel() {
    const aiToggle = document.getElementById('aiToggle');
    const aiPanel = document.getElementById('aiPanel');
    const aiClose = document.getElementById('aiClose');
    const aiSend = document.getElementById('aiSend');
    const aiInput = document.getElementById('aiInput');
    const suggestionChips = document.querySelectorAll('.suggestion-chip');

    if (aiToggle) {
        aiToggle.addEventListener('click', () => {
            aiPanel.classList.toggle('hidden');
        });
    }

    if (aiClose) {
        aiClose.addEventListener('click', () => {
            aiPanel.classList.add('hidden');
        });
    }

    if (aiSend) {
        aiSend.addEventListener('click', sendMessage);
    }

    if (aiInput) {
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const question = chip.dataset.question;
            if (question) {
                aiInput.value = question;
                sendMessage();
            }
        });
    });
}

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    initSwipeFooter();
    initAIPanel();
    renderPlayables();
});