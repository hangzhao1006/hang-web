const { useState, useRef, useEffect, useCallback } = React;

const MC={A:{r:200,g:170,b:120},B:{r:130,g:175,b:155},C:{r:155,g:145,b:185},AB:{r:170,g:172,b:135},AC:{r:178,g:158,b:152},BC:{r:142,g:160,b:170},ABC:{r:210,g:195,b:145},F:{r:215,g:195,b:140},T:{r:175,g:170,b:162}};
const SA_C={THU:null,Cornell:{r:180,g:40,b:40},Harvard:{r:200,g:170,b:100},MIT:{r:100,g:180,b:200}};

// ═══ NODES ═══
const N=[
  // STAGE 0 — Mod A
  {id:"a01",l:"Form Study",x:55,y:44,st:0,mod:"A",sch:"THU"},
  {id:"a02",l:"Visual Lang I",x:55,y:53,st:0,mod:"A",sch:"THU"},
  {id:"a03",l:"Visual Lang II",x:55,y:62,st:0,mod:"A",sch:"THU"},
  {id:"a04",l:"3D Fundmntl",x:55,y:71,st:0,mod:"A",sch:"THU"},
  {id:"a05",l:"CN Art Hist",x:55,y:80,st:0,mod:"A",sch:"THU"},
  {id:"a06",l:"Arts&Crafts",x:55,y:89,st:0,mod:"A",sch:"THU"},
  {id:"a07",l:"Calligraphy",x:55,y:98,st:0,mod:"A",sch:"THU"},
  {id:"a08",l:"Foreign Art",x:55,y:107,st:0,mod:"A",sch:"THU"},
  {id:"a09",l:"Western Dsgn",x:55,y:116,st:0,mod:"A",sch:"THU"},
  {id:"a10",l:"Color Paint",x:55,y:125,st:0,mod:"A",sch:"THU"},
  {id:"a11",l:"Forming I",x:55,y:134,st:0,mod:"A",sch:"THU"},
  {id:"a12",l:"Seal Carving",x:55,y:143,st:0,mod:"A",sch:"THU"},
  {id:"a13",l:"Dye Pattern",x:55,y:152,st:0,mod:"A",sch:"THU"},
  {id:"a14",l:"Color Textile",x:55,y:161,st:0,mod:"A",sch:"THU"},
  {id:"a15",l:"Textile Hist",x:55,y:170,st:0,mod:"A",sch:"THU"},
  {id:"a16",l:"Textile Mat",x:55,y:179,st:0,mod:"A",sch:"THU"},
  {id:"a17",l:"Print&Dye I",x:55,y:188,st:0,mod:"A",sch:"THU"},
  {id:"a18",l:"Logo Design",x:55,y:197,st:0,mod:"A",sch:"THU"},
  {id:"a19",l:"Embroidery",x:55,y:206,st:0,mod:"A",sch:"THU"},
  {id:"a20",l:"Weaving Tech",x:55,y:215,st:0,mod:"A",sch:"THU"},
  {id:"a21",l:"Print&Dye II",x:55,y:224,st:0,mod:"A",sch:"THU"},
  {id:"a22",l:"Weaving",x:55,y:233,st:0,mod:"A",sch:"THU"},
  // Mod B
  {id:"b01",l:"Intro Comp",x:55,y:285,st:0,mod:"B",sch:"Cornell"},
  {id:"b02",l:"Dsgn&Prog Web",x:55,y:310,st:0,mod:"B",sch:"Cornell"},
  // Mod C
  {id:"c01",l:"Accounting",x:55,y:380,st:0,mod:"C",sch:"THU"},
  {id:"c02",l:"Econ I",x:55,y:396,st:0,mod:"C",sch:"THU"},
  {id:"c03",l:"Econ II",x:55,y:412,st:0,mod:"C",sch:"THU"},
  {id:"c04",l:"China Econ",x:55,y:428,st:0,mod:"C",sch:"THU"},

  // STAGE 1 — Mod A
  {id:"e-arch",l:"Cultural Arch",x:185,y:48,st:1,mod:"A",sch:"THU"},
  {id:"e-video",l:"Video&Audio",x:185,y:61,st:1,mod:"A",sch:"THU"},
  {id:"e-creative",l:"Creative Think",x:185,y:74,st:1,mod:"A",sch:"THU"},
  {id:"e-film",l:"Language Film",x:185,y:87,st:1,mod:"A",sch:"THU"},
  {id:"e-exhib",l:"Exhibition Dsgn",x:185,y:100,st:1,mod:"A",sch:"THU"},
  {id:"e-charh",l:"Char Dsgn Hist",x:185,y:113,st:1,mod:"A",sch:"THU"},
  {id:"e-newmed",l:"New Media Art",x:185,y:126,st:1,mod:"A",sch:"THU"},
  {id:"e-infod1",l:"InfoDsgn I AIGC",x:185,y:139,st:1,mod:"AB",sch:"THU"},
  {id:"e-method",l:"Methodology Info",x:185,y:152,st:1,mod:"A",sch:"THU"},
  {id:"e-dsgnpsy",l:"Design Psych",x:185,y:165,st:1,mod:"A",sch:"THU"},
  {id:"e-paint",l:"Painting&View",x:185,y:178,st:1,mod:"A",sch:"THU"},
  {id:"e-socio",l:"Design Socio",x:185,y:191,st:1,mod:"A",sch:"THU"},
  {id:"e-display",l:"Display Dsgn",x:185,y:204,st:1,mod:"A",sch:"THU"},
  {id:"e-survey",l:"Special Survey",x:185,y:217,st:1,mod:"A",sch:"THU"},
  {id:"e-train1",l:"Comp Train I",x:185,y:230,st:1,mod:"A",sch:"THU"},
  {id:"e-prosem",l:"Proseminar MED",x:185,y:245,st:1,mod:"A",sch:"Harvard"},
  // Mod B
  {id:"e-mfg",l:"Manufacturing",x:185,y:275,st:1,mod:"B",sch:"THU"},
  {id:"e-iface",l:"Interface Dsgn",x:185,y:288,st:1,mod:"B",sch:"THU"},
  {id:"e-ixt1",l:"Ix Tech I",x:185,y:301,st:1,mod:"B",sch:"THU"},
  {id:"e-web",l:"Design Web",x:185,y:314,st:1,mod:"B",sch:"THU"},
  {id:"e-smart",l:"Smart Space",x:185,y:327,st:1,mod:"B",sch:"THU"},
  {id:"e-ixt2",l:"Ix Tech II",x:185,y:340,st:1,mod:"B",sch:"THU"},
  {id:"e-usab",l:"Usability Eng",x:185,y:353,st:1,mod:"B",sch:"THU"},
  {id:"e-btpie",l:"Innovation&Ent",x:185,y:366,st:1,mod:"B",sch:"THU"},
  {id:"e-ubiq",l:"Ubiquitous Tech",x:185,y:379,st:1,mod:"B",sch:"THU"},
  // Mod C
  {id:"e-finrpt",l:"Financial Rpt",x:185,y:410,st:1,mod:"C",sch:"Cornell"},
  {id:"e-micro",l:"Intermed Micro",x:185,y:423,st:1,mod:"C",sch:"THU"},
  {id:"e-macro",l:"Intermed Macro",x:185,y:436,st:1,mod:"C",sch:"THU"},
  {id:"e-econth",l:"Econ Thought",x:185,y:449,st:1,mod:"C",sch:"THU"},
  {id:"e-corpfin",l:"Corp Finance",x:185,y:462,st:1,mod:"C",sch:"THU"},
  {id:"e-polecon",l:"Political Econ",x:185,y:475,st:1,mod:"C",sch:"THU"},
  {id:"e-invest",l:"Investment",x:185,y:488,st:1,mod:"C",sch:"THU"},
  {id:"e-cpp",l:"C++ Programming",x:185,y:501,st:1,mod:"C",sch:"THU"},

  // STAGE 2 — Repr
  {id:"hA",l:"h_A",x:300,y:140,st:2,mod:"A",type:"repr"},
  {id:"hB",l:"h_B",x:300,y:325,st:2,mod:"B",type:"repr"},
  {id:"hC",l:"h_C",x:300,y:455,st:2,mod:"C",type:"repr"},

  // STRUCTURAL — Co-TRM
  {id:"st-coAB",l:"Co-TRM A↔B",x:370,y:225,st:2.5,mod:"AB",type:"struct"},
  {id:"st-coBC",l:"Co-TRM B↔C",x:370,y:395,st:2.5,mod:"BC",type:"struct"},
  {id:"st-coAC",l:"Co-TRM A↔C",x:370,y:310,st:2.5,mod:"AC",type:"struct"},

  // STAGE 3 — Cross-modal courses
  // AB
  {id:"x01",l:"Dynamic Infogfx",x:445,y:155,st:3,mod:"AB",sch:"THU"},
  {id:"x02",l:"InfoDesign&Art",x:445,y:170,st:3,mod:"AB",sch:"THU"},
  {id:"x03",l:"Prototyping Dsgn",x:445,y:185,st:3,mod:"AB",sch:"THU"},
  {id:"x04",l:"UI Foundation",x:445,y:200,st:3,mod:"AB",sch:"THU"},
  {id:"x05",l:"HCI Studio",x:445,y:215,st:3,mod:"AB",sch:"Cornell"},
  {id:"x06",l:"IxD Studio",x:445,y:230,st:3,mod:"AB",sch:"Cornell"},
  {id:"x07",l:"Intermed WebDev",x:445,y:245,st:3,mod:"AB",sch:"Cornell"},
  {id:"x08",l:"Ix Design I",x:445,y:260,st:3,mod:"AB",sch:"THU"},
  {id:"x09",l:"Comp Train II",x:445,y:275,st:3,mod:"AB",sch:"THU"},
  {id:"x10",l:"Prof Practice",x:445,y:290,st:3,mod:"AB",sch:"THU"},
  {id:"x11",l:"Ix Design II",x:445,y:305,st:3,mod:"AB",sch:"THU"},
  {id:"x12",l:"InfoDsgn II TD",x:445,y:320,st:3,mod:"AB",sch:"THU"},
  {id:"x13",l:"Digital Prod",x:445,y:335,st:3,mod:"AB",sch:"Harvard"},
  // AC
  {id:"x14",l:"Info Gfx Dsgn",x:445,y:360,st:3,mod:"AC",sch:"THU"},
  {id:"x15",l:"Quant Aesthetics",x:445,y:375,st:3,mod:"AC",sch:"Harvard"},
  // BC
  {id:"x16",l:"Intro DataSci",x:445,y:405,st:3,mod:"BC",sch:"Cornell"},
  {id:"x17",l:"Cognitive Psych",x:445,y:420,st:3,mod:"BC",sch:"THU"},
  {id:"x18",l:"Adv DataSci",x:445,y:435,st:3,mod:"BC",sch:"Harvard"},
  {id:"x19",l:"Biomech Move",x:445,y:450,st:3,mod:"BC",sch:"Harvard"},
  {id:"x20",l:"Mobile Sensor",x:445,y:465,st:3,mod:"BC",sch:"MIT"},

  // STRUCTURAL — Concat
  {id:"st-concat",l:"Concat + Proj",x:545,y:320,st:3.5,mod:"F",type:"struct"},

  // STRUCTURAL — Transformer internals
  {id:"st-selfattn",l:"Self-Attention",x:635,y:290,st:4,mod:"T",type:"struct"},
  {id:"st-ffn",l:"FFN",x:635,y:335,st:4,mod:"T",type:"struct"},
  {id:"st-addnorm",l:"Add & Norm",x:635,y:375,st:4,mod:"T",type:"struct"},

  // STAGE 4 — Real courses
  {id:"t01",l:"Diploma Thesis",x:710,y:275,st:4,mod:"ABC",sch:"THU"},
  {id:"t02",l:"ML Algo→Apps",x:710,y:310,st:4,mod:"ABC",sch:"MIT"},
  {id:"t03",l:"Physics ML",x:710,y:345,st:4,mod:"ABC",sch:"MIT"},
  {id:"t04",l:"Media Tech",x:710,y:380,st:4,mod:"ABC",sch:"MIT"},

  // STAGE 5 — Outputs
  {id:"o01",l:"Audeate",x:810,y:165,st:5,mod:"ABC",sch:"Harvard"},
  {id:"o02",l:"Tuchsure",x:810,y:220,st:5,mod:"AB",sch:"THU"},
  {id:"o03",l:"PG-MoE",x:810,y:275,st:5,mod:"BC",sch:"Harvard"},
  {id:"o04",l:"SerenEcho",x:810,y:330,st:5,mod:"AB",sch:"THU"},
  {id:"o05",l:"SeePal",x:810,y:385,st:5,mod:"AB",sch:"THU"},
  {id:"o06",l:"TideEcho",x:810,y:430,st:5,mod:"AB",sch:"THU"},
  {id:"o07",l:"SkinMe",x:810,y:480,st:5,mod:"BC",sch:"THU"},

  // STAGE 6 — Skills
  {id:"s01",l:"Multimodal AI",x:930,y:55,st:6,mod:"ABC"},
  {id:"s02",l:"ML Systems",x:930,y:82,st:6,mod:"BC"},
  {id:"s03",l:"Edge AI",x:930,y:109,st:6,mod:"BC"},
  {id:"s04",l:"Embedded Sensing",x:930,y:136,st:6,mod:"BC"},
  {id:"s05",l:"Physical Comp",x:930,y:163,st:6,mod:"AB"},
  {id:"s06",l:"Full-Stack Proto",x:930,y:190,st:6,mod:"ABC"},
  {id:"s07",l:"Human-AI Ix",x:930,y:217,st:6,mod:"AB"},
  {id:"s08",l:"Interaction Dsgn",x:930,y:244,st:6,mod:"AB"},
  {id:"s09",l:"Tangible Interface",x:930,y:271,st:6,mod:"AB"},
  {id:"s10",l:"Info Viz",x:930,y:298,st:6,mod:"AC"},
  {id:"s11",l:"UX Research",x:930,y:325,st:6,mod:"AB"},
  {id:"s12",l:"Data-Driven Dsgn",x:930,y:352,st:6,mod:"AC"},
  {id:"s13",l:"Quant Analysis",x:930,y:379,st:6,mod:"C"},
  {id:"s14",l:"System Thinking",x:930,y:406,st:6,mod:"ABC"},
  {id:"s15",l:"Wearable Proto",x:930,y:433,st:6,mod:"AB"},
  {id:"s16",l:"Research→Proto",x:930,y:460,st:6,mod:"ABC"},
  {id:"s17",l:"Creative Coding",x:930,y:487,st:6,mod:"AB"},
  {id:"s18",l:"Sensor Fusion",x:930,y:510,st:6,mod:"BC"},
];

// Support adapters
const SUP=[
  {id:"sup-write",l:"Writing&Comm",x:170,y:93,mod:"A",near:"e-film"},
  {id:"sup-music",l:"Culture Music",x:170,y:82,mod:"A",near:"e-creative"},
  {id:"sup-zhuang",l:"Zhuangzi",x:40,y:104,mod:"A",near:"a07"},
  {id:"sup-oracle",l:"Oracle Bone",x:40,y:148,mod:"A",near:"a12"},
  {id:"sup-energy",l:"Energy&Society",x:40,y:404,mod:"C",near:"c02"},
  {id:"sup-infolit",l:"Info Literacy",x:170,y:359,mod:"B",near:"e-usab"},
  {id:"sup-rw",l:"Reading&Writing",x:460,y:310,mod:"A",near:"x11"},
];

const ALL_N=[...N,...SUP.map(s=>({...s,st:-1,type:"support"}))];
const nMap=Object.fromEntries(ALL_N.map(n=>[n.id,n]));

// ═══ SELF-ATTENTION ARCS ═══
// [idA, idB, weight] — bidirectional, drawn as arcs within same stage column
const SELF_ATT=[
  // Stage 0 A
  ["a01","a02",0.8],["a02","a03",0.9],["a01","a04",0.7],["a10","a14",0.8],
  ["a07","a12",0.85],["a13","a17",0.9],["a21","a17",0.8],["a20","a22",0.9],
  ["a19","a20",0.7],["a16","a15",0.75],["a05","a08",0.8],["a06","a09",0.8],
  ["a11","a04",0.7],["a18","a07",0.5],
  // Stage 0 B
  ["b01","b02",0.9],
  // Stage 0 C
  ["c01","c02",0.7],["c02","c03",0.95],["c03","c04",0.6],
  // Stage 1 A
  ["e-video","e-film",0.9],["e-film","e-newmed",0.75],["e-exhib","e-display",0.85],
  ["e-creative","e-newmed",0.6],["e-arch","e-exhib",0.7],["e-charh","e-method",0.5],
  ["e-infod1","e-method",0.8],["e-dsgnpsy","e-socio",0.75],["e-paint","e-display",0.5],
  ["e-survey","e-train1",0.8],["e-prosem","e-newmed",0.6],
  // Stage 1 B
  ["e-ixt1","e-ixt2",0.95],["e-iface","e-web",0.8],["e-smart","e-ubiq",0.85],
  ["e-usab","e-iface",0.7],["e-mfg","e-ubiq",0.5],["e-ixt2","e-ubiq",0.8],
  // Stage 1 C
  ["e-micro","e-macro",0.9],["e-corpfin","e-invest",0.85],["e-corpfin","e-finrpt",0.8],
  ["e-econth","e-polecon",0.75],["e-invest","e-finrpt",0.7],
  // Stage 3 AB
  ["x01","x02",0.85],["x03","x04",0.8],["x05","x06",0.9],["x08","x11",0.95],
  ["x12","x01",0.7],["x07","x04",0.65],["x09","x10",0.8],["x13","x03",0.6],
  ["x11","x12",0.75],
  // Stage 3 AC
  ["x14","x15",0.7],
  // Stage 3 BC
  ["x16","x18",0.85],["x17","x19",0.6],["x18","x20",0.7],["x19","x20",0.75],
  // Stage 4
  ["t01","t04",0.6],["t02","t03",0.9],["t02","t04",0.7],
];

// ═══ FLOW EDGES ═══
const E=[];

// Helper: seeded pseudo-random for deterministic connections
let _seed=42;
function srand(){_seed=((_seed*1103515245+12345)&0x7fffffff);return _seed/0x7fffffff}

// Stage 0 → 1
N.filter(n=>n.st===0).forEach(t=>{
  const targets=N.filter(e=>e.st===1&&(e.mod===t.mod||e.mod.includes(t.mod)));
  const k=Math.min(2,targets.length);
  const sorted=[...targets].sort(()=>srand()-0.5);
  sorted.slice(0,k).forEach(e=>E.push([t.id,e.id]));
});

// Stage 1 → h_i
N.filter(n=>n.st===1).forEach(e=>{
  if(e.mod==="A"||e.mod==="AB")E.push([e.id,"hA"]);
  if(e.mod==="B"||e.mod==="AB")E.push([e.id,"hB"]);
  if(e.mod==="C")E.push([e.id,"hC"]);
});

// h_i → Co-TRM
E.push(["hA","st-coAB"],["hB","st-coAB"],["hB","st-coBC"],["hC","st-coBC"],["hA","st-coAC"],["hC","st-coAC"]);

// Co-TRM → stage 3
N.filter(n=>n.st===3&&n.mod==="AB").forEach(n=>E.push(["st-coAB",n.id]));
N.filter(n=>n.st===3&&n.mod==="BC").forEach(n=>E.push(["st-coBC",n.id]));
N.filter(n=>n.st===3&&n.mod==="AC").forEach(n=>E.push(["st-coAC",n.id]));

// Stage 3 → Concat
N.filter(n=>n.st===3).forEach(n=>E.push([n.id,"st-concat"]));

// Concat → struct transformer
E.push(["st-concat","st-selfattn"],["st-selfattn","st-ffn"],["st-ffn","st-addnorm"]);

// Concat → real stage 4
N.filter(n=>n.st===4&&!n.type).forEach(n=>{E.push(["st-concat",n.id]);E.push([n.id,"st-addnorm"])});

// RESNET SKIP CONNECTIONS
E.push(["hA","st-addnorm"],["hC","st-addnorm"],["st-concat","st-addnorm"]);

// addnorm → outputs
N.filter(n=>n.st===5).forEach(n=>E.push(["st-addnorm",n.id]));

// Output → Skills
N.filter(n=>n.st===5).forEach(o=>{
  const targets=N.filter(s=>s.st===6&&[...o.mod].some(m=>s.mod.includes(m)));
  [...targets].sort(()=>srand()-0.5).slice(0,4).forEach(s=>E.push([o.id,s.id]));
});

// Skip: some advanced stage-1 → stage-4
["e-ubiq","e-ixt2","e-prosem","e-cpp"].forEach(id=>{
  N.filter(n=>n.st===4&&!n.type).forEach(t=>E.push([id,t.id]));
});

// Support
SUP.forEach(s=>E.push([s.id,s.near]));

// Identify special edges
const skipIds=new Set(["hA→st-addnorm","hC→st-addnorm","st-concat→st-addnorm",
  ...["e-ubiq","e-ixt2","e-prosem","e-cpp"].flatMap(id=>N.filter(n=>n.st===4&&!n.type).map(t=>id+"→"+t.id))]);

function trace(id){
  const fwd={},bwd={};
  E.forEach(([a,b])=>{(fwd[a]||(fwd[a]=[])).push(b);(bwd[b]||(bwd[b]=[])).push(a)});
  // Also include self-attention neighbors
  SELF_ATT.forEach(([a,b])=>{(fwd[a]||(fwd[a]=[])).push(b);(bwd[b]||(bwd[b]=[])).push(a);(fwd[b]||(fwd[b]=[])).push(a);(bwd[a]||(bwd[a]=[])).push(b)});
  const ns=new Set(),es=new Set();
  const f=i=>{if(ns.has(i))return;ns.add(i);(fwd[i]||[]).forEach(n=>{es.add(i+"→"+n);f(n)})};
  const b=i=>{if(ns.has(i))return;ns.add(i);(bwd[i]||[]).forEach(n=>{es.add(n+"→"+i);b(n)})};
  b(id);ns.delete(id);f(id);return{ns,es};
}

const W=1020,H=540;

window.NNSelfAttn = function NNSelfAttn(){
  const cvs=useRef(null);
  const[act,setAct]=useState(null);
  const[hov,setHov]=useState(null);
  const[tip,setTip]=useState(null);
  const parts=useRef([]);
  const raf=useRef(null);
  const td=useRef({ns:new Set(),es:new Set()});
  const amb=useRef(null);
  const time=useRef(0);
  const dpr=typeof window!=='undefined'?(window.devicePixelRatio||1):1;

  const spawn=useCallback(edges=>{const r=[];edges.forEach(e=>{const[a,b]=e.split("→");const f=nMap[a],t=nMap[b];if(f&&t)for(let i=0;i<2;i++)r.push({fx:f.x,fy:f.y,tx:t.x,ty:t.y,t:Math.random()*0.3,spd:0.002+Math.random()*0.003,sz:0.3+Math.random()*1,alive:true})});parts.current=r},[]);

  const hit=useCallback((mx,my)=>{for(const n of ALL_N){const dx=mx-n.x,dy=my-n.y;const r=n.type==="struct"?18:n.type==="repr"?14:n.type==="support"?5:n.st===0?5:n.st===6?12:n.st===5?10:9;if(dx*dx+dy*dy<(r+5)*(r+5))return n}return null},[]);

  const onClick=useCallback(e=>{const r=cvs.current.getBoundingClientRect();const n=hit((e.clientX-r.left)*(W/r.width),(e.clientY-r.top)*(H/r.height));if(n&&n.id!==act){setAct(n.id);const d=trace(n.id);td.current=d;spawn(d.es)}else{setAct(null);td.current={ns:new Set(),es:new Set()};parts.current=[]}},[act,spawn,hit]);

  const onMove=useCallback(e=>{const r=cvs.current.getBoundingClientRect();const n=hit((e.clientX-r.left)*(W/r.width),(e.clientY-r.top)*(H/r.height));setHov(n?n.id:null);setTip(n?{x:e.clientX-r.left+12,y:e.clientY-r.top-30,n}:null);cvs.current.style.cursor=n?'pointer':'default'},[hit]);

  useEffect(()=>{
    const c=cvs.current,ctx=c.getContext("2d");
    c.width=W*dpr;c.height=H*dpr;ctx.scale(dpr,dpr);
    if(!amb.current){amb.current=[];for(let i=0;i<120;i++)amb.current.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-0.5)*0.06,vy:(Math.random()-0.5)*0.03,sz:Math.random()*0.7,al:0.02+Math.random()*0.08})}

    function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}

    function draw(){
      time.current+=0.016;
      ctx.fillStyle="#090909";ctx.fillRect(0,0,W,H);
      const hasAct=act!==null;
      const{ns:aN,es:aE}=td.current;

      // Grid
      ctx.fillStyle="rgba(255,255,255,0.004)";
      for(let x=8;x<W;x+=16)for(let y=8;y<H;y+=16){ctx.beginPath();ctx.arc(x,y,0.2,0,Math.PI*2);ctx.fill()}

      // Ambient
      if(!hasAct)amb.current.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.sz,0,Math.PI*2);ctx.fillStyle=`rgba(190,175,130,${p.al})`;ctx.fill()});

      // Stage labels
      ctx.save();ctx.font="500 5.5px 'SF Mono',monospace";ctx.textAlign="center";
      [{x:55,t:"Token Embed"},{x:185,t:"Unimodal Enc"},{x:300,t:"Repr h_i"},{x:370,t:"Co-TRM"},{x:445,t:"Cross-Modal"},{x:545,t:"Concat"},{x:635,t:"TRM Encoder"},{x:710,t:"Fusion(×N)"},{x:810,t:"Output"},{x:930,t:"Skill"}].forEach(lb=>{
        ctx.fillStyle="rgba(255,255,255,0.07)";ctx.fillText(lb.t,lb.x,16);
      });ctx.restore();

      // Vertical seps
      ctx.strokeStyle="rgba(255,255,255,0.008)";ctx.lineWidth=0.3;
      [120,245,340,405,505,585,670,760,870].forEach(x=>{ctx.beginPath();ctx.moveTo(x,22);ctx.lineTo(x,H-8);ctx.stroke()});

      // Modality bands
      [{y:35,h:215,c:MC.A},{y:268,h:120,c:MC.B},{y:370,h:75,c:MC.C}].forEach(b=>{
        ctx.fillStyle=`rgba(${b.c.r},${b.c.g},${b.c.b},0.004)`;ctx.fillRect(10,b.y,240,b.h);
        ctx.strokeStyle=`rgba(${b.c.r},${b.c.g},${b.c.b},0.02)`;ctx.lineWidth=0.2;ctx.setLineDash([3,4]);ctx.strokeRect(10,b.y,240,b.h);ctx.setLineDash([]);
      });

      // ══ SELF-ATTENTION ARCS ══
      SELF_ATT.forEach(([a,b,w])=>{
        const na=nMap[a],nb=nMap[b];if(!na||!nb)return;
        const isAct2=hasAct&&aN.has(a)&&aN.has(b);
        const dim=hasAct&&!isAct2;
        const cc=MC[na.mod]||MC.A;
        // Arc curving to the right of the nodes
        const midX=Math.max(na.x,nb.x)+12+w*10;
        ctx.beginPath();
        ctx.moveTo(na.x,na.y);
        ctx.quadraticCurveTo(midX,(na.y+nb.y)/2,nb.x,nb.y);
        ctx.strokeStyle=dim?`rgba(${cc.r},${cc.g},${cc.b},0.003)`:`rgba(${cc.r},${cc.g},${cc.b},${isAct2?w*0.3:w*0.04})`;
        ctx.lineWidth=dim?0.05:isAct2?w*1.2:w*0.4;
        ctx.stroke();
      });

      // ══ FLOW EDGES ══
      E.forEach(([a,b])=>{
        const f=nMap[a],t=nMap[b];if(!f||!t)return;
        const ek=a+"→"+b;
        const isAct2=aE.has(ek);
        const isSkip=skipIds.has(ek);
        const isSup=f.type==="support"||t?.type==="support";
        const cc=MC[f.mod]||MC.T;

        ctx.beginPath();
        if(isSkip){
          const goUp=ek.includes("hA")||ek.includes("e-prosem")||ek.includes("e-ubiq");
          const curveY=goUp?25:H-15;
          ctx.moveTo(f.x,f.y);ctx.quadraticCurveTo((f.x+t.x)/2,curveY,t.x,t.y);
          ctx.setLineDash([3,3]);
        }else if(isSup){
          ctx.moveTo(f.x,f.y);ctx.lineTo(t.x,t.y);ctx.setLineDash([1,2]);
        }else{
          const dx=t.x-f.x;
          ctx.moveTo(f.x,f.y);ctx.bezierCurveTo(f.x+dx*0.4,f.y,t.x-dx*0.4,t.y,t.x,t.y);
          ctx.setLineDash([]);
        }
        if(hasAct){
          ctx.strokeStyle=isAct2?`rgba(${cc.r},${cc.g},${cc.b},${isSkip?0.3:0.12})`:"rgba(255,255,255,0.002)";
          ctx.lineWidth=isAct2?(isSkip?0.8:0.3):0.05;
        }else{
          ctx.strokeStyle=isSkip?"rgba(210,190,140,0.035)":isSup?`rgba(${cc.r},${cc.g},${cc.b},0.025)`:"rgba(255,255,255,0.012)";
          ctx.lineWidth=isSkip?0.4:0.2;
        }
        ctx.stroke();ctx.setLineDash([]);
      });

      // Particles
      parts.current.forEach(p=>{p.t+=p.spd;if(p.t>=1){p.alive=false;return}const t=p.t,mt=1-t,dx=p.tx-p.fx;const cx1=p.fx+dx*0.4,cx2=p.tx-dx*0.4;const px=mt*mt*mt*p.fx+3*mt*mt*t*cx1+3*mt*t*t*cx2+t*t*t*p.tx;const py=mt*mt*mt*p.fy+3*mt*mt*t*p.fy+3*mt*t*t*p.ty+t*t*t*p.ty;const al=Math.sin(t*Math.PI);ctx.beginPath();ctx.arc(px,py,p.sz+1.8,0,Math.PI*2);ctx.fillStyle=`rgba(210,195,130,${al*0.05})`;ctx.fill();ctx.beginPath();ctx.arc(px,py,p.sz,0,Math.PI*2);ctx.fillStyle=`rgba(240,225,165,${al*0.7})`;ctx.fill()});
      parts.current=parts.current.filter(p=>p.alive);
      if(hasAct&&parts.current.length<60){aE.forEach(e=>{if(Math.random()<0.04){const[a,b]=e.split("→");const f=nMap[a],t=nMap[b];if(f&&t)parts.current.push({fx:f.x,fy:f.y,tx:t.x,ty:t.y,t:0,spd:0.002+Math.random()*0.003,sz:0.3+Math.random()*1,alive:true})}})}

      // ══ NODES ══
      ALL_N.forEach(n=>{
        const cc=MC[n.mod]||MC.T;
        const isAct2=hasAct&&(aN.has(n.id)||n.id===act);
        const isHov=n.id===hov;
        const dim=hasAct&&!isAct2;
        ctx.globalAlpha=dim?0.03:1;
        const fillA=isHov?0.6:isAct2?0.38:0.1;
        const sa=n.sch?SA_C[n.sch]:null;

        if(n.type==="support"){
          ctx.beginPath();ctx.arc(n.x,n.y,1.8,0,Math.PI*2);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fillA*0.4})`;ctx.fill();
          if(isHov){ctx.font="400 3.5px 'SF Mono',monospace";ctx.fillStyle="rgba(255,255,255,0.5)";ctx.textAlign="center";ctx.fillText(n.l,n.x,n.y-4)}
        }else if(n.type==="repr"){
          rr(n.x-18,n.y-6,36,12,3);
          ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fillA*0.7})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.02:0.2})`;ctx.lineWidth=0.3;ctx.stroke();
          for(let i=0;i<32;i+=2){const v=0.03+0.08*Math.sin(time.current*2+i*0.3+n.y*0.01);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${v})`;ctx.fillRect(n.x-16+i,n.y-4,1.2,8)}
          ctx.font="500 5px 'SF Mono',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.02:0.3})`;ctx.textAlign="center";ctx.fillText(n.l,n.x,n.y+15);
        }else if(n.type==="struct"){
          const tw=n.l.length*2.8+14,th=13;
          rr(n.x-tw/2,n.y-th/2,tw,th,2);
          ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},0.02)`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.01:0.08})`;ctx.lineWidth=0.3;
          if(!n.id.includes("addnorm"))ctx.setLineDash([2,2]);
          ctx.stroke();ctx.setLineDash([]);
          ctx.font="500 4.2px 'SF Mono',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.02:0.25})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y);
          if(n.id.includes("addnorm")){ctx.font="500 7px 'SF Mono',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},0.06)`;ctx.fillText("+",n.x+tw/2+6,n.y)}
        }else if(n.st===0){
          ctx.beginPath();ctx.arc(n.x,n.y,2.5,0,Math.PI*2);
          ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fillA})`;ctx.fill();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.2)`;ctx.lineWidth=0.4;ctx.stroke()}
        }else if(n.st===1){
          rr(n.x-18,n.y-5,36,10,2);
          ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fillA*0.55})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.02:0.12})`;ctx.lineWidth=0.2;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.15)`;ctx.lineWidth=0.3;ctx.stroke()}
          if(isHov||isAct2){ctx.font="500 3.5px 'SF Mono',monospace";ctx.fillStyle=`rgba(255,255,255,${isHov?0.7:0.4})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y)}
        }else if(n.st===3){
          rr(n.x-24,n.y-5,48,10,2);
          ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fillA*0.45})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.02:0.1})`;ctx.lineWidth=0.2;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.15)`;ctx.lineWidth=0.3;ctx.stroke()}
          ctx.font="500 3.2px 'SF Mono',monospace";ctx.fillStyle=`rgba(255,255,255,${dim?0.02:(isHov?0.6:0.22)})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y);
        }else if(n.st===4&&!n.type){
          rr(n.x-25,n.y-8,50,16,3);
          ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fillA*0.45})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.02:0.08})`;ctx.lineWidth=0.3;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.18)`;ctx.lineWidth=0.4;ctx.stroke()}
          ctx.font="500 4px 'SF Mono',monospace";ctx.fillStyle=`rgba(255,255,255,${dim?0.02:(isHov?0.7:0.35)})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y);
        }else if(n.st===5){
          ctx.beginPath();for(let i=0;i<6;i++){const a=Math.PI/3*i-Math.PI/6;ctx.lineTo(n.x+7*Math.cos(a),n.y+7*Math.sin(a))}ctx.closePath();
          ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fillA})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.02:0.22})`;ctx.lineWidth=0.3;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.18)`;ctx.lineWidth=0.4;ctx.stroke()}
          ctx.font="500 4.5px 'SF Mono',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.02:0.45})`;ctx.textAlign="center";ctx.fillText(n.l,n.x,n.y+14);
        }else if(n.st===6){
          rr(n.x-30,n.y-4.5,60,9,2);
          ctx.fillStyle="rgba(255,255,255,0.006)";ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.01:0.04})`;ctx.lineWidth=0.2;ctx.stroke();
          ctx.font="500 3.8px 'SF Mono',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.02:0.25})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y);
        }

        if((isAct2||isHov)&&!dim){ctx.beginPath();ctx.arc(n.x,n.y,10,0,Math.PI*2);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},0.03)`;ctx.fill()}
        ctx.globalAlpha=1;
      });

      // ResNet labels
      ctx.save();ctx.font="400 4px 'SF Mono',monospace";ctx.textAlign="center";
      ctx.fillStyle="rgba(200,170,120,0.05)";ctx.fillText("residual skip (h_A)",470,20);
      ctx.fillStyle="rgba(155,145,185,0.05)";ctx.fillText("residual skip (h_C)",470,H-4);
      ctx.restore();

      // Footer
      ctx.save();ctx.font="400 4px 'SF Mono',monospace";ctx.fillStyle="rgba(255,255,255,0.035)";
      ctx.textAlign="left";ctx.fillText("Tsinghua · Cornell · Harvard GSD · MIT — 2020–2026",10,H-4);
      ctx.textAlign="right";ctx.fillText("Multimodal Transformer · Self-Attention · Cross-Attention · Residual Skip",W-10,H-4);
      ctx.restore();

      raf.current=requestAnimationFrame(draw);
    }
    draw();
    return()=>cancelAnimationFrame(raf.current);
  },[act,hov,dpr]);

  return(
    <div style={{background:"#090909",borderRadius:10,padding:"10px 8px 8px",fontFamily:"'SF Mono','Menlo',monospace",position:"relative"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5,padding:"0 4px"}}>
        <span style={{color:"rgba(215,195,140,0.35)",fontSize:7,fontWeight:500,letterSpacing:"0.12em"}}>MULTIMODAL TRANSFORMER · CURRICULUM ARCHITECTURE</span>
        <span style={{color:"rgba(255,255,255,0.08)",fontSize:5.5}}>click node to trace · hover for detail</span>
      </div>
      <div style={{position:"relative",overflowX:"auto"}}>
        <canvas ref={cvs} onClick={onClick} onMouseMove={onMove} onMouseLeave={()=>{setHov(null);setTip(null)}}
          style={{width:"100%",minWidth:850,height:"auto",aspectRatio:`${W}/${H}`,display:"block",borderRadius:6}}/>
        {tip&&<div style={{position:"absolute",left:Math.min(tip.x,W-140),top:Math.max(tip.y,0),background:"rgba(12,12,12,0.95)",border:"0.5px solid rgba(255,255,255,0.05)",borderRadius:3,padding:"3px 7px",pointerEvents:"none",zIndex:10,backdropFilter:"blur(10px)"}}>
          <div style={{color:"rgba(215,195,140,0.85)",fontSize:7,fontWeight:500}}>{tip.n.l}</div>
          <div style={{color:"rgba(255,255,255,0.2)",fontSize:5.5,marginTop:1}}>{tip.n.sch?tip.n.sch+" · ":""}Stage {tip.n.st>=0?tip.n.st:"S"} · {tip.n.mod}</div>
        </div>}
      </div>
      <div style={{display:"flex",gap:8,marginTop:5,padding:"0 4px",flexWrap:"wrap",alignItems:"center"}}>
        {[{l:"THU",c:"rgba(255,255,255,0.1)"},{l:"Cornell",c:"rgba(180,40,40,0.35)"},{l:"Harvard",c:"rgba(200,170,100,0.35)"},{l:"MIT",c:"rgba(100,180,200,0.35)"}].map(s=><span key={s.l} style={{display:"flex",alignItems:"center",gap:2,fontSize:5,color:"rgba(255,255,255,0.1)"}}><span style={{width:3.5,height:3.5,borderRadius:1,background:s.c,display:"inline-block"}}/>{s.l}</span>)}
        <span style={{marginLeft:"auto",fontSize:4.5,color:"rgba(255,255,255,0.05)"}}>○ token · ▭ enc · ▬ repr · ⌒ self-attn arc · ▭ co-trm · ⬡ output · ╌ residual</span>
      </div>
    </div>
  );
}
