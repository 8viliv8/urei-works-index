(()=>{
  const data=window.UREI_INDEX;
  const workList=document.getElementById('workList');
  const referenceGrid=document.getElementById('referenceGrid');
  const emptyState=document.getElementById('emptyState');
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // 作品ステータスの定義。data.js の status はこのキーのどれか。
  const STATUS={
    live:{label:'LIVE',note:'現在開ける作品'},
    development:{label:'IN DEVELOPMENT',note:'制作中・実験中'},
    seeking:{label:'SOURCE HUNTING',note:'URLやソースを捜索中'},
    archived:{label:'ARCHIVED',note:'ソースを保存済み'}
  };
  // 旧データ互換：status が "seeking" でも表示ラベルが IN DEVELOPMENT のものは制作中として扱う。
  const statusOf=w=>{
    if(w.status==='seeking'&&w.statusLabel==='IN DEVELOPMENT') return 'development';
    return STATUS[w.status]?w.status:'seeking';
  };

  // 索引番号は data の no を使い、無ければ登録順で固定する（フィルター後の順位は使わない）。
  const works=data.works.map((w,i)=>({...w,status:statusOf(w),no:Number.isFinite(w.no)?w.no:i+1}));

  // 版表示：data.meta.updated（YYYY-MM-DD）を明示的に表示する。
  const updated=data.meta&&data.meta.updated;
  const editionDate=document.getElementById('editionDate');
  if(updated&&editionDate){
    editionDate.innerHTML=`<time datetime="${esc(updated)}">${esc(updated.replace(/-/g,'.'))}</time>`;
    editionDate.setAttribute('aria-label',`最終更新 ${updated}`);
  }

  function workCard(w){
    const no=String(w.no).padStart(2,'0');
    const st=STATUS[w.status];
    const label=w.statusLabel||st.label;
    const internal=w.url&&w.url.startsWith('#');
    let title;
    if(w.url){
      const attrs=internal?'':' target="_blank" rel="noopener"';
      const hint=internal?'（このページ内へ移動）':'（新しいタブで開く）';
      title=`<a class="work-link" href="${esc(w.url)}"${attrs}>${esc(w.title)}<span class="sr-only">${hint}</span></a>`;
    }else{
      title=`${esc(w.title)}<span class="sr-only">（公開URL未登録）</span>`;
    }
    return `<article class="work-card ${esc(w.status)}${w.url?' has-link':' no-link'}" data-id="${esc(w.id||'')}" style="--card-ink:${esc(w.ink)}" aria-labelledby="work-${esc(w.id)}">
        <span class="work-no" aria-hidden="true">${esc(no)}</span>
        <h3 class="work-title" id="work-${esc(w.id)}"><span class="sr-only">No.${esc(no)} </span>${title}</h3>
        <p class="work-description">${esc(w.description)}</p>
        <p class="work-meta">${esc(w.origin)}<br><i class="work-stamp"><span class="sr-only">状態：</span>${esc(label)}</i></p>
      </article>`;
  }

  function renderWorks(filter='all'){
    const list=works.filter(w=>filter==='all'||w.status===filter);
    emptyState.hidden=list.length>0;
    workList.innerHTML=list.map(workCard).join('');
  }

  referenceGrid.innerHTML=data.references.map(r=>`<a class="reference-card" href="${esc(r.url)}" target="_blank" rel="noopener" style="--ref-color:${esc(r.color)}">
    <small>${esc(r.source)}</small><h3>${esc(r.title)}</h3><p>${esc(r.note)}</p><span class="reference-tags">${r.tags.map(esc).join(' · ')}</span>
  </a>`).join('');

  const filters=[...document.querySelectorAll('.filter')];
  const filterStatus=document.getElementById('filterStatus');
  function selectFilter(button){
    filters.forEach(b=>{const on=b===button;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
    renderWorks(button.dataset.filter);
    const count=workList.children.length;
    if(filterStatus) filterStatus.textContent=`${button.textContent}：${count}件`;
  }
  filters.forEach(button=>button.addEventListener('click',()=>selectFilter(button)));

  const menu=document.getElementById('siteNav'),menuButton=document.getElementById('menuButton');
  const closeMenu=(focusButton)=>{menu.classList.remove('open');menuButton.setAttribute('aria-expanded','false');if(focusButton)menuButton.focus();};
  menuButton.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open'))closeMenu(true);});

  const pulse=document.getElementById('inkPulse');
  document.getElementById('inkButton').addEventListener('click',()=>{pulse.classList.remove('go');requestAnimationFrame(()=>pulse.classList.add('go'));});
  pulse.addEventListener('animationend',()=>pulse.classList.remove('go'));
  renderWorks();
})();
