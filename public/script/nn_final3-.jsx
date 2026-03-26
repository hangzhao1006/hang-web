const { useState, useRef, useEffect, useCallback } = React;

const MC={A:{r:200,g:170,b:120},B:{r:130,g:175,b:155},C:{r:155,g:145,b:185},AB:{r:170,g:172,b:135},AC:{r:178,g:158,b:152},BC:{r:142,g:160,b:170},ABC:{r:210,g:195,b:145},F:{r:215,g:195,b:140},T:{r:175,g:170,b:162}};
const SA_C={THU:null,Cornell:{r:180,g:40,b:40},Harvard:{r:200,g:170,b:100},MIT:{r:100,g:180,b:200}};

const CW=1400,CH=820;

// ═══ STAGE X POSITIONS (horizontal = layer, like ResNet) ═══
const SX={
  0: 65,      // Token Embedding
  1: 230,     // Unimodal Encoder
  2: 400,     // Repr h_i
  2.5: 480,   // Co-TRM
  3: 600,     // Cross-Modal courses
  3.5: 780,   // Concat
  4: 880,     // Transformer / Fusion courses
  4.5: 980,   // Add&Norm
  5: -1,      // Projects: branched from main, positioned dynamically
  6: 1100,    // Skills
};

// Within each stage column, nodes sorted by time (early=top, late=bottom)
// Time ordering key
const TIME_ORDER={
  "20a":0,"20b":1,"21a":2,"21b":3,"22a":4,"22b":5,
  "23f":6,"24s":7,"24b":8,"25a":9,"25b":10,"25f":11,"26s":12,
};
const TIME_LABEL={
  0:"2020",1:"",2:"2021",3:"",4:"2022",5:"",6:"2023",7:"2024",8:"",9:"2025",10:"",11:"",12:"2026"
};

// ═══ ALL NODES ═══
const N=[];
function add(id,l,tm,st,mod,sch,extra){N.push({id,l,tm,st,mod,sch,tOrd:TIME_ORDER[tm]??99,...extra})}

// S0: Token Embedding — sorted by time within each modality band
// Mod A (2020-2021)
add("a01","Form Study","20a",0,"A","THU");
add("a02","Visual Lang I","20a",0,"A","THU");
add("a03","Visual Lang II","20a",0,"A","THU");
add("a04","3D Fundmntl","20a",0,"A","THU");
add("a05","CN Art Hist","20a",0,"A","THU");
add("a06","Arts&Crafts","20a",0,"A","THU");
add("a07","Calligraphy","20b",0,"A","THU");
add("a08","Foreign Art","20b",0,"A","THU");
add("a09","Western Dsgn","20b",0,"A","THU");
add("a10","Color Paint","20b",0,"A","THU");
add("a11","Forming I","20b",0,"A","THU");
add("a12","Seal Carving","21a",0,"A","THU");
add("a13","Dye Pattern","21a",0,"A","THU");
add("a14","Color Textile","21a",0,"A","THU");
add("a15","Textile Hist","21a",0,"A","THU");
add("a16","Textile Mat","21a",0,"A","THU");
add("a17","Print&Dye I","21a",0,"A","THU");
add("a18","Logo Design","21b",0,"A","THU");
add("a19","Embroidery","21b",0,"A","THU");
add("a20","Weaving Tech","21b",0,"A","THU");
add("a21","Print&Dye II","21b",0,"A","THU");
add("a22","Weaving","21b",0,"A","THU");
// Mod B (2023 Cornell — late entry)
add("b01","Intro Computing","23f",0,"B","Cornell");
add("b02","Dsgn&Prog Web","23f",0,"B","Cornell");
// Mod C (2022 — mid entry)
add("c01","Accounting","22a",0,"C","THU");
add("c02","Econ I","22a",0,"C","THU");
add("c03","Econ II","22b",0,"C","THU");
add("c04","China Econ","22b",0,"C","THU");

// S1: Unimodal Encoder
// Mod A
add("e-arch","Cultural Arch","22a",1,"A","THU");
add("e-video","Video&Audio","22a",1,"A","THU");
add("e-creative","Creative Think","22a",1,"A","THU");
add("e-film","Language Film","22a",1,"A","THU");
add("e-exhib","Exhibition","22b",1,"A","THU");
add("e-newmed","New Media Art","22b",1,"A","THU");
add("e-method","Methodology","24b",1,"A","THU");
add("e-dsgnpsy","Design Psych","24b",1,"A","THU");
add("e-display","Display Dsgn","25a",1,"A","THU");
add("e-prosem","Proseminar","25f",1,"A","Harvard");
// Mod B
add("e-iface","Interface Dsgn","24b",1,"B","THU");
add("e-ixt1","Ix Tech I","24b",1,"B","THU");
add("e-web","Design Web","24b",1,"B","THU");
add("e-smart","Smart Space","24b",1,"B","THU");
add("e-ixt2","Ix Tech II","24b",1,"B","THU");
add("e-usab","Usability","24b",1,"B","THU");
add("e-infod1","InfoDsgn AIGC","24b",1,"AB","THU");
add("e-ubiq","Ubiquitous Tech","25a",1,"B","THU");
// Mod C
add("c05","Financial Rpt","23f",1,"C","Cornell");
add("e-micro","Micro Econ","25a",1,"C","THU");
add("e-macro","Macro Econ","25a",1,"C","THU");
add("e-corpfin","Corp Finance","25a",1,"C","THU");
add("e-invest","Investment","25b",1,"C","THU");
add("e-cpp","C++ Prog","25b",1,"C","THU");

// S2: Repr
add("hA","h_A","repr",2,"A",null,{type:"repr"});
add("hB","h_B","repr",2,"B",null,{type:"repr"});
add("hC","h_C","repr",2,"C",null,{type:"repr"});

// S2.5: Co-TRM structural
add("st-coAB","Co-TRM A↔B","cotrm",2.5,"AB",null,{type:"struct"});
add("st-coBC","Co-TRM B↔C","cotrm",2.5,"BC",null,{type:"struct"});
add("st-coAC","Co-TRM A↔C","cotrm",2.5,"AC",null,{type:"struct"});

// S3: Cross-Modal courses (sorted by time)
add("x01","Dynamic Infogfx","22a",3,"AB","THU");
add("x02","InfoDesign&Art","22a",3,"AB","THU");
add("x03","Prototyping","22b",3,"AB","THU");
add("x04","UI Foundation","22b",3,"AB","THU");
add("x14","Info Gfx Dsgn","22b",3,"AC","THU");
add("x05","HCI Studio","23f",3,"AB","Cornell");
add("x06","IxD Studio","24s",3,"AB","Cornell");
add("x07","Intermed Web","24s",3,"AB","Cornell");
add("x16","Intro DataSci","24s",3,"BC","Cornell");
add("x08","Ix Design I","24b",3,"AB","THU");
add("x09","Comp Train II","25a",3,"AB","THU");
add("x10","Prof Practice","25a",3,"AB","THU");
add("x11","Ix Design II","25a",3,"AB","THU");
add("x12","InfoDsgn TD","25a",3,"AB","THU");
add("x17","Cog Psychology","25b",3,"BC","THU");
add("x13","Digital Prod","25f",3,"AB","Harvard");
add("x15","Quant Aesthetics","25f",3,"AC","Harvard");
add("x18","Adv DataSci","25f",3,"BC","Harvard");
add("x19","Biomech Move","26s",3,"BC","Harvard");
add("x20","Mobile Sensor","26s",3,"BC","MIT");

// S3.5: Concat
add("st-cat","Concat+Proj","cat",3.5,"F",null,{type:"struct"});

// S4: Transformer / high fusion
add("st-sa","Self-Attention","trm",4,"T",null,{type:"struct"});
add("st-ffn","FFN","trm",4,"T",null,{type:"struct"});
add("t-diploma","Diploma Thesis","25b",4,"ABC","THU");
add("t-mlalgo","ML Algo→Apps","26s",4,"ABC","MIT");
add("t-physml","Physics ML","26s",4,"ABC","MIT");
add("t-media","Media Tech","26s",4,"ABC","MIT");

// S4.5: Add&Norm
add("st-an","Add & Norm","an",4.5,"T",null,{type:"struct"});

// S5: Projects — positioned as SIDE BRANCHES from main backbone
// x = between the stage of their source courses and the next stage
// y = near their source courses' y position
add("o-tide","TideEcho","22b",5,"AB","THU",{yr:2022,srcStage:0});
add("o-seepal","SeePal","23f",5,"AB","THU",{yr:2023,srcStage:1});
add("o-shadow","ShadowPlay","24s",5,"AB","THU",{yr:2024,srcStage:3});
add("o-ehoura","Ehoura","24b",5,"AB","THU",{yr:2024,srcStage:3});
add("o-seren","SerenEcho","25a",5,"AB","THU",{yr:2025,srcStage:3});
add("o-symbio","Symbiophony","25a",5,"AB","THU",{yr:2025,srcStage:3});
add("o-tuch","Tuchsure","25b",5,"ABC","THU",{yr:2025,srcStage:4});
add("o-skin","SkinMe","25b",5,"BC","THU",{yr:2025,srcStage:3});
add("o-light","LightScale","25b",5,"A","THU",{yr:2025,srcStage:1});
add("o-pgmoe","PG-MoE","26s",5,"BC","Harvard",{yr:2026,srcStage:4});
add("o-audeate","Audeate","26s",5,"ABC","Harvard",{yr:2026,srcStage:4});

// S6: Skills
const SKS=["Multimodal AI","ML Systems","Edge AI","Embedded Sensing","Physical Comp",
  "Full-Stack Proto","Human-AI Ix","Interaction Dsgn","Tangible Interface","Info Viz",
  "UX Research","Data-Driven Dsgn","Quant Analysis","System Thinking","Wearable Proto",
  "Research→Proto","Creative Coding","Sensor Fusion"];
const SKM=["ABC","BC","BC","BC","AB","ABC","AB","AB","AB","AC","AB","AC","C","ABC","AB","ABC","AB","BC"];
SKS.forEach((s,i)=>add("s"+String(i).padStart(2,"0"),s,"skill",6,SKM[i],null));

// ═══ POSITION ALL NODES ═══
(function(){
  // Modality Y ranges per stage
  const MY={A:[48,380],B:[410,560],C:[590,710]};
  const CROSS_Y={AB:[50,380],AC:[400,450],BC:[470,660],ABC:[350,550]};

  // Group by stage + base modality
  const groups={};
  N.forEach(n=>{
    if(n.st===5||n.st===6||n.type==="repr"||n.type==="struct"||(n.st===4&&!n.type))return;
    const baseMod=n.mod.length<=2?n.mod:n.mod[0];
    const key=n.st+"|"+baseMod;
    (groups[key]||(groups[key]=[])).push(n);
  });

  // Sort each group by time, then position
  Object.entries(groups).forEach(([key,arr])=>{
    arr.sort((a,b)=>(a.tOrd-b.tOrd));
    const st=parseFloat(key.split("|")[0]);
    const mod=key.split("|")[1];
    const x=SX[st]||600;
    const yRange=mod.length>1?CROSS_Y[mod]||CROSS_Y.AB:MY[mod]||MY.A;
    arr.forEach((n,i)=>{
      n.x=x;
      n.y=arr.length<=1?(yRange[0]+yRange[1])/2:yRange[0]+(yRange[1]-yRange[0])*i/(arr.length-1);
    });
  });

  // Repr nodes
  const f=id=>N.find(n=>n.id===id);
  f("hA").x=SX[2];f("hA").y=200;
  f("hB").x=SX[2];f("hB").y=480;
  f("hC").x=SX[2];f("hC").y=650;

  // Struct nodes
  f("st-coAB").x=SX[2.5];f("st-coAB").y=340;
  f("st-coBC").x=SX[2.5];f("st-coBC").y=560;
  f("st-coAC").x=SX[2.5];f("st-coAC").y=450;
  f("st-cat").x=SX[3.5];f("st-cat").y=420;

  // S4: courses on TOP, structural below
  const s4Courses=N.filter(n=>n.st===4&&!n.type);
  s4Courses.sort((a,b)=>a.tOrd-b.tOrd);
  s4Courses.forEach((n,i)=>{n.x=SX[4];n.y=280+i*55});
  // Diploma Thesis y=280, ML Algo y=335, Physics ML y=390, Media Tech y=445
  f("st-sa").x=SX[4];f("st-sa").y=530;
  f("st-ffn").x=SX[4]+5;f("st-ffn").y=590;
  f("st-an").x=SX[4.5];f("st-an").y=560;

  // Skills: evenly distributed full height
  const sk=N.filter(n=>n.st===6);
  sk.forEach((s,i)=>{s.x=SX[6];s.y=50+i*(CH-120)/(sk.length-1)});

  // ═══ PROJECTS as side branches ═══
  // Each project branches DOWN from the backbone at its source stage x position
  // x = between source stage and next stage (offset right)
  // y = below the main modality bands (720+)
  const projs=N.filter(n=>n.st===5);
  projs.sort((a,b)=>a.tOrd-b.tOrd);
  // Project x based on source stage, spread horizontally
  const projXBase={0:120,1:300,3:660,4:950};
  let projIdx=0;
  const projXUsed={};
  projs.forEach(p=>{
    const baseX=projXBase[p.srcStage]||660;
    const offsetKey=Math.round(baseX/50);
    projXUsed[offsetKey]=(projXUsed[offsetKey]||0);
    p.x=baseX+projXUsed[offsetKey]*65;
    p.y=745;
    projXUsed[offsetKey]++;
  });
})();

const nMap=Object.fromEntries(N.map(n=>[n.id,n]));

// ═══ SELF-ATTENTION ═══
const SELF_ATT=[
  ["a01","a02",0.8],["a02","a03",0.9],["a01","a04",0.7],["a10","a14",0.8],
  ["a07","a12",0.85],["a13","a17",0.9],["a20","a22",0.9],["a19","a20",0.7],
  ["a16","a15",0.75],["a05","a08",0.8],["a06","a09",0.8],["a11","a04",0.7],
  ["b01","b02",0.9],["c01","c02",0.7],["c02","c03",0.95],
  ["e-video","e-film",0.9],["e-exhib","e-display",0.85],["e-creative","e-newmed",0.6],
  ["e-infod1","e-method",0.8],["e-ixt1","e-ixt2",0.95],["e-iface","e-web",0.8],
  ["e-smart","e-ubiq",0.85],["e-usab","e-iface",0.7],["e-ixt2","e-ubiq",0.8],
  ["e-micro","e-macro",0.9],["e-corpfin","e-invest",0.85],
  ["x01","x02",0.85],["x03","x04",0.8],["x05","x06",0.9],["x08","x11",0.95],
  ["x11","x12",0.75],["x14","x15",0.7],["x16","x18",0.85],["x18","x20",0.7],
  ["x19","x20",0.75],["t-mlalgo","t-physml",0.9],["t-mlalgo","t-media",0.7],
];

// ═══ EDGES ═══
const E=[];
let _s=42;function sr(){_s=((_s*1103515245+12345)&0x7fffffff);return _s/0x7fffffff}

// S0→S1 same modality, time-forward
N.filter(n=>n.st===0).forEach(t=>{
  const tg=N.filter(e=>e.st===1&&(e.mod===t.mod||e.mod.includes(t.mod))&&e.tOrd>=t.tOrd);
  [...tg].sort(()=>sr()-0.5).slice(0,Math.min(2,tg.length)).forEach(e=>E.push([t.id,e.id]));
});
// S1→repr
N.filter(n=>n.st===1).forEach(e=>{
  if(e.mod==="A"||e.mod==="AB")E.push([e.id,"hA"]);
  if(e.mod==="B"||e.mod==="AB")E.push([e.id,"hB"]);
  if(e.mod==="C")E.push([e.id,"hC"]);
});
// repr→cotrm
E.push(["hA","st-coAB"],["hB","st-coAB"],["hB","st-coBC"],["hC","st-coBC"],["hA","st-coAC"],["hC","st-coAC"]);
// cotrm→S3
N.filter(n=>n.st===3&&n.mod==="AB").forEach(n=>E.push(["st-coAB",n.id]));
N.filter(n=>n.st===3&&n.mod==="BC").forEach(n=>E.push(["st-coBC",n.id]));
N.filter(n=>n.st===3&&n.mod==="AC").forEach(n=>E.push(["st-coAC",n.id]));
// S3→concat
N.filter(n=>n.st===3).forEach(n=>E.push([n.id,"st-cat"]));
// concat→trm struct
E.push(["st-cat","st-sa"],["st-sa","st-ffn"],["st-ffn","st-an"]);
// concat→S4 courses
N.filter(n=>n.st===4&&!n.type).forEach(n=>{E.push(["st-cat",n.id]);E.push([n.id,"st-an"])});
// Skip connections
E.push(["hA","st-an"],["hC","st-an"],["st-cat","st-an"]);
// addnorm→late outputs
N.filter(n=>n.st===5&&(n.yr||0)>=2025).forEach(n=>E.push(["st-an",n.id]));
// Early outputs branch from nearby same-stage courses
N.filter(n=>n.st===5&&(n.yr||0)<2025).forEach(o=>{
  const srcSt=o.srcStage;
  const near=N.filter(n=>n.st===srcSt&&!n.type&&[...o.mod].some(m=>n.mod.includes(m)));
  near.sort((a,b)=>Math.abs(a.tOrd-o.tOrd)-Math.abs(b.tOrd-o.tOrd)).slice(0,3).forEach(n=>E.push([n.id,o.id]));
});
// Mid outputs (2025, srcStage 3) branch from S3
N.filter(n=>n.st===5&&(n.yr||0)===2025&&n.srcStage===3).forEach(o=>{
  const near=N.filter(n=>n.st===3&&[...o.mod].some(m=>n.mod.includes(m)));
  near.sort((a,b)=>Math.abs(a.tOrd-o.tOrd)-Math.abs(b.tOrd-o.tOrd)).slice(0,2).forEach(n=>E.push([n.id,o.id]));
});
// S5→S6
N.filter(n=>n.st===5).forEach(o=>{
  N.filter(s=>s.st===6&&[...o.mod].some(m=>s.mod.includes(m))).sort(()=>sr()-0.5).slice(0,3).forEach(s=>E.push([o.id,s.id]));
});
// Long skips
["e-ubiq","e-ixt2","e-prosem","e-cpp"].forEach(id=>{
  N.filter(n=>n.st===4&&!n.type).forEach(t=>E.push([id,t.id]));
});

const skipSet=new Set(["hA→st-an","hC→st-an","st-cat→st-an",...["e-ubiq","e-ixt2","e-prosem","e-cpp"].flatMap(id=>N.filter(n=>n.st===4&&!n.type).map(t=>id+"→"+t.id))]);

function trace(id){
  const fw={},bw={};
  E.forEach(([a,b])=>{(fw[a]||(fw[a]=[])).push(b);(bw[b]||(bw[b]=[])).push(a)});
  const ns=new Set(),es=new Set();
  const f=i=>{if(ns.has(i))return;ns.add(i);(fw[i]||[]).forEach(n=>{es.add(i+"→"+n);f(n)})};
  const b=i=>{if(ns.has(i))return;ns.add(i);(bw[i]||[]).forEach(n=>{es.add(n+"→"+i);b(n)})};
  b(id);ns.delete(id);f(id);
  const saN={};
  SELF_ATT.forEach(([a,b,w])=>{
    if(ns.has(a)||a===id){saN[b]=Math.max(saN[b]||0,w)}
    if(ns.has(b)||b===id){saN[a]=Math.max(saN[a]||0,w)}
  });
  return{ns,es,saN};
}

function NNSelfAttn(){
  const cvs=useRef(null);const[act,setAct]=useState(null);const[hov,setHov]=useState(null);const[tip,setTip]=useState(null);
  const pts=useRef([]);const raf=useRef(null);const td=useRef({ns:new Set(),es:new Set(),saN:{}});const amb=useRef(null);const tm=useRef(0);
  const dpr=typeof window!=='undefined'?(window.devicePixelRatio||1):1;

  const spawn=useCallback(ed=>{const r=[];ed.forEach(e=>{const[a,b]=e.split("→");const f=nMap[a],t=nMap[b];if(f&&t&&f.x&&t.x)for(let i=0;i<2;i++)r.push({fx:f.x,fy:f.y,tx:t.x,ty:t.y,t:Math.random()*0.3,sp:0.002+Math.random()*0.003,sz:0.3+Math.random()*0.9,al:true})});pts.current=r},[]);
  const hit=useCallback((mx,my)=>{for(const n of N){if(!n.x)return null;const dx=mx-n.x,dy=my-n.y;const r=n.type==="struct"?22:n.type==="repr"?16:n.st===0?5:n.st===6?16:n.st===5?13:11;if(dx*dx+dy*dy<(r+5)*(r+5))return n}return null},[]);
  const oc=useCallback(e=>{const r=cvs.current.getBoundingClientRect();const n=hit((e.clientX-r.left)*(CW/r.width),(e.clientY-r.top)*(CH/r.height));if(n&&n.id!==act){setAct(n.id);const d=trace(n.id);td.current=d;spawn(d.es)}else{setAct(null);td.current={ns:new Set(),es:new Set(),saN:{}};pts.current=[]}},[act,spawn,hit]);
  const om=useCallback(e=>{const r=cvs.current.getBoundingClientRect();const n=hit((e.clientX-r.left)*(CW/r.width),(e.clientY-r.top)*(CH/r.height));setHov(n?n.id:null);setTip(n?{x:e.clientX-r.left+12,y:e.clientY-r.top-30,n}:null);cvs.current.style.cursor=n?'pointer':'default'},[hit]);

  useEffect(()=>{
    const c=cvs.current,ctx=c.getContext("2d");c.width=CW*dpr;c.height=CH*dpr;ctx.scale(dpr,dpr);
    if(!amb.current){amb.current=[];for(let i=0;i<150;i++)amb.current.push({x:Math.random()*CW,y:Math.random()*CH,vx:(Math.random()-0.5)*0.04,vy:(Math.random()-0.5)*0.02,sz:Math.random()*0.7,al:0.03+Math.random()*0.1})}
    function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}

    function draw(){
      tm.current+=0.016;ctx.fillStyle="#0b0b0b";ctx.fillRect(0,0,CW,CH);
      const ha=act!==null;const{ns:aN,es:aE,saN}=td.current;

      // Grid
      ctx.fillStyle="rgba(255,255,255,0.005)";for(let x=10;x<CW;x+=20)for(let y=10;y<CH;y+=20){ctx.beginPath();ctx.arc(x,y,0.2,0,Math.PI*2);ctx.fill()}
      // Ambient
      if(!ha)amb.current.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=CW;if(p.x>CW)p.x=0;if(p.y<0)p.y=CH;if(p.y>CH)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.sz,0,Math.PI*2);ctx.fillStyle=`rgba(190,175,130,${p.al})`;ctx.fill()});

      // ═══ STAGE LABELS (top) — like ResNet layer labels ═══
      ctx.save();ctx.font="600 8px 'SF Mono','Menlo',monospace";ctx.textAlign="center";ctx.fillStyle="rgba(255,255,255,0.3)";
      [{x:SX[0],t:"Token Embed"},{x:SX[1],t:"Unimodal Enc"},{x:SX[2],t:"Repr h_i"},{x:SX[2.5],t:"Co-TRM"},{x:SX[3],t:"Cross-Modal"},{x:SX[3.5],t:"Concat"},{x:SX[4],t:"TRM (×N)"},{x:SX[4.5],t:"Add&Norm"},{x:SX[6],t:"Skill Readout"}].forEach(lb=>{
        ctx.fillText(lb.t,lb.x,22);
      });
      // Vertical column lines
      ctx.strokeStyle="rgba(255,255,255,0.03)";ctx.lineWidth=0.3;
      Object.values(SX).filter(x=>x>0).forEach(x=>{ctx.beginPath();ctx.moveTo(x,30);ctx.lineTo(x,720);ctx.stroke()});
      ctx.restore();

      // ═══ MODALITY BANDS ═══
      [{y:40,h:345,c:MC.A,l:"A · Art & Design"},{y:400,h:170,c:MC.B,l:"B · Tech & HCI"},{y:585,h:130,c:MC.C,l:"C · Econ & Compute"}].forEach(b=>{
        ctx.fillStyle=`rgba(${b.c.r},${b.c.g},${b.c.b},0.006)`;ctx.fillRect(30,b.y,SX[6]-60,b.h);
        ctx.save();ctx.font="500 6px 'SF Mono',monospace";ctx.fillStyle=`rgba(${b.c.r},${b.c.g},${b.c.b},0.12)`;
        ctx.textAlign="left";ctx.fillText(b.l,35,b.y+11);ctx.restore();
      });
      // Project row
      ctx.fillStyle="rgba(215,195,140,0.004)";ctx.fillRect(30,725,SX[6]-60,65);
      ctx.save();ctx.font="500 6px 'SF Mono',monospace";ctx.fillStyle="rgba(215,195,140,0.08)";
      ctx.textAlign="left";ctx.fillText("OUTPUT · Projects (branched from backbone)",35,737);ctx.restore();

      // ═══ TIME INDICATORS (small, inside S0 column) ═══
      ctx.save();ctx.font="400 5px 'SF Mono',monospace";ctx.textAlign="right";
      N.filter(n=>n.st===0&&n.mod==="A").forEach(n=>{
        const lbl=TIME_LABEL[n.tOrd];
        if(lbl){ctx.fillStyle="rgba(255,255,255,0.1)";ctx.fillText(lbl,n.x-12,n.y+2)}
      });
      ctx.restore();

      // ═══ SA ARCS ═══
      SELF_ATT.forEach(([a,b,w])=>{
        const na=nMap[a],nb=nMap[b];if(!na||!nb||!na.x||!nb.x)return;
        const aIn=aN.has(a)||a===act;const bIn=aN.has(b)||b===act;
        const both=ha&&aIn&&bIn;const one=ha&&(aIn||bIn)&&!both;const dim=ha&&!both&&!one;
        const cc=MC[na.mod]||MC.A;
        const sameX=Math.abs(na.x-nb.x)<30;
        ctx.beginPath();
        if(sameX){ctx.moveTo(na.x+4,na.y);ctx.quadraticCurveTo(na.x+18+w*12,(na.y+nb.y)/2,nb.x+4,nb.y)}
        else{const my=Math.min(na.y,nb.y)-6-w*5;ctx.moveTo(na.x,na.y);ctx.quadraticCurveTo((na.x+nb.x)/2,my,nb.x,nb.y)}
        if(dim){ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},0.003)`;ctx.lineWidth=0.04}
        else if(both){ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${0.2+w*0.45})`;ctx.lineWidth=0.5+w*2}
        else if(one){ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${0.04+w*0.1})`;ctx.lineWidth=0.15+w*0.5}
        else{ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${0.01+w*0.05})`;ctx.lineWidth=0.1+w*0.45}
        ctx.stroke();
      });

      // ═══ FLOW EDGES ═══
      E.forEach(([a,b])=>{
        const f=nMap[a],t=nMap[b];if(!f||!t||!f.x||!t.x)return;
        const ek=a+"→"+b;const ia=aE.has(ek);const sk=skipSet.has(ek);const cc=MC[f.mod]||MC.T;
        const isToProj=t.st===5;
        ctx.beginPath();
        if(sk){ctx.moveTo(f.x,f.y);ctx.quadraticCurveTo((f.x+t.x)/2,f.y<350?30:CH-30,t.x,t.y);ctx.setLineDash([3,3])}
        else if(isToProj){
          // Branch DOWN to project row
          ctx.moveTo(f.x,f.y);ctx.bezierCurveTo(f.x,f.y+30,t.x,t.y-30,t.x,t.y);ctx.setLineDash([2,2]);
        }
        else{const dx=t.x-f.x;ctx.moveTo(f.x,f.y);ctx.bezierCurveTo(f.x+dx*0.35,f.y,t.x-dx*0.35,t.y,t.x,t.y);ctx.setLineDash([])}
        if(ha){ctx.strokeStyle=ia?`rgba(${cc.r},${cc.g},${cc.b},${sk?0.4:isToProj?0.25:0.15})`:"rgba(255,255,255,0.003)";ctx.lineWidth=ia?(sk?0.8:isToProj?0.5:0.35):0.04}
        else{ctx.strokeStyle=sk?"rgba(210,190,140,0.04)":isToProj?"rgba(215,195,140,0.03)":"rgba(255,255,255,0.018)";ctx.lineWidth=sk?0.4:0.18}
        ctx.stroke();ctx.setLineDash([]);
      });

      // Particles
      pts.current.forEach(p=>{p.t+=p.sp;if(p.t>=1){p.al=false;return}const t=p.t,mt=1-t,dx=p.tx-p.fx;const c1=p.fx+dx*0.35,c2=p.tx-dx*0.35;const px=mt*mt*mt*p.fx+3*mt*mt*t*c1+3*mt*t*t*c2+t*t*t*p.tx;const py=mt*mt*mt*p.fy+3*mt*mt*t*p.fy+3*mt*t*t*p.ty+t*t*t*p.ty;const al=Math.sin(t*Math.PI);ctx.beginPath();ctx.arc(px,py,p.sz+1.5,0,Math.PI*2);ctx.fillStyle=`rgba(210,195,130,${al*0.07})`;ctx.fill();ctx.beginPath();ctx.arc(px,py,p.sz,0,Math.PI*2);ctx.fillStyle=`rgba(240,225,165,${al*0.75})`;ctx.fill()});
      pts.current=pts.current.filter(p=>p.al);
      if(ha&&pts.current.length<50){aE.forEach(e=>{if(Math.random()<0.03){const[a,b]=e.split("→");const f=nMap[a],t=nMap[b];if(f&&t&&f.x&&t.x)pts.current.push({fx:f.x,fy:f.y,tx:t.x,ty:t.y,t:0,sp:0.002+Math.random()*0.003,sz:0.3+Math.random()*0.8,al:true})}})}

      // ═══ NODES ═══
      N.forEach(n=>{
        if(!n.x)return;
        const cc=MC[n.mod]||MC.T;const ia=ha&&(aN.has(n.id)||n.id===act);const ih=n.id===hov;
        const sw=ha?saN[n.id]||0:0;const dim=ha&&!ia&&sw===0;const isSA=ha&&!ia&&sw>0;
        ctx.globalAlpha=dim?0.04:isSA?(0.15+sw*0.55):1;
        const fa=ih?0.75:ia?0.5:isSA?(0.1+sw*0.45):0.18;const sa=n.sch?SA_C[n.sch]:null;

        if(n.type==="repr"){
          rr(n.x-22,n.y-8,44,16,4);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fa*0.8})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.03:0.28})`;ctx.lineWidth=0.4;ctx.stroke();
          for(let i=0;i<40;i+=2.5){const v=0.04+0.1*Math.sin(tm.current*2+i*0.3+n.y*0.01);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${v})`;ctx.fillRect(n.x-20+i,n.y-6,1.5,12)}
          ctx.font="500 7px 'SF Mono',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.03:0.4})`;ctx.textAlign="center";ctx.fillText(n.l,n.x,n.y+20);
        }else if(n.type==="struct"){
          const tw=n.l.length*3.2+18,th=15;rr(n.x-tw/2,n.y-th/2,tw,th,3);
          ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},0.04)`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.02:0.12})`;ctx.lineWidth=0.4;
          if(!n.id.includes("an"))ctx.setLineDash([2,2]);ctx.stroke();ctx.setLineDash([]);
          ctx.font="500 5.5px 'SF Mono',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.03:0.35})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y);
          if(n.id==="st-an"){ctx.font="600 10px monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},0.1)`;ctx.fillText("+",n.x+tw/2+8,n.y)}
        }else if(n.st===0){
          ctx.beginPath();ctx.arc(n.x,n.y,2.8,0,Math.PI*2);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fa*1.2})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.04:0.3})`;ctx.lineWidth=0.2;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.25)`;ctx.lineWidth=0.4;ctx.stroke()}
        }else if(n.st===1){
          rr(n.x-24,n.y-6,48,12,2);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fa*0.65})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.03:0.18})`;ctx.lineWidth=0.25;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.2)`;ctx.lineWidth=0.35;ctx.stroke()}
          if(ih||ia){ctx.font="500 4px 'SF Mono',monospace";ctx.fillStyle=`rgba(255,255,255,${ih?0.8:0.5})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y)}
        }else if(n.st===3){
          rr(n.x-30,n.y-6,60,12,2);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fa*0.55})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.03:0.14})`;ctx.lineWidth=0.25;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.18)`;ctx.lineWidth=0.35;ctx.stroke()}
          ctx.font="500 3.5px 'SF Mono',monospace";ctx.fillStyle=`rgba(255,255,255,${dim?0.03:(ih?0.7:0.28)})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y);
        }else if(n.st===4&&!n.type){
          rr(n.x-32,n.y-10,64,20,3);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fa*0.55})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.03:0.12})`;ctx.lineWidth=0.35;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.25)`;ctx.lineWidth=0.5;ctx.stroke()}
          ctx.font="500 4.5px 'SF Mono',monospace";ctx.fillStyle=`rgba(255,255,255,${dim?0.03:(ih?0.8:0.45)})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y);
        }else if(n.st===5){
          // Project hexagons in the branch row
          ctx.beginPath();for(let i=0;i<6;i++){const ang=Math.PI/3*i-Math.PI/6;ctx.lineTo(n.x+10*Math.cos(ang),n.y+10*Math.sin(ang))}ctx.closePath();
          ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fa*1.1})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.03:0.3})`;ctx.lineWidth=0.35;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.25)`;ctx.lineWidth=0.5;ctx.stroke()}
          ctx.font="500 5.5px 'SF Mono',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.03:0.55})`;ctx.textAlign="center";ctx.fillText(n.l,n.x,n.y-15);
          if(n.yr){ctx.font="400 4.5px 'SF Mono',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.02:0.2})`;ctx.fillText(n.yr,n.x,n.y+18)}
        }else if(n.st===6){
          rr(n.x-40,n.y-6,80,12,2);ctx.fillStyle="rgba(255,255,255,0.008)";ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.02:0.06})`;ctx.lineWidth=0.2;ctx.stroke();
          ctx.font="500 4.5px 'SF Mono',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.03:0.3})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y);
        }
        if((ia||ih)&&!dim){ctx.beginPath();ctx.arc(n.x,n.y,15,0,Math.PI*2);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},0.04)`;ctx.fill()}
        ctx.globalAlpha=1;
      });

      // Skip labels
      ctx.save();ctx.font="400 5px 'SF Mono',monospace";ctx.fillStyle="rgba(200,170,120,0.08)";ctx.textAlign="center";
      ctx.fillText("residual skip (h_A)",700,28);ctx.fillStyle="rgba(155,145,185,0.08)";ctx.fillText("residual skip (h_C)",700,CH-35);ctx.restore();

      // Footer
      ctx.save();ctx.font="400 5px 'SF Mono',monospace";ctx.fillStyle="rgba(255,255,255,0.05)";
      ctx.textAlign="left";ctx.fillText("Tsinghua · Cornell · Harvard GSD · MIT — 2020–2026",15,CH-6);
      ctx.textAlign="right";ctx.fillText("Multimodal Transformer · Curriculum Architecture · Time-ordered within layers",CW-15,CH-6);
      ctx.restore();

      raf.current=requestAnimationFrame(draw);
    }
    draw();return()=>cancelAnimationFrame(raf.current);
  },[act,hov,dpr]);

  return React.createElement("div",{style:{position:"relative"}},
    React.createElement("canvas",{ref:cvs,onClick:oc,onMouseMove:om,onMouseLeave:()=>{setHov(null);setTip(null)},style:{width:"100%",minWidth:1000,height:"auto",aspectRatio:CW+"/"+CH,display:"block",borderRadius:8,cursor:"default"}}),
    tip&&React.createElement("div",{style:{position:"absolute",left:Math.min(tip.x,CW-160),top:Math.max(tip.y,0),background:"rgba(14,14,14,0.96)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:4,padding:"5px 10px",pointerEvents:"none",zIndex:10,backdropFilter:"blur(12px)"}},
      React.createElement("div",{style:{color:"rgba(220,200,145,0.92)",fontSize:9,fontWeight:500}},tip.n.l),
      React.createElement("div",{style:{color:"rgba(255,255,255,0.28)",fontSize:7,marginTop:2}},(tip.n.sch||"")+(tip.n.sch?" · ":"")+(tip.n.yr?"Project "+tip.n.yr:"Stage "+tip.n.st)+" · "+tip.n.mod)),
    React.createElement("div",{style:{display:"flex",gap:10,marginTop:10,flexWrap:"wrap",alignItems:"center"}},
      [{l:"THU",c:"rgba(255,255,255,0.18)"},{l:"Cornell",c:"rgba(180,40,40,0.5)"},{l:"Harvard",c:"rgba(200,170,100,0.5)"},{l:"MIT",c:"rgba(100,180,200,0.5)"}].map(s=>React.createElement("span",{key:s.l,style:{display:"flex",alignItems:"center",gap:3,fontSize:7,color:"rgba(255,255,255,0.18)"}},React.createElement("span",{style:{width:5,height:5,borderRadius:1,background:s.c,display:"inline-block"}}),s.l)),
      React.createElement("span",{style:{marginLeft:"auto",fontSize:5.5,color:"rgba(255,255,255,0.1)"}},"○ token · ▭ enc · ▬ repr · ⌒ self-attn · ⬡ output · ╌ skip"))
  );
}

window.NNSelfAttn = NNSelfAttn;
