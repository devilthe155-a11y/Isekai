/* ===== tiles & maps ===== */
const TS=16;
const TL={GRASS:0,FLOWER:1,PATH:2,WATER:3,TREE:4,ROCK:5,COBBLE:6,WALL:7,ROOF:8,DOOR:9,SAND:10,DFLOOR:11,DWALL:12,PORTAL:13,FENCE:14,BFLOOR:15,EXIT:16,LAMP:17,SEAL:18,FOUNT:19,ROOF2:20};
const SOLID=new Set([3,4,5,7,8,9,12,14,17,18,19,20]);
const MINI={0:'#3f8a46',1:'#3f8a46',2:'#b99764',3:'#2b6cb0',4:'#245e2a',5:'#7a7f89',6:'#9aa0aa',7:'#c9b79a',8:'#a94438',9:'#5a3b24',10:'#d9c58f',11:'#3a3f52',12:'#0d0f16',13:'#9b6bff',14:'#8a6a3a',15:'#6a3550',16:'#7fe7ff',17:'#ffd36a',18:'#ff5d73',19:'#4a90d6',20:'#3a5aa9'};
function paintTile(g,t,tx,ty){
  const X=tx*TS,Y=ty*TS,R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(X+x,Y+y,w,h)},h=i=>hash(tx,ty,i),fl=(i,m)=>Math.floor(h(i)*m);
  const grass=()=>{R(0,0,16,16,'#3f8a46');for(let i=0;i<6;i++)R(fl(i,15),fl(i+9,15),1,2,h(i+3)>.5?'#4aa052':'#357a3c')};
  const cobble=()=>{R(0,0,16,16,'#9aa0aa');R(0,0,16,1,'#868c97');R(0,8,16,1,'#868c97');R((ty&1)?4:12,0,1,8,'#868c97');R((ty&1)?12:4,8,1,8,'#868c97');if(h(5)>.7)R(fl(6,14),fl(7,14),2,1,'#b0b6c0')};
  const dfloor=()=>{R(0,0,16,16,'#3a3f52');R(0,0,16,1,'#2f3446');R(0,0,1,16,'#2f3446');if(h(3)>.6)R(fl(4,10),fl(5,14),5,1,'#2a2e3e');if(h(8)>.9)R(fl(9,12),fl(10,12),3,3,'#33384a')};
  switch(t){
    case 0:grass();break;
    case 1:{grass();const c=['#ffe066','#ff8fb1','#fff','#9fd0ff'][fl(20,4)];R(2+fl(21,11),2+fl(22,11),2,2,c);R(2+fl(23,11),2+fl(24,11),2,2,c);break}
    case 2:R(0,0,16,16,'#b99764');for(let i=0;i<8;i++)R(fl(i,14),fl(i+8,14),2,1,h(i+2)>.5?'#a88653':'#c8a876');break;
    case 3:R(0,0,16,16,'#2b6cb0');R(0,fl(1,14),6,1,'#4a90d6');R(8,fl(2,14),5,1,'#3b7fc4');break;
    case 4:grass();R(7,10,3,6,'#5a3b24');R(1,1,14,11,'#2e6b34');R(3,0,10,3,'#2e6b34');R(3,3,6,5,'#3a8a40');R(9,6,4,4,'#3a8a40');R(4,4,2,2,'#5ab058');break;
    case 5:grass();R(2,5,12,9,'#8a8f99');R(4,3,8,3,'#9aa0aa');R(3,6,4,2,'#aab0ba');R(2,12,12,2,'#6a6f79');break;
    case 6:cobble();break;
    case 7:R(0,0,16,16,'#cdbb9c');R(0,5,16,1,'#a8967a');R(0,11,16,1,'#a8967a');R((ty&1)?5:11,0,1,5,'#a8967a');R((ty&1)?11:5,6,1,5,'#a8967a');R((ty&1)?5:11,12,1,4,'#a8967a');break;
    case 8:case 20:{const rc=t===8?['#a94438','#8a3329','#c25448']:['#3a5aa9','#2c4688','#4e72c4'];R(0,0,16,16,rc[0]);R(0,0,16,2,rc[2]);R(0,7,16,1,rc[1]);R(0,14,16,2,rc[1]);for(let i=0;i<4;i++){R(i*4+(ty&1)*2,2,1,5,rc[1]);R(i*4+(1-(ty&1))*2,9,1,5,rc[1])}break}
    case 9:R(0,0,16,16,'#cdbb9c');R(3,2,10,14,'#5a3b24');R(4,3,8,13,'#6e4a2e');R(10,9,2,2,'#ffd36a');R(3,2,10,1,'#3a2514');break;
    case 10:R(0,0,16,16,'#d9c58f');for(let i=0;i<5;i++)R(fl(i,14),fl(i+5,14),2,1,'#c8b27a');break;
    case 11:dfloor();break;
    case 12:R(0,0,16,16,'#1b1e2b');R(0,0,16,3,'#2c3148');R(0,3,16,1,'#0f111a');R(0,8,16,1,'#141722');R((ty&1)?4:10,9,1,7,'#141722');break;
    case 13:R(0,0,16,16,'#241540');R(1,1,14,14,'#3a1f6a');R(4,4,8,8,'#6b3fc0');R(6,6,4,4,'#b48cff');break;
    case 14:grass();R(0,5,16,2,'#8a6a3a');R(0,10,16,2,'#8a6a3a');R(1,3,2,11,'#6e5230');R(13,3,2,11,'#6e5230');break;
    case 15:R(0,0,16,16,'#4a2f3a');R(0,0,16,1,'#3a2230');R(0,0,1,16,'#3a2230');if((tx+ty)%4===0){R(4,4,8,8,'#5a3a48');R(6,6,4,4,'#8a3b52')}break;
    case 16:R(0,0,16,16,'#13324a');R(1,1,14,14,'#1e5a80');R(4,4,8,8,'#4cc4e8');R(6,6,4,4,'#d8fbff');break;
    case 17:cobble();R(7,5,2,10,'#3a3f4a');R(5,2,6,4,'#ffd36a');R(6,3,4,2,'#fff6c0');break;
    case 18:dfloor();R(0,0,16,16,'#3a1020');R(1,1,14,14,'#6a1830');R(3,7,10,2,'#ff5d73');break;
    case 19:R(0,0,16,16,'#7a98bc');R(1,1,14,14,'#4a90d6');R(3,4+fl(1,3),5,1,'#9fd0ff');R(9,9+fl(2,3),4,1,'#9fd0ff');break;
  }
}
function newMap(id,w,h,name){return{id,w,h,name,t:new Uint8Array(w*h),lights:[],E:{en:[],npc:[],ai:[],proj:[],drop:[],fx:[],txt:[],tele:[]},safe:null,dark:false}}
const tAt=(m,x,y)=>(x<0||y<0||x>=m.w||y>=m.h)?TL.TREE:m.t[y*m.w+x];
const solidAt=(m,px,py)=>SOLID.has(tAt(m,Math.floor(px/TS),Math.floor(py/TS)));
function renderMap(m){
  m.cv=mk(m.w*TS,m.h*TS,g=>{for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)paintTile(g,m.t[y*m.w+x],x,y)});
  m.mini=mk(m.w,m.h,g=>{for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){g.fillStyle=MINI[m.t[y*m.w+x]];g.fillRect(x,y,1,1)}});
}
function setTile(m,x,y,t){m.t[y*m.w+x]=t;paintTile(m.cv.getContext('2d'),t,x,y);const g=m.mini.getContext('2d');g.fillStyle=MINI[t];g.fillRect(x,y,1,1)}
const inRect=(r,px,py)=>r&&px>=r.x0*TS&&px<(r.x1+1)*TS&&py>=r.y0*TS&&py<(r.y1+1)*TS;
const tc=(x,y)=>[(x+.5)*TS,(y+.5)*TS];

function buildField(){
  const W=120,H=90,m=newMap('field',W,H,'Plains of Beginnings'),t=m.t;
  const S=(x,y,v)=>{if(x>=0&&y>=0&&x<W&&y<H)t[y*W+x]=v},rect=(x0,y0,x1,y1,v)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)S(x,y,v)};
  const T={x0:44,y0:50,x1:76,y1:72};m.safe=T;m.town=T;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    let v=0;const n=fbm(x*.07,y*.07,3),f=fbm(x*.1+50,y*.1+20,9);
    if(n>.64)v=3;else if(n>.6)v=10;else if(f>.6)v=4;else if(hash(x,y,5)>.987)v=5;else if(hash(x,y,6)>.93)v=1;
    if(x<2||y<2||x>=W-2||y>=H-2)v=4;t[y*W+x]=v}
  rect(T.x0-4,T.y0-4,T.x1+4,T.y1+4,0);rect(T.x0,T.y0,T.x1,T.y1,6);
  for(let y=T.y0-1;y>=12;y--){const x=y<19?60:60+Math.round(Math.sin(y*.17)*5*Math.min(1,(y-14)/10));rect(x-1,y,x+1,y,2)}
  for(let x=T.x1+1;x<W-3;x++){const y=62+Math.round(Math.sin(x*.15)*3);rect(x,y-1,x,y+1,2)}
  for(let x=T.x0-1;x>=3;x--){const y=62+Math.round(Math.sin(x*.13+1)*3);rect(x,y-1,x,y+1,2)}
  for(let y=T.y1+1;y<H-3;y++){const x=60+Math.round(Math.sin(y*.2)*3);rect(x-1,y,x+1,y,2)}
  rect(56,8,64,10,5);rect(57,11,58,11,5);rect(62,11,63,11,5);rect(59,11,61,11,13);
  const house=(x,y,w,h,rt)=>{rect(x,y,x+w-1,y+1,rt);rect(x,y+2,x+w-1,y+h-1,7);S(x+(w>>1),y+h-1,9)};
  house(53,51,12,5,20);house(46,54,6,4,8);house(69,54,6,4,8);house(69,66,6,4,8);house(46,66,6,4,8);
  rect(59,61,61,63,19);
  [[53,60],[67,60],[53,65],[67,65],[57,57],[63,57],[48,62],[72,62]].forEach(([x,y])=>{S(x,y,17);m.lights.push({x:(x+.5)*TS,y:y*TS+4,r:64,c:'255,208,120'})});
  m.lights.push({x:60.5*TS,y:11.5*TS,r:60,c:'160,110,255'});
  renderMap(m);populateField(m);return m;
}
function buildDungeon(){
  const W=44,H=96,m=newMap('dungeon',W,H,'Labyrinth of Ruin'),t=m.t;m.dark=true;t.fill(12);
  const rect=(x0,y0,x1,y1,v)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)t[y*W+x]=v};
  const rooms=[[12,84,32,93],[8,66,36,77],[6,48,38,59],[10,36,34,45],[6,6,38,27]];m.rooms=rooms;
  rooms.forEach((r,i)=>rect(r[0],r[1],r[2],r[3],i===4?15:11));
  for(let i=0;i<4;i++)rect(21,rooms[i+1][3]+1,23,rooms[i][1]-1,11);
  for(let i=1;i<4;i++){const r=rooms[i];for(let k=0;k<9;k++){const x=ri(r[0]+2,r[2]-2),y=ri(r[1]+2,r[3]-2);if(x<19||x>25)rect(x,y,x,y,12)}}
  [[11,10],[31,10],[11,20],[31,20]].forEach(([x,y])=>rect(x,y,x+1,y+1,12));
  rect(21,92,23,92,16);
  rooms.forEach((r,i)=>{[[r[0]+1,r[1]],[r[2]-1,r[1]],[r[0]+1,r[3]],[r[2]-1,r[3]]].forEach(([x,y])=>m.lights.push({x:(x+.5)*TS,y:(y+.5)*TS,r:i===4?96:70,c:i===4?'255,90,90':'255,170,90'}))});
  m.lights.push({x:22.5*TS,y:16*TS,r:150,c:'255,60,80'});
  renderMap(m);populateDungeon(m);return m;
}
