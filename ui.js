/* ===== UI ===== */
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(t,kind){const l=$('toasts');while(l.children.length>3)l.firstChild.remove();const d=document.createElement('div');d.className='toast '+(kind||'');d.textContent=t;l.appendChild(d);setTimeout(()=>d.remove(),3300)}
function banner(t,sub,col){const b=$('banner');b.innerHTML='<div class="in" style="--bc:'+(col||'#7fe7ff')+'"><h2>'+esc(t)+'</h2>'+(sub?'<p>'+esc(sub)+'</p>':'')+'</div>'}
function flashFx(a){const f=$('flash');f.classList.remove('go');void f.offsetWidth;f.style.setProperty('opacity',a||1);f.classList.add('go')}
function chat(name,msg,cls){const l=$('chatLog'),d=document.createElement('div');
  if(name==='System'){d.className='sys';d.innerHTML='[System] '+msg}else if(cls==='pty'){d.className='pty';d.innerHTML='[Party] <b>'+esc(name)+'</b>: '+esc(msg)}else{d.className=cls||'';d.innerHTML='<b>'+esc(name)+'</b>: '+(cls==='html'?msg:esc(msg))}
  l.appendChild(d);while(l.children.length>24)l.firstChild.remove()}
/* ----- windows ----- */
const W={open:false,tab:'status',sel:-1,shop:null,stab:'buy',reset:false};
const ATTR={str:'STR  Strength',agi:'AGI  Agility',vit:'VIT  Vitality',int:'INT  Intellect'};
function openWin(tab,shop){W.open=true;W.tab=tab||'status';W.shop=shop||null;W.stab='buy';W.sel=-1;W.reset=false;$('win').hidden=false;sfx('click');renderWin()}
function closeWin(){if(!W.open)return;W.open=false;W.shop=null;$('win').hidden=true;saveGame()}
function statLine(it){const o=[];if(it.atk)o.push('ATK +'+it.atk);if(it.def)o.push('DEF +'+it.def);if(it.hp)o.push('HP +'+it.hp);if(it.crit)o.push('CRIT +'+it.crit+'%');if(it.spd)o.push('SPD +'+it.spd);if(it.heal)o.push('Heals '+it.heal+' HP');return o.join('  ·  ')}
function slotHtml(it,n,attrs,cls){return '<button class="slot '+(cls||'')+'" '+attrs+'>'+(it?'<img src="'+itemIcon(it)+'" alt="'+esc(it.n)+'" style="filter:drop-shadow(0 0 3px '+RC[it.rar]+')">'+(n>1?'<em>'+n+'</em>':''):'')+'</button>'}
function renderWin(){
  const tabs=W.shop?[['buy','BUY'],['sell','SELL']]:[['status','STATUS'],['items','ITEMS'],['skills','SKILLS'],['quests','QUESTS'],['system','SYSTEM']];
  $('wtabs').innerHTML=tabs.map(([k,n])=>'<button data-act="tab" data-k="'+k+'" class="'+((W.shop?W.stab:W.tab)===k?'on':'')+'">'+n+'</button>').join('')+'<button class="x" data-act="close" aria-label="Close">CLOSE</button>';
  const t=W.shop?'shop':W.tab;let h='';
  if(t==='status')h=winStatus();else if(t==='items')h=winItems();else if(t==='skills')h=winSkills();else if(t==='quests')h=winQuests();else if(t==='system')h=winSystem();else h=winShop();
  const b=$('wbody'),st=b.scrollTop;b.innerHTML=h;b.scrollTop=st}
function winStatus(){
  return '<div class="h1">'+esc(P.name)+'</div><div class="mut">Swordsman  ·  '+(P.bossKills?'Floor Clearer':'Newcomer')+'  ·  Floor 1</div>'+
  '<div class="grid2" style="margin-top:12px"><div class="stat">LEVEL <b>'+P.lvl+'</b></div><div class="stat">COL <b class="gold">'+P.col+'</b></div>'+
  '<div class="stat">HP <b>'+Math.ceil(P.hp)+' / '+S.maxhp+'</b></div><div class="stat">EXP <b>'+(P.lvl>=MAXLV?'MAX':P.xp+' / '+NEED(P.lvl))+'</b></div>'+
  '<div class="stat">ATK <b>'+Math.round(S.atk)+'</b></div><div class="stat">DEF <b>'+Math.round(S.def)+'</b></div>'+
  '<div class="stat">CRIT <b>'+Math.round(S.crit*100)+'%</b></div><div class="stat">SPEED <b>'+Math.round(S.spd)+'</b></div></div>'+
  '<div class="h2">ATTRIBUTES'+(P.pts?' <span class="gold">  ·  '+P.pts+' points to spend</span>':'')+'</div><div class="grid2">'+
  ['str','agi','vit','int'].map(k=>'<div class="stat"><span>'+ATTR[k]+'</span><span><b>'+P[k]+'</b>'+(P.pts?'<button class="plus" data-act="stat" data-k="'+k+'" aria-label="Add '+k+'">+</button>':'')+'</span></div>').join('')+'</div>'+
  '<div class="tip" style="margin-top:10px">STR raises damage. AGI raises speed, crit chance and shortens skill cooldowns. VIT raises HP and defence. INT boosts skill damage.</div>'+
  (G.party.length?'<div class="h2">PARTY BONUS</div><div class="stat">+'+G.party.length*8+'% damage  ·  +'+G.party.length*10+'% EXP</div>':'')}
function winItems(){
  const eq=['weapon','armor','acc'],ln={weapon:'WEAPON',armor:'ARMOR',acc:'ACCESSORY'};
  let h='<div class="eq">'+eq.map(s=>{const id=P.eq[s],it=id&&ITEMS[id];return '<button class="slot" data-act="unequip" data-k="'+s+'">'+(it?'<img src="'+itemIcon(it)+'" alt="" style="width:34px;filter:drop-shadow(0 0 3px '+RC[it.rar]+')"><span class="rarity'+it.rar+'">'+esc(it.n)+'</span>':ln[s])+'</button>'}).join('')+'</div>';
  h+='<div class="h2">INVENTORY  ·  '+P.inv.filter(Boolean).length+' / 30</div><div class="slots">'+P.inv.map((s,i)=>slotHtml(s&&ITEMS[s.id],s&&s.n,'data-act="sel" data-i="'+i+'"',W.sel===i?'sel':'')).join('')+'</div>';
  const s=P.inv[W.sel];
  if(s){const it=ITEMS[s.id];h+='<div class="detail"><div class="h1 rarity'+it.rar+'" style="font-size:17px">'+esc(it.n)+'</div><div class="mut">'+RN[it.rar]+' '+({use:'consumable',mat:'material',weapon:'weapon',armor:'armor',acc:'accessory'}[it.t])+(it.req?'  ·  Requires Lv '+it.req:'')+'</div>'+
    (statLine(it)?'<div>'+statLine(it)+'</div>':'')+'<div class="mut">'+esc(it.d)+'</div><div class="btns">'+
    (['weapon','armor','acc'].includes(it.t)?'<button class="btn" data-act="equip" data-i="'+W.sel+'">EQUIP</button>':'')+(it.t==='use'?'<button class="btn" data-act="use">USE</button>':'')+
    '<span class="mut" style="align-self:center">Sells for '+Math.floor(it.price*.5)+' Col</span></div></div>'}
  return h}
function winSkills(){
  const row=(ic,n,sub,d,lock)=>'<div class="row2" style="'+(lock?'opacity:.45':'')+'"><img src="'+skillIcon(ic)+'" width="36" height="36" alt=""><div class="grow"><b>'+n+'</b> <span class="mut">'+sub+'</span><div class="mut">'+d+'</div></div></div>';
  return row('atk','Slash Combo','J / click','Three-hit combo. The third hit is a wide, heavy finisher.')+row('dodge','Shadow Step','K','A quick roll. You cannot be hit while rolling.')+
    SKILLS.map((s,i)=>row(s.id,s.n,P.lvl>=s.lv?('Key '+(i+1)+'  ·  '+s.cd+'s'):('Unlocks at Lv '+s.lv),s.d,P.lvl<s.lv)).join('')}
function winQuests(){
  let h='';const act=QUESTS.filter(q=>qState(q.id).s===1),done=QUESTS.filter(q=>qState(q.id).s===3),nx=nextQuest();
  act.forEach(q=>{h+='<div class="row2"><div class="grow"><b class="gold">'+q.n+'</b>  <span class="mut">'+(qReady(q)?'Return to Arlen':'In progress')+'</span><div class="mut">'+q.d+'</div><div>Progress <b>'+qProg(q)+' / '+q.c+'</b>  ·  Reward '+q.rw.xp+' EXP, '+q.rw.col+' Col</div></div></div>'});
  if(nx&&qState(nx.id).s===0)h+='<div class="row2"><div class="grow"><b>'+nx.n+'</b>  <span class="mut">'+(P.lvl>=nx.minLv?'Available  ·  speak to Guildmaster Arlen':'Requires Lv '+nx.minLv)+'</span></div></div>';
  if(done.length)h+='<div class="h2">COMPLETED</div>'+done.map(q=>'<div class="row2"><div class="grow mut">'+q.n+'</div><b>DONE</b></div>').join('');
  return h||'<div class="mut">No quests yet. Guildmaster Arlen is in the blue-roofed hall in the city plaza.</div>'}
function winSystem(){
  return '<div class="btns"><button class="btn" data-act="save">SAVE GAME</button><button class="btn" data-act="snd">SOUND: '+(muted?'OFF':'ON')+'</button>'+(G.party.length?'<button class="btn" data-act="leave">LEAVE PARTY</button>':'')+
  '<button class="btn" data-act="logout">LOG OUT</button><button class="btn bad" data-act="reset">'+(W.reset?'CONFIRM: DELETE CHARACTER':'DELETE CHARACTER')+'</button></div>'+
  '<div class="h2">CONTROLS</div><div class="mut">WASD / arrows: move  ·  J or click: attack  ·  1-4: skills  ·  K: dodge  ·  R: potion<br>E: interact  ·  M: menu  ·  Enter: chat  ·  On touch: drag the left half to move</div>'+
  '<div class="h2">PROGRESS</div><div class="mut">Kills '+P.kills+'  ·  Guardians defeated '+P.bossKills+'  ·  Progress is saved in this browser.</div>'}
function winShop(){
  const sh=SHOPS[W.shop];let h='<div class="row2"><div class="grow"><b>'+sh.n+'</b></div><div class="gold"><b>'+P.col+' Col</b></div></div>';
  if(W.stab==='buy')h+=sh.stock.map(id=>{const it=ITEMS[id],lock=it.req>P.lvl;return '<div class="row2"><img src="'+itemIcon(it)+'" width="32" height="32" style="image-rendering:pixelated" alt=""><div class="grow"><b class="rarity'+it.rar+'">'+it.n+'</b><div class="mut">'+(statLine(it)||it.d)+(it.req?'  ·  Lv '+it.req:'')+'</div></div><button class="btn" data-act="buy" data-id="'+id+'" '+(P.col<it.price||lock?'disabled':'')+'>'+it.price+' Col</button></div>'}).join('');
  else{const rows=P.inv.map((s,i)=>s?'<div class="row2"><img src="'+itemIcon(ITEMS[s.id])+'" width="32" height="32" style="image-rendering:pixelated" alt=""><div class="grow"><b class="rarity'+ITEMS[s.id].rar+'">'+ITEMS[s.id].n+'</b> <span class="mut">x'+s.n+'</span></div><button class="btn" data-act="sell" data-i="'+i+'">+'+Math.floor(ITEMS[s.id].price*.5)+' Col</button></div>':'').join('');h+=rows||'<div class="mut">You have nothing to sell.</div>'}
  return h}
$('win').addEventListener('click',ev=>{
  const b=ev.target.closest('[data-act]');if(!b||G.state==='title')return;const a=b.dataset.act;
  if(a==='close')closeWin();
  else if(a==='tab'){if(W.shop)W.stab=b.dataset.k;else{W.tab=b.dataset.k;W.reset=false}sfx('click')}
  else if(a==='stat'){if(P.pts>0){P.pts--;P[b.dataset.k]++;const f=P.hp/S.maxhp;calc();P.hp=Math.min(S.maxhp,f*S.maxhp+12*(b.dataset.k==='vit'));sfx('click')}}
  else if(a==='sel'){W.sel=+b.dataset.i;sfx('click')}
  else if(a==='equip'){equipFromInv(+b.dataset.i);W.sel=-1}
  else if(a==='unequip')unequip(b.dataset.k);
  else if(a==='use'){const s=P.inv[W.sel];if(s&&ITEMS[s.id].t==='use'){if(P.hp>=S.maxhp)toast('HP is already full');else{takeItem(s.id,1);P.hp=Math.min(S.maxhp,P.hp+ITEMS[s.id].heal);sfx('potion');if(!P.inv[W.sel])W.sel=-1}}}
  else if(a==='buy'){const it=ITEMS[b.dataset.id];if(P.col>=it.price&&addItem(b.dataset.id,1)){P.col-=it.price;sfx('coin');toast('Bought '+it.n,'loot')}else if(P.col>=it.price)toast('Inventory full','bad')}
  else if(a==='sell'){const i=+b.dataset.i,s=P.inv[i];if(s){P.col+=Math.floor(ITEMS[s.id].price*.5);s.n--;if(s.n<=0)P.inv[i]=null;sfx('coin')}}
  else if(a==='save'){saveGame();toast('Game saved')}
  else if(a==='snd'){setMuted(!muted)}
  else if(a==='leave'){leaveParty()}
  else if(a==='logout'){toast('The log-out function is unavailable.','bad');chat('System','The log-out function is currently unavailable.','sys')}
  else if(a==='reset'){if(W.reset){try{localStorage.removeItem(SAVEKEY)}catch(e){}P=null;location.reload()}else W.reset=true}
  calc();renderWin()});
/* ----- dialog ----- */
let dlgFns=[];
function openDlg(who,text,btns){closeWin();const d=$('dlg');dlgFns=btns.map(b=>b[1]);d.hidden=false;
  d.innerHTML='<div class="who">'+esc(who)+'</div><p>'+text+'</p><div class="btns">'+btns.map((b,i)=>'<button class="btn" data-i="'+i+'">'+b[0]+'</button>').join('')+'</div>';sfx('click')}
function closeDlg(){$('dlg').hidden=true;dlgFns=[]}
$('dlg').addEventListener('click',ev=>{const b=ev.target.closest('[data-i]');if(!b)return;const f=dlgFns[+b.dataset.i];f&&f()});
function talkArlen(){
  const q=nextQuest(),who='Guildmaster Arlen',cl=['Close',closeDlg];
  if(!q)return openDlg(who,'You have cleared every task I can offer, '+esc(P.name)+'. Floor 2 awaits, and I hope to see you there.',[cl]);
  const st=qState(q.id);
  if(st.s===0){if(P.lvl<q.minLv)return openDlg(who,'Good work so far. Come back at level '+q.minLv+' and I will have something for you.',[cl]);
    return openDlg(who,'<b>'+q.n+'</b><br>'+esc(q.d)+'<br><span class="gold">Reward: '+q.rw.xp+' EXP, '+q.rw.col+' Col'+q.rw.items.map(([id,n])=>', '+ITEMS[id].n+(n>1?' x'+n:'')).join('')+'</span>',[['Accept',()=>{st.s=1;st.p=0;sfx('pick');toast('Quest accepted: '+q.n,'loot');chat('System','Quest accepted: '+q.n,'sys');closeDlg();saveGame()}],cl])}
  if(qReady(q))return openDlg(who,'You did it. Take your reward, '+esc(P.name)+'.',[['Turn in',()=>{
      if(q.t==='item')takeItem(q.k,q.c);st.s=3;P.col+=q.rw.col;q.rw.items.forEach(([id,n])=>addItem(id,n));sfx('win');banner('QUEST COMPLETE',q.n,'#ffd36a');chat('System','Quest complete: '+q.n,'sys');gainXp(q.rw.xp);saveGame();talkArlen()}]]);
  openDlg(who,'Still working on <b>'+q.n+'</b>? Progress: '+qProg(q)+' / '+q.c+'.',[cl])}
function talk(n){
  if(n.id==='arlen')return talkArlen();
  if(n.role==='shop')return openDlg(n.name,n.id==='mira'?'Potions for the brave and the careless. What can I get you?':'Steel and leather, fresh from the forge. Take a look.',[['Shop',()=>{closeDlg();openWin('shop',n.id)}],['Leave',closeDlg]]);
  const i=(P.tipI||0)%TIPS.length;P.tipI=i+1;openDlg(n.name,TIPS[i],[['Next tip',()=>talk(n)],['Close',closeDlg]])}
function talkAI(a){
  const inv=!a.party;openDlg(a.name+'  Lv '+a.lvl,inv?'"Hey! Want to team up? Parties get bonus damage and EXP."':'"Lead the way!"',
    [inv?['Invite to party',()=>{if(G.party.length>=2){openDlg(a.name,'Your party is full.',[['Close',closeDlg]]);return}
      if(Math.random()<.85){a.party=true;G.party.push(a);calc();closeDlg();sfx('pick');chat(a.name,'Thanks for the invite! Lets go.','pty');chat('System',esc(a.name)+' joined your party.','sys')}else{closeDlg();chat(a.name,'Sorry, I am busy right now.','')}}]
      :['Leave party',()=>{leaveParty(a);closeDlg()}],['Close',closeDlg]])}
function leaveParty(one){const out=one?[one]:G.party.slice();out.forEach(a=>{a.party=false;a.hx=a.x;a.hy=a.y;G.party=G.party.filter(x=>x!==a);if(G.map.id==='dungeon'){const f=G.field;G.map.E.ai=G.map.E.ai.filter(x=>x!==a);const p=tc(60,64);a.x=p[0]+rnd(-30,30);a.y=p[1]+rnd(-20,20);a.hx=a.x;a.hy=a.y;f.E.ai.push(a)}chat('System',esc(a.name)+' left your party.','sys')});calc()}
function interact(){
  const n=nearestInteract();if(!n)return;
  if(n.k==='npc')talk(n.o);else if(n.k==='ai')talkAI(n.o);else if(n.k==='portal')travel('dungeon');else if(n.k==='exit')travel('field')}
/* ----- travel ----- */
function switchMap(m,x,y){
  const old=G.map;G.state='trans';$('fade').classList.add('on');closeDlg();
  setTimeout(()=>{
    G.party.forEach(a=>{old.E.ai=old.E.ai.filter(o=>o!==a);m.E.ai.push(a);a.x=x+rnd(-18,18);a.y=y+rnd(-12,12)});
    G.map=m;P.x=x;P.y=y;P.vx=P.vy=0;P.swing=null;P.act=null;G.cam.x=x;G.cam.y=y;G.bossEnc=null;$('boss').hidden=true;
    musicMode=m.id==='dungeon'?'dungeon':'town';$('fade').classList.remove('on');G.state='play';
    banner(m.id==='dungeon'?'LABYRINTH OF RUIN':'FLOOR 1',m.id==='dungeon'?'Floor Guardian ahead':'Plains of Beginnings',m.id==='dungeon'?'#c58bff':'#7fe7ff');saveGame()},420)}
function travel(to){
  if(to==='dungeon'){if(P.lvl<5){toast('The air is heavy. Level 5 or higher is recommended.','bad')}G.dungeon=buildDungeon();switchMap(G.dungeon,22.5*TS,90*TS)}
  else{G.dungeon=null;switchMap(G.field,60.5*TS,13.6*TS)}}
function respawn(){
  $('death').hidden=true;const wasD=G.map.id==='dungeon';calc();P.hp=S.maxhp;P.inv_t=1.5;G.state='play';
  if(wasD){G.dungeon=null;G.party.forEach(a=>{G.map.E.ai=G.map.E.ai.filter(o=>o!==a);G.field.E.ai.push(a)});G.map=G.field;G.bossEnc=null;$('boss').hidden=true;musicMode='town'}
  P.x=60.5*TS;P.y=69*TS;P.vx=P.vy=0;P.swing=null;P.act=null;G.cam.x=P.x;G.cam.y=P.y;G.party.forEach(a=>{a.x=P.x+rnd(-20,20);a.y=P.y+rnd(-14,14)});saveGame()}
/* ----- HUD ----- */
const HC={};
function setT(id,v,prop){if(HC[id+(prop||'')]!==v){HC[id+(prop||'')]=v;$(id)[prop||'textContent']=v}}
function updateHud(){
  setT('pName',P.name);setT('pLv','Lv '+P.lvl);const f=clamp(P.hp/S.maxhp,0,1);$('hpFill').style.setProperty('--v',f);$('hpFill').className=f<.25?'bad':f<.5?'warn':'';
  setT('hpTxt',Math.ceil(P.hp)+' / '+S.maxhp);$('xpFill').style.setProperty('--v',P.lvl>=MAXLV?1:P.xp/NEED(P.lvl));
  const dn=G.map.id==='dungeon',tod=G.tod,hh=Math.floor(tod*24),mm=Math.floor((tod*24-hh)*60);
  setT('loc','<span>'+esc(G.map.name.toUpperCase())+'</span><small>'+(dn?'Dungeon':'Floor 1  ·  '+String(hh).padStart(2,'0')+':'+String(mm-mm%10).padStart(2,'0')+(inSafe(P.x,P.y)?'  ·  Safe zone':''))+'</small>','innerHTML');
  let tr='';const q=QUESTS.find(q=>qState(q.id).s===1);
  if(q)tr=qReady(q)?'Return to Guildmaster Arlen':q.n+': '+qProg(q)+' / '+q.c;else{const nx=nextQuest();tr=nx?(P.lvl>=nx.minLv?'Speak to Guildmaster Arlen in the plaza':'Reach level '+nx.minLv+' for the next quest'):'Explore Floor 1'}
  setT('track','▸ '+tr);
  const set=(id,cd,max,lock)=>{const b=$(id);b.style.setProperty('--p',cd>0?clamp(cd/max,0,1):0);b.classList.toggle('lock',!!lock);b.classList.toggle('rdy',cd<=0&&!lock)};
  set('b_atk',P.atkCd,.4);set('b_dodge',P.dodgeCd,.9);set('b_pot',P.potCd,6,false);SKILLS.forEach((s,i)=>set('b_s'+(i+1),P.cds[i],s.cd,P.lvl<s.lv));
  setT('potN',String(countItem('potionS')+countItem('potionM')+countItem('potionL')));
  const b=G.bossEnc;if(b){$('bossFill').style.setProperty('--v',clamp(b.hp/b.maxhp,0,1))}
  const n=nearestInteract(),pr=$('prompt');if(n&&!W.open&&$('dlg').hidden){pr.hidden=false;setT('prompt',(IS_TOUCH?'':'[E]  ')+n.txt)}else pr.hidden=true}
const IS_TOUCH=matchMedia('(pointer:coarse)').matches||('ontouchstart' in window&&innerWidth<900);
if(IS_TOUCH)$('app').classList.add('touch');
function drawMini(){
  const c=$('mini'),g=c.getContext('2d'),m=G.map,R=26,px=P.x/TS,py=P.y/TS,k=104/(R*2);
  g.imageSmoothingEnabled=false;g.fillStyle='#050d18';g.fillRect(0,0,104,104);
  const sx=px-R,sy=py-R;g.drawImage(m.mini,Math.max(0,sx),Math.max(0,sy),Math.min(R*2,m.w-Math.max(0,sx),R*2+Math.min(0,sx)),Math.min(R*2,m.h-Math.max(0,sy),R*2+Math.min(0,sy)),Math.max(0,-sx)*k,Math.max(0,-sy)*k,Math.min(R*2,m.w-Math.max(0,sx),R*2+Math.min(0,sx))*k,Math.min(R*2,m.h-Math.max(0,sy),R*2+Math.min(0,sy))*k);
  const dot=(x,y,col,s)=>{const dx=(x/TS-sx)*k,dy=(y/TS-sy)*k;if(dx<0||dy<0||dx>104||dy>104)return;g.fillStyle=col;g.fillRect(dx-s/2,dy-s/2,s,s)};
  m.E.en.forEach(e=>{if(!e.dead&&e.state!=='dormant')dot(e.x,e.y,e.boss?'#ff2a4a':'#ff6a6a',e.boss?6:3)});
  m.E.ai.forEach(a=>dot(a.x,a.y,a.party?'#7dff9a':'#7fe7ff',3));m.E.npc.forEach(n=>dot(n.x,n.y,'#ffd36a',4));
  if(m.id==='field')dot(60.5*TS,11.5*TS,'#c58bff',5);
  g.fillStyle='#fff';g.beginPath();const cx=(px-sx)*k,cy=(py-sy)*k;g.arc(cx,cy,3.2,0,7);g.fill()}
