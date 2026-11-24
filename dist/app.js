(()=>{
  const data=window.UREI_INDEX;
  const workList=document.getElementById('workList');
  const referenceGrid=document.getElementById('referenceGrid');
  const emptyState=document.getElementById('emptyState');
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  document.getElementById('editionDate').textContent=new Intl.DateTimeFormat('en',{year:'numeric',month:'2-digit'}).format(new Date()).replace('/','.');

  function renderWorks(filter='all'){
    const works=data.works.filter(w=>filter==='all'||w.status===filter);
    emptyState.hidden=works.length>0;
    workList.innerHTML=works.map((w,i)=>{
      const tag=w.url&&w.status==='live'?'a':'article';
      const href=tag==='a'?` href="${esc(w.url)}" target="_blank" rel="noopener"`:'';
      return `<${tag}${href} class="work-card ${esc(w.status)}" style="--card-ink:${esc(w.ink)}">
        <span class="work-no">${String(i+1).padStart(2,'0')}</span>
        <strong class="work-title">${esc(w.title)}</strong>
        <span class="work-description">${esc(w.description)}</span>
        <span class="work-meta">${esc(w.origin)}<br><i class="work-stamp">${esc(w.statusLabel)}</i></span>
      </${tag}>`;
    }).join('');
  }

  referenceGrid.innerHTML=data.references.map(r=>`<a class="reference-card" href="${esc(r.url)}" target="_blank" rel="noopener" style="--ref-color:${esc(r.color)}">
    <small>${esc(r.source)}</small><h3>${esc(r.title)}</h3><p>${esc(r.note)}</p><span class="reference-tags">${r.tags.map(esc).join(' · ')}</span>
  </a>`).join('');

  document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b===button));
    renderWorks(button.dataset.filter);
  }));

  const menu=document.getElementById('siteNav'),menuButton=document.getElementById('menuButton');
  menuButton.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');menuButton.setAttribute('aria-expanded','false');}));

  const pulse=document.getElementById('inkPulse');
  document.getElementById('inkButton').addEventListener('click',()=>{pulse.classList.remove('go');requestAnimationFrame(()=>pulse.classList.add('go'));});
  pulse.addEventListener('animationend',()=>pulse.classList.remove('go'));
  renderWorks();
})();
