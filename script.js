// carbon quest: gamified interactions and simple persistence

const DEFAULT = {
  xp: 0,
  level: 1,
  carbonSaved: 0, // in kg
  activity: []
};

const LEVEL_XP_BASE = 100; // XP required to go from level n to n+1 = base * n

// Load state
function loadState(){
  const raw = localStorage.getItem('eco_state');
  if(!raw) return {...DEFAULT};
  try { return JSON.parse(raw); } catch(e){ return {...DEFAULT}; }
}

function saveState(state){
  localStorage.setItem('eco_state', JSON.stringify(state));
}

let state = loadState();

// UPDATE UI
function updateUI(){
  document.getElementById('carbonScore').textContent = `${state.carbonSaved} kg`;

  const nextXp = LEVEL_XP_BASE * state.level;
  document.getElementById('xpText').textContent = `${state.xp} / ${nextXp} XP`;
  document.getElementById('nextGoal').textContent = `${nextXp} XP`;
  document.getElementById('xpFill').style.width = `${Math.min(100, (state.xp / nextXp) * 100)}%`;

  document.getElementById('userLevel').textContent = `Lvl ${state.level}`;
  document.getElementById('lbYou').textContent = state.xp + (state.carbonSaved * 2);

  renderActivity();
  renderBadges();
  animateRing();
  updateBuddySpeech();
}

// ADD ACTIVITY
function addActivity(text, xpGain=0, carbonGain=0){
  const item = { t: Date.now(), text, xp: xpGain, carbon: carbonGain };
  state.activity.unshift(item);

  state.xp += xpGain;
  state.carbonSaved = Math.round((state.carbonSaved + carbonGain) * 10) / 10;

  while(state.xp >= LEVEL_XP_BASE * state.level){
    state.xp -= LEVEL_XP_BASE * state.level;
    state.level++;
    playLevelUp();
  }

  saveState(state);
  updateUI();
  flashAction(`+${carbonGain} kg • +${xpGain} XP`);
}

// FLASH ACTION POPUP
function flashAction(text){
  const el = document.createElement('div');
  el.className = 'temp-flash';
  el.textContent = text;

  Object.assign(el.style, {
    position:'fixed',
    right:'26px',
    top:'26px',
    background:'linear-gradient(90deg,#9AE6B4,#34D399)',
    color:'#052016',
    padding:'10px 12px',
    borderRadius:'10px',
    fontWeight:800,
    boxShadow:'0 10px 30px rgba(2,6,23,0.6)',
    zIndex:9999,
    opacity:0
  });

  document.body.appendChild(el);

  requestAnimationFrame(()=>{
    el.style.transition='transform .4s, opacity .4s';
    el.style.transform='translateY(0)';
    el.style.opacity=1;
  });

  setTimeout(()=>{
    el.style.opacity=0;
    el.style.transform='translateY(-10px)';
    setTimeout(()=>el.remove(),420);
  },1400);
}

// RING ANIMATION
function animateRing(){
  const fill = document.querySelector('.ring-fill');

  const max = 1000;
  const pct = Math.min(1, state.carbonSaved / max);
  const dash = 302;
  const offset = dash - dash * pct;

  fill.style.strokeDashoffset = offset;

  const g = document.querySelector('#g1 stop:last-child');
  if(g){
    if(pct > 0.6) g.setAttribute('stop-color','#10b981');
    else if(pct > 0.25) g.setAttribute('stop-color','#34D399');
    else g.setAttribute('stop-color','#9AE6B4');
  }
}

// LEVEL UP SOUND
function playLevelUp(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = 'sine';
    o.frequency.setValueAtTime(440 + state.level * 40, ctx.currentTime);

    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.6);

  }catch(e){}
}

// BUDDY SPEECH
function updateBuddySpeech(){
  const b = document.getElementById('buddySpeech');
  const c = state.carbonSaved;

  if(c >= 500) b.textContent = "Legendary. Oceans want you on speed dial.";
  else if(c >= 100) b.textContent = "Amazing work! Keep the planet smiling 🌍";
  else if(c >= 20) b.textContent = "Nice! You're off to a green start.";
  else b.textContent = "Complete missions to gain Earth Points!";

  const face = document.getElementById('buddyFace');
  face.style.transform = `translateY(${Math.sin(Date.now()/450) * 1.2}px)`;
}

// MISSIONS DEFINITIONS
const MISSION_DEFS = [
  { id:'bike', emoji:'🚴', title:'Ride a bike', desc:'Short trip under 5km', carbon:2, xp:12 },
  { id:'recycle', emoji:'♻️', title:'Recycle', desc:'Recycle plastics or paper', carbon:1, xp:6 },
  { id:'plant', emoji:'🌳', title:'Plant a tree', desc:'Plant or support one tree', carbon:50, xp:120 },
  { id:'meat', emoji:'🥗', title:'Skip meat (lunch)', desc:'Choose a plant-based meal', carbon:3, xp:18 },
  { id:'public', emoji:'🚆', title:'Public transport', desc:'Take the bus/train', carbon:4, xp:22 },
  { id:'lights', emoji:'💡', title:'Energy saver', desc:'Turn off extra lights', carbon:0.5, xp:4 }
];

// RENDER MISSIONS
function renderMissions(){
  const grid = document.getElementById('missionsGrid');
  grid.innerHTML = '';

  MISSION_DEFS.forEach(m=>{
    const tpl = document.getElementById('missionTpl').content.cloneNode(true);
    const card = tpl.querySelector('.mission-card');

    card.querySelector('.mission-emoji').textContent = m.emoji;
    card.querySelector('.mission-title').textContent = m.title;
    card.querySelector('.mission-desc').textContent = m.desc;
    card.querySelector('.mission-reward').textContent = `+${m.carbon} kg`;

    const btn = card.querySelector('.btn-do');
    btn.addEventListener('click', ()=>{
      addActivity(m.title, m.xp, m.carbon);
      btn.disabled = true;
      btn.textContent = 'Done';
    });

    grid.appendChild(card);
  });
}

// RENDER ACTIVITY
function renderActivity(){
  const el = document.getElementById('activityList');
  el.innerHTML = '';

  state.activity.slice(0,10).forEach(a=>{
    const li = document.createElement('li');
    const time = new Date(a.t);

    li.innerHTML =
      `<span>${a.text}</span>
       <span>${a.carbon} kg • ${a.xp} XP 
       <small style="color:var(--muted);margin-left:8px">
       · ${time.toLocaleTimeString()}</small></span>`;

    el.appendChild(li);
  });
}

// BADGES
const BADGE_DEFS = [
  { key:'first', icon:'🌟', title:'First Steps', desc:'Save 5 kg', threshold:5 },
  { key:'eco-warrior', icon:'🏅', title:'Eco Warrior', desc:'Save 50 kg', threshold:50 },
  { key:'planter', icon:'🌳', title:'Tree Planter', desc:'Plant 1 tree', threshold:40 },
  { key:'commuter', icon:'🚆', title:'Car-Free', desc:'Use public transport 10 times', threshold:80 },
  { key:'legend', icon:'👑', title:'Planet Legend', desc:'Save 500 kg', threshold:500 }
];

function renderBadges(){
  const area = document.getElementById('badgesArea');
  area.innerHTML = '';

  BADGE_DEFS.forEach(b=>{
    const unlocked = state.carbonSaved >= b.threshold;

    const div = document.createElement('div');
    div.className = 'badge' + (unlocked ? '' : ' locked');
    div.title = `${b.title} — ${b.desc}`;
    div.innerHTML = `<div>${b.icon}</div>`;

    area.appendChild(div);
  });
}

// LEADERBOARD
function populateLeaderboard(){
  document.getElementById('lbYou').textContent =
    state.xp + (state.carbonSaved * 2);
}

// QUICK ACTIONS
document.querySelectorAll('.action').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const id = btn.dataset.action;

    if(id === 'log-bike') addActivity('Quick: Bike', 12, 2);
    if(id === 'log-recycle') addActivity('Quick: Recycle', 6, 1);
    if(id === 'log-meat') addActivity('Quick: Skip Meat', 18, 3);
  });
});

// NAVIGATION BUTTONS
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');

    const tab = btn.dataset.tab;

    if(tab === 'missions'){
      document.getElementById('contentArea').scrollIntoView({behavior:'smooth'});
    } 
    else if(tab === 'badges'){
      document.querySelector('.badges-panel').scrollIntoView({behavior:'smooth'});
    }
    else if(tab === 'stats'){
      alert('Stats panel coming soon — import your real emissions data for precise tracking.');
    }
  });
});

// OPEN APPS FROM DASHBOARD
const appRoutes = {
  ai: "ai.html",
  carbon: "carbon.html",
  chat: "chats.html",
  news: "news.html",
  notes: "notes.html",
  weather: "weather.html"
};

document.querySelectorAll('.app-item').forEach(app => {
  app.addEventListener('click', () => {
    const appName = app.dataset.app;
    const target = appRoutes[appName];

    if(target){
      window.location.href = target;
    } else {
      alert("This app is not linked yet.");
    }
  });
});

// INIT
renderMissions();
populateLeaderboard();
updateUI();

// BUDDY FLOAT LOOP
setInterval(()=>{ updateBuddySpeech(); }, 900);

// RESET (SHIFT + click avatar)
document.querySelector('.avatar').addEventListener('click', (ev)=>{
  if(ev.shiftKey){
    if(confirm('Reset all progress?')){
      state = {...DEFAULT};
      saveState(state);
      updateUI();
      alert('Progress reset.');
    }
  }
});

// CONFETTI AT MILESTONES
let lastMilestone = Math.floor(state.carbonSaved / 100);

function checkMilestones(){
  const milestone = Math.floor(state.carbonSaved / 100);

  if(milestone > lastMilestone){
    burstConfetti();
    lastMilestone = milestone;
  }
}

setInterval(checkMilestones, 1500);

// CONFETTI BURST
function burstConfetti(){
  const count = 24;

  for(let i=0; i<count; i++){
    const d = document.createElement('div');
    d.className='confetti';

    const size = (Math.random()*8)+6;

    Object.assign(d.style,{
      position:'fixed',
      left:`${Math.random()*80 + 10}%`,
      top:`${Math.random()*40 + 10}%`,
      width:`${size}px`,
      height:`${size}px`,
      background:`hsl(${Math.random()*80+90}deg 60% 60%)`,
      transform:`rotate(${Math.random()*360}deg)`,
      opacity:1,
      borderRadius:'2px',
      zIndex:9999
    });

    document.body.appendChild(d);

    setTimeout(()=>{
      d.style.transition='transform 1.2s ease, top 1.2s ease, opacity 1.2s';
      d.style.top = `${window.innerHeight + 50}px`;
      d.style.opacity = '0';
      d.style.transform = `translateX(${(Math.random()-0.5)*200}px) rotate(${Math.random()*720}deg)`;
    },30);

    setTimeout(()=>d.remove(),1500);
  }
}

// CSS for flash
const style = document.createElement('style');
style.textContent = `.temp-flash{will-change:transform,opacity}`;
document.head.appendChild(style);
