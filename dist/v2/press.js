/* ŪRĒI press — DOM の文字を、LETTERPRESS の考え方（印圧・インクのかすれ・にじみ・紙の凹み）で
   キャンバスに「刷る」小さなレンダラ。文字そのものは DOM に残す（選択・読み上げ・検索はそのまま）。
   使い方：data-press を付けた要素を UREI_PRESS.render(root) で刷る。失敗したら普通の文字のまま。 */
(()=>{
  const DPR=()=>Math.min(window.devicePixelRatio||1,2);
  const clamp=(v,a,b)=>v<a?a:v>b?b:v;
  const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};

  // 値ノイズ（シード付き）
  function makeNoise(seed){
    const hash=(x,y)=>{let h=(x*374761393+y*668265263+seed*1442695041)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967295;};
    const vn=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
      const a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};
    return (x,y)=>vn(x,y)*.55+vn(x*2.03+17.1,y*2.03+3.7)*.3+vn(x*4.1+5.3,y*4.1+11.9)*.15;
  }

  // 分離型ボックスブラー（3回で近似ガウス）
  function blur(src,w,h,r){
    if(r<1) return src.slice();
    let a=src.slice(),b=new Float32Array(src.length);
    const pass=(inp,out,horiz)=>{
      const len=horiz?w:h,lines=horiz?h:w,norm=1/(2*r+1);
      for(let l=0;l<lines;l++){
        let acc=0;const idx=i=>horiz?l*w+i:i*w+l;
        for(let i=-r;i<=r;i++) acc+=inp[idx(clamp(i,0,len-1))];
        for(let i=0;i<len;i++){out[idx(i)]=acc*norm;acc+=inp[idx(Math.min(i+r+1,len-1))]-inp[idx(Math.max(i-r,0))];}
      }
    };
    for(let k=0;k<3;k++){pass(a,b,true);pass(b,a,false);}
    return a;
  }

  const hexToRgb=h=>{const m=/^#?([0-9a-f]{6})$/i.exec((h||'').trim());if(!m)return[34,37,40];const n=parseInt(m[1],16);return[n>>16&255,n>>8&255,n&255];};

  function pressElement(el){
    const cs=getComputedStyle(el);
    const box=el.getBoundingClientRect();
    if(!box.width||!box.height) return;
    const fontSize=parseFloat(cs.fontSize);
    const pad=Math.ceil(fontSize*.25)+4;
    const scale=DPR();
    const W=Math.ceil((box.width+pad*2)*scale),H=Math.ceil((box.height+pad*2)*scale);
    if(W*H>6e6) return; // 大きすぎるものは刷らない（安全策）

    // 1) 字形マスク：DOM 上の各文字の位置にそのまま描く（折り返し・字間を DOM と一致させる）
    const mask=document.createElement('canvas');mask.width=W;mask.height=H;
    const mc=mask.getContext('2d');
    mc.scale(scale,scale);
    mc.fillStyle='#000';mc.textBaseline='alphabetic';
    if(el._pressImg){ // 画像（QRコードなど）を刷る：要素の大きさいっぱいに描く
      mc.imageSmoothingEnabled=false;
      mc.drawImage(el._pressImg,pad,pad,box.width,box.height);
    }
    const walker=el._pressImg?document.createTreeWalker(document.createElement('i'),NodeFilter.SHOW_TEXT):document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
    const range=document.createRange();
    let node;
    while((node=walker.nextNode())){
      const pcs=getComputedStyle(node.parentElement);
      if(pcs.visibility==='hidden'||node.parentElement.closest('.sr-only,[data-press-skip]')) continue;
      mc.font=`${pcs.fontStyle} ${pcs.fontWeight} ${pcs.fontSize} ${pcs.fontFamily}`;
      const m=mc.measureText('Hg漢');
      const asc=m.fontBoundingBoxAscent||parseFloat(pcs.fontSize)*.86;
      const tt=pcs.textTransform;
      const text=node.textContent;
      for(let i=0;i<text.length;i++){
        let ch=text[i];
        const code=ch.charCodeAt(0);
        let len=1;if(code>=0xD800&&code<=0xDBFF){ch=text.slice(i,i+2);len=2;}
        if(/\s/.test(ch)){i+=len-1;continue;}
        const glyph=tt==='uppercase'?ch.toUpperCase():tt==='lowercase'?ch.toLowerCase():ch;
        range.setStart(node,i);range.setEnd(node,i+len);
        const rects=range.getClientRects();
        const r=rects[rects.length-1];
        i+=len-1;
        if(!r||!r.width) continue;
        mc.fillText(glyph,r.left-box.left+pad,r.top-box.top+pad+asc);
      }
    }

    const src=mc.getImageData(0,0,W,H).data;
    const n=W*H, m=new Float32Array(n);
    for(let i=0;i<n;i++) m[i]=src[i*4+3]/255;

    // 2) 印圧・にじみ・かすれ
    const px=scale, fs=fontSize*scale;
    const bSmall=blur(m,W,H,Math.max(1,Math.round(.7*px)));       // にじみ
    const bWide=blur(m,W,H,Math.max(1,Math.round(fs*.018)));       // 凹みの陰影
    const bIn=blur(m,W,H,Math.max(1,Math.round(fs*.03)));          // 字の内側判定
    const seed=(el.textContent.length*131+Math.round(box.width))|0;
    const noise=makeNoise(seed), grain=makeNoise(seed+7);
    const ink=hexToRgb(el.dataset.ink||cs.getPropertyValue('--press-ink')||'#23262a');
    const wearRaw=parseFloat(el.dataset.wear??cs.getPropertyValue('--press-wear'));
    const wear=Number.isFinite(wearRaw)?wearRaw:0; // かすれの量（0 = かすれなし）
    const wearK=wear*(.5+.5*smooth(16,48,fontSize)); // 小さい文字はかすれを控えめにして読みやすく
    const depthK=parseFloat(document.documentElement.dataset.material==='leather'?getComputedStyle(document.documentElement).getPropertyValue('--press-depth-k'):1)||1;
    const depth=(parseFloat(el.dataset.depth||cs.getPropertyValue('--press-depth'))||1)*depthK; // 素材ごとの押し込みの深さ
    const coarse=Math.max(5,fs*.09), fine=Math.max(1.1,px*1.05);
    const lx=-.55,ly=-.83; // 左上からの光

    const out=mc.createImageData(W,H),o=out.data;
    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        const i=y*W+x;
        const mv=m[i];
        // インクの量（字の内側ほど、ノイズで足りなくなる＝かすれ）
        const interior=smooth(.55,.98,bIn[i]);
        const nC=clamp((noise(x/coarse,y/coarse)-.5)*2.4+.5,0,1);
        const nF=clamp((grain(x/fine,y/fine)-.5)*2.2+.5,0,1);
        const starve=smooth(.5,.88,nC)*wearK*(.35+.65*interior);
        const holes=smooth(.74,.93,nF)*.7*(.4+.6*interior)*wearK;
        let cov=mv*clamp(1-starve*.7-holes,0,1);
        const halo=smooth(.12,.7,bSmall[i])*(.08+.18*wear)*(1-mv);   // にじみ（かすれなしの時は控えめ）   // 縁のにじみ
        cov=clamp(Math.max(cov,halo*(.6+.4*nC)),0,1);
        // 凹み（紙が押されて光と影ができる）
        const gx=(bWide[i+1<n?i+1:i]-bWide[i>0?i-1:i])*.5, gy=(bWide[i+W<n?i+W:i]-bWide[i>=W?i-W:i])*.5;
        const shade=-(gx*lx+gy*ly)*Math.min(fs,60*px)*.55*depth;
        const outside=1-cov;
        const tone=.86+.22*nC;
        let r=ink[0]*tone,g=ink[1]*tone,b=ink[2]*tone,a=cov*.97;
        if(outside>0){
          if(shade>0){const sa=clamp(shade*.16,0,.12)*outside;r=(r*a)/(a+sa||1);g=(g*a)/(a+sa||1);b=(b*a)/(a+sa||1);a=a+sa*(1-a);}
          else{const ha=clamp(-shade*.45,0,.55)*outside;const na=a+ha*(1-a);if(na>0){r=(r*a+255*ha*(1-a))/na;g=(g*a+255*ha*(1-a))/na;b=(b*a+255*ha*(1-a))/na;}a=na;}
        }
        o[i*4]=r;o[i*4+1]=g;o[i*4+2]=b;o[i*4+3]=clamp(a,0,1)*255;
      }
    }

    // 3) 要素の後ろに敷く
    let cv=el.querySelector(':scope > canvas.press-canvas');
    if(!cv){cv=document.createElement('canvas');cv.className='press-canvas';cv.setAttribute('aria-hidden','true');el.prepend(cv);}
    cv.width=W;cv.height=H;
    cv.style.cssText=`position:absolute;left:${-pad}px;top:${-pad}px;width:${W/scale}px;height:${H/scale}px;pointer-events:none;z-index:0`;
    cv.getContext('2d').putImageData(out,0,0);
    el.classList.add('is-pressed');
    el.dataset.pressedW=String(Math.round(box.width));
  }

  let fontsReady=null;
  function waitFonts(){
    if(!fontsReady) fontsReady=(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(()=>new Promise(r=>setTimeout(r,30)));
    return fontsReady;
  }

  async function doRender(root,{force=false}={}){
    await waitFonts();
    const els=[...root.querySelectorAll('[data-press]')];
    for(const el of els){
      if(el.dataset.pressImage&&!el._pressImg){
        try{const img=new Image();img.src=el.dataset.pressImage;await img.decode();el._pressImg=img;}catch(e){continue;}
      }
      if(!force&&el.classList.contains('is-pressed')&&el.dataset.pressedW===String(Math.round(el.getBoundingClientRect().width))) continue;
      try{pressElement(el);}catch(e){el.classList.remove('is-pressed');console.warn('press failed',e);}
      await new Promise(r=>requestAnimationFrame(r)); // 1要素ずつ刷って画面を固めない
    }
  }

  let chain=Promise.resolve();
  const render=(root=document,opts={})=>(chain=chain.then(()=>doRender(root,opts)).catch(()=>{}));

  let lastW=window.innerWidth,timer=0;
  window.addEventListener('resize',()=>{
    if(Math.abs(window.innerWidth-lastW)<2) return; // iOS のアドレスバー伸縮では刷り直さない
    lastW=window.innerWidth;clearTimeout(timer);
    timer=setTimeout(()=>render(document,{force:true}),180);
  });

  window.UREI_PRESS={render};
})();
