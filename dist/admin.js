(()=>{
  // ===== 設定 =====
  const OWNER='8viliv8', REPO='urei-works-index', BRANCH='main';
  const DATA_PATH='dist/data.js', KEY_PATH='dist/admin-key.json';
  const MARKER='// @@WORKS_END';
  const API=`https://api.github.com/repos/${OWNER}/${REPO}`;
  const ITERATIONS=600000;
  const INKS=['#254762','#27342f','#6d5369','#a34533','#2f5e4c','#c99a1e'];

  const $=id=>document.getElementById(id);
  const panels=['loadingPanel','loginPanel','setupPanel','addPanel'];
  const show=id=>panels.forEach(p=>$(p).hidden=p!==id);
  const say=(el,text,isError=false,html=false)=>{el.hidden=!text;el.classList.toggle('error',isError);el[html?'innerHTML':'textContent']=text||'';};
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // 鍵はメモリにだけ置く（ページを閉じる・LOG OUT で消える）。
  let token=null;

  // ===== base64 / UTF-8 =====
  const b64FromBytes=bytes=>{let s='';const a=new Uint8Array(bytes);for(let i=0;i<a.length;i+=0x8000)s+=String.fromCharCode(...a.subarray(i,i+0x8000));return btoa(s);};
  const bytesFromB64=b64=>Uint8Array.from(atob(b64.replace(/\s/g,'')),c=>c.charCodeAt(0));
  const utf8ToB64=str=>b64FromBytes(new TextEncoder().encode(str));
  const b64ToUtf8=b64=>new TextDecoder().decode(bytesFromB64(b64));

  // ===== 暗号（PBKDF2-SHA256 → AES-GCM） =====
  async function deriveKey(pass,salt,iterations){
    const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  async function encryptToken(tok,pass){
    const salt=crypto.getRandomValues(new Uint8Array(16)), iv=crypto.getRandomValues(new Uint8Array(12));
    const key=await deriveKey(pass,salt,ITERATIONS);
    const data=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(tok));
    return {v:1,kdf:'PBKDF2-SHA256',iterations:ITERATIONS,cipher:'AES-256-GCM',salt:b64FromBytes(salt),iv:b64FromBytes(iv),data:b64FromBytes(data)};
  }
  async function decryptToken(box,pass){
    const key=await deriveKey(pass,bytesFromB64(box.salt),box.iterations);
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytesFromB64(box.iv)},key,bytesFromB64(box.data));
    return new TextDecoder().decode(plain);
  }

  // ===== GitHub API =====
  async function gh(path,{method='GET',body,auth=true}={}){
    const headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
    if(auth&&token) headers.Authorization=`Bearer ${token}`;
    if(body) headers['Content-Type']='application/json';
    const res=await fetch(`${API}${path}`,{method,headers,body:body?JSON.stringify(body):undefined,cache:'no-store'});
    const json=await res.json().catch(()=>({}));
    if(!res.ok){const err=new Error(json.message||`HTTP ${res.status}`);err.status=res.status;throw err;}
    return json;
  }
  const getFile=(path,auth=true)=>gh(`/contents/${path}?ref=${BRANCH}&t=${Date.now()}`,{auth});
  const putFile=(path,text,message,sha)=>gh(`/contents/${path}`,{method:'PUT',body:{message,content:utf8ToB64(text),branch:BRANCH,...(sha?{sha}:{})}});

  async function loadKeyBox(){
    try{const f=await getFile(KEY_PATH,false);return JSON.parse(b64ToUtf8(f.content));}
    catch(e){if(e.status===404)return null;throw e;}
  }

  // ===== data.js の読み取りと追記 =====
  function parseData(src){
    const win={};
    new Function('window',src)(win);
    if(!win.UREI_INDEX||!Array.isArray(win.UREI_INDEX.works)) throw new Error('data.js の形式を読み取れません');
    return win.UREI_INDEX;
  }
  const today=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;};
  function originOf(u){
    const h=u.hostname;
    if(h==='claude.ai'||h.endsWith('.claude.ai')||h==='claude.site'||h.endsWith('.claude.site')) return 'CLAUDE ARTIFACT';
    if(h.endsWith('.github.io')) return 'GITHUB PAGES';
    if(h==='github.com') return 'GITHUB';
    if(h.endsWith('chatgpt.site')||h==='chatgpt.com'||h.endsWith('.chatgpt.com')) return 'CHATGPT';
    if(h.endsWith('.workers.dev')||h.endsWith('.pages.dev')) return 'CLOUDFLARE';
    return h.replace(/^www\./,'').toUpperCase();
  }
  function titleFromUrl(u){
    const seg=u.pathname.split('/').filter(Boolean).pop()||'';
    const base=decodeURIComponent(seg).replace(/\.(html?|php)$/i,'').replace(/[-_]+/g,' ').trim();
    if(base&&base.toLowerCase()!=='index'&&!/^[A-Za-z0-9]{16,}$/.test(base)) return base.toUpperCase();
    const host=u.hostname.replace(/^www\./,'').split('.')[0];
    return (host||'UNTITLED').replace(/[-_]+/g,' ').toUpperCase();
  }
  const slug=s=>s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'work';
  const LABELS={live:'LIVE',development:'IN DEVELOPMENT',seeking:'SOURCE HUNTING',archived:'ARCHIVED'};

  function buildEntry(fields){
    const J=JSON.stringify;
    return [
      '    {',
      `      id: ${J(fields.id)},`,
      `      no: ${fields.no},`,
      `      title: ${J(fields.title)},`,
      `      description: ${J(fields.description)},`,
      `      status: ${J(fields.status)},`,
      `      statusLabel: ${J(LABELS[fields.status])},`,
      `      origin: ${J(fields.origin)},`,
      `      url: ${J(fields.url)},`,
      `      genres: ${J(fields.genres)},`,
      `      added: ${J(fields.added)},`,
      `      ink: ${J(fields.ink)}`,
      '    }'
    ].join('\n');
  }
  function insertEntry(src,entry,date){
    const idx=src.indexOf(MARKER);
    if(idx<0) throw new Error('data.js に追加位置の目印（@@WORKS_END）がありません');
    const lineStart=src.lastIndexOf('\n',idx)+1;
    const head=src.slice(0,lineStart).replace(/\s+$/,'');
    const tail=src.slice(lineStart);
    const sep=head.endsWith('[')?'\n':',\n';
    let out=head+sep+entry+'\n'+tail;
    out=out.replace(/(updated:\s*")\d{4}-\d{2}-\d{2}(")/,`$1${date}$2`);
    return out;
  }

  async function addWork(form){
    const url=new URL(form.url);
    if(!/^https?:$/.test(url.protocol)) throw new Error('http または https のURLを入れてください');
    for(let attempt=0;attempt<2;attempt++){
      const file=await getFile(DATA_PATH);
      const src=b64ToUtf8(file.content);
      const data=parseData(src);
      const dup=data.works.find(w=>w.url&&w.url.replace(/\/$/,'')===url.href.replace(/\/$/,''));
      if(dup) throw new Error(`このURLは登録済みです（No.${String(dup.no).padStart(2,'0')} ${dup.title}）`);
      const no=Math.max(0,...data.works.map(w=>Number(w.no)||0))+1;
      const title=form.title.trim()||titleFromUrl(url);
      const ids=new Set(data.works.map(w=>w.id));
      let id=slug(title); if(ids.has(id)) id=`${id}-${no}`;
      const date=today();
      const entry=buildEntry({id,no,title,description:form.note.trim(),status:form.status,origin:originOf(url),url:url.href,genres:form.genres,added:date,ink:INKS[no%INKS.length]});
      const next=insertEntry(src,entry,date);
      const after=parseData(next);
      if(after.works.length!==data.works.length+1||after.works[after.works.length-1].url!==url.href) throw new Error('追記後の data.js の確認に失敗しました（保存していません）');
      try{
        const res=await putFile(DATA_PATH,next,`Add work: ${title} (via admin)`,file.sha);
        return {no,title,commit:res.commit&&res.commit.html_url};
      }catch(e){if(e.status===409&&attempt===0)continue;throw e;}
    }
  }

  // ===== 画面 =====
  const genreList=(window.UREI_INDEX&&window.UREI_INDEX.genres)||[];
  $('genreChecks').innerHTML=genreList.map(g=>`<label><input type="checkbox" value="${esc(g.id)}">${esc(g.label)}</label>`).join('');

  let keyBox=null;
  async function start(){
    try{keyBox=await loadKeyBox();}
    catch(e){show('loginPanel');say($('loginMessage'),`鍵の読み込みに失敗しました：${e.message}`,true);return;}
    if(keyBox){show('loginPanel');$('loginPass').focus();}
    else{show('setupPanel');}
  }

  $('loginPanel').addEventListener('submit',async e=>{
    e.preventDefault();
    const btn=$('loginButton');btn.disabled=true;say($('loginMessage'),'');
    try{
      if(!keyBox) keyBox=await loadKeyBox();
      token=await decryptToken(keyBox,$('loginPass').value);
      $('loginPass').value='';
      show('addPanel');$('addUrl').focus();
    }catch(err){
      token=null;
      say($('loginMessage'),err.name==='OperationError'?'パスワードが違います。':`ログインできませんでした：${err.message}`,true);
    }finally{btn.disabled=false;}
  });

  $('toSetup').addEventListener('click',()=>{show('setupPanel');$('toLogin').hidden=!keyBox;});
  $('toLogin').addEventListener('click',()=>show('loginPanel'));

  $('setupPanel').addEventListener('submit',async e=>{
    e.preventDefault();
    const msg=$('setupMessage'),btn=$('setupButton');
    const tok=$('setupToken').value.trim(),p1=$('setupPass').value,p2=$('setupPass2').value;
    if(p1!==p2){say(msg,'確認用のパスワードが一致しません。',true);return;}
    if(p1.length<16){say(msg,'パスワードは16文字以上にしてください。',true);return;}
    btn.disabled=true;say(msg,'鍵を確認しています…');
    try{
      token=tok;
      const repo=await gh('');
      if(repo.permissions&&repo.permissions.push===false) throw new Error('この鍵には書き込み権限がありません（Contents: Read and write が必要）');
      say(msg,'暗号化して保存しています…');
      const box=await encryptToken(tok,p1);
      let sha;try{sha=(await getFile(KEY_PATH)).sha;}catch(err){if(err.status!==404)throw err;}
      await putFile(KEY_PATH,JSON.stringify(box,null,2)+'\n','Update encrypted admin key (via admin)',sha);
      keyBox=box;
      $('setupToken').value='';$('setupPass').value='';$('setupPass2').value='';
      say(msg,'');show('addPanel');
      say($('addMessage'),'鍵を保存しました。次回からはパスワードだけでログインできます。');
    }catch(err){
      token=null;
      say(msg,err.status===401?'GitHubの鍵が正しくないか、期限切れです。':`保存できませんでした：${err.message}`,true);
    }finally{btn.disabled=false;}
  });

  $('addPanel').addEventListener('submit',async e=>{
    e.preventDefault();
    const msg=$('addMessage'),btn=$('addButton');
    btn.disabled=true;say(msg,'索引に刷り込んでいます…');
    try{
      const r=await addWork({
        url:$('addUrl').value.trim(),
        title:$('addTitle').value,
        note:$('addNote').value,
        status:$('addStatus').value,
        genres:[...$('genreChecks').querySelectorAll('input:checked')].map(i=>i.value)
      });
      say(msg,`No.${String(r.no).padStart(2,'0')} 「${esc(r.title)}」を追加しました。1〜2分で<a href="./">索引</a>に並びます。${r.commit?` <a href="${esc(r.commit)}" target="_blank" rel="noopener">変更記録</a>`:''}`,false,true);
      $('addUrl').value='';$('addTitle').value='';$('addNote').value='';$('addStatus').value='live';
      $('genreChecks').querySelectorAll('input').forEach(i=>i.checked=false);
      $('addUrl').focus();
    }catch(err){
      say(msg,err.status===401?'GitHubの鍵が無効になっています。「鍵を設定し直す」から作り直してください。':`追加できませんでした：${err.message}`,true);
    }finally{btn.disabled=false;}
  });

  $('logout').addEventListener('click',()=>{token=null;say($('addMessage'),'');show('loginPanel');});
  start();
})();
