const GEMINI_API_KEY = 'AIzaSyDuu4VTElp41a41v0ri6auuk9LurwntnKg';
const IMAGE_API_KEY = 'z91cJkR1ACL2RsMf9AVGMYcmeBFhkC7O26yQo8OXz0QH3YARdged6v4Q0DVK';
const IMAGE_ENDPOINT = 'https://modelslab.com/api/v7/images/text-to-image';
const WALLPAPERS = [
    "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1465101178521-c1a9136a3a2e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1200&q=80"
];

const GALLERY_IMAGES = [
    {"url":"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80","title":"Forest Conservation","description":"Protecting old growth forests"},
    {"url":"https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=800&q=80","title":"Renewable Energy","description":"Wind turbines generating clean power"},
    {"url":"https://images.unsplash.com/photo-1569163139394-de44333f1e5c?auto=format&fit=crop&w=800&q=80","title":"Sustainable Living","description":"Eco-friendly lifestyle choices"},
    {"url":"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80","title":"Ocean Conservation","description":"Protecting marine ecosystems"},
    {"url":"https://images.unsplash.com/photo-1536431311719-398b6704d4cc?auto=format&fit=crop&w=800&q=80","title":"Green Transportation","description":"Electric vehicles and sustainable transport"}
];

const NEWS_API_KEY = 'pub_344da34dda66428baeba18626914e979';

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadFromStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || null;
}

async function callAI(prompt, model = 'gemini-pro') {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        return 'AI response unavailable. Fallback: Stay eco-friendly!';
    }
}

async function generateImage(prompt) {
    try {
        const response = await fetch(IMAGE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${IMAGE_API_KEY}` },
            body: JSON.stringify({ prompt, width: 512, height: 512 })
        });
        const data = await response.json();
        return data.output[0];
    } catch (error) {
        return 'https://via.placeholder.com/512?text=Image+Generation+Failed';
    }
}

function E(id) {
    return document.getElementById(id);
}

function $$(sel) {
    return [].slice.call(document.querySelectorAll(sel));
}

function updateDesktopClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const clockEl = E('clock');
    if (clockEl) clockEl.textContent = timeStr;
    setTimeout(updateDesktopClock, 60000);
}

class EcoTrackOS {
    constructor() {
        this.activeWindows = new Set();
        this.minimizedWindows = new Set();
        this.windowZIndex = 200;
        this.user = loadFromStorage('ecoUser');
    }

    async init() {
        if (!this.user) return this.showLogin();
        this.setWallpaper();
        this.setupEventListeners();
        this.populateLauncher();
        this.hideLoadingScreen();
        updateDesktopClock();
        this.showDailyEcoTip();
    }

    hideLoadingScreen() {
        const loadingScreen = E('loadingScreen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 2000);
        }
    }

    showLogin() {
        const modal = E('loginModal');
        modal.classList.remove('hidden');
        
        E('loginBtn').onclick = () => {
            const usernameInput = E('username');
            if (usernameInput.value.trim()) {
                this.user = { username: usernameInput.value };
                saveToStorage('ecoUser', this.user);
                modal.classList.add('hidden');
                this.init();
            }
        };
        
        E('registerBtn').onclick = async () => {
            const usernameInput = E('username');
            if (usernameInput.value.trim()) {
                const pledge = await callAI('Generate a fun eco pledge for new users.');
                alert(`Pledge: ${pledge}`);
                this.user = { username: usernameInput.value };
                saveToStorage('ecoUser', this.user);
                modal.classList.add('hidden');
                this.init();
            }
        };
    }

    setWallpaper() {
        const idx = Math.floor(Math.random() * WALLPAPERS.length);
        const wallpaperEl = E('wallpaper');
        wallpaperEl.style.backgroundImage = `url('${WALLPAPERS[idx]}')`;
        wallpaperEl.style.backgroundColor = 'transparent';
    }

    setupEventListeners() {
        $$('.desktop-icon').forEach(icon => 
            icon.addEventListener('dblclick', () => this.launchApp(icon.dataset.app))
        );
        
        document.querySelector('.launcher-btn').addEventListener('click', () => this.toggleLauncher());
        
        const darkModeToggle = E('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => document.body.classList.toggle('dark-mode'));
        }
    }

    toggleLauncher() {
        const launcher = E('appLauncher');
        launcher.classList.toggle('hidden');
        gsap.fromTo(launcher, 
            { scale: 0.95, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
        );
    }

    populateLauncher() {
        const grid = E('launcher-grid');
        $$('.desktop-icon').forEach(icon => {
            const app = document.createElement('div');
            app.className = 'launcher-app';
            app.innerHTML = `${icon.querySelector('.icon').textContent} ${icon.querySelector('.label').textContent}`;
            app.addEventListener('click', () => this.launchApp(icon.dataset.app));
            grid.appendChild(app);
        });
    }

    launchApp(appId) {
        let windowEl = E(`${appId}-window`);
        if (!windowEl) windowEl = this.createWindow(appId);
        
        windowEl.style.display = 'flex';
        windowEl.classList.remove('hidden');
        windowEl.style.zIndex = ++this.windowZIndex;
        
        gsap.fromTo(windowEl, 
            { scale: 0.8, opacity: 0, rotation: -2 }, 
            { scale: 1, opacity: 1, rotation: 0, duration: 0.4, ease: 'power2.out' }
        );
        
        this.activeWindows.add(appId);
        this.initializeApp(appId);
    }

    createWindow(appId) {
        const windowEl = document.createElement('div');
        windowEl.id = `${appId}-window`;
        windowEl.className = 'app-window';
        windowEl.style.width = '600px';
        windowEl.style.height = '400px';
        windowEl.style.top = '100px';
        windowEl.style.left = '100px';
        windowEl.style.background = 'white';
        
        windowEl.innerHTML = `
            <div class="window-header">
                <span>${this.getAppTitle(appId)}</span>
                <div class="window-controls">
                    <button class="window-btn minimize-btn" onclick="ecoOS.minimizeWindow('${appId}')">-</button>
                    <button class="window-btn close-btn" onclick="ecoOS.closeWindow('${appId}')">×</button>
                </div>
            </div>
            <div class="window-content" style="padding: 20px; height: calc(100% - 40px); overflow-y: auto;"></div>
        `;
        
        document.body.appendChild(windowEl);
        return windowEl;
    }

    getAppTitle(appId) {
        const titles = {
            calculator: 'Carbon Calculator',
            chat: 'EcoChat',
            notes: 'Green Notes',
            gallery: 'Eco Gallery',
            news: 'Green News',
            weather: 'Weather',
            todo: 'Eco Todo',
            dashboard: 'Dashboard',
            settings: 'Settings'
        };
        return titles[appId] || 'App';
    }

    closeWindow(appId) {
        const windowEl = E(`${appId}-window`);
        if (windowEl) {
            gsap.to(windowEl, {
                scale: 0.8, opacity: 0, duration: 0.3,
                onComplete: () => {
                    windowEl.style.display = 'none';
                    this.activeWindows.delete(appId);
                }
            });
        }
    }

    minimizeWindow(appId) {
        const windowEl = E(`${appId}-window`);
        if (windowEl) {
            windowEl.style.display = 'none';
            this.minimizedWindows.add(appId);
            this.activeWindows.delete(appId);
        }
    }

    initializeApp(appId) {
        switch (appId) {
            case 'calculator': this.initCalculator(appId); break;
            case 'chat': this.initChat(appId); break;
            case 'notes': this.initNotes(appId); break;
            case 'gallery': this.initGallery(appId); break;
            case 'news': this.initNews(appId); break;
            case 'weather': this.initWeather(appId); break;
            case 'todo': this.initTodo(appId); break;
            case 'dashboard': this.initDashboard(appId); break;
            case 'settings': this.initSettings(appId); break;
        }
    }

    initCalculator(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = `
            <h3>Carbon Footprint Calculator</h3>
            <div class="eco-calculator-form">
                <input type="number" id="miles" placeholder="Miles driven per month">
                <input type="number" id="electricity" placeholder="kWh electricity per month">
                <button class="calculate-btn" onclick="ecoOS.calculateCarbon()">Calculate</button>
            </div>
            <div id="calculator-results" class="calculator-results hidden">
                <p>Your monthly CO2 emissions: <span id="co2Value">0</span> kg</p>
                <div class="eco-tip" id="carbonTip"></div>
            </div>
        `;
    }

    async calculateCarbon() {
        const miles = parseFloat(E('miles').value) || 0;
        const electricity = parseFloat(E('electricity').value) || 0;
        const co2 = (miles * 0.411) + (electricity * 0.5);
        
        E('co2Value').textContent = co2.toFixed(2);
        E('calculator-results').classList.remove('hidden');
        
        const tip = await callAI(`Give a tip to reduce ${co2.toFixed(2)} kg CO2 emissions`);
        E('carbonTip').textContent = tip;
    }

    initChat(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = `
            <div class="chat-container">
                <div class="chat-messages" id="chatMessages">
                    <div class="chat-message bot-message">
                        <div class="message-content">Hi! I'm your eco assistant. How can I help you live more sustainably?</div>
                    </div>
                </div>
                <div class="chat-input-container">
                    <input type="text" class="chat-input" id="chatInput" placeholder="Ask about eco-friendly tips...">
                    <button class="chat-send-btn" onclick="ecoOS.sendMessage()">Send</button>
                </div>
            </div>
        `;
    }

    async sendMessage() {
        const input = E('chatInput');
        const message = input.value.trim();
        if (!message) return;

        const messagesContainer = E('chatMessages');
        messagesContainer.innerHTML += `
            <div class="chat-message user-message">
                <div class="message-content">${message}</div>
            </div>
        `;

        input.value = '';
        const response = await callAI(`As an eco-friendly assistant, respond to: ${message}`);
        
        messagesContainer.innerHTML += `
            <div class="chat-message bot-message">
                <div class="message-content">${response}</div>
            </div>
        `;
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    initNotes(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = `
            <div class="notes-container">
                <div class="notes-toolbar">
                    <button class="notes-btn" onclick="ecoOS.addNote()">+ New Note</button>
                </div>
                <div class="notes-list" id="notesList"></div>
            </div>
        `;
        this.loadNotes();
    }

    addNote() {
        const text = prompt('Enter your eco note:');
        if (text) {
            const notes = loadFromStorage('eco_notes') || [];
            notes.push({ text, date: new Date().toLocaleDateString() });
            saveToStorage('eco_notes', notes);
            this.loadNotes();
        }
    }

    loadNotes() {
        const notes = loadFromStorage('eco_notes') || [];
        const notesList = E('notesList');
        notesList.innerHTML = notes.map((note, index) => `
            <div class="note-item">
                <div>
                    <div>${note.text}</div>
                    <small>${note.date}</small>
                </div>
                <button class="note-delete" onclick="ecoOS.deleteNote(${index})">×</button>
            </div>
        `).join('');
    }

    deleteNote(index) {
        const notes = loadFromStorage('eco_notes') || [];
        notes.splice(index, 1);
        saveToStorage('eco_notes', notes);
        this.loadNotes();
    }

    initGallery(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = `
            <div class="gallery-container">
                <div class="gallery-header">Eco Gallery</div>
                <div class="gallery-grid">
                    ${GALLERY_IMAGES.map(img => `
                        <div class="gallery-item">
                            <img src="${img.url}" alt="${img.title}" class="gallery-image">
                            <div style="padding: 8px;">
                                <div style="font-weight: bold; font-size: 12px;">${img.title}</div>
                                <div style="font-size: 10px; opacity: 0.7;">${img.description}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    initNews(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = `
            <div class="news-container">
                <div class="news-feed" id="newsFeed">Loading eco news...</div>
            </div>
        `;
        this.loadNews();
    }

    async loadNews() {
        try {
            const response = await fetch(`https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=environment&language=en&size=5`);
            const data = await response.json();
            const newsFeed = E('newsFeed');
            
            newsFeed.innerHTML = data.results.map(article => `
                <div class="news-article">
                    <img src="${article.image_url || 'https://via.placeholder.com/100x68?text=News'}" alt="News" class="news-image">
                    <div>
                        <div class="news-title">${article.title}</div>
                        <div class="news-summary">${article.description || 'No description available'}</div>
                        <div class="news-date">${new Date(article.pubDate).toLocaleDateString()}</div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            E('newsFeed').innerHTML = '<div>Unable to load news at this time.</div>';
        }
    }

    initWeather(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = `
            <div>
                <h3>Weather & Air Quality</h3>
                <div id="weatherInfo">Loading weather data...</div>
            </div>
        `;
        this.loadWeather();
    }

    async loadWeather() {
        try {
            const tips = await callAI('Give 3 weather-related eco tips for today');
            E('weatherInfo').innerHTML = `
                <p>Weather data unavailable, but here are eco tips:</p>
                <div class="eco-tip">${tips}</div>
            `;
        } catch (error) {
            E('weatherInfo').textContent = 'Weather data unavailable.';
        }
    }

    initTodo(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = `
            <div>
                <h3>Eco Todo List</h3>
                <div style="margin-bottom: 10px;">
                    <input type="text" id="todoInput" placeholder="Add eco-friendly task..." style="flex: 1; padding: 8px;">
                    <button id="addTodo" style="padding: 8px 12px; margin-left: 8px;">Add</button>
                </div>
                <div id="todoList"></div>
            </div>
        `;
        
        const todos = loadFromStorage('eco_todos') || [];
        todos.forEach(t => this.addTodoItem(t));
        
        E('addTodo').onclick = async () => {
            const txt = E('todoInput').value;
            if (!txt) return;
            
            const reminder = await callAI(`Generate a reminder for this eco todo: ${txt}`);
            const todo = { text: txt, reminder };
            todos.push(todo);
            saveToStorage('eco_todos', todos);
            this.addTodoItem(todo);
            E('todoInput').value = '';
        };
    }

    addTodoItem(todo) {
        const list = E('todoList');
        const item = document.createElement('div');
        item.style.cssText = 'background: #f0f0f0; padding: 10px; margin: 5px 0; border-radius: 5px;';
        item.innerHTML = `${todo.text} - ${todo.reminder}`;
        list.appendChild(item);
    }

    initDashboard(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = `
            <div class="dashboard-container">
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <div class="stat-value">42</div>
                        <div class="stat-label">Trees Saved</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">128</div>
                        <div class="stat-label">kg CO2 Reduced</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">15</div>
                        <div class="stat-label">Days Active</div>
                    </div>
                </div>
                <div style="padding: 20px; text-align: center;">
                    <p>Your eco-friendly journey dashboard!</p>
                </div>
            </div>
        `;
    }

    initSettings(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = `
            <div>
                <h3>Settings</h3>
                <p><strong>Welcome, ${this.user?.username || 'User'}!</strong></p>
                <button onclick="ecoOS.clearData()" style="background: #ff4444; color: white; padding: 10px; border: none; border-radius: 5px;">Clear All Data</button>
                <hr style="margin: 20px 0;">
                <p style="font-size: 12px; opacity: 0.7;">
                    Made by Tanuj Sharma and Sparsh Jain, Class 11, Lovely Public School.<br>
                    © 2025
                </p>
            </div>
        `;
    }

    clearData() {
        if (confirm('Are you sure you want to clear all data?')) {
            localStorage.clear();
            location.reload();
        }
    }

    async showDailyEcoTip() {
        try {
            const tip = await callAI('Give a short daily eco tip');
            this.showNotification('Daily Eco Tip', tip);
        } catch (error) {
            this.showNotification('Daily Eco Tip', 'Remember to reduce, reuse, and recycle!');
        }
    }

    showNotification(title, message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `<strong>${title}</strong><br>${message}`;
        E('notifications').appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

const ecoOS = new EcoTrackOS();

document.addEventListener('DOMContentLoaded', () => {
    ecoOS.init();
});
