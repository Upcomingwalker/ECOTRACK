/* ============================
   EcoTrack — script.js (C)
   Ultra Switch 2 UI behavior
   ============================ */

/* -------------------------
   State & persistence
-------------------------*/
const DEFAULT = { xp:0, level:1, carbonSaved:0, activity:[] };
const LEVEL_XP_BASE = 100;
let state = loadState();

function loadState(){
  try{ const raw = localStorage.getItem('eco_state'); return raw?JSON.parse(raw):{...DEFAULT}; }
  catch(e){ return {...DEFAULT}; }
}
function saveState(){ localStorage.setItem('eco_state', JSON.stringify(state)); }

/* -------------------------
   Boot sequence
-------------------------*/
const boot = document.getElementById('boot');
const shell = document.getElementById('shell');

function doBootThenShowUI(){
  // show boot for 1600ms then animate out
  setTimeout(()=>{
    boot.style.transition = 'opacity .5s, transform .6s';
    boot.style.opacity = '0';
    boot.style.transform = 'scale(0.96)';
    setTimeout(()=>{ boot.remove(); shell.classList.remove('hidden'); initUI(); }, 700);
  }, 1400);
}

/* -------------------------
   UI init and render
-------------------------*/
function initUI(){
  renderTiles();
  renderMissions();
  updateUI();
  spawnParticles();
  attachHandlers();
  // buddy float loop
  setInterval(()=>{ document.getElementById('buddyFace').style.transform = `translateY(${Math.sin(Date.now()/420)*1.6}px)` }, 800);
  // milestone check
  setInterval(checkMilestones, 1500);
}

/* -------------------------
   Update UI elements
-------------------------*/
function updateUI(){
  document.getElementById('carbonScore').textContent = `${state.carbonSaved} kg`;
  const nextXp = LEVEL_XP_BASE * state.level;
  document.getElementById('xpText').textContent = `${state.xp} / ${nextXp} XP`;
  // small ring animate
  animateSmallRing();
  // status text
  document.getElementById('statusText').textContent = `Lvl ${state.level} • ${state.carbonSaved} kg saved`;
  // activity + badges
  renderActivity();
  renderBadges();
}

/* -------------------------
   Missions / Activity logic
-------------------------*/
const MISSION_DEFS = [
  { id:'bike', emoji:'🚴', title:'Ride a bike', desc:'Short trip under 5km', carbon:2, xp:12 },
  { id:'recycle', emoji:'♻️', title:'Recycle', desc:'Recycle plastics or paper', carbon:1, xp:6 },
  { id:'plant', emoji:'🌳', title:'Plant a tree', desc:'Plant or support one tree', carbon:50, xp:120 },
  { id:'meat', emoji:'🥗', title:'Skip meat (lunch)', desc:'Choose a plant-based meal', carbon:3, xp:18 },
  { id:'public', emoji:'🚆', title:'Public transport', desc:'Take the bus/train', carbon:4, xp:22 },
  { id:'lights', emoji:'💡', title:'Energy saver', desc:'Turn off extra lights', carbon:0.5, xp:4 }
];

function addActivity(text, xpGain=0, carbonGain=0){
  const item = { t: Date.now(), text, xp: xpGain, carbon: carbonGain };
  state.activity.unshift(item);
  state.xp += xpGain;
  state.carbonSaved = Math.round((state.carbonSaved + carbonGain)*10)/10;
  // level loop
  while(state.xp >= LEVEL_XP_BASE * state.level){
    state.xp -= LEVEL_XP_BASE * state.level;
    state.level++;
    playLevelUp();
  }
  saveState(); updateUI(); showToast(`+${carbonGain} kg • +${xpGain} XP`);
}

/* -------------------------
   Render missions & badges
-------------------------*/
function renderMissions(){
  const grid = document.getElementById('missionsGrid');
  grid.innerHTML = '';
  const tpl = document.getElementById('missionTpl').content;
  MISSION_DEFS.forEach(m=>{
    const node = tpl.cloneNode(true);
    node.querySelector('.mission-emoji').textContent = m.emoji;
    node.querySelector('.mission-title').textContent = m.title;
    node.querySelector('.mission-desc').textContent = m.desc;
    node.querySelector('.mission-reward').textContent = `+${m.carbon} kg`;
    const btn = node.querySelector('.btn-do');
    btn.addEventListener('click', ()=>{
      addActivity(m.title, m.xp, m.carbon);
      btn.disabled = true; btn.textContent = 'Done';
    });
    grid.appendChild(node);
  });
}

function renderActivity(){
  const list = document.getElementById('activityList'); if(!list) return;
  list.innerHTML = '';
  state.activity.slice(0,12).forEach(a=>{
    const li = document.createElement('li');
    const time = new Date(a.t).toLocaleTimeString();
    li.innerHTML = `<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.text}</span><span style="white-space:nowrap">${a.carbon} kg • ${a.xp} XP <small style="color:var(--muted);margin-left:8px">· ${time}</small></span>`;
    list.appendChild(li);
  });
}

const BADGE_DEFS = [
  { key:'first', icon:'🌟', threshold:5 },
  { key:'eco-warrior', icon:'🏅', threshold:50 },
  { key:'planter', icon:'🌳', threshold:40 },
  { key:'commuter', icon:'🚆', threshold:80 },
  { key:'legend', icon:'👑', threshold:500 }
];

function renderBadges(){
  // simple right-panel badges auto-insert if panel exists
  const panel = document.querySelector('.badges-panel'); if(!panel) return;
  let container = panel.querySelector('.badges'); if(!container){ container = document.createElement('div'); container.className='badges'; panel.appendChild(container); }
  container.innerHTML = '';
  BADGE_DEFS.forEach(b=>{
    const unlocked = state.carbonSaved >= b.threshold;
    const d = document.createElement('div'); d.className = 'badge' + (unlocked?'':' locked'); d.textContent = b.icon; container.appendChild(d);
  });
}

/* -------------------------
   Small ring animation
-------------------------*/
function animateSmallRing(){
  const fill = document.querySelector('.ring-small .ring-fill');
  if(!fill) return;
  const dash = 302;
  const pct = Math.min(1, state.carbonSaved / 1000);
  fill.style.strokeDashoffset = dash - dash*pct;
}

/* -------------------------
   Sound / level up
-------------------------*/
function playLevelUp(){
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(520 + state.level*30, ctx.currentTime);
    g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime+0.02); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+0.45);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.5);
  }catch(e){}
}

/* -------------------------
   Toast / popup helpers
-------------------------*/
function showToast(msg, ms=1400){
  const t = document.getElementById('toast'); if(!t) return;
  const el = document.createElement('div'); el.className='toast'; el.textContent = msg;
  Object.assign(el.style,{background:'linear-gradient(90deg,#9AE6B4,#34D399)',color:'#042018',padding:'8px 12px',borderRadius:'8px',marginTop:'8px',fontWeight:800,boxShadow:'0 8px 30px rgba(0,0,0,0.4)'});
  t.appendChild(el);
  setTimeout(()=>{ el.style.transition='opacity .4s,transform .4s'; el.style.opacity='0'; el.style.transform='translateY(-8px)'; setTimeout(()=>el.remove(),420) }, ms);
}

/* -------------------------
   Confetti
-------------------------*/
function burstConfetti(){
  const count = 20;
  for(let i=0;i<count;i++){
    const d = document.createElement('div'); d.className='confetti';
    const s = 6 + Math.random()*8; Object.assign(d.style,{position:'fixed',left:`${20+Math.random()*60}%`,top:`${Math.random()*30+10}%`,width:`${s}px`,height:`${s}px`,background:`hsl(${Math.random()*70+90}deg 65% 60%)`,zIndex:9999,borderRadius:'2px'});
    document.body.appendChild(d);
    setTimeout(()=>{ d.animate([{transform:'translateY(0)',opacity:1},{transform:`translateY(${window.innerHeight+120}px)`,opacity:0}],{duration:1100+Math.random()*800,easing:'cubic-bezier(.2,.8,.2,1)'}); setTimeout(()=>d.remove(),1500) }, 30);
  }
}
let lastMilestone = Math.floor(state.carbonSaved / 100);
function checkMilestones(){ const m = Math.floor(state.carbonSaved / 100); if(m > lastMilestone){ burstConfetti(); lastMilestone = m; } }

/* -------------------------
   Particles subtle
-------------------------*/
function spawnParticles(){
  const root = document.getElementById('particles'); if(!root) return;
  const total = 36;
  for(let i=0;i<total;i++){
    const p = document.createElement('div'); p.className='particle';
    const size = 3 + Math.random()*6; p.style.width=p.style.height=`${size}px`;
    p.style.left = `${Math.random()*100}%`; p.style.top = `${Math.random()*60 + 10}%`; p.style.opacity = `${0.08 + Math.random()*0.22}`;
    root.appendChild(p);
    const dx = (Math.random()-0.5)*40;
    const dur = 8000 + Math.random()*10000;
    p.animate([{transform:'translateY(0) translateX(0)'},{transform:`translateY(${60 + Math.random()*60}px) translateX(${dx}px)`}],{duration:dur,iterations:Infinity,easing:'ease-in-out'});
  }
}

/* -------------------------
   App tiles & routing
-------------------------*/
function renderTiles(){
  // tiles already in DOM; just attach hover/focus effect to show score ring
  document.querySelectorAll('.app-tile').forEach(tile=>{
    tile.addEventListener('focus', ()=> showTileInfo(tile));
    tile.addEventListener('mouseenter', ()=> showTileInfo(tile));
    tile.addEventListener('mouseleave', ()=> hideTileInfo());
    tile.addEventListener('click', ()=> openApp(tile.dataset.app));
    // keyboard: Enter opens
    tile.addEventListener('keydown', (e)=>{ if(e.key==='Enter') openApp(tile.dataset.app); });
  });
}

let tileInfoTimeout = null;
function showTileInfo(tile){
  clearTimeout(tileInfoTimeout);
  const label = tile.querySelector('.app-label')?.textContent || tile.dataset.app;
  const status = document.getElementById('statusText');
  status.textContent = `${label} — Select to open`;
  // show the compact score ring highlight briefly
  const sc = document.querySelector('.ring-small .ring-fill');
  if(sc) sc.style.transition='stroke-dashoffset .5s';
}
function hideTileInfo(){
  tileInfoTimeout = setTimeout(()=>{ updateUI(); }, 800);
}

const APP_ROUTES = { ai:'ai.html', carbon:'carbon.html', chat:'chats.html', news:'news.html', notes:'notes.html', weather:'weather.html' };

function openApp(name){
  // small animation: flash and then go
  const tile = document.querySelector(`.app-tile[data-app="${name}"]`);
  if(tile){
    tile.animate([{transform:'scale(1)'},{transform:'scale(.96)'}],{duration:120,fill:'both'});
  }
  // if route exists, navigate; else show info modal (we keep it simple)
  if(APP_ROUTES[name]) {
    // simulate quick ring reveal then navigate
    showTemporaryRingThenNavigate(APP_ROUTES[name]);
  } else {
    showToast('App not linked yet',1200);
  }
}

function showTemporaryRingThenNavigate(url){
  // show compact highlight then go
  const old = document.getElementById('statusText').textContent;
  document.getElementById('statusText').textContent = 'Opening...';
  setTimeout(()=>{ window.location.href = url; }, 450);
}

/* -------------------------
   Modal handlers
-------------------------*/
function attachHandlers(){
  document.getElementById('openMissions').addEventListener('click', ()=>{
    openModal('missionsModal');
  });
  document.getElementById('openActivity').addEventListener('click', ()=>{
    openModal('activityModal');
  });
  document.querySelectorAll('.modal-close').forEach(b=>b.addEventListener('click', ()=> closeModal(b.closest('.modal').id)));
  document.querySelectorAll('[data-close]').forEach(b=> b.addEventListener('click', ()=>{ const m = b.closest('.modal'); if(m) closeModal(m.id); }));
  // quick actions inside modals delegated
  document.addEventListener('click', (e)=>{
    if(e.target.matches('.btn-do')) return; // handled in renderMissions where btn attached
  });

  // avatar reset (shift+click)
  const avatar = document.querySelector('.buddy-avatar') || document.querySelector('.avatar');
  if(avatar) avatar.addEventListener('click', (ev)=>{ if(ev.shiftKey && confirm('Reset progress?')){ state = {...DEFAULT}; saveState(); updateUI(); showToast('Progress reset',900); } });
}

function openModal(id){
  const m = document.getElementById(id); if(!m) return;
  m.setAttribute('aria-hidden','false');
}
function closeModal(id){
  const m = document.getElementById(id); if(!m) return;
  m.setAttribute('aria-hidden','true');
}

/* -------------------------
   Spawn confetti when milestone happens
-------------------------*/
function checkMilestones(){ const milestone = Math.floor(state.carbonSaved/100); if(milestone > lastMilestone){ burstConfetti(); lastMilestone = milestone; } }

/* -------------------------
   show toast convenience used earlier
-------------------------*/
function showToast(msg,ms=1400){ const t = document.getElementById('toast'); if(!t) return; const el=document.createElement('div'); el.textContent=msg; Object.assign(el.style,{background:'linear-gradient(90deg,#9AE6B4,#34D399)',color:'#042018',padding:'8px 12px',borderRadius:'8px',marginTop:'8px',fontWeight:800,boxShadow:'0 8px 22px rgba(0,0,0,0.4)'}); t.appendChild(el); setTimeout(()=>{ el.style.transition='opacity .4s, transform .4s'; el.style.opacity='0'; el.style.transform='translateY(-8px)'; setTimeout(()=>el.remove(),420); }, ms); }

/* -------------------------
   Init on load
-------------------------*/
window.addEventListener('load', ()=>{
  // start boot then UI
  doBootThenShowUI();
});

/* expose for debug */
window._eco = { state, saveState, addActivity };

/* End of script.js */

