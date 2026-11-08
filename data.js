/* ===== game data ===== */
const RC=['#c9d6df','#7dff9a','#6fc3ff','#c58bff'],RN=['Common','Uncommon','Rare','Epic'];
const ITEMS={
  potionS:{n:'Small Healing Crystal',t:'use',heal:60,price:25,rar:0,col:'#7dff9a',d:'Restores 60 HP.'},
  potionM:{n:'Healing Crystal',t:'use',heal:170,price:80,rar:1,col:'#6fc3ff',d:'Restores 170 HP.'},
  potionL:{n:'Greater Healing Crystal',t:'use',heal:420,price:230,rar:2,col:'#c58bff',d:'Restores 420 HP.'},
  jelly:{n:'Slime Jelly',t:'mat',price:6,rar:0,col:'#6fd36a',d:'Sticky and faintly sweet.'},
  hide:{n:'Boar Hide',t:'mat',price:12,rar:0,col:'#8a5a3a',d:'Thick and tough.'},
  pelt:{n:'Wolf Pelt',t:'mat',price:24,rar:1,col:'#9aa3af',d:'A soft grey pelt.'},
  ear:{n:'Goblin Ear',t:'mat',price:30,rar:0,col:'#6aa84f',d:'Proof of a goblin kill.'},
  core:{n:'Moss Core',t:'mat',price:70,rar:1,col:'#3a8a40',d:'Hums with old magic.'},
  bone:{n:'Old Bone',t:'mat',price:32,rar:0,col:'#e8e4d0',d:'From a Hollow Soldier.'},
  wing:{n:'Bat Wing',t:'mat',price:26,rar:0,col:'#6a4a7a',d:'Leathery and light.'},
  sword1:{n:'Iron Sword',t:'weapon',atk:6,req:1,price:80,rar:0,col:'#c9d6df',d:'A reliable starter blade.'},
  sword2:{n:'Steel Blade',t:'weapon',atk:13,req:4,price:380,rar:1,col:'#dfe9f2',d:'Balanced and sharp.'},
  sword3:{n:"Hunter's Saber",t:'weapon',atk:22,req:7,price:900,rar:1,col:'#7dff9a',d:'Favoured by wolf hunters.'},
  sword4:{n:'Moonlit Rapier',t:'weapon',atk:32,crit:4,req:10,price:2200,rar:2,col:'#6fc3ff',d:'Glows faintly in the dark.'},
  sword5:{n:'Gravelcrusher',t:'weapon',atk:46,req:12,price:6000,rar:3,col:'#c58bff',d:'Ripped from the Gravel King.'},
  arm1:{n:'Cloth Tunic',t:'armor',def:2,hp:10,req:1,price:40,rar:0,col:'#7a6a50',bc:'#2b3a55',d:'Light and plain.'},
  arm2:{n:'Leather Vest',t:'armor',def:5,hp:25,req:3,price:160,rar:0,col:'#8a5a3a',bc:'#6b4a2a',d:'Stitched wolf leather.'},
  arm3:{n:'Chain Coat',t:'armor',def:9,hp:50,req:6,price:520,rar:1,col:'#8a93a3',bc:'#7d8798',d:'Rings of dull steel.'},
  arm4:{n:"Knight's Plate",t:'armor',def:15,hp:90,req:9,price:1500,rar:2,col:'#c9d0dc',bc:'#b6bfd0',d:'Polished and heavy.'},
  arm5:{n:'Guardian Mail',t:'armor',def:22,hp:150,req:12,price:5000,rar:3,col:'#c58bff',bc:'#3a3f6c',d:'Worn by the floor guardian.'},
  acc1:{n:'Wolf Fang Charm',t:'acc',crit:6,req:5,price:420,rar:1,col:'#e8e4d0',d:'+6% crit chance.'},
  acc2:{n:'Ranger Boots',t:'acc',spd:12,req:5,price:480,rar:1,col:'#8a5a3a',d:'+12 move speed.'},
  acc3:{n:'Ring of Vigor',t:'acc',hp:90,req:8,price:900,rar:2,col:'#ff8fb1',d:'+90 max HP.'},
  acc4:{n:'Crown Shard',t:'acc',atk:8,crit:8,req:12,price:3000,rar:3,col:'#ffd36a',d:'+8 ATK, +8% crit.'}
};
Object.keys(ITEMS).forEach(k=>ITEMS[k].k=k);
const STACK=k=>ITEMS[k].t==='use'||ITEMS[k].t==='mat';
const GEARDROP=['sword2','sword3','sword4','arm2','arm3','arm4','acc1','acc2','acc3'];
const ENEMIES={
  slime:{n:'Slime',hp:28,atk:5,spd:26,r:5,xp:9,col:[2,6],lv:[1,3],ai:'hop',aggro:70,loot:[['jelly',.55],['potionS',.07]]},
  boar:{n:'Frenzy Boar',hp:62,atk:9,spd:30,r:6,xp:20,col:[4,9],lv:[3,5],ai:'charge',aggro:90,loot:[['hide',.5],['potionS',.1]]},
  wolf:{n:'Gale Wolf',hp:86,atk:12,spd:56,r:6,xp:34,col:[8,14],lv:[5,8],ai:'melee',aggro:110,loot:[['pelt',.5],['potionS',.12],['potionM',.04]]},
  archer:{n:'Goblin Archer',hp:70,atk:11,spd:36,r:5,xp:40,col:[10,18],lv:[7,10],ai:'ranged',aggro:140,loot:[['ear',.6],['potionM',.1]]},
  golem:{n:'Moss Golem',hp:230,atk:20,spd:22,r:8,xp:90,col:[25,40],lv:[9,12],ai:'melee',aggro:80,loot:[['core',.5],['potionM',.2]]},
  skel:{n:'Hollow Soldier',hp:130,atk:17,spd:40,r:5,xp:55,col:[14,24],lv:[10,12],ai:'melee',aggro:130,loot:[['bone',.5],['potionM',.15]]},
  bat:{n:'Cave Bat',hp:50,atk:10,spd:72,r:4,xp:30,col:[8,14],lv:[10,12],ai:'bat',aggro:140,loot:[['wing',.4],['potionS',.1]]},
  boss:{n:'Gravel King',hp:6500,atk:38,spd:30,r:13,xp:1200,col:[400,400],lv:[12,12],ai:'boss',aggro:9999,loot:[]}
};
const SKILLS=[
  {id:'leap',n:'Sonic Leap',lv:2,cd:5,d:'Dash forward and strike for 170% damage.'},
  {id:'crescent',n:'Crescent Wave',lv:4,cd:4.5,d:'Fire a piercing slash for 150% damage.'},
  {id:'storm',n:'Blade Storm',lv:7,cd:9,d:'Spin and hit every nearby foe three times, 270% total.'},
  {id:'ascend',n:'Ascension',lv:10,cd:20,d:'Gather power, then unleash a 560% burst.'}
];
const QUESTS=[
  {id:'q1',n:'First Steps',d:'Slimes are multiplying outside the city. Defeat 5 of them.',t:'kill',k:'slime',c:5,minLv:1,rw:{xp:60,col:100,items:[['potionS',3]]}},
  {id:'q2',n:'Fur and Fangs',d:'Bring me 4 Wolf Pelts. Gale Wolves roam east and north of the city.',t:'item',k:'pelt',c:4,minLv:4,rw:{xp:200,col:250,items:[['arm2',1],['potionS',3]]}},
  {id:'q3',n:'Arrows in the Dark',d:'Goblin archers are ambushing travellers on the northern road. Defeat 6.',t:'kill',k:'archer',c:6,minLv:7,rw:{xp:420,col:450,items:[['sword2',1],['potionM',3]]}},
  {id:'q4',n:'The Floor Guardian',d:'The Labyrinth lies at the end of the northern road. Defeat the Gravel King to open the way to Floor 2.',t:'kill',k:'boss',c:1,minLv:9,rw:{xp:1500,col:1500,items:[['potionL',3]]}}
];
const SHOPS={
  mira:{n:'Merchant Mira',stock:['potionS','potionM','potionL']},
  doran:{n:'Smith Doran',stock:['sword1','sword2','arm1','arm2','arm3','acc1','acc2']}
};
const AINAMES=['Rinko','Sol_Fox','TankMaster99','Hikari','Noct','Kuroba','PiyoPiyo','Veyra','MageTomo','Ryuu','Fenn','Lilac'];
const CHATTER=['LF party for the floor boss','anyone selling wolf pelts?','this boar hits like a truck','finally level up!','the logout button is still gone...','who keeps stealing my slimes lol','heading north, need a tank','Mira has healing crystals in stock','gg on the boss run','dodge the red circles, they hurt','anyone know where the labyrinth is?','just stay on the road and follow the lamps','my sword broke my heart and my wallet','Floor 2 when??','night is coming, careful out there'];
const TIPS=['Welcome to Arcadia, newcomer. Move with the left stick or WASD. Attack with J, or tap the big button.','Dodge with K. You are invincible for a moment while rolling, so use it when you see red.','Open the MENU to spend stat points. STR hits harder, AGI is speed and crits, VIT is HP and defence, INT boosts skills.','Guildmaster Arlen is in the big blue-roofed hall. He pays well. Mira sells potions, Doran sells gear.','The Labyrinth is far to the north, past the road. The guardian there will not be gentle.'];
/* ===== global state ===== */
const G={state:'title',map:null,field:null,dungeon:null,party:[],time:0,tod:.32,shake:0,cam:{x:0,y:0},zoom:3,dpr:1,vw:0,vh:0,flash:0,bossEnc:null,saveT:0,chatT:8,msgs:0};
let P=null,S=null;
const NEED=l=>Math.floor(30*Math.pow(l,1.5)),MAXLV=20;
function newPlayer(name){return{name,x:0,y:0,vx:0,vy:0,ang:Math.PI/2,lvl:1,xp:0,pts:0,str:5,agi:5,vit:5,int:5,col:50,hp:180,
  inv:Array(30).fill(null),eq:{weapon:'sword1',armor:'arm1',acc:null},q:{},kills:0,
  atkCd:0,combo:0,comboT:0,swing:null,dodgeT:0,dodgeCd:0,inv_t:0,potCd:0,cds:[0,0,0,0],act:null,anim:0,moving:false,hurtT:0,r:5,bossKills:0};}
function calc(){
  const w=P.eq.weapon&&ITEMS[P.eq.weapon],a=P.eq.armor&&ITEMS[P.eq.armor],c=P.eq.acc&&ITEMS[P.eq.acc],sum=k=>(w&&w[k]||0)+(a&&a[k]||0)+(c&&c[k]||0),pn=G.party.length;
  S={maxhp:Math.round(100+P.vit*12+P.lvl*10+sum('hp')),atk:(5+P.str*2+P.lvl+sum('atk'))*(1+pn*.08),def:P.vit*.8+sum('def'),crit:.05+P.agi*.006+sum('crit')/100,spd:70+P.agi*.6+sum('spd'),skl:1+P.int*.03};
  if(P.hp>S.maxhp)P.hp=S.maxhp;
}
function addItem(id,n){n=n||1;
  if(STACK(id)){const s=P.inv.find(x=>x&&x.id===id);if(s){s.n+=n;return true}}
  const i=P.inv.findIndex(x=>!x);if(i<0)return false;P.inv[i]={id,n:STACK(id)?n:1};
  if(!STACK(id)&&n>1)for(let k=1;k<n;k++)addItem(id,1);return true}
function countItem(id){return P.inv.reduce((s,x)=>s+(x&&x.id===id?x.n:0),0)}
function takeItem(id,n){for(let i=0;i<P.inv.length&&n>0;i++){const s=P.inv[i];if(s&&s.id===id){const t=Math.min(n,s.n);s.n-=t;n-=t;if(s.n<=0)P.inv[i]=null}}}
function equipFromInv(i){const s=P.inv[i];if(!s)return;const it=ITEMS[s.id];if(!['weapon','armor','acc'].includes(it.t))return;
  if(it.req>P.lvl){toast('Requires level '+it.req,'bad');return}
  const slot=it.t,old=P.eq[slot];P.eq[slot]=s.id;P.inv[i]=old?{id:old,n:1}:null;calc();sfx('click');saveGame()}
function unequip(slot){const id=P.eq[slot];if(!id)return;if(!addItem(id,1)){toast('Inventory full','bad');return}P.eq[slot]=null;calc();sfx('click');saveGame()}
function qState(id){return P.q[id]||(P.q[id]={s:0,p:0})}
function qProg(q){const st=qState(q.id);return q.t==='item'?Math.min(q.c,countItem(q.k)):Math.min(q.c,st.p)}
function qReady(q){return qState(q.id).s===1&&qProg(q)>=q.c}
function onKillQuest(kind){QUESTS.forEach(q=>{const st=qState(q.id);if(st.s===1&&q.t==='kill'&&q.k===kind&&st.p<q.c){st.p++;if(st.p>=q.c){toast('Quest ready: '+q.n,'loot');sfx('pick')}}})}
function nextQuest(){for(const q of QUESTS){if(qState(q.id).s!==3)return q}return null}
function gainXp(n){if(P.lvl>=MAXLV)return;P.xp+=n;let up=false;while(P.lvl<MAXLV&&P.xp>=NEED(P.lvl)){P.xp-=NEED(P.lvl);P.lvl++;P.pts+=3;up=true}
  if(up){calc();P.hp=S.maxhp;sfx('level');banner('LEVEL UP','You are now level '+P.lvl+'  ·  +3 stat points','#ffd36a');flashFx();addFx({k:'ring',x:P.x,y:P.y,r:6,gr:90,t:0,max:.7,col:'#ffd36a'});
    const un=SKILLS.find(s=>s.lv===P.lvl);if(un)toast('New skill: '+un.n,'loot');chat('System','Level up! You reached level '+P.lvl+'.','sys')}}
const SAVEKEY='arcadia-link-v1';
function saveGame(){if(!P)return;try{localStorage.setItem(SAVEKEY,JSON.stringify({name:P.name,lvl:P.lvl,xp:P.xp,pts:P.pts,str:P.str,agi:P.agi,vit:P.vit,int:P.int,col:P.col,inv:P.inv,eq:P.eq,q:P.q,kills:P.kills,bossKills:P.bossKills}))}catch(e){}}
function loadSave(){try{const s=JSON.parse(localStorage.getItem(SAVEKEY));return s&&s.lvl?s:null}catch(e){return null}}
function applySave(s){Object.assign(P,s);if(!Array.isArray(P.inv)||P.inv.length!==30)P.inv=Array(30).fill(null);calc();P.hp=S.maxhp}
