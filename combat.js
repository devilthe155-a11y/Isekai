/* ===== entities, combat ===== */
const E=()=>G.map.E;
const inSafe=(x,y)=>G.map&&G.map.safe&&inRect(G.map.safe,x,y);
function addFx(f){E().fx.push(f)}
function addTxt(x,y,txt,col,size){E().txt.push({x,y,txt,col:col||'#fff',size:size||8,t:0,max:.9})}
function burst(x,y,col,n,sp){for(let i=0;i<n;i++){const a=Math.random()*6.28,s=rnd(.3,1)*(sp||60);addFx({k:'p',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-10,t:0,max:rnd(.25,.6),col,s:rnd(1,2.2)})}}
function zoneOf(x,y){const d=dist(x/TS,y/TS,60,62);return d<24?0:d<38?1:d<50?2:3}
function mkEnemy(kind,x,y,lvl){
  const d=ENEMIES[kind];lvl=lvl||ri(d.lv[0],d.lv[1]);const m=1+(lvl-d.lv[0])*.13;
  const e={kind,d,x,y,sx:x,sy:y,lvl,hp:Math.round(d.hp*m),maxhp:Math.round(d.hp*m),atk:d.atk*m,spd:d.spd,r:d.r,state:'idle',t:rnd(0,2),cd:rnd(.5,1.5),wind:0,windMax:0,hurtT:0,kx:0,ky:0,dead:false,rt:0,anim:rnd(0,5),face:1,tx:x,ty:y,dash:0,hit:false,hop:0,boss:kind==='boss',home:true};
  return e}
function populateField(m){
  let n=0,guard=0;const T=m.town;
  while(n<85&&guard++<4000){
    const x=ri(4,m.w-5),y=ri(4,m.h-5);
    if(SOLID.has(m.t[y*m.w+x])||m.t[y*m.w+x]===2||dist(x,y,60,62)<17)continue;
    const z=zoneOf(x*TS,y*TS),kinds=[['slime','slime','slime','boar'],['boar','wolf','wolf','slime'],['wolf','archer','archer','wolf'],['archer','golem','golem','wolf']][z];
    const k=pick(kinds),p=tc(x,y);m.E.en.push(mkEnemy(k,p[0],p[1]));n++}
  const mk=(id,nm,pal,x,y,role)=>{const p=tc(x,y);m.E.npc.push({id,name:nm,pal,x:p[0],y:p[1],role,r:5,face:'d',anim:0})};
  mk('arlen','Guildmaster Arlen',PAL.arlen,59,57,'guild');mk('mira','Merchant Mira',PAL.mira,49,59,'shop');
  mk('doran','Smith Doran',PAL.doran,72,59,'shop');mk('pip','Guide Pip',PAL.pip,60,66,'guide');
  for(let i=0;i<9;i++){
    const inTown=i<3,x=inTown?ri(46,74):ri(30,100),y=inTown?ri(52,70):ri(22,80),p=tc(x,y);
    if(!inTown&&(SOLID.has(m.t[y*m.w+x])||dist(x,y,60,62)<16)){i--;continue}
    m.E.ai.push({name:AINAMES[i],lvl:inTown?ri(3,9):ri(5,12),pal:AIPAL[i],x:p[0],y:p[1],hx:p[0],hy:p[1],r:5,face:'d',anim:rnd(0,5),state:'idle',t:rnd(0,3),cd:0,target:null,party:false,hp:100,home:inTown?60:200,chatT:rnd(8,30),vx:0,vy:0})}
}
function populateDungeon(m){
  const R=m.rooms,add=(k,x,y,lv)=>{const e=mkEnemy(k,(x+.5)*TS,(y+.5)*TS,lv);e.home=false;m.E.en.push(e)};
  [[1,5,'skel'],[2,4,'skel'],[2,4,'bat'],[3,5,'skel'],[3,4,'bat']].forEach(([ri_,n,k])=>{const r=R[ri_];for(let i=0;i<n;i++){let x,y,g=0;do{x=ri(r[0]+1,r[2]-1);y=ri(r[1]+1,r[3]-1)}while(SOLID.has(m.t[y*m.w+x])&&g++<30);add(k,x,y)}});
  const b=mkEnemy('boss',22.5*TS,12*TS,12);b.state='dormant';b.home=false;m.E.en.push(b);
}
/* ----- player damage helpers ----- */
function rollDmg(mult,skill){let d=S.atk*mult*(skill?S.skl:1)*rnd(.92,1.08);const c=Math.random()<S.crit;if(c)d*=1.6;return[Math.round(d),c]}
function hurtEnemy(e,dmg,ang,kb,crit,by){
  if(e.dead||e.state==='dormant'||e.state==='intro')return;
  e.hp-=dmg;e.hurtT=.14;if(e.state==='idle'||e.state==='return')e.state='chase';
  if(!e.boss&&kb){e.kx+=Math.cos(ang)*kb;e.ky+=Math.sin(ang)*kb}
  addTxt(e.x+rnd(-4,4),e.y-e.r-10,String(dmg),crit?'#ffd36a':'#fff',crit?11:8);burst(e.x,e.y-4,crit?'#ffd36a':'#fff',crit?7:4,50);
  sfx(crit?'crit':'hit');if(by==='p')G.shake=Math.max(G.shake,crit?3:1.5);
  if(e.hp<=0)killEnemy(e,by)}
function killEnemy(e,by){
  e.dead=true;e.rt=26;const x=e.x,y=e.y,d=e.d;burst(x,y-4,'#fff',14,80);
  const mine=by==='p'||by==='party';
  if(mine){const px=1+G.party.length*.1,xp=Math.round(d.xp*(1+(e.lvl-d.lv[0])*.13)*px);gainXp(xp);addTxt(x,y-20,'+'+xp+' XP','#7fe7ff',8);P.kills++;onKillQuest(e.kind)}
  const cols=ri(d.col[0],d.col[1]);if(cols>0)E().drop.push({x,y,col:cols,t:0,vx:rnd(-30,30),vy:rnd(-30,30)});
  d.loot.forEach(([id,p])=>{if(mine&&Math.random()<p)E().drop.push({x,y,id,t:0,vx:rnd(-40,40),vy:rnd(-40,40)})});
  if(mine&&!e.boss&&Math.random()<.035+e.lvl*.002){const pool=GEARDROP.filter(k=>ITEMS[k].req<=e.lvl+3);if(pool.length)E().drop.push({x,y,id:pick(pool),t:0,vx:rnd(-40,40),vy:rnd(-40,40)})}
  if(e.boss)bossDefeated(e)}
function bossDefeated(e){
  G.bossEnc=null;$('boss').hidden=true;musicMode='dungeon';P.bossKills++;sfx('win');G.shake=10;flashFx();
  banner('FLOOR GUARDIAN DEFEATED','The way to the next floor is open','#ffd36a');chat('System','The Gravel King has fallen. The seal is broken.','sys');
  E().tele.length=0;E().proj.length=0;const m=G.map;for(let x=21;x<=23;x++){setTile(m,x,28,11);setTile(m,x,29,11)}
  for(let x=21;x<=23;x++)setTile(m,x,15,16);
  [['sword5',.45],['arm5',.45],['acc4',.35],['potionL',1],['potionL',1],['arm4',.5]].forEach(([id,p])=>{if(Math.random()<p)E().drop.push({x:e.x+rnd(-14,14),y:e.y+rnd(-10,10),id,t:0,vx:rnd(-50,50),vy:rnd(-50,50)})});
  for(let i=0;i<8;i++)E().drop.push({x:e.x,y:e.y,col:ri(40,90),t:0,vx:rnd(-70,70),vy:rnd(-70,70)});
  m.E.en.forEach(o=>{if(!o.dead&&!o.boss){o.hp=0;o.dead=true;burst(o.x,o.y,'#c58bff',8,60)}});
  onKillQuest('boss');saveGame()}
function hurtPlayer(dmg,srcx,srcy,pierce){
  if(P.hp<=0||P.inv_t>0||P.dodgeT>0||G.state!=='play')return;
  dmg=Math.max(1,Math.round(dmg*rnd(.88,1.12)-(pierce?0:S.def*.5)));P.hp-=dmg;P.inv_t=.55;P.hurtT=.2;
  addTxt(P.x,P.y-24,String(dmg),'#ff5d73',10);burst(P.x,P.y-8,'#ff5d73',7,60);sfx('hurt');G.shake=Math.max(G.shake,4);$('vig').style.opacity=1;
  const a=Math.atan2(P.y-srcy,P.x-srcx);P.vx+=Math.cos(a)*110;P.vy+=Math.sin(a)*110;P.swing=null;
  if(P.hp<=0){P.hp=0;playerDie()}}
function playerDie(){G.state='dead';sfx('die');$('death').hidden=false;closeWin();closeDlg();P.col=Math.floor(P.col*.9);chat('System','You have died. 10% of your Col was lost.','sys')}
/* ----- player actions ----- */
function nearestEnemy(x,y,r){let b=null,bd=r;for(const e of E().en){if(e.dead||e.state==='dormant')continue;const d=dist(x,y,e.x,e.y)-e.r;if(d<bd){bd=d;b=e}}return b}
function arcHit(x,y,ang,range,arc,mult,kb,skill,by){
  let n=0;for(const e of E().en){if(e.dead||e.state==='dormant'||e.state==='intro')continue;const dx=e.x-x,dy=e.y-y,d=Math.hypot(dx,dy)-e.r;if(d>range)continue;
    if(arc<6.2&&d>6&&Math.abs(angN(Math.atan2(dy,dx)-ang))>arc/2)continue;const[v,c]=rollDmg(mult,skill);hurtEnemy(e,v,Math.atan2(dy,dx),kb,c,by||'p');n++}return n}
function tryAttack(){
  if(G.state!=='play'||P.atkCd>0||P.act)return;
  const t=nearestEnemy(P.x,P.y,56);if(t&&!P.manualAim)P.ang=Math.atan2(t.y-P.y,t.x-P.x);
  P.combo=P.comboT>0?(P.combo+1)%3:0;P.comboT=.7;const n=P.combo;P.swing={t:0,dur:.26,n,ang:P.ang,hit:false};P.atkCd=n===2?.42:.3;sfx('swing');
  if(n===2){P.vx+=Math.cos(P.ang)*70;P.vy+=Math.sin(P.ang)*70}}
function swingTick(dt){
  const s=P.swing;if(!s)return;s.t+=dt;
  if(!s.hit&&s.t>=.07){s.hit=true;const n=s.n,mult=n===2?1.5:1,range=n===2?30:25,arc=n===2?2.6:2.0;
    addFx({k:'arc',x:P.x,y:P.y-7,ang:s.ang+(n===1?-.3:.3),r:range-4,arc,t:0,max:.2,col:n===2?'#ffd36a':'#bfefff',flip:n===1});
    if(arcHit(P.x,P.y,s.ang,range,arc,mult,n===2?90:40,false)>0&&n===2)G.shake=Math.max(G.shake,3)}
  if(s.t>=s.dur)P.swing=null}
function tryDodge(){
  if(G.state!=='play'||P.dodgeCd>0||P.act)return;
  let mx=P.mx||0,my=P.my||0;const a=(mx||my)?Math.atan2(my,mx):P.ang;P.ang=a;P.dodgeT=.28;P.dodgeCd=.9;P.vx=Math.cos(a)*230;P.vy=Math.sin(a)*230;P.swing=null;sfx('dodge');
  for(let i=0;i<5;i++)addFx({k:'p',x:P.x,y:P.y-4,vx:rnd(-10,10),vy:rnd(-10,10),t:0,max:.3,col:'#7fe7ff',s:2})}
function usePotion(){
  if(G.state!=='play'||P.potCd>0)return;const ids=['potionL','potionM','potionS'];const id=ids.find(i=>countItem(i)>0&&(ITEMS[i].heal<=Math.max(60,(S.maxhp-P.hp)*1.5)||i==='potionS'))||ids.find(i=>countItem(i)>0);
  if(!id){toast('No healing crystals','bad');return}
  if(P.hp>=S.maxhp){toast('HP is already full');return}
  takeItem(id,1);const h=ITEMS[id].heal;P.hp=Math.min(S.maxhp,P.hp+h);P.potCd=6;sfx('potion');addTxt(P.x,P.y-24,'+'+h,'#7dff9a',9);burst(P.x,P.y-6,'#7dff9a',9,40)}
function castSkill(i){
  const sk=SKILLS[i];if(G.state!=='play'||P.lvl<sk.lv||P.cds[i]>0||P.act)return;
  const t=nearestEnemy(P.x,P.y,90);if(t&&!P.manualAim)P.ang=Math.atan2(t.y-P.y,t.x-P.x);const a=P.ang;P.cds[i]=sk.cd*(1-Math.min(.3,P.agi*.004));P.swing=null;sfx('skill');
  if(sk.id==='leap'){P.act={k:'leap',t:0,dur:.22,a,hit:new Set()};P.inv_t=Math.max(P.inv_t,.3)}
  if(sk.id==='crescent'){P.act={k:'cast',t:0,dur:.2,a,fire:'crescent'}}
  if(sk.id==='storm'){P.act={k:'storm',t:0,dur:.9,a,n:0}}
  if(sk.id==='ascend'){P.act={k:'ascend',t:0,dur:.9,a,done:false};P.inv_t=Math.max(P.inv_t,.9);addFx({k:'ring',x:P.x,y:P.y,r:50,gr:-50,t:0,max:.7,col:'#ffd36a'})}}
function actTick(dt){
  const a=P.act;if(!a)return;a.t+=dt;
  if(a.k==='leap'){const s=260,nx=P.x+Math.cos(a.a)*s*dt,ny=P.y+Math.sin(a.a)*s*dt;if(!solidAt(G.map,nx,P.y))P.x=nx;if(!solidAt(G.map,P.x,ny))P.y=ny;
    addFx({k:'p',x:P.x,y:P.y-5,vx:0,vy:0,t:0,max:.3,col:'#7fe7ff',s:3});
    for(const e of E().en){if(e.dead||a.hit.has(e)||e.state==='dormant'||e.state==='intro')continue;if(dist(P.x,P.y,e.x,e.y)<e.r+14){a.hit.add(e);const[v,c]=rollDmg(1.7,true);hurtEnemy(e,v,a.a,90,c,'p')}}}
  if(a.k==='cast'&&a.t>.08&&a.fire){a.fire=null;E().proj.push({x:P.x+Math.cos(a.a)*10,y:P.y-6+Math.sin(a.a)*10,vx:Math.cos(a.a)*190,vy:Math.sin(a.a)*190,r:10,dmg:1.5,from:'p',life:.8,ang:a.a,type:'wave',hit:new Set()});P.vx-=Math.cos(a.a)*30;P.vy-=Math.sin(a.a)*30}
  if(a.k==='storm'){const k=Math.floor(a.t/.28);if(k>a.n&&a.n<3){a.n++;addFx({k:'ring',x:P.x,y:P.y-6,r:12,gr:60,t:0,max:.25,col:'#bfefff'});arcHit(P.x,P.y,0,36,6.3,.9,60,true);sfx('swing');G.shake=Math.max(G.shake,2)}if(a.n===0&&a.t<.02){a.n=1;addFx({k:'ring',x:P.x,y:P.y-6,r:12,gr:60,t:0,max:.25,col:'#bfefff'});arcHit(P.x,P.y,0,36,6.3,.9,60,true)}}
  if(a.k==='ascend'&&!a.done&&a.t>.6){a.done=true;sfx('smash');G.shake=8;flashFx(.4);addFx({k:'ring',x:P.x,y:P.y,r:10,gr:160,t:0,max:.5,col:'#ffd36a'});addFx({k:'ring',x:P.x,y:P.y,r:6,gr:110,t:0,max:.4,col:'#fff'});arcHit(P.x,P.y,0,52,6.3,5.6,140,true);burst(P.x,P.y,'#ffd36a',30,120)}
  if(a.t>=a.dur)P.act=null}
/* ----- movement with tile collision ----- */
function moveEnt(o,dx,dy,r){
  const m=G.map,rr=r||o.r||5,ok=(x,y)=>!solidAt(m,x-rr,y-rr*.5)&&!solidAt(m,x+rr,y-rr*.5)&&!solidAt(m,x-rr,y+rr*.5)&&!solidAt(m,x+rr,y+rr*.5);
  if(ok(o.x+dx,o.y))o.x+=dx;if(ok(o.x,o.y+dy))o.y+=dy;o.x=clamp(o.x,8,m.w*TS-8);o.y=clamp(o.y,8,m.h*TS-8)}
function updatePlayer(dt){
  P.atkCd-=dt;P.comboT-=dt;P.dodgeCd-=dt;P.potCd-=dt;P.inv_t-=dt;P.dodgeT-=dt;P.hurtT-=dt;for(let i=0;i<4;i++)P.cds[i]-=dt;
  const busy=P.act&&P.act.k==='ascend'||P.act&&P.act.k==='storm'&&false;
  let mx=P.mx||0,my=P.my||0;const ml=Math.hypot(mx,my);if(ml>1){mx/=ml;my/=ml}
  const sp=S.spd*(P.swing?.55:1)*(P.act&&P.act.k==='ascend'?0:P.act&&P.act.k==='storm'?.6:1);
  if(P.dodgeT<=0&&!(P.act&&P.act.k==='leap')){P.vx=lerp(P.vx,0,Math.min(1,dt*10));P.vy=lerp(P.vy,0,Math.min(1,dt*10));moveEnt(P,mx*sp*dt+P.vx*dt,my*sp*dt+P.vy*dt,P.r)}
  else if(P.dodgeT>0){moveEnt(P,P.vx*dt,P.vy*dt,P.r)}
  P.moving=ml>.15&&P.dodgeT<=0;if(P.moving){P.anim+=dt*(7+S.spd/30);if(!P.swing&&!P.act&&!P.manualAim)P.ang=Math.atan2(my,mx)}
  if(P.dodgeT>0&&Math.random()<.6)addFx({k:'p',x:P.x,y:P.y-4,vx:0,vy:0,t:0,max:.25,col:'rgba(127,231,255,.7)',s:3});
  swingTick(dt);actTick(dt);
  if(inSafe(P.x,P.y)&&G.map.id==='field'){if(P.hp<S.maxhp)P.hp=Math.min(S.maxhp,P.hp+S.maxhp*.08*dt)}else P.hp=Math.min(S.maxhp,P.hp+S.maxhp*.004*dt);
  $('vig').style.opacity=Math.max(0,parseFloat($('vig').style.opacity||0)-dt*2)}
/* ----- enemy AI ----- */
function enemyHitPlayer(e,mult){hurtPlayer(e.atk*(mult||1),e.x,e.y)}
function updateEnemy(e,dt){
  if(e.dead){if(e.home&&(e.rt-=dt)<=0){e.dead=false;e.hp=e.maxhp;e.x=e.sx;e.y=e.sy;e.state='idle';e.kx=e.ky=0}return}
  if(e.boss){updateBoss(e,dt);return}
  const pd=dist(e.x,e.y,P.x,P.y),d=e.d;e.hurtT-=dt;e.cd-=dt;e.anim+=dt;
  if(Math.abs(e.kx)+Math.abs(e.ky)>1){moveEnt(e,e.kx*dt,e.ky*dt);e.kx*=Math.pow(.02,dt);e.ky*=Math.pow(.02,dt)}
  const can=P.hp>0&&G.state==='play'&&!inSafe(P.x,P.y);
  const go=(tx,ty,sp)=>{const a=Math.atan2(ty-e.y,tx-e.x);moveEnt(e,Math.cos(a)*sp*dt,Math.sin(a)*sp*dt);e.face=Math.cos(a)<0?-1:1};
  if(e.state==='idle'){e.t-=dt;if(e.t<=0){e.t=rnd(1.5,4);e.tx=e.sx+rnd(-40,40);e.ty=e.sy+rnd(-40,40);e.wander=rnd(.6,1.4)}
    if(e.wander>0){e.wander-=dt;go(e.tx,e.ty,e.spd*.35)}if(can&&pd<d.aggro)e.state='chase';return}
  if(e.state==='return'){go(e.sx,e.sy,e.spd);e.hp=Math.min(e.maxhp,e.hp+e.maxhp*.2*dt);if(dist(e.x,e.y,e.sx,e.sy)<8)e.state='idle';if(can&&pd<d.aggro*.7)e.state='chase';return}
  if(!can||pd>d.aggro*2.4||(e.home&&dist(e.x,e.y,e.sx,e.sy)>300)){e.state='return';e.wind=0;return}
  const reach=e.r+P.r+6;
  if(e.wind>0){e.wind-=dt;if(e.wind<=0){
      if(d.ai==='ranged'){const a=Math.atan2(P.y-6-e.y,P.x-e.x);E().proj.push({x:e.x,y:e.y-6,vx:Math.cos(a)*150,vy:Math.sin(a)*150,r:3,dmg:e.atk,from:'e',life:1.4,ang:a,type:'arrow'});sfx('swing')}
      else if(d.ai==='charge'){e.dash=.45;e.dang=Math.atan2(P.y-e.y,P.x-e.x);e.hit=false}
      else{if(pd<reach+8){enemyHitPlayer(e);burst(e.x+(P.x-e.x)*.5,e.y-4,'#fff',3,30)}}
      e.cd=d.ai==='ranged'?rnd(1.6,2.4):rnd(.9,1.5)}return}
  if(e.dash>0){e.dash-=dt;moveEnt(e,Math.cos(e.dang)*150*dt,Math.sin(e.dang)*150*dt);e.face=Math.cos(e.dang)<0?-1:1;if(!e.hit&&dist(e.x,e.y,P.x,P.y)<reach){e.hit=true;enemyHitPlayer(e,1.2)}return}
  const a=Math.atan2(P.y-e.y,P.x-e.x);
  if(d.ai==='hop'){e.hop-=dt;if(e.hop<=0)e.hop=.9;if(e.hop>.55){go(P.x,P.y,e.spd*3)}if(pd<reach&&e.cd<=0){e.cd=1.2;enemyHitPlayer(e);burst(P.x,P.y-6,'#6fd36a',4,40)}}
  else if(d.ai==='ranged'){if(pd<64)go(e.x-Math.cos(a)*50,e.y-Math.sin(a)*50,e.spd*1.1);else if(pd>130)go(P.x,P.y,e.spd);e.face=Math.cos(a)<0?-1:1;if(e.cd<=0&&pd<150){e.wind=e.windMax=.6;e.cd=2}}
  else if(d.ai==='bat'){e.bt=(e.bt||0)+dt*4;const sx=-Math.sin(a)*Math.sin(e.bt)*.8,sy=Math.cos(a)*Math.sin(e.bt)*.8;moveEnt(e,(Math.cos(a)+sx)*e.spd*dt,(Math.sin(a)+sy)*e.spd*dt);e.face=Math.cos(a)<0?-1:1;if(pd<reach&&e.cd<=0){e.cd=1.3;enemyHitPlayer(e);e.kx-=Math.cos(a)*100;e.ky-=Math.sin(a)*100}}
  else if(d.ai==='charge'){if(pd>reach+10)go(P.x,P.y,e.spd);if(e.cd<=0&&pd<80&&pd>20){e.wind=e.windMax=.6;e.cd=2.4}else if(pd<reach&&e.cd<=0){e.wind=e.windMax=.4;e.cd=1.6}}
  else{if(pd>reach)go(P.x,P.y,e.spd);if(pd<reach+10&&e.cd<=0){e.wind=e.windMax=.45;e.cd=1.4}}
  if(e.wind<=0)for(const o of E().en){if(o===e||o.dead||o.boss)continue;const dd=dist(e.x,e.y,o.x,o.y);if(dd<10&&dd>.1)moveEnt(e,(e.x-o.x)/dd*20*dt,(e.y-o.y)/dd*20*dt)}}
/* ----- boss: Gravel King ----- */
function tele(o){o.t=0;o.col=o.col||'255,60,80';E().tele.push(o)}
function updateBoss(e,dt){
  const pd=dist(e.x,e.y,P.x,P.y),a=Math.atan2(P.y-e.y,P.x-e.x);e.hurtT-=dt;e.anim+=dt;
  if(e.state==='dormant'){if(P.y<26*TS&&G.state==='play'){e.state='intro';e.t=2.4;G.bossEnc=e;musicMode='boss';sfx('boss');G.shake=6;
      for(let x=21;x<=23;x++){setTile(G.map,x,28,18);setTile(G.map,x,29,18)}
      banner('FLOOR GUARDIAN','The Gravel King','#ff5d73');chat('System','The doors have sealed behind you.','sys');$('boss').hidden=false;$('bossName').textContent='GRAVEL KING  Lv.12'}return}
  if(e.state==='intro'){e.t-=dt;if(e.t<=0){e.state='fight';e.cd=1.2}return}
  const ph=e.hp/e.maxhp>.6?1:e.hp/e.maxhp>.25?2:3;
  if(ph>(e.ph||1)){e.ph=ph;sfx('boss');G.shake=7;banner(ph===2?'THE KING GROWS ANGRY':'ENRAGED','Watch the red markers','#ff5d73');
    for(let i=0;i<2;i++){const s=mkEnemy('skel',e.x+(i?30:-30),e.y+20,11);s.home=false;s.state='chase';E().en.push(s)}}
  e.ph=ph;
  if(P.hp<=0){e.state='fight'}
  if(e.act){const k=e.act;k.t+=dt;
    if(k.k==='charge'&&k.t>k.wind){if(!k.go){k.go=true;k.hit=false}const sp=260;if(k.t<k.wind+.38){moveEnt(e,Math.cos(k.a)*sp*dt,Math.sin(k.a)*sp*dt,e.r*.7);if(!k.hit&&dist(e.x,e.y,P.x,P.y)<e.r+8){k.hit=true;hurtPlayer(e.atk*1.3,e.x,e.y)}}}
    if(k.t>=k.dur){e.act=null;e.cd=ph===3?.9:ph===2?1.3:1.8}return}
  e.face=Math.cos(a)<0?-1:1;
  if(pd>38)moveEnt(e,Math.cos(a)*e.spd*(ph===3?1.5:1)*dt,Math.sin(a)*e.spd*(ph===3?1.5:1)*dt,e.r*.7);
  e.cd-=dt;if(e.cd>0||P.hp<=0)return;
  const pool=ph===1?['smash','stomp']:ph===2?['smash','stomp','rocks']:['smash','stomp','rocks','charge'],k=pick(pool);
  if(k==='smash'){const cx=e.x+Math.cos(a)*30,cy=e.y+Math.sin(a)*30;e.act={k:'smash',t:0,dur:1.1};tele({k:'circle',x:cx,y:cy,r:30,max:.85,fn:()=>{sfx('smash');G.shake=8;burst(cx,cy,'#aaa',16,90);addFx({k:'ring',x:cx,y:cy,r:8,gr:50,t:0,max:.3,col:'#fff'});if(dist(P.x,P.y,cx,cy)<30+P.r)hurtPlayer(e.atk*1.25,cx,cy)}})}
  if(k==='stomp'){e.act={k:'stomp',t:0,dur:1.3};tele({k:'circle',x:e.x,y:e.y,r:56,max:1.05,fn:()=>{sfx('smash');G.shake=9;burst(e.x,e.y,'#aaa',20,110);addFx({k:'ring',x:e.x,y:e.y,r:8,gr:70,t:0,max:.4,col:'#fff'});if(dist(P.x,P.y,e.x,e.y)<56+P.r)hurtPlayer(e.atk*1.0,e.x,e.y)}})}
  if(k==='rocks'){e.act={k:'rocks',t:0,dur:1.2};sfx('warn');tele({k:'cone',x:e.x,y:e.y,a,r:110,max:.7,fn:()=>{sfx('smash');const n=ph===3?7:5;for(let i=0;i<n;i++){const aa=a+(i-(n-1)/2)*.28;E().proj.push({x:e.x,y:e.y-8,vx:Math.cos(aa)*130,vy:Math.sin(aa)*130,r:5,dmg:e.atk*.6,from:'e',life:1.6,ang:aa,type:'rock'})}}})}
  if(k==='charge'){e.act={k:'charge',t:0,dur:1.5,a,wind:1};tele({k:'line',x:e.x,y:e.y,a,len:200,w:22,max:1,fn:()=>{sfx('boss')}})}
}
/* ----- projectiles, drops, tele, ai players ----- */
function updateProj(dt){const pr=E().proj;
  for(let i=pr.length-1;i>=0;i--){const p=pr[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;let dead=p.life<=0||solidAt(G.map,p.x,p.y);
    if(p.type==='wave'){addFx({k:'p',x:p.x,y:p.y,vx:0,vy:0,t:0,max:.2,col:'#bfefff',s:2});for(const e of E().en){if(e.dead||p.hit.has(e)||e.state==='dormant'||e.state==='intro')continue;if(dist(p.x,p.y,e.x,e.y)<e.r+8){p.hit.add(e);const[v,c]=rollDmg(p.dmg,true);hurtEnemy(e,v,p.ang,40,c,'p')}}}
    else if(p.from==='e'){if(dist(p.x,p.y,P.x,P.y-5)<p.r+5){hurtPlayer(p.dmg,p.x-p.vx,p.y-p.vy);dead=true}}
    if(dead){if(p.type!=='wave')burst(p.x,p.y,p.type==='rock'?'#999':'#ddd',4,30);pr.splice(i,1)}}}
function updateTele(dt){const tl=E().tele;for(let i=tl.length-1;i>=0;i--){const t=tl[i];t.t+=dt;if(t.t>=t.max){t.fn&&t.fn();tl.splice(i,1)}}}
function updateDrops(dt){const dr=E().drop;
  for(let i=dr.length-1;i>=0;i--){const d=dr[i];d.t+=dt;d.life=(d.life||0)+dt;if(d.vx||d.vy){const nx=d.x+d.vx*dt,ny=d.y+d.vy*dt;if(!solidAt(G.map,nx,ny)){d.x=nx;d.y=ny}d.vx*=Math.pow(.01,dt);d.vy*=Math.pow(.01,dt)}
    const pd=dist(d.x,d.y,P.x,P.y);if(pd<48&&d.t>.5&&G.state==='play'){const a=Math.atan2(P.y-d.y,P.x-d.x);d.x+=Math.cos(a)*140*dt;d.y+=Math.sin(a)*140*dt}
    if(pd<10&&d.t>.4&&G.state==='play'){
      if(d.col){P.col+=d.col;sfx('coin');addTxt(P.x,P.y-26,'+'+d.col+' Col','#ffd36a',7);dr.splice(i,1)}
      else if(addItem(d.id,1)){const it=ITEMS[d.id];sfx('pick');toast('Obtained '+it.n,'loot');chat('System','Obtained <b style="color:'+RC[it.rar]+'">'+it.n+'</b>','sys');dr.splice(i,1);if(it.rar>=2)saveGame()}
      else if(!d.warn){d.warn=1;toast('Inventory full','bad')}}
    else if(d.life>90)dr.splice(i,1)}}
function updateAI(a,dt){
  a.anim+=dt;a.t-=dt;a.cd-=dt;a.chatT-=dt;let mvx=0,mvy=0;const m=G.map;
  if(a.chatT<=0){a.chatT=rnd(18,50);if(!a.party&&m.id==='field'&&dist(a.x,a.y,P.x,P.y)<700)chat(a.name,pick(CHATTER),'')}
  const sp=62;
  if(a.party){
    let tgt=null,bd=95;for(const e of E().en){if(e.dead||e.state==='dormant'||e.state==='intro')continue;const d=dist(e.x,e.y,a.x,a.y);if(d<bd&&dist(e.x,e.y,P.x,P.y)<170){bd=d;tgt=e}}
    const pd=dist(a.x,a.y,P.x,P.y);if(pd>320){a.x=P.x+rnd(-20,20);a.y=P.y+rnd(-20,20)}
    if(tgt){const d=dist(a.x,a.y,tgt.x,tgt.y);if(d>tgt.r+16){const an=Math.atan2(tgt.y-a.y,tgt.x-a.x);mvx=Math.cos(an);mvy=Math.sin(an)}else if(a.cd<=0){a.cd=.8;const dmg=Math.round((8+a.lvl*3.2+P.lvl*1.2)*rnd(.85,1.15));addFx({k:'arc',x:a.x,y:a.y-7,ang:Math.atan2(tgt.y-a.y,tgt.x-a.x),r:20,arc:2,t:0,max:.16,col:'#9dffb4'});hurtEnemy(tgt,dmg,Math.atan2(tgt.y-a.y,tgt.x-a.x),30,false,'party')}}
    else if(pd>38){const an=Math.atan2(P.y-a.y,P.x-a.x);mvx=Math.cos(an);mvy=Math.sin(an)}
  }else{
    let tgt=null;if(m.id==='field'&&!inSafe(a.x,a.y)){let bd=110;for(const e of E().en){if(e.dead)continue;const d=dist(e.x,e.y,a.x,a.y);if(d<bd){bd=d;tgt=e}}}
    if(tgt){const d=dist(a.x,a.y,tgt.x,tgt.y);if(d>tgt.r+16){const an=Math.atan2(tgt.y-a.y,tgt.x-a.x);mvx=Math.cos(an);mvy=Math.sin(an)}else if(a.cd<=0){a.cd=.9;const an=Math.atan2(tgt.y-a.y,tgt.x-a.x);addFx({k:'arc',x:a.x,y:a.y-7,ang:an,r:20,arc:2,t:0,max:.16,col:'#ffd0a0'});hurtEnemy(tgt,Math.round(6+a.lvl*3),an,25,false,'ai')}}
    else{if(a.t<=0){a.t=rnd(1.5,5);const an=rnd(0,6.28),r=rnd(0,a.home);a.tx=a.hx+Math.cos(an)*r;a.ty=a.hy+Math.sin(an)*r;a.go=rnd(.8,2.2)}
      if(a.go>0){a.go-=dt;const an=Math.atan2(a.ty-a.y,a.tx-a.x);if(dist(a.x,a.y,a.tx,a.ty)>6){mvx=Math.cos(an)*.6;mvy=Math.sin(an)*.6}}}
  }
  if(mvx||mvy){moveEnt(a,mvx*sp*dt,mvy*sp*dt,5);a.mov=true;a.face=Math.abs(mvx)>Math.abs(mvy)?(mvx<0?'l':'r'):(mvy<0?'u':'d')}else a.mov=false}
function updateWorld(dt){
  const w=E();for(const e of w.en){if(G.state!=='play'&&!G.title)continue;if(Math.abs(e.x-P.x)<420&&Math.abs(e.y-P.y)<340||e.boss)updateEnemy(e,dt)}
  updateProj(dt);updateTele(dt);updateDrops(dt);w.ai.forEach(a=>updateAI(a,dt));
  for(let i=w.fx.length-1;i>=0;i--){const f=w.fx[i];f.t+=dt;if(f.k==='p'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=(f.g===undefined?60:f.g)*dt}if(f.t>=f.max)w.fx.splice(i,1)}
  for(let i=w.txt.length-1;i>=0;i--){const t=w.txt[i];t.t+=dt;t.y-=18*dt;if(t.t>=t.max)w.txt.splice(i,1)}}
function nearestInteract(){
  if(G.state!=='play')return null;const w=E();let best=null,bd=28;
  for(const n of w.npc){const d=dist(n.x,n.y,P.x,P.y);if(d<bd){bd=d;best={k:'npc',o:n,txt:'Talk to '+n.name}}}
  for(const a of w.ai){const d=dist(a.x,a.y,P.x,P.y);if(d<bd){bd=d;best={k:'ai',o:a,txt:a.name+'  Lv '+a.lvl}}}
  const t=tAt(G.map,Math.floor(P.x/TS),Math.floor(P.y/TS));
  if(t===TL.PORTAL&&G.map.id==='field')return{k:'portal',txt:'Enter the Labyrinth'};
  if(t===TL.EXIT&&G.map.id==='dungeon')return{k:'exit',txt:'Return to the city'};
  return best}
