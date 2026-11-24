(()=>{
  const data=window.UREI_INDEX;
  const press=window.UREI_PRESS;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  if(!data){$('workList').innerHTML='<li class="empty">作品データを読み込めませんでした。</li>';return;}

  const STATUS={live:'Live',development:'In development',seeking:'Source hunting',archived:'Archived'};
  const statusOf=w=>{
    if(w.status==='seeking'&&w.statusLabel==='IN DEVELOPMENT') return 'development';
    return STATUS[w.status]?w.status:'seeking';
  };
  const works=data.works.map((w,i)=>({...w,status:statusOf(w),no:Number.isFinite(w.no)?w.no:i+1,genres:Array.isArray(w.genres)?w.genres:[]}));
  const genres=[{id:'all',label:'All'},...(data.genres||[]).map(g=>({...g,label:g.label.charAt(0)+g.label.slice(1).toLowerCase()})),{id:'unsorted',label:'Unsorted'}];
  const genreLabel=id=>{const g=genres.find(x=>x.id===id);return g?g.label:id;};
  const inGenre=(w,g)=>g==='all'||(g==='unsorted'?w.genres.length===0:w.genres.includes(g));
  const state={genre:'all',status:'all'};

  // 版表示
  const updated=data.meta&&data.meta.updated;
  if(updated&&$('editionDate')) $('editionDate').innerHTML=`<time datetime="${esc(updated)}">${esc(updated.replace(/-/g,'.'))}</time>`;

  // 作品
  function item(w){
    const no=String(w.no).padStart(2,'0');
    const internal=w.url&&w.url.startsWith('#');
    const kinds=[...w.genres.map(genreLabel),...(w.tags||[])].filter(Boolean).map(esc).join(' · ');
    const titleText=`<span class="pressable" data-press>${esc(w.title)}</span>`;
    const title=w.url
      ?`<a class="link" href="${esc(w.url)}"${internal?'':' target="_blank" rel="noopener"'}>${titleText}<span class="sr-only">${internal?'（このページ内へ移動）':'（新しいタブで開く）'}</span></a>`
      :`${titleText}<span class="sr-only">（公開URL未登録）</span>`;
    return `<li class="item ${esc(w.status)} ${w.url?'has-link':'no-link'}" data-id="${esc(w.id||'')}">
      <span class="no" aria-hidden="true">${no}</span>
      <h3 class="title"><span class="sr-only">No.${no} </span>${title}</h3>
      ${w.description?`<p class="desc">${esc(w.description)}</p>`:''}
      <p class="meta">${kinds?`<span>${kinds}</span>`:''}${w.origin?`<span>${esc(w.origin)}</span>`:''}<span class="state"><span class="sr-only">状態：</span>${esc(STATUS[w.status])}</span></p>
    </li>`;
  }
  function render(){
    const list=works.filter(w=>inGenre(w,state.genre)&&(state.status==='all'||w.status===state.status));
    $('workList').innerHTML=list.map(item).join('');
    $('emptyState').hidden=list.length>0;
    if(press) press.render($('workList'));
    return list.length;
  }

  // ジャンル切り替え
  $('genreSwitch').innerHTML=genres.map(g=>{
    const n=works.filter(w=>inGenre(w,g.id)).length;
    return `<button type="button" data-genre="${esc(g.id)}" aria-pressed="${g.id==='all'}" class="${n?'':'is-empty'}"><span class="w">${esc(g.label)}</span><span class="n" aria-label="${n}件">${n}</span></button>`;
  }).join('');
  const genreButtons=[...$('genreSwitch').querySelectorAll('button')];
  const statusButtons=[...document.querySelectorAll('.switch.status button')];
  statusButtons.forEach(b=>{b.innerHTML=`<span class="w">${b.textContent}</span>`;});
  const press_=(group,btn)=>group.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
  const announce=n=>{$('filterStatus').textContent=`${genreLabel(state.genre)} / ${STATUS[state.status]||'All'}：${n}件`;};
  genreButtons.forEach(b=>b.addEventListener('click',()=>{press_(genreButtons,b);state.genre=b.dataset.genre;announce(render());}));
  statusButtons.forEach(b=>b.addEventListener('click',()=>{press_(statusButtons,b);state.status=b.dataset.filter;announce(render());}));

  // 参照
  $('referenceList').innerHTML=(data.references||[]).map(r=>`<li class="ref"><a href="${esc(r.url)}" target="_blank" rel="noopener">
    <small>${esc(r.source)}</small><h3><span class="pressable" data-press>${esc(r.title)}</span></h3><p>${esc(r.note)}</p><span class="tags">${(r.tags||[]).map(esc).join(' · ')}</span></a></li>`).join('');

  render();
  if(press) press.render(document);
})();
