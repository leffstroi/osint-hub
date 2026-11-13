import { TOOLS } from './data/tools.js';
import { DIRS } from './data/directions.js';

const KEY='oh_gemini_key', MODEL='oh_gemini_model', HIST='oh_ai_hist';
export const MODELS=['gemini-2.5-flash','gemini-2.5-flash-lite','gemini-flash-latest','gemini-2.5-pro'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const SYSTEM = `Ты — «OSINT Hub Assistant», опытный аналитик разведки по открытым источникам (OSINT) и специалист по информационной безопасности, наставник для студентов и журналистов.
Отвечай на языке пользователя (русский или английский), конкретно и практично: пошаговая методика, точные инструменты (с URL), готовые запросы (Google-дорки, операторы X/Reddit, Overpass QL, команды CLI: exiftool, sherlock, maigret, holehe, gpg, amass/subfinder), как проверить и задокументировать результат, уровень уверенности.
Области: GEOINT/геолокация (тени, солнце, знаки, разметка, растительность, Overpass), спутниковые снимки, IMINT/верификация фото и видео, SOCMINT, Telegram (только публичные данные), ники, e-mail/телефон, домены/IP/инфраструктура (пассивно), транспорт (ADS-B, AIS), блокчейн, даркнет (только наблюдение), дорки, реестры компаний и санкции, криптография (AES, GPG, Signal, VeraCrypt, хэши, классические шифры), OPSEC исследователя, защита и восстановление СВОИХ аккаунтов.
Жёсткие правила этики и закона:
- Не помогай со слежкой за конкретным частным лицом, доксингом, поиском домашнего адреса/родственников/места нахождения частного человека, деанонимизацией без законного основания, сталкингом.
- Не помогай атаковать, взламывать, «сносить», массово жаловаться на чужие аккаунты (Telegram, WhatsApp и др.), с фишингом, SIM-swap, перехватом сессий, подбором паролей, обходом авторизации, использованием утёкших баз и «пробив»-ботов.
- Сканирование и эксплуатация чужих систем — только с письменного разрешения владельца; по умолчанию предлагай пассивную разведку.
В таких случаях коротко объясни, почему нельзя, и предложи законную альтернативу (защита своих аккаунтов, обращение в полицию/поддержку платформы, проверка собственного цифрового следа, учебные задачи).
Формат: Markdown, заголовки и нумерованные шаги, блоки кода для запросов и команд. Без воды. Если данных мало — задай 1–2 уточняющих вопроса и всё равно дай стартовый план.`;

export const getKey=()=>localStorage.getItem(KEY)||'';
export const getModel=()=>localStorage.getItem(MODEL)||MODELS[0];

export function md(s){
  const blocks=[]; s=String(s).replace(/```(\w*)\n?([\s\S]*?)```/g,(_,l,c)=>{blocks.push(`<pre><code>${esc(c.trim())}</code></pre>`);return `\u0000${blocks.length-1}\u0000`;});
  s=esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<i>$2</i>')
   .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
   .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g,'$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
  const out=[];let list=null;
  for(const line of s.split('\n')){let m;
    if((m=line.match(/^&gt;\s?(.*)/))){list&&(out.push(`</${list}>`),list=null);out.push(`<blockquote>${m[1]}</blockquote>`);}
    else if((m=line.match(/^#{1,4}\s+(.*)/))){list&&(out.push(`</${list}>`),list=null);out.push(`<h4>${m[1]}</h4>`);}
    else if((m=line.match(/^\s*[-*•]\s+(.*)/))){if(list!=='ul'){list&&out.push(`</${list}>`);out.push('<ul>');list='ul';}out.push(`<li>${m[1]}</li>`);}
    else if((m=line.match(/^\s*\d+[.)]\s+(.*)/))){if(list!=='ol'){list&&out.push(`</${list}>`);out.push('<ol>');list='ol';}out.push(`<li>${m[1]}</li>`);}
    else{list&&(out.push(`</${list}>`),list=null);if(line.trim())out.push(`<p>${line}</p>`);}}
  list&&out.push(`</${list}>`);
  return out.join('').replace(/\u0000(\d+)\u0000/g,(_,i)=>blocks[i]);
}

const BAD=/(снести|снос|забанить|бан чуж|взлом|взломать|угнать|массов\w* жалоб|пробить|пробив|доксинг|dox|hack (?:into|account)|take ?down|mass ?report|ban (?:his|her|their|someone)|steal|фишинг|phish|sim.?swap|домашн\w* адрес|где живёт|где живет|узнать адрес)/i;
const KW={geoint:/гео|место|локац|где снят|geo|locat|shadow|тен|солнц|sun|street|улиц/i,sat:/спутник|satell|снимк|sentinel|nasa|пожар/i,imint:/фото|изображ|картин|image|photo|exif|видео|video|фейк|fake|deepfake|ии|ai.?gen/i,socmint:/соцсет|social|twitter|x\.com|reddit|tiktok|instagram|vk|facebook|youtube/i,telegram:/telegram|телеграм|тг\b|tg\b|whatsapp|ватсап|аккаунт|account|сесси|session|2fa|угнал|hijack|recover|восстанов/i,username:/ник|username|логин|handle|профил/i,email:/почт|e-?mail|телефон|номер|phone|утечк|breach|pwned/i,infra:/домен|domain|ip\b|сайт|website|dns|whois|сервер|shodan|поддомен|subdomain/i,transport:/самол|рейс|flight|aircraft|судн|корабл|ship|vessel|ais|ads-?b/i,blockchain:/крипт.?валют|биткоин|bitcoin|btc|eth|usdt|кошел|wallet|блокчейн|blockchain|транзакц/i,darkweb:/даркнет|dark ?web|tor\b|onion/i,dorking:/дорк|dork|поиск документ|filetype|google/i,company:/компани|фирм|company|реестр|санкц|sanction|офшор|offshore|директор/i,cryptography:/шифр|encrypt|decrypt|aes|pgp|gpg|vera|хэш|hash|цезар|caesar|vigen|криптограф/i,opsec:/opsec|vpn|анонимн|anonym|виртуальн|vm\b|sock|безопасн/i};

export function fallback(q, lang){
  const ru=lang==='ru';
  if(BAD.test(q)) return ru?`### ⛔ С этим помочь нельзя
Атаки на чужие аккаунты, «сносы», массовые жалобы, взлом, фишинг и поиск адреса/местонахождения частного человека незаконны и нарушают правила платформ.

**Что можно сделать законно:**
1. Защитить **свой** Telegram/WhatsApp — см. раздел [Telegram: поиск и защита аккаунта](#/dir/telegram) (облачный пароль, сеансы, защита от SIM-swap, восстановление).
2. Если вам угрожают или вас преследуют — сохраните доказательства (скриншоты со ссылками и датой) и обратитесь в полицию и в поддержку платформы (Telegram: @SpamBot, abuse@telegram.org; WhatsApp: «Пожаловаться» в чате).
3. Проверить **свой** цифровой след: [генератор ссылок по нику](#/lab/username), Have I Been Pwned.`:`### ⛔ I can't help with that
Attacking others' accounts, takedowns, mass reporting, hacking, phishing or locating private individuals is illegal and violates platform rules.

**Lawful alternatives:**
1. Protect **your own** Telegram/WhatsApp — see [Telegram: search & account protection](#/dir/telegram).
2. If you're harassed, preserve evidence and contact police and platform support.
3. Audit **your own** footprint: [username link generator](#/lab/username), Have I Been Pwned.`;
  const scores=Object.entries(KW).map(([d,r])=>[d,(q.match(new RegExp(r.source,'gi'))||[]).length]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]);
  const words=q.toLowerCase().split(/[^\p{L}\p{N}.]+/u).filter(w=>w.length>3);
  const toolHits=TOOLS.filter(t=>words.some(w=>t.name.toLowerCase().includes(w)));
  if(!scores.length&&!toolHits.length) return ru?`Я работаю в **офлайн-режиме** (без ключа Gemini) и подбираю ответ из базы знаний сайта. Уточните тему: геолокация фото, проверка изображения, ник, e-mail, домен/IP, Telegram, самолёты/суда, крипто-кошелёк, шифрование, OPSEC.\n\nДля полноценных ответов ИИ добавьте свой ключ Gemini выше (⚙️).`:`I'm in **offline mode** (no Gemini key) and answer from the site's knowledge base. Clarify the topic: photo geolocation, image verification, username, email, domain/IP, Telegram, aircraft/ships, crypto wallet, encryption, OPSEC.\n\nAdd your Gemini key above (⚙️) for full AI answers.`;
  const tr=o=>o[lang]||o.ru; let out=ru?'> 📚 Офлайн-ответ из базы знаний OSINT Hub (для ответов ИИ добавьте ключ Gemini).\n\n':'> 📚 Offline answer from the OSINT Hub knowledge base (add a Gemini key for AI answers).\n\n';
  for(const [d] of scores.slice(0,2)){const D=DIRS.find(x=>x.id===d);
    out+=`### ${D.icon} ${tr(D.title)}\n${tr(D.overview)}\n\n**${ru?'Методика':'Methodology'}:**\n`+tr(D.steps).map((s,i)=>`${i+1}. ${s}`).join('\n')+'\n\n';
    out+=`**${ru?'Инструменты':'Tools'}:**\n`+TOOLS.filter(t=>t.dir===d).slice(0,6).map(t=>`- [${t.name}](${t.url}) — ${ru?t.ru:t.en}`).join('\n')+`\n\n${ru?'Подробнее':'More'}: [#/dir/${d}](#/dir/${d})\n\n`;}
  if(toolHits.length) out+=`**${ru?'Упомянутые инструменты':'Mentioned tools'}:**\n`+toolHits.slice(0,6).map(t=>`- [${t.name}](${t.url}) — ${ru?t.ru:t.en}`).join('\n');
  return out;
}

export async function askGemini(history){
  const key=getKey(); if(!key) throw new Error('nokey');
  const models=[getModel(),...MODELS.filter(m=>m!==getModel())].slice(0,3); let last;
  for(const m of models){
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},
      body:JSON.stringify({systemInstruction:{parts:[{text:SYSTEM}]},contents:history.map(h=>({role:h.role==='user'?'user':'model',parts:[{text:h.text}]})),generationConfig:{temperature:0.4,maxOutputTokens:2048}})});
    const j=await r.json().catch(()=>({}));
    if(r.ok){const txt=j.candidates?.[0]?.content?.parts?.map(p=>p.text).join('')||'';if(txt)return {text:txt,model:m};last=new Error(j.candidates?.[0]?.finishReason||'empty');continue;}
    last=new Error(j.error?.message||('HTTP '+r.status)); last.status=r.status;
    if(![429,500,503,404].includes(r.status)) break;
  }
  throw last;
}

export function aiPage(L){
  const has=!!getKey();
  return `<h1>🤖 ${L('ИИ-помощник','AI assistant')}</h1>
  <p class="muted">${L('Задайте вопрос по OSINT, верификации, кибербезопасности или защите аккаунтов. С ключом Gemini — ответы ИИ; без ключа — офлайн-ответы из базы знаний сайта.','Ask about OSINT, verification, security or account protection. With a Gemini key — AI answers; without — offline knowledge-base answers.')}</p>
  <details class="card" id="aiset" ${has?'':'open'}><summary>⚙️ ${L('Ключ Gemini API','Gemini API key')}: <b class="${has?'ok':'warn'}">${has?L('сохранён','saved'):L('не задан (офлайн-режим)','not set (offline mode)')}</b></summary>
  <p class="muted">${L('Ключ хранится только в этом браузере (localStorage) и отправляется напрямую в Google. Он не попадает в код сайта. Бесплатный ключ: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a>.','The key is stored only in this browser (localStorage) and sent directly to Google. It is never in the site code. Free key: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a>.')}</p>
  <div class="form"><label>${L('Ключ','Key')}<input id="aikey" type="password" autocomplete="off" placeholder="${has?'••••••••••••':'AIza… / AQ.…'}"></label>
  <label>${L('Модель','Model')}<select id="aimodel">${MODELS.map(m=>`<option ${m===getModel()?'selected':''}>${m}</option>`).join('')}</select></label></div>
  <div class="btnrow"><button class="btn sm" id="aisave">💾 ${L('Сохранить','Save')}</button><button class="btn sm ghost danger" id="aidel">🗑 ${L('Удалить ключ','Remove key')}</button></div></details>
  <div id="chat" class="chat"></div>
  <div class="sugg">${[L('Как определить, где снято фото без EXIF?','How to geolocate a photo without EXIF?'),L('Как проверить, не фейк ли вирусное видео?','How to verify a viral video?'),L('Как защитить Telegram от угона и восстановить аккаунт?','How to protect and recover my Telegram?'),L('Найди поддомены сайта пассивно','Find a site’s subdomains passively'),L('Как зашифровать файл GPG для друга?','How to GPG-encrypt a file for a friend?')].map(s=>`<button class="chip" data-s="${esc(s)}">${esc(s)}</button>`).join('')}</div>
  <form id="aiform" class="aiform"><textarea id="aiq" rows="2" placeholder="${L('Ваш вопрос…','Your question…')}"></textarea><button class="btn" id="aisend">➤</button></form>
  <div class="btnrow"><button class="btn sm ghost" id="aiclr">🧹 ${L('Очистить чат','Clear chat')}</button></div>`;
}

export function bindAi(L, lang, rerender){
  const g=id=>document.getElementById(id); let hist=JSON.parse(localStorage.getItem(HIST)||'[]');
  const draw=()=>{g('chat').innerHTML=hist.length?hist.map(h=>`<div class="msg ${h.role}">${h.role==='user'?esc(h.text).replace(/\n/g,'<br>'):md(h.text)}${h.model?`<span class="mdl">${h.model}</span>`:''}</div>`).join(''):`<p class="muted">${L('Начните с вопроса или выберите пример ниже.','Start with a question or pick an example below.')}</p>`;g('chat').scrollTop=1e9;};
  const save=()=>localStorage.setItem(HIST,JSON.stringify(hist.slice(-30)));
  g('aisave').onclick=()=>{const k=g('aikey').value.trim();if(k)localStorage.setItem(KEY,k);localStorage.setItem(MODEL,g('aimodel').value);rerender();};
  g('aidel').onclick=()=>{localStorage.removeItem(KEY);rerender();};
  g('aiclr').onclick=()=>{hist=[];save();draw();};
  const send=async q=>{q=q.trim();if(!q)return;hist.push({role:'user',text:q});draw();g('aiq').value='';g('aisend').disabled=true;
    const wait=document.createElement('div');wait.className='msg model typing';wait.textContent=L('Думаю…','Thinking…');g('chat').appendChild(wait);g('chat').scrollTop=1e9;
    try{ if(!getKey()) throw new Error('nokey'); const r=await askGemini(hist.filter(h=>!h.offline).slice(-12)); hist.push({role:'model',text:r.text,model:r.model}); }
    catch(e){ let pre=''; if(e.message!=='nokey') pre=L(`> ⚠️ Gemini недоступен (${e.message}). Показываю офлайн-ответ.\n\n`,`> ⚠️ Gemini unavailable (${e.message}). Showing offline answer.\n\n`);
      hist.push({role:'model',text:pre+fallback(q,lang),offline:true,model:'offline'}); }
    save();g('aisend').disabled=false;draw();};
  g('aiform').addEventListener('submit',e=>{e.preventDefault();send(g('aiq').value);});
  g('aiq').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(g('aiq').value);}});
  document.querySelector('.sugg').addEventListener('click',e=>{const s=e.target.dataset.s;if(s)send(s);});
  draw();
}
