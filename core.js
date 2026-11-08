'use strict';
/* ===== utils ===== */
const $=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.random()*(b-a), ri=(a,b)=>Math.floor(rnd(a,b+1));
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
const dist=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const angN=a=>{while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a};
function hex(c){return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]}
function hash(x,y,s){let h=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s,1442695041)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295}
function vnoise(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const a=hash(xi,yi,s),b=hash(xi+1,yi,s),c=hash(xi,yi+1,s),d=hash(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
const fbm=(x,y,s)=>vnoise(x,y,s)*.6+vnoise(x*2,y*2,s+7)*.3+vnoise(x*4,y*4,s+13)*.1;

/* ===== audio (all synthesized, no files) ===== */
let AC=null,master=null,muted=false,musicMode='town',mStep=0;
function initAudio(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=muted?0:.55;master.connect(AC.destination)}catch(e){AC=null}}
function setMuted(m){muted=m;if(master)master.gain.value=m?0:.55}
function tone(f,d,type,v,slide,delay){if(!AC||muted)return;const t=AC.currentTime+(delay||0),o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,t);
  if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),t+d);g.gain.setValueAtTime(v||.08,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.03)}
function noiseB(d,v,hp,delay){if(!AC||muted)return;const n=Math.floor(AC.sampleRate*d),b=AC.createBuffer(1,n,AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;
  const s=AC.createBufferSource();s.buffer=b;const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=hp||800;const g=AC.createGain(),t=AC.currentTime+(delay||0);g.gain.setValueAtTime(v||.1,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);g.connect(master);s.start(t)}
const SFX={
  swing:()=>{noiseB(.1,.07,2500);tone(420,.09,'sawtooth',.03,-200)},
  hit:()=>{noiseB(.08,.12,600);tone(160,.1,'square',.07,-80)},
  crit:()=>{noiseB(.12,.14,500);tone(700,.14,'square',.07,-300);tone(1000,.1,'triangle',.06,0,.04)},
  hurt:()=>{tone(200,.2,'sawtooth',.1,-120);noiseB(.1,.08,300)},
  pick:()=>{tone(880,.07,'triangle',.07);tone(1320,.1,'triangle',.07,0,.06)},
  coin:()=>{tone(1200,.06,'square',.04);tone(1600,.08,'square',.04,0,.05)},
  level:()=>{[523,659,784,1046].forEach((f,i)=>tone(f,.28,'triangle',.09,0,i*.1))},
  click:()=>tone(900,.04,'square',.04),
  skill:()=>{tone(300,.25,'sawtooth',.06,600);noiseB(.2,.06,1500)},
  dodge:()=>noiseB(.14,.06,3000),
  potion:()=>{tone(500,.12,'sine',.08,300);tone(800,.18,'sine',.08,0,.08)},
  boss:()=>{tone(70,1.2,'sawtooth',.14,-30);tone(95,1.2,'square',.07,-40);noiseB(.8,.1,100)},
  smash:()=>{tone(80,.4,'sawtooth',.14,-50);noiseB(.35,.16,200)},
  win:()=>{[392,523,659,784,1046].forEach((f,i)=>tone(f,.4,'triangle',.1,0,i*.14))},
  die:()=>{tone(300,.9,'sawtooth',.1,-250)},
  warn:()=>tone(240,.12,'square',.05)
};
function sfx(n){try{SFX[n]&&SFX[n]()}catch(e){}}
function musicTick(){
  if(!AC||muted||document.hidden)return;
  const sc=[0,3,5,7,10,12,15],roots=[0,-4,-2,-5],boss=musicMode==='boss',dun=musicMode==='dungeon';
  const base=boss?82.4:dun?98:146.8,ch=roots[(mStep>>3)&3],mul=Math.pow(2,ch/12);
  if((mStep&7)===0){tone(base*mul/2,3.2,'sine',dun||boss?.07:.05);tone(base*mul*(dun||boss?1.19:1.5)/2,3.2,'sine',.035)}
  if(boss&&(mStep&1)===0)tone(base*mul/2,.12,'sawtooth',.04);
  if(Math.random()<(boss?.8:dun?.4:.6)){const n=sc[ri(0,sc.length-1)],f=base*mul*Math.pow(2,n/12)*(boss?1:2);tone(f,boss?.2:.5,dun||boss?'triangle':'sine',boss?.05:.04)}
  mStep++;
}
setInterval(musicTick,420);

/* ===== procedural pixel sprites ===== */
function mk(w,h,fn,ol){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g,w,h);if(ol)outline(c,ol);return c}
function outline(c,col){const w=c.width,h=c.height,g=c.getContext('2d'),d=g.getImageData(0,0,w,h),s=d.data,o=new Uint8ClampedArray(s),[r,gg,b]=hex(col);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(s[i+3]>0)continue;
    if((x>0&&s[i-1]>0)||(x<w-1&&s[i+7]>0)||(y>0&&s[i-w*4+3]>0)||(y<h-1&&s[i+w*4+3]>0)){o[i]=r;o[i+1]=gg;o[i+2]=b;o[i+3]=255}}
  d.data.set(o);g.putImageData(d,0,0)}
const SC={};
function cached(k,fn){return SC[k]||(SC[k]=fn())}
function humanSprite(p,dir,fr){
  return cached('h'+JSON.stringify(p)+dir+fr,()=>mk(18,22,g=>{
    const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x+1,y+1,w,h)},a=fr===1?1:0,b=fr===2?1:0;
    if(dir==='l'){
      if(p.cape)R(11,8,3,10-a,p.cape);
      R(6,14,3,6-a,p.leg);R(9,14,3,6-b,p.leg);R(6,19-a,3,1,p.boot);R(9,19-b,3,1,p.boot);
      R(5,8,8,7,p.body);R(5,13,8,1,p.body2);R(7,9,3,5,p.body2===p.body?p.leg:p.body);R(7,14,3,1,p.skin);
      R(5,1,8,8,p.skin);R(5,0,8,3,p.hair);R(10,2,3,6,p.hair);R(5,3,1,2,p.hair);R(6,5,1,2,'#1a1a2e');
      if(p.wep){R(1,9,6,1,'#dfe9f2');R(1,10,6,1,'#9fb4c4');R(7,8,1,3,'#caa24a');R(8,9,2,2,'#5a3b24')}
    }else{
      const back=dir==='u';
      if(back&&p.cape)R(4,8,10,11,p.cape);
      R(5,14,3,6-a,p.leg);R(10,14,3,6-b,p.leg);R(5,19-a,3,1,p.boot);R(10,19-b,3,1,p.boot);
      R(4,8,10,7,p.body);R(4,13,10,1,p.body2);R(2,9,2,5,p.body);R(14,9,2,5,p.body);R(2,14,2,1,p.skin);R(14,14,2,1,p.skin);
      if(back)R(6,9,6,3,p.body2);
      R(4,1,10,8,p.skin);
      if(back)R(4,0,10,9,p.hair);else{R(4,0,10,3,p.hair);R(4,3,1,3,p.hair);R(13,3,1,3,p.hair);R(6,5,2,2,'#1a1a2e');R(11,5,2,2,'#1a1a2e')}
      if(p.wep&&!back){R(16,4,1,10,'#dfe9f2');R(17,4,1,10,'#9fb4c4');R(15,13,3,1,'#caa24a');R(16,14,1,3,'#5a3b24')}
      if(p.wep&&back){R(0,5,1,10,'#dfe9f2')}
    }
  },'#0b1220'));
}
const PAL={
  hero:b=>({skin:'#f2c9a0',hair:'#242a46',body:b||'#2b3a55',body2:'#6fe3ff',leg:'#232b3d',boot:'#10141f',wep:true,cape:'#161b2e'}),
  arlen:{skin:'#e8bd94',hair:'#b8b8c8',body:'#7a2e3a',body2:'#d4a84a',leg:'#3a2a30',boot:'#1a1216'},
  mira:{skin:'#f2c9a0',hair:'#c0602a',body:'#3b7a5a',body2:'#e9e0c0',leg:'#5a4a3a',boot:'#2a2018'},
  doran:{skin:'#c8956a',hair:'#3a2a1a',body:'#5a4a3a',body2:'#9a8a7a',leg:'#3a3028',boot:'#1a1410'},
  pip:{skin:'#f2c9a0',hair:'#e8c040',body:'#d7b13a',body2:'#fff',leg:'#4a5a8a',boot:'#222'},
  goblin:{skin:'#6aa84f',hair:'#3a5a2a',body:'#6b4a2a',body2:'#4a3018',leg:'#4a3a28',boot:'#2a1e12'},
  skel:{skin:'#e8e4d0',hair:'#e8e4d0',body:'#c9c4aa',body2:'#8a8670',leg:'#aaa68c',boot:'#8a8670'},
  boss:{skin:'#8c8f9a',hair:'#5a5f6a',body:'#4a4f5c',body2:'#c0392b',leg:'#3b3f4a',boot:'#262a33'}
};
const AIPAL=[]; (function(){const sk=['#f2c9a0','#e8bd94','#c8956a','#8a5a3a'],hr=['#2a2a3a','#c0602a','#e8c040','#7a3ab0','#e8e8f0','#2a8a8a','#c02a4a'],bd=['#2a6ab0','#b03a3a','#3aa06a','#8a3ab0','#d0902a','#3a3a50','#a0a0b0'];
  for(let i=0;i<12;i++)AIPAL.push({skin:sk[i%4],hair:hr[(i*3)%7],body:bd[(i*5)%7],body2:'#e8e8f0',leg:'#2a2a3a',boot:'#14141c',wep:i%3!==1,cape:i%4===0?'#1a1a30':undefined})})();
function slimeSprite(col,fr){return cached('s'+col+fr,()=>mk(18,14,g=>{
  const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x+1,y+1,w,h)},sq=fr?1:0;
  R(1-sq,6+sq,14+2*sq,6-sq,col);R(3,4+sq,10,3,col);R(5,3+sq,6,2,col);R(4,5+sq,3,2,'rgba(255,255,255,.55)');R(5,8,2,2,'#14202a');R(10,8,2,2,'#14202a');R(1-sq,11,14+2*sq,1,'rgba(0,0,0,.25)')},'#0b1220'))}
function beastSprite(kind,fr){return cached('b'+kind+fr,()=>mk(26,18,g=>{
  const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x+1,y+1,w,h)},w=kind==='wolf',bc=w?'#7d8693':'#8a5a3a',dc=w?'#5d6673':'#6a4228',a=fr?1:0;
  R(6,5,14,7,bc);R(7,10,12,2,dc);R(0,4,8,6,bc);R(0,7,3,3,w?'#aab3be':'#b58a64');R(2,2,2,3,dc);R(5,2,2,3,dc);R(2,5,1,1,w?'#ffd34a':'#222');
  R(20,w?3:5,w?5:2,2,dc);R(7,12,3,5-a,dc);R(11,12,3,5-(1-a),dc);R(14,12,3,5-a,dc);R(18,12,3,5-(1-a),dc);
  if(!w){R(0,9,1,3,'#fff');R(3,9,1,3,'#fff');R(8,4,10,2,dc)}},'#0b1220'))}
function batSprite(fr){return cached('bat'+fr,()=>mk(22,12,g=>{
  const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x+1,y+1,w,h)},u=fr?-2:2;
  R(8,3,4,5,'#4a3a5a');R(8,1,1,2,'#4a3a5a');R(11,1,1,2,'#4a3a5a');R(9,4,1,1,'#ff5d73');R(11,4,1,1,'#ff5d73');
  R(1,3+u,7,2,'#352a46');R(0,4+u,3,3,'#352a46');R(12,3+u,7,2,'#352a46');R(17,4+u,3,3,'#352a46')},'#0b1220'))}
const ICO={};
function itemIcon(it){const k=it.k;if(ICO[k])return ICO[k];const c=mk(16,16,g=>{
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)},col=it.col||'#c9d6df';
  if(it.t==='weapon'){for(let i=0;i<9;i++){R(3+i,11-i,2,2,col);R(4+i,11-i,1,1,'#fff')}R(2,10,5,2,'#caa24a');R(1,12,3,3,'#5a3b24')}
  else if(it.t==='armor'){R(3,3,10,10,col);R(1,3,3,5,col);R(12,3,3,5,col);R(6,3,4,2,'#0b1220');R(3,9,10,1,'rgba(0,0,0,.3)');R(7,6,2,5,'rgba(255,255,255,.35)')}
  else if(it.t==='acc'){R(5,2,6,2,'#caa24a');R(3,4,2,7,'#caa24a');R(11,4,2,7,'#caa24a');R(5,11,6,2,'#caa24a');R(6,6,4,4,col);R(7,6,1,1,'#fff')}
  else if(it.t==='use'){R(6,2,4,3,'#c9b79a');R(5,5,6,2,'#e8f0f6');R(3,7,10,7,col);R(4,8,2,4,'rgba(255,255,255,.5)')}
  else{R(3,4,10,8,col);R(5,3,6,1,col);R(5,12,6,1,col);R(5,6,2,2,'rgba(255,255,255,.45)');R(9,9,2,2,'rgba(0,0,0,.25)')}
},'#0b1220');return ICO[k]=c.toDataURL()}
function skillIcon(id){return cached('si'+id,()=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');g.strokeStyle='#7fe7ff';g.fillStyle='#7fe7ff';g.lineWidth=3;g.lineCap='round';
  if(id==='atk'){g.beginPath();g.moveTo(8,25);g.lineTo(24,7);g.stroke();g.beginPath();g.moveTo(6,18);g.lineTo(14,26);g.stroke()}
  if(id==='dodge'){for(let i=0;i<3;i++){g.beginPath();g.moveTo(6+i*7,8);g.lineTo(13+i*7,16);g.lineTo(6+i*7,24);g.stroke()}}
  if(id==='pot'){g.fillStyle='#7dff9a';g.fillRect(12,4,8,5);g.beginPath();g.arc(16,19,9,0,7);g.fill();g.fillStyle='rgba(255,255,255,.6)';g.fillRect(11,15,3,6)}
  if(id==='leap'){g.beginPath();g.moveTo(4,16);g.lineTo(26,16);g.stroke();g.beginPath();g.moveTo(19,8);g.lineTo(27,16);g.lineTo(19,24);g.stroke();g.globalAlpha=.5;g.beginPath();g.moveTo(4,10);g.lineTo(14,10);g.moveTo(4,22);g.lineTo(14,22);g.stroke()}
  if(id==='crescent'){g.beginPath();g.arc(10,16,16,-1,1);g.stroke();g.beginPath();g.arc(14,16,13,-.9,.9);g.stroke()}
  if(id==='storm'){g.beginPath();g.arc(16,16,11,0,5);g.stroke();g.beginPath();g.arc(16,16,5,1,6);g.stroke();g.beginPath();g.moveTo(16,2);g.lineTo(16,7);g.moveTo(16,25);g.lineTo(16,30);g.stroke()}
  if(id==='ascend'){g.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4;g.moveTo(16+Math.cos(a)*5,16+Math.sin(a)*5);g.lineTo(16+Math.cos(a)*14,16+Math.sin(a)*14)}g.stroke();g.beginPath();g.arc(16,16,4,0,7);g.fill()}
  return c.toDataURL()})}
