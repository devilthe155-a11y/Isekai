/* ===== rendering ===== */
const cv=$('c'),ctx=cv.getContext('2d');let LC=null,lctx=null,Z=3;
function resize(){const d=Math.min(2,window.devicePixelRatio||1),w=innerWidth,h=innerHeight;G.vw=w;G.vh=h;G.dpr=d;cv.width=Math.round(w*d);cv.height=Math.round(h*d);
  Z=Math.max(2,Math.round(Math.min(w/400,h/250)))*d;LC=document.createElement('canvas');LC.width=cv.width;LC.height=cv.height;lctx=LC.getContext('2d')}
addEventListener('resize',resize);
const WH={};function whiteOf(s){return WH[s.width+'x'+s.height+(s._k||(s._k=Math.random()))]||(WH[s.width+'x'+s.height+s._k]=mk(s.width,s.height,g=>{g.drawImage(s,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#fff';g.fillRect(0,0,s.width,s.height)}))}
function dirOf(a){const c=Math.cos(a),s=Math.sin(a);return Math.abs(c)>.72?(c<0?['l',0]:['l',1]):(s>0?['d',0]:['u',0])}
function drawSpr(s,x,y,flip,sc,tint){sc=sc||1;const w=s.width*sc,h=s.height*sc;ctx.save();ctx.translate(Math.round(x),Math.round(y));if(flip)ctx.scale(-1,1);ctx.drawImage(tint?whiteOf(s):s,-w/2,-h+2*sc,w,h);ctx.restore()}
function shadow(x,y,r){ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(x,y,r,r*.45,0,0,7);ctx.fill()}
function drawBar(x,y,w,f,col){ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(x-w/2-1,y-1,w+2,4);ctx.fillStyle=col;ctx.fillRect(x-w/2,y,w*clamp(f,0,1),2)}
function label(txt,x,y,col,sz){ctx.font='700 '+(sz||7)+'px Oxanium,sans-serif';ctx.textAlign='center';ctx.lineWidth=2;ctx.strokeStyle='rgba(0,0,0,.85)';ctx.strokeText(txt,x,y);ctx.fillStyle=col||'#fff';ctx.fillText(txt,x,y)}
function render(){
  const m=G.map,w=m.E,vw=cv.width/Z,vh=cv.height/Z;
  let cx=G.cam.x,cy=G.cam.y;if(G.shake>0.05){cx+=rnd(-1,1)*G.shake;cy+=rnd(-1,1)*G.shake}
  cx=clamp(cx,vw/2,Math.max(vw/2,m.w*TS-vw/2));cy=clamp(cy,vh/2,Math.max(vh/2,m.h*TS-vh/2));
  const ox=Math.round(vw/2*Z-cx*Z),oy=Math.round(vh/2*Z-cy*Z);
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#050d18';ctx.fillRect(0,0,cv.width,cv.height);ctx.setTransform(Z,0,0,Z,ox,oy);ctx.imageSmoothingEnabled=false;
  ctx.drawImage(m.cv,0,0);
  const x0=cx-vw/2-24,x1=cx+vw/2+24,y0=cy-vh/2-24,y1=cy+vh/2+24,vis=o=>o.x>x0&&o.x<x1&&o.y>y0&&o.y<y1;
  /* ground fx: telegraphs, rings */
  for(const t of w.tele){const f=t.t/t.max;ctx.fillStyle='rgba(255,50,70,'+(.12+f*.3)+')';ctx.strokeStyle='rgba(255,90,100,.9)';ctx.lineWidth=1;
    if(t.k==='circle'){ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(t.x,t.y,t.r*f,0,7);ctx.stroke()}
    else if(t.k==='cone'){ctx.beginPath();ctx.moveTo(t.x,t.y);ctx.arc(t.x,t.y,t.r,t.a-.55,t.a+.55);ctx.closePath();ctx.fill();ctx.stroke()}
    else{ctx.save();ctx.translate(t.x,t.y);ctx.rotate(t.a);ctx.fillRect(0,-t.w/2,t.len,t.w);ctx.strokeRect(0,-t.w/2,t.len*f,t.w);ctx.restore()}}
  for(const f of w.fx)if(f.k==='ring'){const k=f.t/f.max;ctx.strokeStyle=f.col;ctx.globalAlpha=1-k;ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,f.y,Math.max(1,f.r+f.gr*k),0,7);ctx.stroke();ctx.globalAlpha=1}
  /* drops */
  for(const d of w.drop){if(!vis(d))continue;const bob=Math.sin(d.t*5)*1.5;shadow(d.x,d.y+2,4);
    if(d.col){ctx.fillStyle='#ffd36a';ctx.fillRect(Math.round(d.x)-2,Math.round(d.y-4+bob),4,4);ctx.fillStyle='#fff6c0';ctx.fillRect(Math.round(d.x)-1,Math.round(d.y-4+bob),1,1)}
    else{const it=ITEMS[d.id];ctx.globalAlpha=.35+.25*Math.sin(d.t*6);ctx.fillStyle=RC[it.rar];ctx.beginPath();ctx.arc(d.x,d.y-4+bob,8,0,7);ctx.fill();ctx.globalAlpha=1;
      const ic=ICO[d.id]&&ICO._c&&ICO._c[d.id];if(!ICO._c)ICO._c={};if(!ICO._c[d.id]){itemIcon(it);const im=new Image();im.src=ICO[d.id];ICO._c[d.id]=im}
      const im=ICO._c[d.id];if(im.complete)ctx.drawImage(im,Math.round(d.x)-6,Math.round(d.y-12+bob),12,12)}}
  /* entities sorted by y */
  const L=[];
  for(const n of w.npc)if(vis(n))L.push([n.y,()=>{shadow(n.x,n.y,6);const p=Math.hypot(n.x-P.x,n.y-P.y)<40;ctx.save();drawSpr(humanSprite(n.pal,'d',0),n.x,n.y+3,false);ctx.restore();label(n.name,n.x,n.y-24,'#ffd36a',6);
    if(n.id==='arlen'){const q=nextQuest();if(q&&(qState(q.id).s===0&&P.lvl>=q.minLv||qReady(q))){label(qReady(q)?'?':'!',n.x,n.y-31+Math.sin(G.time*5)*1.5,'#ffd36a',11)}}}]);
  for(const a of w.ai)if(vis(a))L.push([a.y,()=>{shadow(a.x,a.y,6);const dd=dirOf(a.face==='l'?Math.PI:a.face==='r'?0:a.face==='u'?-1.57:1.57),fr=a.mov?1+(Math.floor(a.anim*8)%2):0;drawSpr(humanSprite(a.pal,dd[0],fr),a.x,a.y+3,dd[1]===1||a.face==='r');
    label(a.name,a.x,a.y-24,a.party?'#7dff9a':'#bfefff',6)}]);
  for(const e of w.en){if(e.dead||!vis(e))continue;L.push([e.y,()=>drawEnemy(e)])}
  if(G.state!=='title')L.push([P.y,drawPlayer]);
  L.sort((a,b)=>a[0]-b[0]);L.forEach(o=>o[1]());
  /* projectiles & fx */
  for(const p of w.proj){if(p.type==='wave'){ctx.strokeStyle='#bfefff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x-Math.cos(p.ang)*8,p.y-Math.sin(p.ang)*8,12,p.ang-.9,p.ang+.9);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke()}
    else if(p.type==='arrow'){ctx.strokeStyle='#e8d9a8';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-Math.cos(p.ang)*7,p.y-Math.sin(p.ang)*7);ctx.stroke()}
    else{ctx.fillStyle='#9a9a9a';ctx.fillRect(Math.round(p.x)-3,Math.round(p.y)-3,6,6);ctx.fillStyle='#c8c8c8';ctx.fillRect(Math.round(p.x)-3,Math.round(p.y)-3,3,3)}}
  for(const f of w.fx){if(f.k==='p'){ctx.globalAlpha=1-f.t/f.max;ctx.fillStyle=f.col;ctx.fillRect(Math.round(f.x),Math.round(f.y),f.s,f.s);ctx.globalAlpha=1}
    else if(f.k==='arc'){const k=f.t/f.max;ctx.globalAlpha=1-k;ctx.strokeStyle=f.col;ctx.lineWidth=3.2*(1-k*.6);ctx.beginPath();const sw=f.arc,a0=f.ang-sw/2,a1=f.ang+sw/2;ctx.arc(f.x,f.y,f.r+k*5,f.flip?a1-sw*Math.min(1,k*2.2):a0,f.flip?a1:a0+sw*Math.min(1,k*2.2),f.flip);ctx.stroke();ctx.globalAlpha=1}}
  /* lighting */
  lighting(ox,oy,cx,cy,vw,vh);
  ctx.setTransform(Z,0,0,Z,ox,oy);
  for(const t of w.txt){ctx.globalAlpha=1-Math.pow(t.t/t.max,2);ctx.font='800 '+t.size+'px Oxanium,sans-serif';ctx.textAlign='center';ctx.lineWidth=2.5;ctx.strokeStyle='#000';ctx.strokeText(t.txt,t.x,t.y);ctx.fillStyle=t.col;ctx.fillText(t.txt,t.x,t.y);ctx.globalAlpha=1}
}
function drawEnemy(e){
  const d=e.d,hit=e.hurtT>0,r=e.r,x=e.x;let y=e.y;shadow(x,y+2,r+1);let spr,sc=1,flip=e.face<0,fr=Math.floor(e.anim*5)%2;
  if(e.kind==='slime'){spr=slimeSprite(['#6fd36a','#6fd36a','#7fb8ff','#c58bff'][zoneOf(x,y)],e.state==='chase'&&e.hop>.55?1:fr&&0);y+=1}
  else if(e.kind==='boar'||e.kind==='wolf'){spr=beastSprite(e.kind,e.state==='idle'?0:fr);flip=e.face>0;y+=2}
  else if(e.kind==='bat'){spr=batSprite(Math.floor(e.anim*10)%2);y-=8+Math.sin(e.anim*5)*2}
  else if(e.kind==='archer'){spr=humanSprite(PAL.goblin,'l',e.state==='idle'?0:1+fr);y+=3}
  else if(e.kind==='skel'){spr=humanSprite(PAL.skel,'l',e.state==='idle'?0:1+fr);y+=3}
  else if(e.kind==='golem'){spr=humanSprite({skin:'#7a8a6a',hair:'#5a7a4a',body:'#6a7a5a',body2:'#3a8a40',leg:'#4a5a42',boot:'#2a3a2a'},'d',e.state==='idle'?0:1+fr);sc=1.5;y+=3}
  else{spr=humanSprite(PAL.boss,'d',e.state==='fight'&&!e.act?1+fr:0);sc=2.6;y+=5;if(e.state==='dormant')sc=2.4}
  const wob=e.wind>0?Math.sin(e.anim*50)*1:0;drawSpr(spr,x+wob,y,flip,sc,hit);
  if(e.wind>0&&e.d.ai!=='ranged'){label('!',e.x,e.y-e.r-14,'#ff5d73',10)}
  if(e.boss){if(e.state==='intro'){ctx.strokeStyle='rgba(255,60,80,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,20+(2.4-e.t)*10,0,7);ctx.stroke()}return}
  if(e.hp<e.maxhp||e.state==='chase'){drawBar(e.x,e.y-e.r*2-12,16,e.hp/e.maxhp,'#ff5d73');label('Lv'+e.lvl+' '+e.d.n,e.x,e.y-e.r*2-15,'#ffd0d0',5)}}
function drawPlayer(){
  const dd=dirOf(P.ang),fr=P.moving?1+(Math.floor(P.anim)%2):0;shadow(P.x,P.y,6);
  const bc=P.eq.armor&&ITEMS[P.eq.armor].bc;ctx.save();
  if(P.dodgeT>0)ctx.globalAlpha=.45;else if(P.inv_t>0&&Math.floor(G.time*20)%2)ctx.globalAlpha=.55;
  let ox=0,oy=0;if(P.swing){const k=P.swing.t/P.swing.dur,pw=Math.sin(Math.min(1,k)*Math.PI)*(P.swing.n===2?4:2.5);ox=Math.cos(P.swing.ang)*pw;oy=Math.sin(P.swing.ang)*pw}
  if(P.act&&P.act.k==='ascend'){const k=P.act.t/.6;oy-=Math.min(1,k)*4;ctx.fillStyle='rgba(255,211,106,'+(.25+.2*Math.sin(G.time*30))+')';ctx.beginPath();ctx.arc(P.x,P.y-8,12+k*8,0,7);ctx.fill()}
  if(P.act&&P.act.k==='storm'){ctx.strokeStyle='rgba(191,239,255,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(P.x,P.y-7,14,G.time*18,G.time*18+4);ctx.stroke()}
  drawSpr(humanSprite(PAL.hero(bc),dd[0],fr),P.x+ox,P.y+3+oy,dd[1]===1);ctx.restore();
  label(P.name,P.x,P.y-25,'#fff',6)}
function lighting(ox,oy,cx,cy,vw,vh){
  const m=G.map;let dark=0;
  if(m.dark)dark=.84;else{const t=G.tod;dark=t<.2?.55:t<.3?.55*(1-(t-.2)/.1):t<.72?0:t<.82?.55*((t-.72)/.1):.55}
  if(dark<=.01)return;
  lctx.setTransform(1,0,0,1,0,0);lctx.globalCompositeOperation='source-over';lctx.fillStyle=m.dark?'rgb(8,6,18)':'rgb(6,12,40)';lctx.globalAlpha=dark;lctx.fillRect(0,0,LC.width,LC.height);lctx.globalAlpha=1;
  lctx.setTransform(Z,0,0,Z,ox,oy);lctx.globalCompositeOperation='destination-out';
  const glow=(x,y,r,a)=>{const g=lctx.createRadialGradient(x,y,r*.1,x,y,r);g.addColorStop(0,'rgba(0,0,0,'+a+')');g.addColorStop(1,'rgba(0,0,0,0)');lctx.fillStyle=g;lctx.fillRect(x-r,y-r,r*2,r*2)};
  if(G.state!=='title')glow(P.x,P.y-6,m.dark?78:60,.95);
  for(const l of m.lights)if(l.x>cx-vw/2-100&&l.x<cx+vw/2+100&&l.y>cy-vh/2-100&&l.y<cy+vh/2+100)glow(l.x,l.y,l.r,.9);
  for(const t of m.E.tele)glow(t.x,t.y,60,.5);
  lctx.globalCompositeOperation='source-over';
  /* tint glows */
  ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(LC,0,0);
  ctx.setTransform(Z,0,0,Z,ox,oy);ctx.globalCompositeOperation='lighter';
  for(const l of m.lights)if(l.x>cx-vw/2-100&&l.x<cx+vw/2+100&&l.y>cy-vh/2-100&&l.y<cy+vh/2+100){const g=ctx.createRadialGradient(l.x,l.y,0,l.x,l.y,l.r*.8);g.addColorStop(0,'rgba('+l.c+','+(.2*dark)+')');g.addColorStop(1,'rgba('+l.c+',0)');ctx.fillStyle=g;ctx.fillRect(l.x-l.r,l.y-l.r,l.r*2,l.r*2)}
  ctx.globalCompositeOperation='source-over'}
/* ===== input ===== */
const K={};let joy=null;
function readMove(){let x=0,y=0;if(K.ArrowLeft||K.a)x--;if(K.ArrowRight||K.d)x++;if(K.ArrowUp||K.w)y--;if(K.ArrowDown||K.s)y++;if(joy){x+=joy.x;y+=joy.y}P.mx=x;P.my=y}
function chatOpen(){return !$('chatIn').hidden}
function setChat(on){const i=$('chatIn');i.hidden=!on;if(on){i.focus()}else{i.blur();i.value=''}}
addEventListener('keydown',ev=>{
  if(G.state==='title'){if(ev.key==='Enter'&&document.activeElement===$('nameIn'))startGame();return}
  if(chatOpen()){if(ev.key==='Enter'){const v=$('chatIn').value.trim();if(v){chat(P.name,v,'me');setTimeout(()=>{const a=G.map.E.ai.find(x=>dist(x.x,x.y,P.x,P.y)<400);if(a&&Math.random()<.5)chat(a.name,pick(['hey!','lol','good luck out there','nice','heh, same','careful, the north is dangerous','anyone up for a party?']),a.party?'pty':'')},1200+Math.random()*1500)}setChat(false)}else if(ev.key==='Escape')setChat(false);return}
  const k=ev.key.length===1?ev.key.toLowerCase():ev.key;K[k]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(ev.key))ev.preventDefault();
  if(G.state==='dead'){if(k==='Enter')respawn();return}
  if(k==='Escape'){closeWin();closeDlg();return}
  if(k==='m')W.open?closeWin():openWin('status');else if(k==='i')W.open?closeWin():openWin('items');
  else if(k==='Enter'){setChat(true);ev.preventDefault()}
  else if(k==='e'||k===' '){if(!ev.repeat)interact()}
  else if(G.state==='play'&&!W.open&&$('dlg').hidden){if(k==='k')tryDodge();else if(k==='r')usePotion();else if('1234'.includes(k)&&k)castSkill(+k-1)}
});
addEventListener('keyup',ev=>{const k=ev.key.length===1?ev.key.toLowerCase():ev.key;K[k]=false});
addEventListener('blur',()=>{for(const k in K)K[k]=false;joy=null;$('joy').hidden=true});
cv.addEventListener('pointerdown',ev=>{
  if(G.state==='title')return;initAudio();
  if(ev.pointerType==='mouse'){P.hold=true;tryAttack();return}
  if(ev.clientX<G.vw*.55&&!joy){joy={id:ev.pointerId,ox:ev.clientX,oy:ev.clientY,x:0,y:0};const j=$('joy');j.hidden=false;j.style.left=ev.clientX+'px';j.style.top=ev.clientY+'px';cv.setPointerCapture(ev.pointerId)}});
cv.addEventListener('pointermove',ev=>{if(joy&&ev.pointerId===joy.id){const dx=ev.clientX-joy.ox,dy=ev.clientY-joy.oy,l=Math.hypot(dx,dy),m=Math.min(l,48);joy.x=l>8?dx/l*(m/48):0;joy.y=l>8?dy/l*(m/48):0;if(l>8&&m/48<.25){joy.x=0;joy.y=0}const k=$('joy').firstElementChild;k.style.transform='translate('+(l?dx/l*m:0)+'px,'+(l?dy/l*m:0)+'px)'}});
const endJ=ev=>{if(joy&&ev.pointerId===joy.id){joy=null;$('joy').hidden=true;$('joy').firstElementChild.style.transform=''}};
cv.addEventListener('pointerup',ev=>{endJ(ev);P.hold=false});cv.addEventListener('pointercancel',endJ);
addEventListener('pointerup',()=>{if(P)P.hold=false});
const bind=(id,down,up)=>{const b=$(id);b.addEventListener('pointerdown',ev=>{ev.preventDefault();initAudio();down()});if(up){b.addEventListener('pointerup',up);b.addEventListener('pointerleave',up);b.addEventListener('pointercancel',up)}};
bind('b_atk',()=>{P.hold=true;tryAttack()},()=>{P.hold=false});bind('b_dodge',tryDodge);bind('b_pot',usePotion);[0,1,2,3].forEach(i=>bind('b_s'+(i+1),()=>castSkill(i)));
$('prompt').addEventListener('pointerdown',ev=>{ev.preventDefault();interact()});
$('bMenu').addEventListener('click',()=>{W.open?closeWin():openWin('status')});$('bChat').addEventListener('click',()=>setChat(chatOpen()?false:true));
$('chatIn').addEventListener('keydown',ev=>{if(ev.key==='Enter')ev.stopPropagation()});
$('chatIn').addEventListener('keyup',ev=>ev.stopPropagation());
$('respawn').addEventListener('click',respawn);
[0,1,2,3].forEach(i=>{const b=$('b_s'+(i+1));b.insertAdjacentHTML('afterbegin','<img alt="" src="'+skillIcon(SKILLS[i].id)+'">')});
$('b_atk').insertAdjacentHTML('afterbegin','<img alt="" src="'+skillIcon('atk')+'">');$('b_dodge').insertAdjacentHTML('afterbegin','<img alt="" src="'+skillIcon('dodge')+'">');$('b_pot').insertAdjacentHTML('afterbegin','<img alt="" src="'+skillIcon('pot')+'">');
/* ===== boot & loop ===== */
function startGame(){
  initAudio();if(G.state!=='title')return;const name=($('nameIn').value||'Wanderer').trim().slice(0,14)||'Wanderer',sv=loadSave();
  P=newPlayer(name);if(sv&&sv.name===name){applySave(sv)}else{addItem('potionS',3);P.col=50;calc();P.hp=S.maxhp}
  P.x=60.5*TS;P.y=69*TS;G.cam.x=P.x;G.cam.y=P.y;G.map=G.field;G.state='play';musicMode='town';
  $('title').hidden=true;$('hud').hidden=false;flashFx();banner('LINK START','Welcome to Arcadia, '+name,'#7fe7ff');sfx('level');
  chat('System','Link established. Welcome to <b>Arcadia</b>, '+esc(name)+'.','sys');
  if(!sv||sv.name!==name){chat('System','You cannot log out. Clear the floor guardian to escape.','sys');setTimeout(()=>toast('Talk to Guide Pip in the plaza to begin'),1500)}else chat('System','Progress restored.','sys');
  const n=G.field.E.ai.slice(0,3);setTimeout(()=>n.forEach((a,i)=>setTimeout(()=>chat(a.name,pick(CHATTER),''),i*1400)),3000)}
$('go').addEventListener('click',startGame);
let last=performance.now();
function frame(now){
  requestAnimationFrame(frame);let dt=Math.min(.05,(now-last)/1000);last=now;G.time+=dt;
  if(G.state==='title'){G.cam.x=60.5*TS+Math.sin(G.time*.15)*60;G.cam.y=62*TS+Math.cos(G.time*.12)*30;G.field.E.ai.forEach(a=>updateAI(a,dt));G.tod=(G.tod+dt/90)%1;G.map=G.field;render();return}
  if(G.state==='play'){
    G.tod=(G.tod+dt/600)%1;readMove();if(P.hold||K.j)tryAttack();updatePlayer(dt);updateWorld(dt);updateHud();
    G.saveT+=dt;if(G.saveT>30){G.saveT=0;saveGame()}
  }else if(G.state==='dead'||G.state==='trans'){updateWorld(dt)}
  G.shake=Math.max(0,G.shake-dt*14);G.cam.x=lerp(G.cam.x,P.x,Math.min(1,dt*9));G.cam.y=lerp(G.cam.y,P.y,Math.min(1,dt*9));
  render();if(G.state==='play')drawMini()}
(function boot(){
  resize();G.field=buildField();G.map=G.field;P=newPlayer('Wanderer');P.x=60.5*TS;P.y=66*TS;calc();
  const sv=loadSave();if(sv){$('nameIn').value=sv.name;$('go').textContent='CONTINUE';$('tsub').insertAdjacentHTML('afterbegin','Saved character: <b>'+esc(sv.name)+'</b>  ·  Lv '+sv.lvl+'<br>')}
  requestAnimationFrame(frame)})();
