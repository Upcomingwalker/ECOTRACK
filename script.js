/* Full JS with parallax, particles, and all features.
   Paste into script.js — no external libs required. */

// -----------------------------
// State & persistence
// -----------------------------
const DEFAULT = { xp:0, level:1, carbonSaved:0, activity:[] };
const LEVEL_XP_BASE = 100;
let state = loadState();

function loadState(){
  try{
    const raw = localStorage.getItem('eco_state');
    return raw ? JSON.parse(raw) : {...DEFAULT};
  }catch(e){ return {...DEFAULT}; }
}
function saveState(){ localStorage.setItem('eco_state', JSON.stringify(state)); }

// -----------------------------
// UI update functions
// -----------------------------
function updateUI(){
  document.getElementById('carbonScore').textContent = `${state.carbonSaved} kg`;
  const nextXp = LEVEL_XP_BASE * state.level;
  document.getElementById('xpText').textContent = `${state.xp} / ${nextXp} XP`;
  document.getElementById('nextGoal').textContent = `${nextXp} XP`;
  document.getElementById('xpFill').style.width = `${Math.min(100,(state.xp/nextXp)*100)}%`;
  document.getElementById('userLevel').textContent = `Lvl ${state.level}`;
  document.getElementById('lbYou').textContent = Math.round(state.xp + state.carbonSaved*2);

  renderActivity(); renderBadges(); animateRing(); updateBuddySpeech();
}

// -----------------------------
// Activity & Leveling
// -----------------------------
function addActivity(text,xpGain=0,carbonGain=0){
  const item = { t:Date.now(), text, xp:xpGain, carbon:carbonGain };
  state.activity.unshift(item);
  state.xp += xpGain;
  state.carbonSaved = Math.round((state.carbonSaved + carbonGain)*10)/10;

  while(state.xp >= LEVEL_XP_BASE * state.level){
    state.xp -= LEVEL_XP_BASE * state.level;
    state.level++; playLevelUp();
  }
  saveState(); updateUI(); flashAction(`+${carbonGain} kg • +${xpGain} XP`);
}
function flashAction(text){
  const el = document.createElement('div'); el.className='temp-flash'; el.textContent=text;
  Object.assign(el.style,{position:'fixed',right:'22px',top:'22px',background:'linear-gradient(90deg,#9AE6B4,#34D399)',color:'#042018',padding:'8px 10px',borderRadius:'8px',fontWeight:800,zIndex:9999,opacity:0});
  document.body.appendChild(el);
  requestAnimationFrame(()=>{el.style.transition='transform .35s, opacity .35s'; el.style.transform='translateY(0)'; el.style.opacity=1});
  setTimeout(()=>{el.style.opacity=0; el.style.transform='translateY(-8px)'; setTimeout(()=>el.remove(),420)},1400);
}

// -----------------------------
// Ring animation & level sound
// -----------------------------
function animateRing(){
  const fill = document.querySelector('.ring-fill');
  const max = 1200;
  const pct = Math.min(1, state.carbonSaved / max);
  const dash = 302;
  fill.style.strokeDashoffset = dash - dash*pct;
  const g = document.querySelector('#g1 stop:last-child');
  if(g) g.setAttribute('stop-color', pct>0.6? '#10b981': pct>0.25? '#34D399' : '#9AE6B4');
}
function playLevelUp(){
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(520 + state.level*30, ctx.currentTime);
    g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime+0.02); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+0.45);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.5);
  }catch(e){}
}

// -----------------------------
// Buddy speech
// -----------------------------
function updateBuddySpeech(){
  const b = document.getElementById('buddySpeech');
  const c = state.carbonSaved;
  if(c >= 500) b.textContent = "Legendary. Oceans want you on speed dial.";
  else if(c >= 100) b.textContent = "Amazing work! Keep the planet smiling 🌍";
  else if(c >= 20) b.textContent = "Nice! You're off to a green start.";
  else b.textContent = "Complete missions to gain Earth Points!";
  const face = document.getElementById('buddyFace'); if(face) face.style.transform = `translateY(${Math.sin(Date.now()/420)*1.6}px)`;
}

// -----------------------------
// Missions & UI rendering
// -----------------------------
const MISSION_DEFS = [
  { id:'bike', emoji:'🚴', title:'Ride a bike', desc:'Short trip under 5km', carbon:2, xp:12 },
  { id:'recycle', emoji:'♻️', title:'Recycle', desc:'Recycle plastics or paper', carbon:1, xp:6 },
  { id:'plant', emoji:'🌳', title:'Plant a tree', desc:'Plant or support one tree', carbon:50, xp:120 },
  { id:'meat', emoji:'🥗', title:'Skip meat (lunch)', desc:'Choose a plant-based meal', carbon:3, xp:18 },
  { id:'public', emoji:'🚆', title:'Public transport', desc:'Take the bus/train', carbon:4, xp:22 },
  { id:'lights', emoji:'💡', title:'Energy saver', desc:'Turn off extra lights', carbon:0.5, xp:4 }
];

function renderMissions(){
  const grid = document.getElementById('missionsGrid'); grid.innerHTML='';
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
      btn.disabled = true; btn.textContent = 'Done';
    });
    grid.appendChild(card);
  });
}
function renderActivity(){
  const el = document.getElementById('activityList'); el.innerHTML='';
  state.activity.slice(0,8).forEach(a=>{
    const li = document.createElement('li'); const time = new Date(a.t);
    li.innerHTML = `<span>${a.text}</span><span>${a.carbon} kg • ${a.xp} XP <small style="color:var(--muted);margin-left:8px">· ${time.toLocaleTimeString()}</small></span>`;
    el.appendChild(li);
  });
}
const BADGE_DEFS = [
  { key:'first', icon:'🌟', title:'First Steps', desc:'Save 5 kg', threshold:5 },
  { key:'eco-warrior', icon:'🏅', title:'Eco Warrior', desc:'Save 50 kg', threshold:50 },
  { key:'planter', icon:'🌳', title:'Tree Planter', desc:'Plant 1 tree', threshold:40 },
  { key:'commuter', icon:'🚆', title:'Car-Free', desc:'Use public transport 10 times', threshold:80 },
  { key:'legend', icon:'👑', title:'Planet Legend', desc:'Save 500 kg', threshold:500 }
];
function renderBadges(){
  const area = document.getElementById('badgesArea'); area.innerHTML='';
  BADGE_DEFS.forEach(b=>{
    const unlocked = state.carbonSaved >= b.threshold;
    const div = document.createElement('div'); div.className = 'badge' + (unlocked ? '' : ' locked'); div.title = `${b.title} — ${b.desc}`; div.innerHTML = `<div>${b.icon}</div>`;
    area.appendChild(div);
  });
}
function populateLeaderboard(){ document.getElementById('lbYou').textContent = Math.round(state.xp + (state.carbonSaved*2)); }

// -----------------------------
// App routing (open pages)
// -----------------------------
const appRoutes = { ai:"ai.html", carbon:"carbon.html", chat:"chats.html", news:"news.html", notes:"notes.html", weather:"weather.html" };
document.addEventListener('click', (e)=>{
  const app = e.target.closest('.app-item');
  if(app){
    const name = app.dataset.app; const target = appRoutes[name];
    if(target) window.location.href = target; else alert('App not linked.');
  }
});

// quick actions
document.addEventListener('click', (e)=>{
  const a = e.target.closest('.action');
  if(!a) return;
  const id = a.dataset.action;
  if(id === 'log-bike') addActivity('Quick: Bike', 12, 2);
  if(id === 'log-recycle') addActivity('Quick: Recycle', 6, 1);
  if(id === 'log-meat') addActivity('Quick: Skip Meat', 18, 3);
});

// nav buttons
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    const tab = btn.dataset.tab;
    // simple soft focus behaviors
    if(tab === 'missions') document.querySelector('.missions-panel').scrollIntoView({behavior:'smooth'});
    if(tab === 'badges') document.querySelector('.badges-panel').scrollIntoView({behavior:'smooth'});
    if(tab === 'stats') alert('Stats coming soon.');
  });
});

// avatar reset (shift+click)
document.querySelector('.avatar').addEventListener('click', (ev)=>{ if(ev.shiftKey && confirm('Reset progress?')){ state = {...DEFAULT}; saveState(); updateUI(); alert('Reset.'); } });

// -----------------------------
// Parallax & particles
// -----------------------------
const parallaxRoot = document.getElementById('parallax');
const layers = Array.from(parallaxRoot.querySelectorAll('.layer, .layer-sil'));

let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e)=>{ const w=window.innerWidth,h=window.innerHeight; mouseX=(e.clientX/w)-0.5; mouseY=(e.clientY/h)-0.5; });

function parallaxLoop(){
  layers.forEach(layer =>{
    const depth = parseFloat(layer.dataset.depth) || (layer.classList.contains('layer-sil')?0.6:0.12);
    const moveX = mouseX * depth * 40;
    const moveY = mouseY * depth * 18;
    layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
  });
  requestAnimationFrame(parallaxLoop);
}
parallaxLoop();

// generate subtle particles
const particlesRoot = document.getElementById('particles');
function spawnParticles(n=40){
  for(let i=0;i<n;i++){
    const p = document.createElement('div'); p.className='particle';
    const size = Math.random()*6 + 3; p.style.width = p.style.height = `${size}px`;
    p.style.left = `${Math.random()*100}%`; p.style.top = `${Math.random()*60 + 10}%`;
    p.style.opacity = `${0.15 + Math.random()*0.3}`; p.style.transform = `translateY(0)`;
    particlesRoot.appendChild(p);
    // gentle float
    const dx = (Math.random()-0.5)*40;
    const dt = 8000 + Math.random()*10000;
    p.animate([{transform:'translateY(0) translateX(0)'},{transform:`translateY(${60 + Math.random()*60}px) translateX(${dx}px)`}],{duration:dt,iterations:Infinity,easing:'ease-in-out'});
  }
}
spawnParticles(36);

// -----------------------------
// Milestone confetti
// -----------------------------
let lastMilestone = Math.floor(state.carbonSaved / 100);
function checkMilestones(){
  const m = Math.floor(state.carbonSaved / 100);
  if(m > lastMilestone){ burstConfetti(); lastMilestone = m; }
}
setInterval(checkMilestones, 1500);
function burstConfetti(){
  const count = 20;
  for(let i=0;i<count;i++){
    const d = document.createElement('div'); d.className='confetti';
    const s = 6 + Math.random()*8; Object.assign(d.style,{position:'fixed',left:`${20 + Math.random()*60}%`,top:`${20 + Math.random()*20}%`,width:`${s}px`,height:`${s}px`,background:`hsl(${Math.random()*60+80}deg 60% 55%)`,zIndex:9999,borderRadius:'2px'});
    document.body.appendChild(d);
    setTimeout(()=>{ d.animate([{transform:'translateY(0)', opacity:1},{transform:`translateY(${window.innerHeight + 100}px)`, opacity:0}],{duration:1200 + Math.random()*600,easing:'cubic-bezier(.2,.8,.2,1)'}); setTimeout(()=>d.remove(),1600)},20);
  }
}

// -----------------------------
// Init & render
// -----------------------------
function init(){
  renderMissions(); populateLeaderboard(); updateUI();
  // small floating buddy loop (face subtle drift via CSS animation)
}
init();

// small dev helper for console: expose state
window._eco_state = state;

// CSS injection for temp flash (keeps file single)
const style = document.createElement('style'); style.textContent = `.temp-flash{will-change:transform,opacity;border-radius:8px}`; document.head.appendChild(style);
