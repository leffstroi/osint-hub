import SparkMD5 from 'spark-md5';
import { SITES } from './data/usernames.js';

export const LAB = [
 {id:'dork',icon:'🔎',ru:'Конструктор Google-дорков',en:'Google dork builder'},
 {id:'username',icon:'👤',ru:'Генератор ссылок по нику (55 сайтов)',en:'Username link generator (55 sites)'},
 {id:'exif',icon:'📷',ru:'Просмотр EXIF и GPS на карте',en:'EXIF & GPS map viewer'},
 {id:'sun',icon:'☀️',ru:'Солнце и тени',en:'Sun & shadow helper'},
 {id:'reverse',icon:'🖼️',ru:'Обратный поиск изображения',en:'Reverse image search launcher'},
 {id:'infra',icon:'🌐',ru:'Лаунчер IP / домена',en:'IP / domain launcher'},
 {id:'encode',icon:'🧮',ru:'Кодировки и хэши',en:'Encoding & hash toolbox'},
 {id:'aes',icon:'🔐',ru:'AES-256 шифрование паролем',en:'AES-256 passphrase encryption'},
 {id:'classic',icon:'📜',ru:'Классические шифры и частотный анализ',en:'Classical ciphers & frequency analysis'},
 {id:'telegram',icon:'✈️',ru:'Telegram: публичный поиск по нику',en:'Telegram public handle search'},
];

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = (r, s) => r.querySelector(s);

export function renderLab(id, el, L) {
  const fn = { dork, username, exif, sun, reverse, infra, encode, aes, classic, telegram }[id];
  fn(el, L);
}

function links(arr){ return `<div class="linkgrid">${arr.map(([n,u])=>`<a class="chip" target="_blank" rel="noopener noreferrer" href="${esc(u)}">${esc(n)} ↗</a>`).join('')}</div>`; }

function dork(el, L){
  el.innerHTML = `<div class="form">
  <label>${L('Ключевые слова','Keywords')}<input id="q" placeholder='"Bishkek" отчет'></label>
  <label>${L('Точная фраза','Exact phrase')}<input id="ex"></label>
  <label>site:<input id="site" placeholder="gov.kg"></label>
  <label>filetype:<select id="ft"><option value="">—</option>${['pdf','doc','docx','xls','xlsx','ppt','pptx','csv','txt','kml','json','sql','log'].map(x=>`<option>${x}</option>`).join('')}</select></label>
  <label>intitle:<input id="it"></label><label>inurl:<input id="iu"></label><label>intext:<input id="itx"></label>
  <label>${L('Исключить слова','Exclude words')}<input id="no" placeholder="реклама"></label>
  <label>after:<input id="af" type="date"></label><label>before:<input id="bf" type="date"></label>
  </div>
  <div class="out"><code id="out"></code><button class="btn sm" id="cp">${L('Копировать','Copy')}</button></div>
  <div id="go"></div>
  <p class="muted">${L('Готовые шаблоны:','Presets:')}</p><div class="linkgrid" id="pre"></div>`;
  const presets=[[L('Документы на сайте','Docs on a site'),{site:'example.com',ft:'pdf'}],[L('Открытые индексы каталогов','Open directory listings'),{it:'index of',q:'parent directory'}],[L('Таблицы госорганов','Gov spreadsheets'),{site:'gov.kg',ft:'xlsx'}],[L('Упоминания в Telegram','Telegram mentions'),{site:'t.me',q:''}],[L('Презентации компании','Company slides'),{ft:'pptx',q:'"company name"'}],[L('KML/карты','KML maps'),{ft:'kml'}]];
  const ids=['q','ex','site','ft','it','iu','itx','no','af','bf'];
  const upd=()=>{const v=Object.fromEntries(ids.map(i=>[i,$(el,'#'+i).value.trim()]));
    const p=[];if(v.q)p.push(v.q);if(v.ex)p.push(`"${v.ex}"`);if(v.site)p.push('site:'+v.site);if(v.ft)p.push('filetype:'+v.ft);if(v.it)p.push(`intitle:"${v.it}"`);if(v.iu)p.push('inurl:'+v.iu);if(v.itx)p.push(`intext:"${v.itx}"`);
    v.no.split(/\s+/).filter(Boolean).forEach(w=>p.push('-'+w));if(v.af)p.push('after:'+v.af);if(v.bf)p.push('before:'+v.bf);
    const s=p.join(' ');$(el,'#out').textContent=s||L('(заполните поля)','(fill in fields)');const e=encodeURIComponent(s);
    $(el,'#go').innerHTML=s?links([['Google','https://www.google.com/search?q='+e],['Bing','https://www.bing.com/search?q='+e],['DuckDuckGo','https://duckduckgo.com/?q='+e],['Yandex','https://yandex.com/search/?text='+e]]):'';};
  ids.forEach(i=>$(el,'#'+i).addEventListener('input',upd));
  $(el,'#pre').innerHTML=presets.map((p,i)=>`<button class="chip" data-i="${i}">${esc(p[0])}</button>`).join('');
  $(el,'#pre').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;ids.forEach(i=>$(el,'#'+i).value='');Object.entries(presets[b.dataset.i][1]).forEach(([k,v])=>$(el,'#'+k).value=v);upd();});
  $(el,'#cp').onclick=()=>navigator.clipboard?.writeText($(el,'#out').textContent);
  upd();
}

function username(el, L){
  el.innerHTML=`<div class="form"><label>${L('Ник','Username')}<input id="u" placeholder="johndoe" autocapitalize="off" autocomplete="off"></label></div>
  <p class="muted">${L('Ссылки открываются в новых вкладках. Сайт ничего не скачивает и не проверяет за вас — смотрите сами, существует ли профиль. Используйте для проверки своего цифрового следа или законного исследования.','Links open in new tabs; nothing is scraped — check each profile yourself. Use for auditing your own footprint or lawful research.')}</p>
  <div id="res"></div>`;
  const upd=()=>{const u=$(el,'#u').value.trim().replace(/^@/,'');
    $(el,'#res').innerHTML=u?`<p>${SITES.length} ${L('ссылок для','links for')} <b>${esc(u)}</b></p>`+links(SITES.map(([n,t])=>[n,t.replaceAll('{u}',encodeURIComponent(u))])):'';};
  $(el,'#u').addEventListener('input',upd);
}

async function exif(el, L){
  el.innerHTML=`<label class="drop" id="drop"><input type="file" id="f" accept="image/*,.heic,.tif,.tiff" hidden><span>📷 ${L('Выберите или перетащите фото. Файл обрабатывается только в браузере.','Choose or drop a photo. Processed locally only.')}</span></label>
  <div id="map" class="map hidden"></div><div id="meta"></div>`;
  const handle=async file=>{
    $(el,'#meta').innerHTML=L('Чтение…','Reading…');
    const [{default:exifr}] = await Promise.all([import('exifr')]);
    let data=null; try{ data = await exifr.parse(file,{tiff:true,exif:true,gps:true,xmp:true,iptc:true,icc:false}); }catch(e){}
    let gps=null; try{ gps = await exifr.gps(file);}catch(e){}
    if(!data){ $(el,'#meta').innerHTML=`<p class="warn">${L('Метаданные не найдены (часто их удаляют соцсети и мессенджеры).','No metadata found (social networks and messengers usually strip it).')}</p>`; $(el,'#map').classList.add('hidden'); return; }
    const rows=Object.entries(data).filter(([k,v])=>v!==undefined&&typeof v!=='object'||v instanceof Date).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${esc(v instanceof Date?v.toISOString():v)}</td></tr>`).join('');
    let g='';
    if(gps&&isFinite(gps.latitude)){const la=gps.latitude.toFixed(6),lo=gps.longitude.toFixed(6);
      g=`<p class="ok">📍 GPS: <b>${la}, ${lo}</b></p>`+links([['Google Maps',`https://www.google.com/maps?q=${la},${lo}`],['OpenStreetMap',`https://www.openstreetmap.org/?mlat=${la}&mlon=${lo}#map=17/${la}/${lo}`],['Yandex',`https://yandex.com/maps/?pt=${lo},${la}&z=17`],['SunCalc',`https://www.suncalc.org/#/${la},${lo},17/`]]);
      const m=$(el,'#map');m.classList.remove('hidden');
      const Lf=(await import('leaflet')).default; await import('leaflet/dist/leaflet.css');
      if(m._lmap){m._lmap.remove();}
      const map=Lf.map(m).setView([gps.latitude,gps.longitude],15);m._lmap=map;
      Lf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
      Lf.circleMarker([gps.latitude,gps.longitude],{radius:9,color:'#39ff88'}).addTo(map);
      setTimeout(()=>map.invalidateSize(),100);
    } else { $(el,'#map').classList.add('hidden'); g=`<p class="muted">${L('GPS-координат нет.','No GPS coordinates.')}</p>`; }
    $(el,'#meta').innerHTML=g+`<div class="tablewrap"><table>${rows}</table></div><p class="muted">${L('Помните: EXIF можно подделать. Проверяйте другими методами.','Remember: EXIF can be forged. Verify by other means.')}</p>`;
  };
  $(el,'#f').addEventListener('change',e=>e.target.files[0]&&handle(e.target.files[0]));
  const d=$(el,'#drop');d.addEventListener('dragover',e=>{e.preventDefault();d.classList.add('over')});d.addEventListener('dragleave',()=>d.classList.remove('over'));
  d.addEventListener('drop',e=>{e.preventDefault();d.classList.remove('over');e.dataTransfer.files[0]&&handle(e.dataTransfer.files[0]);});
}

// NOAA-based solar position
function sunPos(date, lat, lon){
  const rad=Math.PI/180, d=date.getTime()/86400000+2440587.5-2451545.0;
  const g=(357.529+0.98560028*d)*rad, q=280.459+0.98564736*d;
  const Lr=(q+1.915*Math.sin(g)+0.020*Math.sin(2*g))*rad, e=(23.439-0.00000036*d)*rad;
  const ra=Math.atan2(Math.cos(e)*Math.sin(Lr),Math.cos(Lr)), dec=Math.asin(Math.sin(e)*Math.sin(Lr));
  const gmst=(18.697374558+24.06570982441908*d)%24, lst=(gmst*15+lon)*rad, H=lst-ra;
  const alt=Math.asin(Math.sin(lat*rad)*Math.sin(dec)+Math.cos(lat*rad)*Math.cos(dec)*Math.cos(H));
  let az=Math.atan2(-Math.sin(H),Math.tan(dec)*Math.cos(lat*rad)-Math.sin(lat*rad)*Math.cos(H));
  return {alt:alt/rad, az:((az/rad)+360)%360};
}
function sun(el, L){
  const now=new Date(); const iso=new Date(now-now.getTimezoneOffset()*6e4).toISOString().slice(0,16);
  el.innerHTML=`<div class="form"><label>${L('Широта','Latitude')}<input id="la" type="number" step="any" value="42.8746"></label>
  <label>${L('Долгота','Longitude')}<input id="lo" type="number" step="any" value="74.5698"></label>
  <label>${L('Дата и время (ваш часовой пояс)','Date & time (your timezone)')}<input id="dt" type="datetime-local" value="${iso}"></label>
  <label>${L('Высота объекта, м','Object height, m')}<input id="h" type="number" step="any" value="1.8"></label>
  <label>${L('Длина тени, м (для обратного расчёта)','Shadow length, m (reverse)')}<input id="sl" type="number" step="any" placeholder="—"></label></div>
  <div id="r" class="card"></div><canvas id="cv" width="320" height="320" class="compass"></canvas>`;
  const upd=()=>{const la=+$(el,'#la').value,lo=+$(el,'#lo').value,dt=new Date($(el,'#dt').value),h=+$(el,'#h').value,sl=+$(el,'#sl').value;
    if(!isFinite(la)||!isFinite(lo)||isNaN(dt))return; const p=sunPos(dt,la,lo);
    const shadow=p.alt>0?h/Math.tan(p.alt*Math.PI/180):Infinity, sdir=(p.az+180)%360;
    let rev=''; if(sl>0&&h>0){const a=Math.atan(h/sl)*180/Math.PI; rev=`<p>${L('По тени: высота солнца','From shadow: sun altitude')} ≈ <b>${a.toFixed(1)}°</b> (${L('сейчас','now')} ${p.alt.toFixed(1)}°)</p>`;}
    $(el,'#r').innerHTML=`<p>☀️ ${L('Высота солнца','Sun altitude')}: <b>${p.alt.toFixed(1)}°</b> · ${L('Азимут','Azimuth')}: <b>${p.az.toFixed(1)}°</b></p>
    <p>🌑 ${L('Тень','Shadow')}: ${p.alt>0?`<b>${shadow.toFixed(2)} м</b> ${L('направлена на','pointing')} <b>${sdir.toFixed(0)}°</b>`:L('солнце под горизонтом','sun below horizon')}</p>${rev}
    ${links([['SunCalc',`https://www.suncalc.org/#/${la},${lo},15/${dt.getFullYear()}.${String(dt.getMonth()+1).padStart(2,'0')}.${String(dt.getDate()).padStart(2,'0')}/${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}/1/3`],['ShadeMap',`https://shademap.app/@${la},${lo},15z`],['Google Earth',`https://earth.google.com/web/@${la},${lo},500a,1000d,35y,0h,0t,0r`]])}`;
    const c=$(el,'#cv'),x=c.getContext('2d'),R=140,cx=160,cy=160;x.clearRect(0,0,320,320);x.strokeStyle='#2a3a33';x.lineWidth=1;
    for(let r of [R,R*2/3,R/3]){x.beginPath();x.arc(cx,cy,r,0,7);x.stroke();}
    x.fillStyle='#7f9a8c';x.font='14px monospace';x.textAlign='center';x.fillText('N',cx,14);x.fillText('S',cx,316);x.fillText('E',312,165);x.fillText('W',8,165);
    if(p.alt>0){const rr=R*(1-p.alt/90),a=(p.az-90)*Math.PI/180;x.fillStyle='#ffd23f';x.beginPath();x.arc(cx+rr*Math.cos(a),cy+rr*Math.sin(a),9,0,7);x.fill();
      const sa=(sdir-90)*Math.PI/180,len=Math.min(R,shadow/h*35);x.strokeStyle='#39ff88';x.lineWidth=4;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+len*Math.cos(sa),cy+len*Math.sin(sa));x.stroke();}
  };
  el.querySelectorAll('input').forEach(i=>i.addEventListener('input',upd)); upd();
}

function reverse(el, L){
  el.innerHTML=`<div class="form"><label>${L('Публичный URL изображения','Public image URL')}<input id="u" type="url" placeholder="https://…/photo.jpg"></label></div><div id="r"></div>
  <p class="muted">${L('Для локального файла: откройте Google Lens / Yandex / TinEye и загрузите файл вручную.','For a local file, open Google Lens / Yandex / TinEye and upload manually.')}</p>
  ${links([['Google Lens','https://lens.google.com/'],['Yandex','https://yandex.com/images/'],['Bing','https://www.bing.com/visualsearch'],['TinEye','https://tineye.com/']])}`;
  $(el,'#u').addEventListener('input',e=>{const u=e.target.value.trim();if(!/^https?:\/\//.test(u)){$(el,'#r').innerHTML='';return;}const q=encodeURIComponent(u);
    $(el,'#r').innerHTML=`<img class="preview" src="${esc(u)}" alt="" referrerpolicy="no-referrer" onerror="this.style.display='none'">`+links([['Google Lens','https://lens.google.com/uploadbyurl?url='+q],['Yandex','https://yandex.com/images/search?rpt=imageview&url='+q],['Bing','https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:'+q],['TinEye','https://tineye.com/search?url='+q],['Baidu','https://graph.baidu.com/details?isfromtusoupc=1&tn=pc&carousel=0&image='+q]]);});
}

function infra(el, L){
  el.innerHTML=`<div class="form"><label>${L('Домен или IP','Domain or IP')}<input id="u" placeholder="example.com / 8.8.8.8" autocapitalize="off"></label></div><div id="r"></div>
  <p class="muted">${L('Только пассивная разведка: эти сервисы показывают уже собранные публичные данные.','Passive recon only: these services show already-collected public data.')}</p>`;
  $(el,'#u').addEventListener('input',e=>{let v=e.target.value.trim().replace(/^https?:\/\//,'').replace(/\/.*$/,'');if(!v){$(el,'#r').innerHTML='';return;}
    const ip=/^\d{1,3}(\.\d{1,3}){3}$/.test(v)||v.includes(':'), q=encodeURIComponent(v);
    const common=[['VirusTotal',`https://www.virustotal.com/gui/search/${q}`],['Shodan',`https://www.shodan.io/search?query=${q}`],['Censys',`https://search.censys.io/search?resource=hosts&q=${q}`],['urlscan',`https://urlscan.io/search/#${q}`],['AlienVault OTX',`https://otx.alienvault.com/browse/global/pulses?q=${q}`]];
    const ipL=[['IPinfo',`https://ipinfo.io/${q}`],['AbuseIPDB',`https://www.abuseipdb.com/check/${q}`],['GreyNoise',`https://viz.greynoise.io/ip/${q}`],['BGP HE',`https://bgp.he.net/ip/${q}`],['ViewDNS reverse IP',`https://viewdns.info/reverseip/?host=${q}&t=1`],['Shodan host',`https://www.shodan.io/host/${q}`]];
    const dL=[['ICANN Lookup',`https://lookup.icann.org/en/lookup?name=${q}`],['DomainTools',`https://whois.domaintools.com/${q}`],['crt.sh',`https://crt.sh/?q=%25.${q}`],['SecurityTrails',`https://securitytrails.com/domain/${q}/dns`],['DNSDumpster','https://dnsdumpster.com/'],['Wayback',`https://web.archive.org/web/*/${q}`],['archive.today',`https://archive.ph/${q}`],['BuiltWith',`https://builtwith.com/${q}`],['MXToolbox',`https://mxtoolbox.com/SuperTool.aspx?action=mx%3a${q}`],['Google site:',`https://www.google.com/search?q=site%3A${q}`],['Safe Browsing',`https://transparencyreport.google.com/safe-browsing/search?url=${q}`]];
    $(el,'#r').innerHTML=`<p>${ip?'IP':L('Домен','Domain')}: <b>${esc(v)}</b></p>`+links([...(ip?ipL:dL),...common]);});
}

const toHex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const b64e=s=>btoa(String.fromCharCode(...new TextEncoder().encode(s)));
const b64d=s=>new TextDecoder().decode(Uint8Array.from(atob(s.trim()),c=>c.charCodeAt(0)));
function encode(el, L){
  el.innerHTML=`<label class="block">${L('Ввод','Input')}<textarea id="in" rows="4">Avantgarde OSINT</textarea></label>
  <div class="btnrow">${[['b64e','Base64 →'],['b64d','← Base64'],['urle','URL →'],['urld','← URL'],['hexe','Hex →'],['hexd','← Hex'],['bin','Binary →'],['rot13','ROT13'],['rev',L('Реверс','Reverse')]].map(([k,n])=>`<button class="btn sm" data-k="${k}">${n}</button>`).join('')}</div>
  <label class="block">${L('Результат','Output')}<textarea id="out" rows="4" readonly></textarea></label>
  <h4>${L('Хэши (считаются локально)','Hashes (computed locally)')}</h4><div id="h" class="tablewrap"></div>
  <label class="drop sm"><input type="file" id="f" hidden><span>📄 ${L('Хэш файла','Hash a file')}</span></label>`;
  const ops={b64e,b64d,urle:encodeURIComponent,urld:decodeURIComponent,hexe:s=>toHex(new TextEncoder().encode(s)),hexd:s=>new TextDecoder().decode(new Uint8Array((s.replace(/[^0-9a-f]/gi,'').match(/../g)||[]).map(h=>parseInt(h,16)))),
    bin:s=>[...new TextEncoder().encode(s)].map(b=>b.toString(2).padStart(8,'0')).join(' '),rot13:s=>s.replace(/[a-z]/gi,c=>String.fromCharCode((c<='Z'?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26)),rev:s=>[...s].reverse().join('')};
  el.querySelector('.btnrow').addEventListener('click',e=>{const k=e.target.dataset.k;if(!k)return;try{$(el,'#out').value=ops[k]($(el,'#in').value);}catch(err){$(el,'#out').value=L('Ошибка: неверный ввод','Error: invalid input');}});
  const hash=async buf=>{const rows=[['MD5',SparkMD5.ArrayBuffer.hash(buf)]];for(const a of ['SHA-1','SHA-256','SHA-384','SHA-512'])rows.push([a,toHex(await crypto.subtle.digest(a,buf))]);
    $(el,'#h').innerHTML=`<table>${rows.map(([a,v])=>`<tr><td>${a}</td><td class="mono">${v}</td></tr>`).join('')}</table>`;};
  const th=()=>hash(new TextEncoder().encode($(el,'#in').value).buffer);
  $(el,'#in').addEventListener('input',th);th();
  $(el,'#f').addEventListener('change',async e=>{const f=e.target.files[0];if(f)hash(await f.arrayBuffer());});
}

async function deriveKey(pass,salt){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
function aes(el, L){
  el.innerHTML=`<p class="muted">${L('AES-256-GCM, ключ из пароля через PBKDF2-SHA256 (250 000 итераций), случайная соль и IV. Всё происходит в браузере. Передавайте пароль другим каналом.','AES-256-GCM, key from passphrase via PBKDF2-SHA256 (250k iterations), random salt and IV. All in-browser. Share the passphrase via a different channel.')}</p>
  <label class="block">${L('Пароль','Passphrase')}<input id="p" type="password" autocomplete="new-password"></label>
  <label class="block">${L('Текст / шифротекст','Text / ciphertext')}<textarea id="in" rows="5"></textarea></label>
  <div class="btnrow"><button class="btn" id="enc">🔒 ${L('Зашифровать','Encrypt')}</button><button class="btn ghost" id="dec">🔓 ${L('Расшифровать','Decrypt')}</button></div>
  <label class="block">${L('Результат','Output')}<textarea id="out" rows="5" readonly></textarea></label>`;
  $(el,'#enc').onclick=async()=>{const p=$(el,'#p').value;if(p.length<8){$(el,'#out').value=L('Пароль минимум 8 символов','Passphrase: at least 8 characters');return;}
    const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
    const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await deriveKey(p,salt),new TextEncoder().encode($(el,'#in').value)));
    const all=new Uint8Array(28+ct.length);all.set(salt);all.set(iv,16);all.set(ct,28);
    $(el,'#out').value='OHAES1:'+btoa(String.fromCharCode(...all));};
  $(el,'#dec').onclick=async()=>{try{const s=$(el,'#in').value.trim().replace(/^OHAES1:/,'');const all=Uint8Array.from(atob(s),c=>c.charCodeAt(0));
    const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:all.slice(16,28)},await deriveKey($(el,'#p').value,all.slice(0,16)),all.slice(28));
    $(el,'#out').value=new TextDecoder().decode(pt);}catch(e){$(el,'#out').value=L('Не удалось расшифровать: неверный пароль или повреждённые данные.','Decryption failed: wrong passphrase or corrupted data.');}};
}

const RU='абвгдеёжзийклмнопрстуфхцчшщъыьэюя', EN='abcdefghijklmnopqrstuvwxyz';
function shift(s,k){return [...s].map(ch=>{const lo=ch.toLowerCase();for(const A of [RU,EN]){const i=A.indexOf(lo);if(i>=0){const n=A[((i+k)%A.length+A.length)%A.length];return ch===lo?n:n.toUpperCase();}}return ch;}).join('');}
function vig(s,key,dir){const k=[...key.toLowerCase()].map(c=>{let i=EN.indexOf(c);if(i>=0)return i;i=RU.indexOf(c);return i>=0?i:0;});if(!k.length)return s;let j=0;
  return [...s].map(ch=>{const lo=ch.toLowerCase();for(const A of [RU,EN]){const i=A.indexOf(lo);if(i>=0){const n=A[((i+dir*k[j++%k.length])%A.length+A.length)%A.length];return ch===lo?n:n.toUpperCase();}}return ch;}).join('');}
function classic(el, L){
  el.innerHTML=`<label class="block">${L('Текст','Text')}<textarea id="in" rows="4">Тулезх угкезжълн</textarea></label>
  <div class="form"><label>${L('Сдвиг Цезаря','Caesar shift')}<input id="k" type="number" value="3"></label><label>${L('Ключ Виженера','Vigenère key')}<input id="vk" value="ключ"></label></div>
  <div class="btnrow"><button class="btn sm" data-a="ce">Caesar +</button><button class="btn sm" data-a="cd">Caesar −</button><button class="btn sm" data-a="ve">Vigenère +</button><button class="btn sm" data-a="vd">Vigenère −</button><button class="btn sm" data-a="bf">${L('Перебор всех сдвигов','Brute-force all shifts')}</button><button class="btn sm" data-a="fq">${L('Частотный анализ','Frequency analysis')}</button></div>
  <div id="out" class="card mono"></div>
  <p class="muted">${L('Почему это не безопасно: у Цезаря всего 33 ключа (перебор за секунду), простая замена ломается по частотам букв, Виженер — методом Касиски. Для реальной защиты используйте AES или GPG.','Why insecure: Caesar has only 26–33 keys, substitution falls to letter frequencies, Vigenère to Kasiski. Use AES or GPG for real protection.')}</p>`;
  el.querySelector('.btnrow').addEventListener('click',e=>{const a=e.target.dataset.a;if(!a)return;const s=$(el,'#in').value,k=+$(el,'#k').value||0,o=$(el,'#out');
    if(a==='ce')o.textContent=shift(s,k);if(a==='cd')o.textContent=shift(s,-k);if(a==='ve')o.textContent=vig(s,$(el,'#vk').value,1);if(a==='vd')o.textContent=vig(s,$(el,'#vk').value,-1);
    if(a==='bf'){const isRu=/[а-яё]/i.test(s),n=isRu?33:26;o.innerHTML=Array.from({length:n-1},(_,i)=>`<div><b>−${i+1}</b> ${esc(shift(s,-(i+1)))}</div>`).join('');}
    if(a==='fq'){const c={};let t=0;for(const ch of s.toLowerCase())if(RU.includes(ch)||EN.includes(ch)){c[ch]=(c[ch]||0)+1;t++;}
      const arr=Object.entries(c).sort((x,y)=>y[1]-x[1]);o.innerHTML=`<p>${L('Типичные частоты: RU — о е а и н т; EN — e t a o i n','Typical: EN — e t a o i n; RU — о е а и н т')}</p>`+arr.map(([ch,v])=>`<div class="bar"><span>${esc(ch)}</span><i style="width:${(v/arr[0][1]*100).toFixed(0)}%"></i><em>${(v/t*100).toFixed(1)}%</em></div>`).join('');}
  });
}

function telegram(el, L){
  el.innerHTML=`<p class="warn">⚠️ ${L('Только публичные данные и законные цели. Не используйте «пробив»-боты на утёкших базах — это незаконно. Атаки и массовые жалобы на чужие аккаунты запрещены.','Public data and lawful purposes only. No leaked-database lookup bots. Attacks and mass-reporting are prohibited.')}</p>
  <div class="form"><label>${L('Ник Telegram','Telegram handle')}<input id="u" placeholder="durov" autocapitalize="off"></label></div><div id="r"></div>`;
  $(el,'#u').addEventListener('input',e=>{const u=e.target.value.trim().replace(/^@|^https?:\/\/t\.me\//g,'');if(!u){$(el,'#r').innerHTML='';return;}const q=encodeURIComponent(u);
    $(el,'#r').innerHTML=links([['t.me/'+u,'https://t.me/'+q],[L('Превью t.me/s (каналы)','t.me/s preview (channels)'),'https://t.me/s/'+q],['Google site:t.me',`https://www.google.com/search?q=site%3At.me+%22${q}%22`],['Telegago',`https://cse.google.com/cse?cx=006368593537057042503:efxu7xprihg#gsc.q=${q}`],['TGStat',`https://tgstat.com/search?q=${q}`],['Telemetr',`https://telemetr.io/en/channels?query=${q}`],['Lyzem',`https://lyzem.com/search?q=${q}`],['Yandex',`https://yandex.com/search/?text=%22${q}%22+telegram`],['WhatsMyName',`https://whatsmyname.app/?q=${q}`]]);});
}
