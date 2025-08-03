const WALLPAPERS = [
  "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3a2e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1200&q=80"
];
function E(id) { return document.getElementById(id); }
function $$(sel) { return Array.from(document.querySelectorAll(sel)); }
function setWallpaper() {
  let idx = Math.floor(Math.random() * WALLPAPERS.length);
  localStorage.setItem("eco_wallpaper_idx", idx);
  E('wallpaper').style.backgroundImage = `url('${WALLPAPERS[idx]}')`;
}
function updateDesktopClock() {
  const clock = E('desktopClock');
  function pad(n) { return n < 10 ? '0' + n : n; }
  function animClock() {
    const now = new Date();
    clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    clock.style.transform = 'scale(1.02)';
    setTimeout(() => { clock.style.transform = 'scale(1)'; }, 250);
  }
  animClock();
  setInterval(animClock, 1000);
}
function saveNotes(notes) { localStorage.setItem('eco_notes', JSON.stringify(notes)); }
function loadNotes() { try { return JSON.parse(localStorage.getItem('eco_notes')) || []; } catch { return []; } }
function saveChatHistory(msgs) { localStorage.setItem('eco_chat', JSON.stringify(msgs)); }
function loadChatHistory() { try { return JSON.parse(localStorage.getItem('eco_chat')) || []; } catch { return []; } }
function saveCalc(result) { localStorage.setItem('eco_calculator_result', JSON.stringify(result)); }
function loadCalc() { try { return JSON.parse(localStorage.getItem('eco_calculator_result')) || null; } catch { return null; } }
class EcoTrackOS {
  constructor() {
    this.activeWindows = new Set();
    this.windowZIndex = 200;
    this.minimizedWindows = new Set();
  }
  init() {
    this.setupEventListeners();
    this.setupWindowControls();
    this.initializeApps();
    this.hideLoadingScreen();
    updateDesktopClock();
  }
  showLoadingScreen() {
    return new Promise(resolve => {
      const loading = E('loadingScreen');
      loading.style.display = 'flex';
      setTimeout(() => resolve(), 1500);
    });
  }
  hideLoadingScreen() {
    const loading = E('loadingScreen');
    loading.style.display = 'none';
  }
  setupEventListeners() {
    const launcherBtn = E('launcherBtn');
    const appLauncher = E('appLauncher');
    const runningAppsDiv = E('runningApps');
    launcherBtn.onclick = () => {
      appLauncher.classList.toggle('hidden');
      if (!appLauncher.classList.contains('hidden')) {
        E('launcherSearch').focus();
      }
    };
    $$('.launcher-app').forEach(btn => {
      btn.onclick = () => {
        this.launchApp(btn.dataset.app);
        appLauncher.classList.add('hidden');
      };
    });
    const searchInput = E('launcherSearch');
    searchInput.oninput = () => {
      const search = searchInput.value.toLowerCase();
      $$('.launcher-app').forEach(appBtn => {
        const name = appBtn.querySelector('.launcher-app-name').textContent.toLowerCase();
        appBtn.style.display = name.includes(search) ? 'flex' : 'none';
      });
    };
    document.addEventListener('keydown', e => {
      if (e.key === "Escape") {
        if (!appLauncher.classList.contains('hidden')) {
          appLauncher.classList.add('hidden');
          launcherBtn.focus();
        }
      }
    });
    document.addEventListener('click', e => {
      if (!appLauncher.classList.contains('hidden') &&
         !appLauncher.contains(e.target) && e.target !== launcherBtn) {
        appLauncher.classList.add('hidden');
      }
    });
    this.runningAppsDiv = runningAppsDiv;
  }
  setupWindowControls() {
    $$('.window-btn.minimize-btn').forEach(btn => {
      btn.onclick = () => {
        const win = btn.closest('.app-window');
        win.classList.add('hidden');
        this.minimizedWindows.add(win.id);
        this.activeWindows.delete(win.id);
        this.updateTaskbar();
      };
    });
    $$('.window-btn.maximize-btn').forEach(btn => {
      btn.onclick = () => {
        const win = btn.closest('.app-window');
        win.classList.toggle('maximized');
      };
    });
    $$('.window-btn.close-btn').forEach(btn => {
      btn.onclick = () => {
        const win = btn.closest('.app-window');
        win.classList.add('hidden');
        this.activeWindows.delete(win.id);
        this.minimizedWindows.delete(win.id);
        this.updateTaskbar();
      };
    });
  }
  updateTaskbar() {
    this.runningAppsDiv.innerHTML = '';
    this.activeWindows.forEach(winId => {
      const btn = document.createElement('button');
      btn.className = 'taskbar-app active';
      btn.title = this.getAppNameFromWindowId(winId);
      btn.setAttribute('aria-label', `Switch to ${btn.title} app`);
      btn.textContent = this.getAppIconFromWindowId(winId);
      btn.onclick = () => {
        this.focusWindow(winId);
      };
      this.runningAppsDiv.appendChild(btn);
    });
  }
  getAppNameFromWindowId(winId) {
    const map = {
      'eco-calculator-window': 'Eco Calculator',
      'ai-chatbot-window': 'AI Chatbot',
      'impact-dashboard-window': 'Impact Dashboard',
      'news-feed-window': 'News Feed',
      'notes-window': 'Notes',
      'media-gallery-window': 'Gallery',
      'about-window': 'About',
    };
    return map[winId] || 'Application';
  }
  getAppIconFromWindowId(winId) {
    const map = {
      'eco-calculator-window': '🧮',
      'ai-chatbot-window': '🤖',
      'impact-dashboard-window': '📊',
      'news-feed-window': '📰',
      'notes-window': '📝',
      'media-gallery-window': '🖼️',
      'about-window': 'ℹ️',
    };
    return map[winId] || '❓';
  }
  launchApp(appId) {
    const winId = `${appId}-window`;
    const winEl = E(winId);
    if (!winEl) return;
    winEl.classList.remove('hidden', 'maximized');
    winEl.style.zIndex = ++this.windowZIndex;
    this.activeWindows.add(winId);
    this.minimizedWindows.delete(winId);
    this.focusWindow(winId);
    this.initializeApp(appId);
    this.updateTaskbar();
  }
  focusWindow(winId) {
    const winEl = E(winId);
    if (!winEl) return;
    winEl.style.zIndex = ++this.windowZIndex;
    winEl.classList.remove('hidden');
    this.activeWindows.add(winId);
    this.minimizedWindows.delete(winId);
    this.updateTaskbar();
    winEl.focus();
  }
  initializeApps() {
    this.initializeCalculatorApp();
    this.initializeChatbotApp();
    this.initializeDashboardApp();
    this.initializeNewsApp();
    this.initializeNotesApp();
    this.initializeGalleryApp();
  }
  initializeApp(appId) {
    if (appId === 'eco-calculator') this.initializeCalculatorApp();
    else if (appId === 'ai-chatbot') this.initializeChatbotApp();
    else if (appId === 'impact-dashboard') this.initializeDashboardApp();
    else if (appId === 'news-feed') this.initializeNewsApp();
    else if (appId === 'notes') this.initializeNotesApp();
    else if (appId === 'media-gallery') this.initializeGalleryApp();
  }
  initializeCalculatorApp() {
    const form = E('ecoCalculatorForm');
    if (!form) return;
    const resultsDiv = E('calculatorResults');
    const co2ValueSpan = E('co2Value');
    const tipsDiv = E('ecoTips');
    const loader = form.querySelector('.btn-loader');
    form.onsubmit = e => {
      e.preventDefault();
      loader.classList.remove('hidden');
      setTimeout(() => {
        const elec = parseFloat(E('monthlyElectricity').value) || 0;
        const gas = parseFloat(E('monthlyGas').value) || 0;
        const travelKm = parseFloat(E('monthlyTravelKm').value) || 0;
        const co2 = ((elec * 0.0007) + (gas * 0.0053) + (travelKm * 0.0002)) * 12;
        const co2Rounded = Math.max(0, Math.round(co2 * 100) / 100);
        const tips = [
          "Use public transport or cycle.",
          "Switch to LED lighting.",
          "Reduce meat consumption once a week.",
          "Unplug devices when not in use.",
          "Plant trees whenever possible."
        ];
        const result = { co2_tons_per_year: co2Rounded, tips };
        saveCalc(result);
        this.displayCalculatorResults(result);
        loader.classList.add('hidden');
      }, 700);
    };
    const last = loadCalc();
    if (last) this.displayCalculatorResults(last);
  }
  displayCalculatorResults(result) {
    const results
