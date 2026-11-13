import './style.css';
import { TOOLS } from './data/tools.js';
import { DIRS } from './data/directions.js';
import CODES from './data/codes.json';
import { S } from './i18n.js';
import { LAB, renderLab } from './lab.js';
import { aiPage, bindAi } from './ai.js';

const app = document.getElementById('app');
const store = { get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}, set:(k,v)=>localStorage.setItem(k,JSON.stringify(v)) };
let lang = store.get('oh_lang','ru');
const t = k => S[lang][k] ?? k;
const L = (ru,en) => lang==='ru'?ru:en;
const tr = o => o?.[lang] ?? o?.ru ?? '';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dirById = Object.fromEntries(DIRS.map(d=>[d.id,d]));
let favs = new Set(store.get('oh_favs',[]));
const isPremium = () => store.get('oh_premium',false);

function shell(content, active){
  const nav=[['#/',t('home'),'home'],['#/tools',t('tools'),'tools'],['#/lab',t('lab'),'lab'],['#/ai','🤖 '+L('ИИ-помощник','AI'),'ai'],['#/notebook',t('notebook'),'notebook'],['#/favorites',t('favs'),'favs'],['#/ethics',t('ethics'),'ethics'],['#/premium','⭐ '+t('premium'),'premium']];
  return `<header class="top"><a class="logo" href="#/"><span class="dot"></span>OSINT<b>Hub</b></a>
  <nav class="nav" id="nav">${nav.map(([h,n,k])=>`<a href="${h}" class="${active===k?'on':''}">${n}</a>`).join('')}</nav>
  <div class="tr"><button class="btn sm ghost" id="lang" aria-label="language">${lang==='ru'?'EN':'RU'}</button><button class="btn sm ghost burger" id="burger" aria-label="menu">☰</button></div></header>
  <div class="ethbar">⚖️ ${t('ethicsBanner')} <a href="#/ethics">→</a></div>
  <main class="wrap">${content}</main>
  <footer class="foot">${t('footer')} · ${TOOLS.length} ${t('toolsCount')} · ${DIRS.length} ${t('dirsCount')}</footer>`;
}

function toolCard(x){
  const d=dirById[x.dir];
  return `<article class="tool"><div class="th"><a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer" class="tn">${esc(x.name)} ↗</a>
  <button class="star ${favs.has(x.name)?'on':''}" data-fav="${esc(x.name)}" aria-label="${t('fav')}">${favs.has(x.name)?'★':'☆'}</button></div>
  <p>${esc(lang==='ru'?x.ru:x.en)}</p><div class="tags"><a class="tag dir" href="#/dir/${x.dir}">${d.icon} ${esc(tr(d.title))}</a><span class="tag p-${x.price}">${t(x.price)}</span><span class="tag">${t(x.type)}</span></div></article>`;
}

function home(){
  const counts={};TOOLS.forEach(x=>counts[x.dir]=(counts[x.dir]||0)+1);
  return shell(`<section class="hero"><p class="kicker">// ${t('tag')}</p><h1>${t('heroT')}<span class="cursor">_</span></h1><p class="lead">${t('heroP')}</p>
  <div class="btnrow"><a class="btn" href="#/dir/geoint">🌍 ${t('start')}</a><a class="btn ghost" href="#/lab">🧪 ${t('openLab')}</a><a class="btn ghost" href="#/ai">🤖 ${L('Спросить ИИ','Ask AI')}</a></div>
  <div class="stats"><div><b>${TOOLS.length}</b>${t('toolsCount')}</div><div><b>${DIRS.length}</b>${t('dirsCount')}</div><div><b>${LAB.length}</b>${t('labCount')}</div></div></section>
  <div class="searchbox"><input id="gs" type="search" placeholder="🔍 ${t('search')}" autocomplete="off"></div><div id="gsr"></div>
  <h2>${t('dirs')}</h2><div class="grid dirs">${DIRS.map(d=>`<a class="dircard" href="#/dir/${d.id}"><span class="ic">${d.icon}</span><h3>${esc(tr(d.title))}</h3><p>${esc(tr(d.overview).slice(0,120))}…</p><span class="cnt">${counts[d.id]||0} ${t('toolsCount')}</span></a>`).join('')}</div>
  <h2>${t('lab')}</h2><div class="grid labs">${LAB.map(l=>`<a class="labcard" href="#/lab/${l.id}"><span class="ic">${l.icon}</span>${esc(L(l.ru,l.en))}</a>`).join('')}</div>`,'home');
}

function search(q){
  q=q.toLowerCase().trim(); if(!q) return {tools:[],dirs:[],labs:[]};
  const m=s=>String(s).toLowerCase().includes(q);
  return {tools:TOOLS.filter(x=>m(x.name)||m(x.ru)||m(x.en)||m(x.dir)||m(tr(dirById[x.dir].title))),dirs:DIRS.filter(d=>m(d.title.ru)||m(d.title.en)||m(d.id)),labs:LAB.filter(l=>m(l.ru)||m(l.en))};
}
function bindGlobalSearch(){
  const i=document.getElementById('gs'); if(!i) return;
  i.addEventListener('input',()=>{const r=search(i.value),o=document.getElementById('gsr');
    if(!i.value.trim()){o.innerHTML='';return;}
    o.innerHTML=`<div class="srch">${r.dirs.map(d=>`<a class="chip" href="#/dir/${d.id}">${d.icon} ${esc(tr(d.title))}</a>`).join('')}${r.labs.map(l=>`<a class="chip" href="#/lab/${l.id}">${l.icon} ${esc(L(l.ru,l.en))}</a>`).join('')}</div>
    <p class="muted">${t('results')}: ${r.tools.length}</p><div class="grid tools">${r.tools.slice(0,30).map(toolCard).join('')||`<p>${t('nores')}</p>`}</div>`;});
}

function dirPage(id){
  const d=dirById[id]; if(!d) return home();
  const tl=TOOLS.filter(x=>x.dir===id), steps=tr(d.steps), tips=tr(d.tips);
  const hint = isPremium() ? `<div class="card ok-b"><h3>🔓 ${t('hintT')}</h3><p>${esc(tr(d.hint))}</p></div>`
   : `<div class="card lock"><h3>🔒 ${t('hintT')}</h3><p>${t('lockP')}</p><a class="btn sm" href="#/premium">⭐ ${t('unlock')}</a></div>`;
  return shell(`<p class="crumbs"><a href="#/">${t('home')}</a> / ${t('dirs')}</p><h1>${d.icon} ${esc(tr(d.title))}</h1>
  <div class="dirnav">${DIRS.map(x=>`<a class="chip ${x.id===id?'on':''}" href="#/dir/${x.id}">${x.icon} ${esc(tr(x.title))}</a>`).join('')}</div>
  <section class="card"><h3>${t('overview')}</h3><p>${esc(tr(d.overview))}</p></section>
  <section class="card"><h3>${t('method')}</h3><ol class="steps">${steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></section>
  <section class="card"><h3>${t('tipsT')}</h3><ul class="tips">${tips.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></section>
  <section class="card ex"><h3>🎯 ${t('exercise')}</h3><p>${esc(tr(d.exercise))}</p></section>${hint}
  <h2>${t('toolsIn')} (${tl.length})</h2><div class="grid tools">${tl.map(toolCard).join('')}</div>`,'');
}

let filt={q:'',dir:'',price:'',type:''};
function toolsPage(){
  const opts=(k,vals,lab)=>`<select data-f="${k}"><option value="">${lab}: ${t('all')}</option>${vals.map(([v,n])=>`<option value="${v}" ${filt[k]===v?'selected':''}>${esc(n)}</option>`).join('')}</select>`;
  return shell(`<h1>🧰 ${t('tools')} <small>(${TOOLS.length})</small></h1>
  <div class="filters"><input id="tq" type="search" placeholder="🔍 ${t('search')}" value="${esc(filt.q)}">
  ${opts('dir',DIRS.map(d=>[d.id,d.icon+' '+tr(d.title)]),t('dir'))}${opts('price',['free','freemium','paid'].map(p=>[p,t(p)]),t('price'))}${opts('type',['web','cli','ext','app','bot'].map(p=>[p,t(p)]),t('type'))}</div>
  <p class="muted" id="tc"></p><div class="grid tools" id="tl"></div>`,'tools');
}
function renderToolList(){
  const el=document.getElementById('tl'); if(!el) return; const q=filt.q.toLowerCase();
  const r=TOOLS.filter(x=>(!filt.dir||x.dir===filt.dir)&&(!filt.price||x.price===filt.price)&&(!filt.type||x.type===filt.type)&&(!q||(x.name+' '+x.ru+' '+x.en).toLowerCase().includes(q)));
  document.getElementById('tc').textContent=`${t('results')}: ${r.length}`; el.innerHTML=r.map(toolCard).join('')||`<p>${t('nores')}</p>`;
}

function labPage(id){
  const cur=LAB.find(l=>l.id===id);
  return shell(`<h1>🧪 ${t('lab')}</h1><p class="muted">${L('Все инструменты работают локально в вашем браузере.','All tools run locally in your browser.')}</p>
  <div class="dirnav">${LAB.map(l=>`<a class="chip ${l.id===id?'on':''}" href="#/lab/${l.id}">${l.icon} ${esc(L(l.ru,l.en))}</a>`).join('')}</div>
  ${cur?`<section class="card"><h2>${cur.icon} ${esc(L(cur.ru,cur.en))}</h2><div id="labbody"></div></section>`:`<div class="grid labs">${LAB.map(l=>`<a class="labcard" href="#/lab/${l.id}"><span class="ic">${l.icon}</span>${esc(L(l.ru,l.en))}</a>`).join('')}</div>`}`,'lab');
}

function notebookPage(){
  return shell(`<h1>📓 ${t('notebook')}</h1><p class="muted">${L('Заметки хранятся только в этом браузере (localStorage). Экспортируйте в Markdown для отчёта.','Notes are stored only in this browser (localStorage). Export to Markdown for your report.')}</p>
  <div class="card"><input id="nt" placeholder="${L('Заголовок / находка','Title / finding')}"><input id="nu" placeholder="${L('Источник (URL)','Source (URL)')}" type="url"><textarea id="nb" rows="4" placeholder="${L('Описание, вывод, уровень уверенности…','Details, conclusion, confidence…')}"></textarea>
  <div class="btnrow"><button class="btn" id="nadd">➕ ${L('Добавить','Add')}</button><button class="btn ghost" id="nexp">⬇️ Markdown</button><button class="btn ghost danger" id="nclr">🗑 ${L('Очистить всё','Clear all')}</button></div></div><div id="nl"></div>`,'notebook');
}
function renderNotes(){
  const n=store.get('oh_notes',[]),el=document.getElementById('nl'); if(!el) return;
  el.innerHTML=n.length?n.map((x,i)=>`<div class="card note"><div class="th"><b>${esc(x.title||'—')}</b><button class="star" data-del="${i}" aria-label="delete">✕</button></div><p class="muted">${new Date(x.ts).toLocaleString()}</p>${x.url?`<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.url)}</a>`:''}<p class="pre">${esc(x.body)}</p></div>`).join(''):`<p class="muted">${L('Пока нет заметок.','No notes yet.')}</p>`;
}
function bindNotebook(){
  const g=id=>document.getElementById(id);
  g('nadd').onclick=()=>{const title=g('nt').value.trim(),url=g('nu').value.trim(),body=g('nb').value.trim();if(!title&&!body)return;const n=store.get('oh_notes',[]);n.unshift({title,url,body,ts:Date.now()});store.set('oh_notes',n);g('nt').value=g('nu').value=g('nb').value='';renderNotes();};
  g('nexp').onclick=()=>{const n=store.get('oh_notes',[]);const md=`# ${L('Отчёт расследования','Investigation report')}\n\n_${new Date().toLocaleString()}_\n\n`+n.slice().reverse().map(x=>`## ${x.title||'—'}\n\n- ${L('Время','Time')}: ${new Date(x.ts).toLocaleString()}\n${x.url?`- ${L('Источник','Source')}: ${x.url}\n`:''}\n${x.body}\n`).join('\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([md],{type:'text/markdown'}));a.download='osint-notebook.md';a.click();};
  g('nclr').onclick=()=>{if(confirm(L('Удалить все заметки?','Delete all notes?'))){store.set('oh_notes',[]);renderNotes();}};
  g('nl').addEventListener('click',e=>{const d=e.target.dataset.del;if(d===undefined)return;const n=store.get('oh_notes',[]);n.splice(+d,1);store.set('oh_notes',n);renderNotes();});
  renderNotes();
}

function favPage(){ const f=TOOLS.filter(x=>favs.has(x.name)); return shell(`<h1>★ ${t('favs')}</h1><div class="grid tools">${f.map(toolCard).join('')||`<p class="muted">${t('nofavs')}</p>`}</div>`,'favs'); }

function ethicsPage(){
  const ru=[['Законная цель','Исследуйте только с законным основанием: журналистика, проверка фактов, защита себя и своей организации, учебные задачи.'],['Без слежки и доксинга','Нельзя следить за человеком, раскрывать его адрес, телефон, родственников, публиковать личные данные. Это незаконно во многих странах (в КР — Закон «Об информации персонального характера»).'],['Только публичные данные','Никаких взломов, подбора паролей, обхода авторизации, покупки утечек и «пробив»-ботов.'],['Без атак на аккаунты','Массовые жалобы, «сносы», захват чужих Telegram/WhatsApp — преступление. Здесь мы учим только защищать свои аккаунты.'],['Соблюдайте ToS','Правила сервисов (скрейпинг, фейковые аккаунты) могут запрещать отдельные действия. Учитывайте их.'],['Минимизация вреда','Не взаимодействуйте с целью, не публикуйте найденное, если это может навредить невиновным. Размывайте лица и личные данные в отчётах.'],['Проверяемость','Фиксируйте источники и шаги — выводы должны быть воспроизводимы. Указывайте уровень уверенности.'],['ИИ-инструменты','Результаты ИИ (геолокация, детекторы) — только подсказки, всегда проверяйте вручную.']];
  const en=[['Lawful purpose','Investigate only with a lawful basis: journalism, fact-checking, protecting yourself or your organisation, education.'],['No stalking or doxxing','Never track a person, expose their address, phone, relatives or publish personal data. Illegal in many jurisdictions.'],['Public data only','No hacking, password guessing, bypassing logins, buying leaks or lookup bots.'],['No account attacks','Mass reporting, takedowns, hijacking others’ Telegram/WhatsApp are crimes. We only teach protecting your own accounts.'],['Respect ToS','Service terms may prohibit scraping or fake accounts. Take them into account.'],['Minimise harm','Do not engage targets or publish findings that may harm innocents. Blur faces and personal data.'],['Verifiability','Record sources and steps so conclusions are reproducible. State confidence.'],['AI tools','AI results (geolocation, detectors) are hints only — always verify.']];
  return shell(`<h1>⚖️ ${t('ethics')}</h1><div class="grid dirs">${(lang==='ru'?ru:en).map(([h,p],i)=>`<div class="card"><h3>${i+1}. ${h}</h3><p>${p}</p></div>`).join('')}</div>
  <p class="muted">${L('Материалы сайта — образовательные. Ответственность за использование несёт пользователь.','Site materials are educational. Users are responsible for their use.')}</p>`,'ethics');
}

function premiumPage(){
  const on=isPremium();
  return shell(`<h1>⭐ Premium</h1>
  ${on?`<div class="card ok-b"><h3>✅ ${L('Premium активен','Premium active')}</h3><p>${L('Разборы и решения заданий открыты во всех направлениях.','Walkthroughs are unlocked in all directions.')}</p><button class="btn sm ghost" id="pout">${L('Выйти из Premium на этом устройстве','Remove Premium on this device')}</button></div>`:''}
  <div class="grid two"><section class="card"><h3>${L('Что даёт Premium','What you get')}</h3><ul class="tips"><li>${L('Разборы и решения практических заданий по всем','Walkthroughs and solutions for all')} ${DIRS.length} ${t('dirsCount')}</li><li>${L('Подсказки с готовыми запросами (Overpass, дорки, CLI-команды)','Hints with ready queries (Overpass, dorks, CLI)')}</li><li>${L('Поддержка развития проекта','Support the project')}</li></ul>
  <h3>${L('Как оплатить','How to pay')}</h3><ol class="steps"><li>${L('Переведите оплату по номеру или QR-коду (MBank, O!Bank или любое приложение с ELQR).','Pay by number or QR code (MBank, O!Bank or any ELQR app).')}</li><li>${L('Отправьте чек об оплате на этот же номер.','Send the receipt to the same number.')}</li><li>${L('Получите код доступа и введите его ниже.','Receive an access code and enter it below.')}</li></ol>
  <div class="paybox"><p>${L('Номер','Number')}: <b class="mono">+996 507 863 440</b> <button class="btn sm ghost" id="cpn">${L('Копировать','Copy')}</button></p><p>${L('Получатель','Recipient')}: <b>Марлес М</b></p><p>MBank · O!Bank</p></div>
  <label class="block">${L('Код доступа','Access code')}<input id="code" placeholder="AVG-XXXXXX-XXXX" autocapitalize="characters" autocomplete="off"></label><button class="btn" id="cact">🔓 ${L('Активировать','Activate')}</button><p id="cmsg"></p></section>
  <section class="card qr"><img src="${import.meta.env.BASE_URL}pay-qr.jpg" alt="QR" loading="lazy"><p class="muted">${L('QR для оплаты через O!Bank / ELQR','QR for payment via O!Bank / ELQR')}</p></section></div>`,'premium');
}
function bindPremium(){
  const g=id=>document.getElementById(id);
  g('cpn').onclick=()=>navigator.clipboard?.writeText('+996507863440');
  g('pout')&&(g('pout').onclick=()=>{store.set('oh_premium',false);route();});
  g('cact').onclick=async()=>{const c=g('code').value.trim().toUpperCase();const h=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(c)))].map(b=>b.toString(16).padStart(2,'0')).join('');
    if(CODES.includes(h)){store.set('oh_premium',true);g('cmsg').innerHTML=`<span class="ok">✅ ${L('Premium активирован!','Premium activated!')}</span>`;setTimeout(route,800);}else g('cmsg').innerHTML=`<span class="warn">❌ ${L('Неверный код','Invalid code')}</span>`;};
}

function route(){
  const h=location.hash.replace(/^#\/?/,'').split('/'); let html; const [p,a]=h;
  if(p==='dir')html=dirPage(a);else if(p==='tools')html=toolsPage();else if(p==='lab')html=labPage(a);else if(p==='notebook')html=notebookPage();
  else if(p==='favorites')html=favPage();else if(p==='ethics')html=ethicsPage();else if(p==='premium')html=premiumPage();else if(p==='ai')html=shell(aiPage(L),'ai');else html=home();
  app.innerHTML=html; document.documentElement.lang=lang; window.scrollTo(0,0);
  document.getElementById('lang').onclick=()=>{lang=lang==='ru'?'en':'ru';store.set('oh_lang',lang);route();};
  document.getElementById('burger').onclick=()=>document.getElementById('nav').classList.toggle('open');
  bindGlobalSearch();
  if(p==='tools'){renderToolList();document.getElementById('tq').addEventListener('input',e=>{filt.q=e.target.value;renderToolList();});
    document.querySelectorAll('[data-f]').forEach(s=>s.addEventListener('change',e=>{filt[s.dataset.f]=e.target.value;renderToolList();}));}
  if(p==='lab'&&a&&document.getElementById('labbody'))renderLab(a,document.getElementById('labbody'),L);
  if(p==='notebook')bindNotebook(); if(p==='ai')bindAi(L,lang,route); if(p==='premium')bindPremium();
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-fav]');if(!b)return;const n=b.dataset.fav;favs.has(n)?favs.delete(n):favs.add(n);store.set('oh_favs',[...favs]);
  document.querySelectorAll(`[data-fav="${CSS.escape(n)}"]`).forEach(x=>{x.classList.toggle('on',favs.has(n));x.textContent=favs.has(n)?'★':'☆';});});
window.addEventListener('hashchange',route); route();
