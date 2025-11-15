/* ================================
     ECO TRACK - SCRIPT.JS
   ================================ */

/* -------------------------------
   Persistent State
--------------------------------*/
const DEFAULT = {
  xp: 0,
  level: 1,
  carbonSaved: 0,
  activity: []
};

const LEVEL_XP_BASE = 100;

function loadState() {
  const raw = localStorage.getItem("eco_state");
  if (!raw) return { ...DEFAULT };
  try {
    return JSON.parse(raw);
  } catch (e) {
    return { ...DEFAULT };
  }
}

function saveState(state) {
  localStorage.setItem("eco_state", JSON.stringify(state));
}

let state = loadState();

/* -------------------------------
   UI UPDATERS
--------------------------------*/
function updateUI() {
  document.getElementById("carbonScore").textContent =
    state.carbonSaved + " kg";

  const nextXp = LEVEL_XP_BASE * state.level;
  document.getElementById("xpText").textContent =
    state.xp + " / " + nextXp + " XP";
  document.getElementById("nextGoal").textContent = nextXp + " XP";
  document.getElementById("xpFill").style.width =
    Math.min(100, (state.xp / nextXp) * 100) + "%";

  document.getElementById("userLevel").textContent =
    "Lvl " + state.level;

  document.getElementById("lbYou").textContent =
    state.xp + state.carbonSaved * 2;

  renderActivity();
  renderBadges();
  animateRing();
  updateBuddySpeech();
}

/* -------------------------------
   Activity + Leveling
--------------------------------*/
function addActivity(text, xpGain = 0, carbonGain = 0) {
  const entry = {
    t: Date.now(),
    text,
    xp: xpGain,
    carbon: carbonGain
  };

  state.activity.unshift(entry);
  state.xp += xpGain;
  state.carbonSaved = Math.round((state.carbonSaved + carbonGain) * 10) / 10;

  while (state.xp >= LEVEL_XP_BASE * state.level) {
    state.xp -= LEVEL_XP_BASE * state.level;
    state.level++;
    playLevelUp();
  }

  saveState(state);
  updateUI();
  flashAction("+" + carbonGain + " kg  •  +" + xpGain + " XP");
}

function flashAction(msg) {
  const div = document.createElement("div");
  div.className = "temp-flash";
  div.textContent = msg;

  Object.assign(div.style, {
    position: "fixed",
    right: "26px",
    top: "26px",
    background: "linear-gradient(90deg,#9AE6B4,#34D399)",
    color: "#052016",
    padding: "10px 12px",
    borderRadius: "10px",
    fontWeight: "800",
    zIndex: "9999",
    opacity: 0,
    transition: "opacity .4s, transform .4s",
    transform: "translateY(-10px)"
  });

  document.body.appendChild(div);
  requestAnimationFrame(() => {
    div.style.opacity = 1;
    div.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    div.style.opacity = 0;
    div.style.transform = "translateY(-12px)";
    setTimeout(() => div.remove(), 500);
  }, 1500);
}

/* -------------------------------
   Carbon Ring Animation
--------------------------------*/
function animateRing() {
  const fill = document.querySelector(".ring-fill");
  const dash = 302;
  const maxValue = 1000;
  const percent = Math.min(1, state.carbonSaved / maxValue);
  const offset = dash - dash * percent;

  fill.style.strokeDashoffset = offset;
}

/* -------------------------------
   Level-Up Beep
--------------------------------*/
function playLevelUp() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440 + state.level * 40, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {}
}

/* -------------------------------
   Buddy Speech
--------------------------------*/
function updateBuddySpeech() {
  const t = state.carbonSaved;
  const b = document.getElementById("buddySpeech");

  if (t >= 500) b.textContent = "Legendary. Even glaciers cheer for you.";
  else if (t >= 150) b.textContent = "Crushing it. Earth salutes you.";
  else if (t >= 20) b.textContent = "You’re doing good things. Keep going.";
  else b.textContent = "Complete missions to gain Earth Points!";
}

/* -------------------------------
   Render Missions
--------------------------------*/
const MISSION_DEFS = [
  { id: "bike", emoji: "🚴", title: "Ride a bike", desc: "Short trip", carbon: 2, xp: 12 },
  { id: "recycle", emoji: "♻️", title: "Recycle items", desc: "Plastic/Paper", carbon: 1, xp: 6 },
  { id: "plant", emoji: "🌳", title: "Plant a tree", desc: "1 tree", carbon: 50, xp: 120 },
  { id: "meat", emoji: "🥗", title: "Skip meat", desc: "Lunch", carbon: 3, xp: 18 },
  { id: "public", emoji: "🚆", title: "Public transport", desc: "Bus/train", carbon: 4, xp: 22 },
  { id: "lights", emoji: "💡", title: "Energy saver", desc: "Turn off lights", carbon: 0.5, xp: 4 }
];

function renderMissions() {
  const grid = document.getElementById("missionsGrid");
  const tpl = document.getElementById("missionTpl");

  grid.innerHTML = "";

  MISSION_DEFS.forEach(m => {
    const node = tpl.content.cloneNode(true);
    node.querySelector(".mission-emoji").textContent = m.emoji;
    node.querySelector(".mission-title").textContent = m.title;
    node.querySelector(".mission-desc").textContent = m.desc;
    node.querySelector(".mission-reward").textContent = `+${m.carbon} kg`;

    const btn = node.querySelector(".btn-do");
    btn.addEventListener("click", () => {
      addActivity(m.title, m.xp, m.carbon);
      btn.disabled = true;
      btn.textContent = "Done";
    });

    grid.appendChild(node);
  });
}

/* -------------------------------
   Recent Activity List
--------------------------------*/
function renderActivity() {
  const list = document.getElementById("activityList");
  list.innerHTML = "";

  state.activity.slice(0, 10).forEach(a => {
    const li = document.createElement("li");
    const time = new Date(a.t).toLocaleTimeString();
    li.innerHTML =
      `<span>${a.text}</span>
       <span>${a.carbon} kg • ${a.xp} XP 
       <small style="color:var(--muted); margin-left:6px">· ${time}</small></span>`;
    list.appendChild(li);
  });
}

/* -------------------------------
   Badges
--------------------------------*/
const BADGES = [
  { key: "first", icon: "🌟", threshold: 5 },
  { key: "warrior", icon: "🏅", threshold: 50 },
  { key: "tree", icon: "🌳", threshold: 40 },
  { key: "commuter", icon: "🚆", threshold: 80 },
  { key: "legend", icon: "👑", threshold: 500 }
];

function renderBadges() {
  const area = document.getElementById("badgesArea");
  area.innerHTML = "";

  BADGES.forEach(b => {
    const unlocked = state.carbonSaved >= b.threshold;
    const div = document.createElement("div");
    div.className = "badge" + (unlocked ? "" : " locked");
    div.textContent = b.icon;
    area.appendChild(div);
  });
}

/* -------------------------------
   App Routing (ai.html, carbon.html, etc)
--------------------------------*/
const ROUTES = {
  ai: "ai.html",
  carbon: "carbon.html",
  chat: "chats.html",
  news: "news.html",
  notes: "notes.html",
  weather: "weather.html"
};

document.querySelectorAll(".app-item").forEach(el => {
  el.addEventListener("click", () => {
    const key = el.dataset.app;
    if (ROUTES[key]) window.location.href = ROUTES[key];
  });
});

/* -------------------------------
   Quick Actions
--------------------------------*/
document.querySelectorAll(".action").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.action;
    if (id === "log-bike") addActivity("Quick: Bike", 12, 2);
    if (id === "log-recycle") addActivity("Quick: Recycle", 6, 1);
    if (id === "log-meat") addActivity("Quick: Skip Meat", 18, 3);
  });
});

/* -------------------------------
   Avatar Reset (Shift+Click)
--------------------------------*/
document.querySelector(".avatar").addEventListener("click", e => {
  if (e.shiftKey) {
    if (confirm("Reset all progress?")) {
      state = { ...DEFAULT };
      saveState(state);
      updateUI();
    }
  }
});

/* -------------------------------
   Parallax Background
--------------------------------*/
document.addEventListener("mousemove", e => {
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;

  document.querySelectorAll("[data-depth]").forEach(layer => {
    const depth = parseFloat(layer.getAttribute("data-depth"));
    layer.style.transform =
      `translate(${x * depth * 20}px, ${y * depth * 20}px)`;
  });
});

/* -------------------------------
   Particle Generator
--------------------------------*/
function spawnParticles() {
  const container = document.getElementById("particles");

  setInterval(() => {
    const p = document.createElement("div");
    p.className = "particle";

    const size = Math.random() * 6 + 4;
    const left = Math.random() * 100;
    const duration = Math.random() * 3000 + 5000;

    p.style.width = size + "px";
    p.style.height = size + "px";
    p.style.left = left + "%";
    p.style.top = "100%";
    p.style.opacity = "0.6";

    container.appendChild(p);

    setTimeout(() => {
      p.style.transition = `transform ${duration}ms linear, opacity 800ms`;
      p.style.transform = "translateY(-140vh)";
      p.style.opacity = "0";
    }, 50);

    setTimeout(() => p.remove(), duration + 2000);
  }, 180);
}

/* -------------------------------
   Confetti on milestones
--------------------------------*/
let lastMilestone = Math.floor(state.carbonSaved / 100);

function checkMilestones() {
  const m = Math.floor(state.carbonSaved / 100);
  if (m > lastMilestone) {
    burstConfetti();
    lastMilestone = m;
  }
}

setInterval(checkMilestones, 1500);

function burstConfetti() {
  for (let i = 0; i < 30; i++) {
    const d = document.createElement("div");
    d.className = "confetti";

    const size = Math.random() * 7 + 6;
    d.style.position = "fixed";
    d.style.left = Math.random() * 100 + "%";
    d.style.top = "-10px";
    d.style.width = size + "px";
    d.style.height = size + "px";
    d.style.background =
      `hsl(${Math.random() * 80 + 90}deg 65% 60%)`;
    d.style.borderRadius = "2px";
    d.style.zIndex = "99999";
    d.style.opacity = "1";
    document.body.appendChild(d);

    setTimeout(() => {
      d.style.transition =
        "transform 1.2s ease, top 1.2s ease, opacity 1.2s";
      d.style.top = window.innerHeight + "px";
      d.style.opacity = "0";
      d.style.transform =
        `translateX(${(Math.random() - 0.5) * 200}px) rotate(${Math.random() * 720}deg)`;
    }, 20);

    setTimeout(() => d.remove(), 1500);
  }
}

/* -------------------------------
   Fade-in Utility Style
--------------------------------*/
const style = document.createElement("style");
style.textContent = `.temp-flash{will-change:opacity,transform}`;
document.head.appendChild(style);

/* -------------------------------
   INIT
--------------------------------*/
renderMissions();
updateUI();
spawnParticles();
