const GEMINI_API_KEY = 'AIzaSyDuu4VTElp41a41v0ri6auuk9LurwntnKg';
const IMAGE_API_KEY = 'z91cJkR1ACL2RsMf9AVGMYcmeBFhkC7O26yQo8OXz0QH3YARdged6v4Q0DVK';
const IMAGE_ENDPOINT = 'https://modelslab.com/api/v7/images/text-to-image';
const WALLPAPERS = ["https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1465101178521-c1a9136a3a2e?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1200&q=80"];
const GALLERY_IMAGES = [{"url":"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80","title":"Forest Conservation","description":"Protecting old growth forests"},{"url":"https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=800&q=80","title":"Renewable Energy","description":"Wind turbines generating clean power"},{"url":"https://images.unsplash.com/photo-1569163139394-de44333f1e5c?auto=format&fit=crop&w=800&q=80","title":"Sustainable Living","description":"Eco-friendly lifestyle choices"},{"url":"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80","title":"Ocean Conservation","description":"Protecting marine ecosystems"},{"url":"https://images.unsplash.com/photo-1536431311719-398b6704d4cc?auto=format&fit=crop&w=800&q=80","title":"Green Transportation","description":"Electric vehicles and sustainable transport"}];
const NEWS_API_KEY = 'pub_344da34dda66428baeba18626914e979';

function saveToStorage(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function loadFromStorage(key) { return JSON.parse(localStorage.getItem(key)) || null; }

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

function E(id) { return document.getElementById(id); }
function $$(sel) { return [].slice.call(document.querySelectorAll(sel)); }

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

    showLogin() {
        const modal = E('loginModal');
        modal.classList.remove('hidden');
        E('loginBtn').onclick = () => {
            this.user = { username: E('username').value };
            saveToStorage('ecoUser', this.user);
            modal.classList.add('hidden');
            this.init();
        };
        E('registerBtn').onclick = async () => {
            const pledge = await callAI('Generate a fun eco pledge for new users.');
            alert(`Pledge: ${pledge}`);
            this.user = { username: E('username').value };
            saveToStorage('ecoUser', this.user);
            modal.classList.add('hidden');
            this.init();
        };
    }

    setWallpaper() {
        const idx = Math.floor(Math.random() * WALLPAPERS.length);
        const wallpaperEl = E('wallpaper');
        wallpaperEl.style.backgroundImage = `url('${WALLPAPERS[idx]}')`;
        wallpaperEl.style.backgroundColor = 'transparent';
    }

    setupEventListeners() {
        $$('.desktop-icon').forEach(icon => icon.addEventListener('dblclick', () => this.launchApp(icon.dataset.app)));
        document.querySelector('.launcher-btn').addEventListener('click', () => this.toggleLauncher());
        E('darkModeToggle').addEventListener('click', () => document.body.classList.toggle('dark-mode'));
    }

    toggleLauncher() {
        const launcher = E('appLauncher');
        launcher.classList.toggle('hidden');
        gsap.fromTo(launcher, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
    }

    populateLauncher() {
        const grid = E('launcher-grid');
        $$('.desktop-icon').forEach(icon => {
            const app = document.createElement('div');
            app.className = 'launcher-app';
            app.innerHTML = `<span class="launcher-app-icon">${icon.querySelector('.icon').textContent}</span><span class="launcher-app-name">${icon.querySelector('.label').textContent}</span>`;
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
        gsap.fromTo(windowEl, { scale: 0.8, opacity: 0, rotation: -2 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.4, ease: 'power2.out' });
        this.activeWindows.add(appId);
        this.initializeApp(appId);
    }

    createWindow(appId) {
        const windowEl = document.createElement('div');
        windowEl.id = `${appId}-window`;
        windowEl.className = 'app-window';
        windowEl.innerHTML = `
            <div class="window-header">
                <div class="window-title"><span class="window-icon"></span>${appId.replace(/-/g, ' ').toUpperCase()}</div>
                <div class="window-controls">
                    <button class="window-btn minimize-btn">-</button>
                    <button class="window-btn maximize-btn">□</button>
                    <button class="window-btn close-btn">×</button>
                </div>
            </div>
            <div class="window-content"></div>
            <div class="resize-handle"></div>
        `;
        document.body.appendChild(windowEl);
        windowEl.querySelector('.close-btn').addEventListener('click', () => this.closeWindow(appId));
        windowEl.querySelector('.minimize-btn').addEventListener('click', () => this.minimizeWindow(appId));
        windowEl.querySelector('.maximize-btn').addEventListener('click', () => this.maximizeWindow(appId));
        Draggable.create(windowEl, { type: 'x,y', bounds: 'body', handle: '.window-header' });
        return windowEl;
    }

    closeWindow(appId) {
        const windowEl = E(`${appId}-window`);
        gsap.to(windowEl, { scale: 0.8, opacity: 0, duration: 0.3, onComplete: () => windowEl.style.display = 'none' });
        this.activeWindows.delete(appId);
    }

    minimizeWindow(appId) {
        const windowEl = E(`${appId}-window`);
        gsap.to(windowEl, { scale: 0.2, y: '100%', opacity: 0, duration: 0.3, onComplete: () => windowEl.classList.add('hidden') });
        this.minimizedWindows.add(appId);
    }

    maximizeWindow(appId) {
        const windowEl = E(`${appId}-window`);
        windowEl.classList.toggle('maximized');
    }

    initializeApp(appId) {
        switch (appId) {
            case 'eco-calculator': this.initCalculator(appId); break;
            case 'ai-chatbot': this.initChatbot(appId); break;
            case 'notes': this.initNotes(appId); break;
            case 'media-gallery': this.initGallery(appId); break;
            case 'news-feed': this.initNews(appId); break;
            case 'ai-advisor': this.initAIAdvisor(appId); break;
            case 'weather': this.initWeather(appId); break;
            case 'todo': this.initTodo(appId); break;
            case 'settings': this.initSettings(appId); break;
            case 'about': this.initAbout(appId); break;
            case 'impact-dashboard': this.initDashboard(appId); break;
        }
    }

    initCalculator(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = `
            <form id="ecoCalculatorForm">
                <button type="submit">Calculate</button>
            </form>
            <div id="calculatorResults" class="hidden"></div>
        `;
        E('ecoCalculatorForm').onsubmit = async (e) => {
            e.preventDefault();
            const result = { co2_tons_per_year: Math.round(Math.random() * 3 + 1) };
            const tips = await callAI('Generate 3 eco tips.');
            result.tips = tips.split('\n').filter(t => t.trim());
            saveToStorage('eco_calculator_result', result);
            this.displayCalculatorResults(result);
        };
        const last = loadFromStorage('eco_calculator_result');
        if (last) this.displayCalculatorResults(last);
    }

    displayCalculatorResults(result) {
        const resultsDiv = E('calculatorResults');
        resultsDiv.classList.remove('hidden');
        resultsDiv.innerHTML = `<span id="co2Value">${result.co2_tons_per_year}</span> tons CO2/year<br>`;
        const tipsDiv = document.createElement('div');
        tipsDiv.id = 'ecoTips';
        result.tips.forEach((tip, idx) => {
            const d = document.createElement('div');
            d.className = 'eco-tip';
            d.textContent = tip;
            tipsDiv.appendChild(d);
            gsap.fromTo(d, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: idx * 0.15 });
        });
        resultsDiv.appendChild(tipsDiv);
    }

    initChatbot(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = `
            <div class="chat-container">
                <div id="chatMessages" class="chat-messages"></div>
                <div class="chat-input-container">
                    <input id="chatInput" type="text">
                    <button id="chatSendBtn">Send</button>
                </div>
            </div>
        `;
        const history = loadFromStorage('eco_chat') || [];
        history.forEach(m => this.addChatMessage(m.text, m.sender, 'chatMessages'));
        E('chatSendBtn').onclick = async () => {
            const msg = E('chatInput').value.trim();
            if (!msg) return;
            this.addChatMessage(msg, 'user', 'chatMessages');
            const reply = await callAI(`As EcoBot, respond to: ${msg} with sustainability advice.`);
            this.addChatMessage(reply, 'bot', 'chatMessages');
            history.push({ text: msg, sender: 'user' }, { text: reply, sender: 'bot' });
            saveToStorage('eco_chat', history);
            E('chatInput').value = '';
        };
    }

    addChatMessage(text, sender, containerId) {
        const container = E(containerId);
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}-message`;
        msgDiv.innerHTML = `<div class="message-content">${text}</div>`;
        container.appendChild(msgDiv);
        gsap.fromTo(msgDiv, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.52 });
        container.scrollTop = container.scrollHeight;
    }

    initNotes(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = `
            <div class="notes-container">
                <div class="notes-toolbar"><button id="newNoteBtn">New Note</button></div>
                <div id="notesList" class="notes-list"></div>
            </div>
        `;
        this.renderNotes();
        E('newNoteBtn').onclick = () => {
            const txt = prompt('New Note:');
            if (!txt) return;
            const notes = loadFromStorage('eco_notes') || [];
            notes.push({ id: Date.now(), text: txt });
            saveToStorage('eco_notes', notes);
            this.renderNotes();
        };
    }

    renderNotes() {
        const list = E('notesList');
        const notes = loadFromStorage('eco_notes') || [];
        list.innerHTML = '';
        notes.forEach(n => {
            const d = document.createElement('div');
            d.className = 'note-item';
            d.innerHTML = `${n.text} <button class="note-delete">×</button>`;
            d.querySelector('.note-delete').onclick = () => {
                const updated = notes.filter(x => x.id !== n.id);
                saveToStorage('eco_notes', updated);
                this.renderNotes();
            };
            list.appendChild(d);
            gsap.fromTo(d, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.39 });
        });
    }

    initGallery(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = `
            <div class="gallery-container">
                <div class="gallery-header">Eco Gallery <button id="generateImageBtn">Generate Image</button></div>
                <div id="galleryGrid" class="gallery-grid"></div>
            </div>
        `;
        GALLERY_IMAGES.forEach((img, idx) => this.addGalleryItem(img.url, img.title, img.description, idx));
        E('generateImageBtn').onclick = async () => {
            const prompt = prompt('Enter prompt for AI image (e.g., "sustainable forest"):');
            if (!prompt) return;
            const url = await generateImage(prompt);
            this.addGalleryItem(url, 'Generated Image', prompt, GALLERY_IMAGES.length);
        };
    }

    addGalleryItem(url, title, desc, idx) {
        const grid = E('galleryGrid');
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `<img class="gallery-image" src="${url}" alt="${title}">`;
        item.onclick = () => this.showImageModal(url, title, desc);
        grid.appendChild(item);
        gsap.fromTo(item, { opacity: 0, scale: 0.93 }, { opacity: 1, scale: 1, duration: 0.36, delay: idx * 0.1 });
    }

    showImageModal(url, title, desc) {
        const modal = E('imageModal');
        modal.classList.remove('hidden');
        modal.querySelector('.modal-image').src = url;
        modal.querySelector('.modal-title').textContent = title;
        modal.querySelector('.modal-description').textContent = desc;
        modal.querySelector('.modal-close').onclick = () => modal.classList.add('hidden');
    }

    async initNews(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = `<div class="news-container"><div class="news-header"><h3>Eco News</h3></div><div id="newsFeed" class="news-feed"></div></div>`;
        const newsFeed = E('newsFeed');
        try {
            const resp = await fetch(`https://newsdata.io/api/1/news?country=in&language=en&category=environment,climate&apikey=${NEWS_API_KEY}`);
            const data = await resp.json();
            if (data && Array.isArray(data.results)) {
                const arts = data.results.slice(0, 7).map(article => ({
                    title: article.title || 'Untitled',
                    summary: article.description ? article.description.slice(0, 170) + '...' : '',
                    image: article.image_url || "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=400&q=80",
                    date: article.pubDate ? new Date(article.pubDate) : new Date()
                }));
                arts.forEach(async (art, idx) => {
                    art.summary = await callAI(`Summarize this eco article briefly: ${art.summary}`);
                    const d = document.createElement('div');
                    d.className = 'news-article';
                    d.innerHTML = `
                        <img class="news-image" src="${art.image}">
                        <div class="news-content">
                            <div class="news-title">${art.title}</div>
                            <div class="news-summary">${art.summary}</div>
                            <div class="news-date">${art.date.toLocaleDateString()}</div>
                        </div>
                    `;
                    newsFeed.appendChild(d);
                    gsap.fromTo(d, { opacity: 0, y: 30, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.38, delay: idx * 0.1 });
                });
            }
        } catch (error) {}
    }

    initAIAdvisor(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = '<button id="generatePlan">Get Eco Plan</button><div id="plan"></div>';
        E('generatePlan').onclick = async () => {
            const plan = await callAI('Create a weekly sustainability plan for a student in India.');
            E('plan').textContent = plan;
        };
    }

    async initWeather(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = '<div id="weatherInfo"></div>';
        try {
            const resp = await fetch('https://api.openweathermap.org/data/2.5/weather?q=New%20Delhi&appid=YOUR_WEATHER_API_KEY&units=metric');
            const data = await resp.json();
            const tips = await callAI(`Eco tips for ${data.weather[0].main} weather in New Delhi.`);
            E('weatherInfo').innerHTML = `<h3>${data.name}: ${data.main.temp}°C, ${data.weather[0].description}</h3><p>${tips}</p>`;
        } catch (error) {
            E('weatherInfo').textContent = 'Weather data unavailable.';
        }
    }

    initTodo(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = '<input id="todoInput" placeholder="Add todo"><button id="addTodo">Add</button><div id="todoList"></div>';
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
        item.textContent = `${todo.text} - ${todo.reminder}`;
        list.appendChild(item);
    }

    initSettings(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = '<h3>Settings</h3><button onclick="localStorage.clear(); location.reload();">Reset All Data</button>';
    }

    initAbout(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = '<h2>About EcoTrack OS</h2><p>Made by Tanuj Sharma and Sparsh Jain, Class 11, Lovely Public School.</p><p>© 2025</p>';
    }

    initDashboard(appId) {
        const content = E(`${appId}-window`).querySelector('.window-content');
        content.innerHTML = '<div class="dashboard-container"><div class="dashboard-stats"></div><div class="dashboard-charts"></div></div>';
    }

    hideLoadingScreen() {
        setTimeout(() => {
            gsap.to('#loadingScreen', { opacity: 0, duration: 0.5, onComplete: () => E('loadingScreen').style.display = 'none' });
        }, 2000);
    }

    async showDailyEcoTip() {
        const tip = await callAI('Generate a daily eco tip.');
        this.showNotification(tip);
    }

    showNotification(message) {
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.textContent = message;
        E('notifications').appendChild(notif);
        gsap.fromTo(notif, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });
        setTimeout(() => notif.remove(), 5000);
    }
}

const os = new EcoTrackOS();
os.init();

function setWallpaper() {
    let idx = Math.floor(Math.random() * WALLPAPERS.length);
    localStorage.setItem("eco_wallpaper_idx", idx);
    E('wallpaper').style.backgroundImage = `url('${WALLPAPERS[idx]}')`;
}
window.addEventListener('DOMContentLoaded', setWallpaper);

function updateDesktopClock() {
    const clock = E('desktopClock');
    function pad(n) { return n < 10 ? '0' + n : n; }
    function animClock() {
        const now = new Date();
        clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        gsap.fromTo(clock, { scale: 0.97 }, { scale: 1, duration: 0.25, overwrite: 'auto' });
    }
    animClock();
    setInterval(animClock, 1000);
}
window.addEventListener('DOMContentLoaded', updateDesktopClock);

(function() {
    const cc = E('customCursor');
    window.addEventListener('mousemove', e => {
        gsap.to(cc, { left: e.clientX, top: e.clientY, duration: 0.1, opacity: 1 });
    });
    window.addEventListener('mousedown', () => { gsap.to(cc, { scale: 0.8, duration: 0.1 }); });
    window.addEventListener('mouseup', () => { gsap.to(cc, { scale: 1, duration: 0.13 }); });
    window.addEventListener('mouseleave', () => { gsap.to(cc, { opacity: 0, duration: 0.2 }); });
})();
