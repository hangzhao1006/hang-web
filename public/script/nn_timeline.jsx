const { useState, useRef, useEffect, useCallback } = React;

const MC={A:{r:200,g:170,b:120},B:{r:130,g:175,b:155},C:{r:155,g:145,b:185},AB:{r:170,g:172,b:135},AC:{r:178,g:158,b:152},BC:{r:142,g:160,b:170},ABC:{r:210,g:195,b:145},F:{r:215,g:195,b:140},T:{r:175,g:170,b:162}};
const SA_C={THU:null,Cornell:{r:180,g:40,b:40},Harvard:{r:200,g:170,b:100},MIT:{r:100,g:180,b:200}};

// ═══ TIME → X MAPPING ═══
// Horizontal axis is TIME, not stage
// 2020-S1 = leftmost, 2026-S2 = rightmost
const TIME_MAP = {
  "2020-S1": 50, "2020-S2": 90, "2021-S1": 130, "2021-S2": 170,
  "2022-S1": 220, "2022-S2": 270, "2023-S3": 290,
  "2023-F": 330, "2024-S": 380, "2023-S2": 340, "2024-S1": 410,
  "2024-S2": 460, "2024-S3": 480,
  "2025-S1": 540, "2025-F": 580,
  "2026-S": 660,
  // Structural nodes (not time-bound, placed at logical positions)
  "repr": 500, "cotrm": 520, "concat": 700, "trm-struct": 740, "addnorm": 780,
  // Skills at far right
  "skill": 900,
};

function tx(term) { return TIME_MAP[term] || 400; }

// Y bands: A=top, B=mid, C=bottom, cross in between
function modY(mod, idx, total) {
  const bands = { A:[38,250], B:[275,430], C:[455,600], AB:[200,350], AC:[300,400], BC:[400,550], ABC:[300,420] };
  const b = bands[mod] || bands.ABC;
  if (total <= 1) return (b[0]+b[1])/2;
  return b[0] + (b[1]-b[0]) * idx / (total-1);
}

// ═══ ALL NODES — positioned by TIME ═══
const N = [
  // ─── 2020-S1: THU Art foundation ───
  {id:"a01",l:"Form Study",     tm:"2020-S1",st:0,mod:"A",sch:"THU"},
  {id:"a02",l:"Visual Lang I",  tm:"2020-S1",st:0,mod:"A",sch:"THU"},
  {id:"a03",l:"Visual Lang II", tm:"2020-S1",st:0,mod:"A",sch:"THU"},
  {id:"a04",l:"3D Fundmntl",    tm:"2020-S1",st:0,mod:"A",sch:"THU"},
  {id:"a05",l:"CN Art Hist",    tm:"2020-S1",st:0,mod:"A",sch:"THU"},
  {id:"a06",l:"Arts&Crafts Hist",tm:"2020-S1",st:0,mod:"A",sch:"THU"},

  // ─── 2020-S2 ───
  {id:"a07",l:"Calligraphy",    tm:"2020-S2",st:0,mod:"A",sch:"THU"},
  {id:"a08",l:"Foreign Art Hist",tm:"2020-S2",st:0,mod:"A",sch:"THU"},
  {id:"a09",l:"Western Design", tm:"2020-S2",st:0,mod:"A",sch:"THU"},
  {id:"a10",l:"Color Painting", tm:"2020-S2",st:0,mod:"A",sch:"THU"},
  {id:"a11",l:"Forming I",      tm:"2020-S2",st:0,mod:"A",sch:"THU"},

  // ─── 2021-S1: Textile deep dive ───
  {id:"a12",l:"Seal Carving",   tm:"2021-S1",st:0,mod:"A",sch:"THU"},
  {id:"a13",l:"Dye Pattern",    tm:"2021-S1",st:0,mod:"A",sch:"THU"},
  {id:"a14",l:"Color Textile",  tm:"2021-S1",st:0,mod:"A",sch:"THU"},
  {id:"a15",l:"Textile Hist",   tm:"2021-S1",st:0,mod:"A",sch:"THU"},
  {id:"a16",l:"Textile Mat",    tm:"2021-S1",st:0,mod:"A",sch:"THU"},
  {id:"a17",l:"Print&Dye I",    tm:"2021-S1",st:0,mod:"A",sch:"THU"},

  // ─── 2021-S2 ───
  {id:"a18",l:"Logo Design",    tm:"2021-S2",st:0,mod:"A",sch:"THU"},
  {id:"a19",l:"Embroidery",     tm:"2021-S2",st:0,mod:"A",sch:"THU"},
  {id:"a20",l:"Weaving Tech",   tm:"2021-S2",st:0,mod:"A",sch:"THU"},
  {id:"a21",l:"Print&Dye II",   tm:"2021-S2",st:0,mod:"A",sch:"THU"},
  {id:"a22",l:"Weaving",        tm:"2021-S2",st:0,mod:"A",sch:"THU"},

  // ─── 2022-S1: Art enc + NEW Econ input ───
  {id:"e-arch",l:"Cultural Arch",    tm:"2022-S1",st:1,mod:"A",sch:"THU"},
  {id:"e-video",l:"Video&Audio",     tm:"2022-S1",st:1,mod:"A",sch:"THU"},
  {id:"e-creative",l:"Creative Think",tm:"2022-S1",st:1,mod:"A",sch:"THU"},
  {id:"e-film",l:"Language Film",    tm:"2022-S1",st:1,mod:"A",sch:"THU"},
  // NEW INPUT: Econ enters at 2022 (not 2020!)
  {id:"c01",l:"Accounting",     tm:"2022-S1",st:0,mod:"C",sch:"THU"},
  {id:"c02",l:"Econ I",         tm:"2022-S1",st:0,mod:"C",sch:"THU"},
  // FIRST CROSS-MODAL courses appear
  {id:"x01",l:"Dynamic Infogfx",tm:"2022-S1",st:3,mod:"AB",sch:"THU"},
  {id:"x02",l:"InfoDesign&Art", tm:"2022-S1",st:3,mod:"AB",sch:"THU"},

  // ─── 2022-S2: More cross-modal ───
  {id:"c03",l:"Econ II",        tm:"2022-S2",st:0,mod:"C",sch:"THU"},
  {id:"c04",l:"China Econ",     tm:"2022-S2",st:0,mod:"C",sch:"THU"},
  {id:"e-exhib",l:"Exhibition",     tm:"2022-S2",st:1,mod:"A",sch:"THU"},
  {id:"e-charh",l:"Char Dsgn Hist", tm:"2022-S2",st:1,mod:"A",sch:"THU"},
  {id:"e-newmed",l:"New Media Art",  tm:"2022-S2",st:1,mod:"A",sch:"THU"},
  {id:"x03",l:"Prototyping",    tm:"2022-S2",st:3,mod:"AB",sch:"THU"},
  {id:"x04",l:"UI Foundation",  tm:"2022-S2",st:3,mod:"AB",sch:"THU"},
  {id:"x14",l:"Info Gfx Dsgn",  tm:"2022-S2",st:3,mod:"AC",sch:"THU"},

  // ─── 2023-F: Cornell — NEW Tech & Econ inputs ───
  {id:"b01",l:"Intro Computing",tm:"2023-F",st:0,mod:"B",sch:"Cornell"},
  {id:"b02",l:"Dsgn&Prog Web",  tm:"2023-F",st:0,mod:"B",sch:"Cornell"},
  {id:"c05",l:"Financial Rpt",  tm:"2023-F",st:1,mod:"C",sch:"Cornell"},
  {id:"x05",l:"HCI Studio",    tm:"2023-F",st:3,mod:"AB",sch:"Cornell"},

  // ─── 2024-S: Cornell spring ───
  {id:"x06",l:"IxD Studio",    tm:"2024-S",st:3,mod:"AB",sch:"Cornell"},
  {id:"x07",l:"Intermed Web",  tm:"2024-S",st:3,mod:"AB",sch:"Cornell"},
  {id:"x16",l:"Intro DataSci", tm:"2024-S",st:3,mod:"BC",sch:"Cornell"},

  // ── 2024 OUTPUT: Early projects (like pre-trained checkpoints) ──
  {id:"o-seren",l:"SerenEcho",  tm:"2024-S",st:5,mod:"AB",sch:"THU",yr:2024},
  {id:"o-seepal",l:"SeePal",    tm:"2024-S",st:5,mod:"AB",sch:"THU",yr:2024},
  {id:"o-tide",l:"TideEcho",    tm:"2024-S",st:5,mod:"AB",sch:"THU",yr:2024},

  // ─── 2024-S2: THU return, Tech encoders ───
  {id:"e-iface",l:"Interface Dsgn",tm:"2024-S1",st:1,mod:"B",sch:"THU"},
  {id:"e-ixt1",l:"Ix Tech I",   tm:"2024-S1",st:1,mod:"B",sch:"THU"},
  {id:"e-web",l:"Design Web",   tm:"2024-S1",st:1,mod:"B",sch:"THU"},
  {id:"e-smart",l:"Smart Space", tm:"2024-S1",st:1,mod:"B",sch:"THU"},
  {id:"e-ixt2",l:"Ix Tech II",  tm:"2024-S1",st:1,mod:"B",sch:"THU"},
  {id:"e-usab",l:"Usability",   tm:"2024-S1",st:1,mod:"B",sch:"THU"},
  {id:"e-infod1",l:"InfoDsgn AIGC",tm:"2024-S1",st:1,mod:"AB",sch:"THU"},
  {id:"e-method",l:"Methodology",tm:"2024-S1",st:1,mod:"A",sch:"THU"},
  {id:"e-dsgnpsy",l:"Design Psych",tm:"2024-S1",st:1,mod:"A",sch:"THU"},
  {id:"x08",l:"Ix Design I",   tm:"2024-S1",st:3,mod:"AB",sch:"THU"},

  // ─── 2024-S3 / 2025-S1: Advanced ───
  {id:"x09",l:"Comp Train II", tm:"2024-S3",st:3,mod:"AB",sch:"THU"},
  {id:"x10",l:"Prof Practice", tm:"2024-S3",st:3,mod:"AB",sch:"THU"},
  {id:"e-ubiq",l:"Ubiquitous Tech",tm:"2025-S1",st:1,mod:"B",sch:"THU"},
  {id:"e-display",l:"Display Dsgn",tm:"2025-S1",st:1,mod:"A",sch:"THU"},
  {id:"x11",l:"Ix Design II",  tm:"2025-S1",st:3,mod:"AB",sch:"THU"},
  {id:"x12",l:"InfoDsgn II TD",tm:"2025-S1",st:3,mod:"AB",sch:"THU"},
  // Econ advanced (also 2025-S1)
  {id:"e-micro",l:"Micro Econ", tm:"2025-S1",st:1,mod:"C",sch:"THU"},
  {id:"e-macro",l:"Macro Econ", tm:"2025-S1",st:1,mod:"C",sch:"THU"},
  {id:"e-corpfin",l:"Corp Finance",tm:"2025-S1",st:1,mod:"C",sch:"THU"},
  {id:"e-invest",l:"Investment",tm:"2025-S1",st:1,mod:"C",sch:"THU"},
  {id:"e-cpp",l:"C++ Prog",    tm:"2025-S1",st:1,mod:"C",sch:"THU"},

  // ── 2025 OUTPUT: Mid-stage projects ──
  {id:"o-skin",l:"SkinMe",      tm:"2025-S1",st:5,mod:"BC",sch:"THU",yr:2024},
  {id:"o-tuch",l:"Tuchsure",    tm:"2025-S1",st:5,mod:"AB",sch:"THU",yr:2025},

  // Diploma thesis (TRM level)
  {id:"t-diploma",l:"Diploma Thesis",tm:"2025-S1",st:4,mod:"ABC",sch:"THU"},
  {id:"x17",l:"Cognitive Psych",tm:"2025-S1",st:3,mod:"BC",sch:"THU"},

  // ─── 2025-F: Harvard ───
  {id:"e-prosem",l:"Proseminar",tm:"2025-F",st:1,mod:"A",sch:"Harvard"},
  {id:"x13",l:"Digital Prod",  tm:"2025-F",st:3,mod:"AB",sch:"Harvard"},
  {id:"x15",l:"Quant Aesthetics",tm:"2025-F",st:3,mod:"AC",sch:"Harvard"},
  {id:"x18",l:"Adv DataSci",   tm:"2025-F",st:3,mod:"BC",sch:"Harvard"},

  // ─── 2026-S: MIT + Harvard advanced ───
  {id:"x19",l:"Biomech Move",  tm:"2026-S",st:3,mod:"BC",sch:"Harvard"},
  {id:"x20",l:"Mobile Sensor", tm:"2026-S",st:3,mod:"BC",sch:"MIT"},
  {id:"t-mlalgo",l:"ML Algo→Apps",tm:"2026-S",st:4,mod:"ABC",sch:"MIT"},
  {id:"t-physml",l:"Physics ML",tm:"2026-S",st:4,mod:"ABC",sch:"MIT"},
  {id:"t-media",l:"Media Tech", tm:"2026-S",st:4,mod:"ABC",sch:"MIT"},

  // ── 2025-2026 OUTPUT: Latest projects ──
  {id:"o-pgmoe",l:"PG-MoE",    tm:"2025-F",st:5,mod:"BC",sch:"Harvard",yr:2025},
  {id:"o-audeate",l:"Audeate",  tm:"2026-S",st:5,mod:"ABC",sch:"Harvard",yr:2026},

  // ─── STRUCTURAL NODES (positioned at logical time points) ───
  {id:"hA",l:"h_A",tm:"repr",st:2,mod:"A",type:"repr"},
  {id:"hB",l:"h_B",tm:"repr",st:2,mod:"B",type:"repr"},
  {id:"hC",l:"h_C",tm:"repr",st:2,mod:"C",type:"repr"},
  {id:"st-coAB",l:"Co-TRM A↔B",tm:"cotrm",st:2.5,mod:"AB",type:"struct"},
  {id:"st-coBC",l:"Co-TRM B↔C",tm:"cotrm",st:2.5,mod:"BC",type:"struct"},
  {id:"st-coAC",l:"Co-TRM A↔C",tm:"cotrm",st:2.5,mod:"AC",type:"struct"},
  {id:"st-cat",l:"Concat+Proj",tm:"concat",st:3.5,mod:"F",type:"struct"},
  {id:"st-sa",l:"Self-Attention",tm:"trm-struct",st:4,mod:"T",type:"struct"},
  {id:"st-ffn",l:"FFN",tm:"trm-struct",st:4,mod:"T",type:"struct"},
  {id:"st-an",l:"Add & Norm",tm:"addnorm",st:4,mod:"T",type:"struct"},

  // ─── SKILLS (far right) ───
  {id:"s01",l:"Multimodal AI",tm:"skill",st:6,mod:"ABC"},
  {id:"s02",l:"ML Systems",tm:"skill",st:6,mod:"BC"},
  {id:"s03",l:"Edge AI",tm:"skill",st:6,mod:"BC"},
  {id:"s04",l:"Embedded Sensing",tm:"skill",st:6,mod:"BC"},
  {id:"s05",l:"Physical Comp",tm:"skill",st:6,mod:"AB"},
  {id:"s06",l:"Full-Stack Proto",tm:"skill",st:6,mod:"ABC"},
  {id:"s07",l:"Human-AI Ix",tm:"skill",st:6,mod:"AB"},
  {id:"s08",l:"Interaction Dsgn",tm:"skill",st:6,mod:"AB"},
  {id:"s09",l:"Tangible Interface",tm:"skill",st:6,mod:"AB"},
  {id:"s10",l:"Info Viz",tm:"skill",st:6,mod:"AC"},
  {id:"s11",l:"UX Research",tm:"skill",st:6,mod:"AB"},
  {id:"s12",l:"Data-Driven Dsgn",tm:"skill",st:6,mod:"AC"},
  {id:"s13",l:"Quant Analysis",tm:"skill",st:6,mod:"C"},
  {id:"s14",l:"System Thinking",tm:"skill",st:6,mod:"ABC"},
  {id:"s15",l:"Wearable Proto",tm:"skill",st:6,mod:"AB"},
  {id:"s16",l:"Research→Proto",tm:"skill",st:6,mod:"ABC"},
  {id:"s17",l:"Creative Coding",tm:"skill",st:6,mod:"AB"},
  {id:"s18",l:"Sensor Fusion",tm:"skill",st:6,mod:"BC"},
];

// Position nodes: x from time, y from modality
(function positionAll(){
  const groups={};
  N.forEach(n=>{const k=n.tm+"|"+n.mod;(groups[k]||(groups[k]=[])).push(n)});
  Object.values(groups).forEach(g=>{
    g.forEach((n,i)=>{
      n.x = tx(n.tm);
      n.y = modY(n.mod, i, g.length);
    });
  });
  // Adjust structural nodes y manually
  const find=id=>N.find(n=>n.id===id);
  if(find("hA"))find("hA").y=145;
  if(find("hB"))find("hB").y=350;
  if(find("hC"))find("hC").y=525;
  if(find("st-coAB"))find("st-coAB").y=250;
  if(find("st-coBC"))find("st-coBC").y=450;
  if(find("st-coAC"))find("st-coAC").y=350;
  if(find("st-cat"))find("st-cat").y=350;
  if(find("st-sa"))find("st-sa").y=310;
  if(find("st-ffn"))find("st-ffn").y=365;
  if(find("st-an"))find("st-an").y=410;
})();

const nMap=Object.fromEntries(N.map(n=>[n.id,n]));

// SELF-ATTENTION
const SELF_ATT=[
  ["a01","a02",0.8],["a02","a03",0.9],["a01","a04",0.7],["a10","a14",0.8],
  ["a07","a12",0.85],["a13","a17",0.9],["a21","a17",0.8],["a20","a22",0.9],
  ["a19","a20",0.7],["a16","a15",0.75],["a05","a08",0.8],["a06","a09",0.8],
  ["a11","a04",0.7],["a18","a07",0.5],
  ["b01","b02",0.9],
  ["c01","c02",0.7],["c02","c03",0.95],["c03","c04",0.6],
  ["e-video","e-film",0.9],["e-film","e-newmed",0.75],["e-exhib","e-display",0.85],
  ["e-creative","e-newmed",0.6],["e-arch","e-exhib",0.7],
  ["e-infod1","e-method",0.8],["e-dsgnpsy","e-method",0.6],
  ["e-ixt1","e-ixt2",0.95],["e-iface","e-web",0.8],["e-smart","e-ubiq",0.85],
  ["e-usab","e-iface",0.7],["e-ixt2","e-ubiq",0.8],
  ["e-micro","e-macro",0.9],["e-corpfin","e-invest",0.85],["e-corpfin","c05",0.7],
  ["x01","x02",0.85],["x03","x04",0.8],["x05","x06",0.9],["x08","x11",0.95],
  ["x12","x01",0.6],["x07","x04",0.65],["x09","x10",0.8],["x11","x12",0.75],
  ["x14","x15",0.7],["x16","x18",0.85],["x17","x19",0.6],["x18","x20",0.7],
  ["x19","x20",0.75],["t-mlalgo","t-physml",0.9],["t-mlalgo","t-media",0.7],
];

// SA weight lookup
const SA_W={};SELF_ATT.forEach(([a,b,w])=>{SA_W[a+"↔"+b]=w;SA_W[b+"↔"+a]=w});

// EDGES
const E=[];
let _s=42;function sr(){_s=((_s*1103515245+12345)&0x7fffffff);return _s/0x7fffffff}

// S0→S1 same mod
N.filter(n=>n.st===0).forEach(t=>{
  const tg=N.filter(e=>e.st===1&&(e.mod===t.mod||e.mod.includes(t.mod))&&tx(e.tm)>=tx(t.tm));
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
// addnorm→S5 (only late outputs)
N.filter(n=>n.st===5&&(n.yr||0)>=2025).forEach(n=>E.push(["st-an",n.id]));
// Early outputs connect from nearby stage-3 courses
N.filter(n=>n.st===5&&(n.yr||0)<=2024).forEach(o=>{
  const nearby=N.filter(n=>(n.st===1||n.st===3)&&Math.abs(tx(n.tm)-tx(o.tm))<80&&[...o.mod].some(m=>n.mod.includes(m)));
  nearby.sort(()=>sr()-0.5).slice(0,3).forEach(n=>E.push([n.id,o.id]));
});
// S5→S6
N.filter(n=>n.st===5).forEach(o=>{
  N.filter(s=>s.st===6&&[...o.mod].some(m=>s.mod.includes(m))).sort(()=>sr()-0.5).slice(0,4).forEach(s=>E.push([o.id,s.id]));
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
  const saNeighbors={};
  SELF_ATT.forEach(([a,b,w])=>{
    if(ns.has(a)||a===id){saNeighbors[b]=Math.max(saNeighbors[b]||0,w)}
    if(ns.has(b)||b===id){saNeighbors[a]=Math.max(saNeighbors[a]||0,w)}
  });
  return{ns,es,saNeighbors};
}

const CW=980,CH=640;

function NNSelfAttn(){
  const cvs=useRef(null);const[act,setAct]=useState(null);const[hov,setHov]=useState(null);const[tip,setTip]=useState(null);
  const pts=useRef([]);const raf=useRef(null);const td=useRef({ns:new Set(),es:new Set(),saNeighbors:{}});const amb=useRef(null);const tm=useRef(0);
  const dpr=typeof window!=='undefined'?(window.devicePixelRatio||1):1;

  const spawn=useCallback(ed=>{const r=[];ed.forEach(e=>{const[a,b]=e.split("→");const f=nMap[a],t=nMap[b];if(f&&t)for(let i=0;i<2;i++)r.push({fx:f.x,fy:f.y,tx:t.x,ty:t.y,t:Math.random()*0.3,sp:0.002+Math.random()*0.003,sz:0.4+Math.random()*1.1,a:true})});pts.current=r},[]);
  const hit=useCallback((mx,my)=>{for(const n of N){const dx=mx-n.x,dy=my-n.y;const r=n.type==="struct"?20:n.type==="repr"?15:n.st===0?6:n.st===6?14:n.st===5?11:10;if(dx*dx+dy*dy<(r+5)*(r+5))return n}return null},[]);
  const oc=useCallback(e=>{const r=cvs.current.getBoundingClientRect();const n=hit((e.clientX-r.left)*(CW/r.width),(e.clientY-r.top)*(CH/r.height));if(n&&n.id!==act){setAct(n.id);const d=trace(n.id);td.current=d;spawn(d.es)}else{setAct(null);td.current={ns:new Set(),es:new Set(),saNeighbors:{}};pts.current=[]}},[act,spawn,hit]);
  const om=useCallback(e=>{const r=cvs.current.getBoundingClientRect();const n=hit((e.clientX-r.left)*(CW/r.width),(e.clientY-r.top)*(CH/r.height));setHov(n?n.id:null);setTip(n?{x:e.clientX-r.left+12,y:e.clientY-r.top-30,n}:null);cvs.current.style.cursor=n?'pointer':'default'},[hit]);

  useEffect(()=>{
    const c=cvs.current,ctx=c.getContext("2d");c.width=CW*dpr;c.height=CH*dpr;ctx.scale(dpr,dpr);
    if(!amb.current){amb.current=[];for(let i=0;i<130;i++)amb.current.push({x:Math.random()*CW,y:Math.random()*CH,vx:(Math.random()-0.5)*0.05,vy:(Math.random()-0.5)*0.03,sz:Math.random()*0.8,al:0.04+Math.random()*0.14})}
    function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}

    function draw(){
      tm.current+=0.016;ctx.fillStyle="#0b0b0b";ctx.fillRect(0,0,CW,CH);
      const ha=act!==null;const{ns:aN,es:aE,saNeighbors}=td.current;

      // Grid
      ctx.fillStyle="rgba(255,255,255,0.006)";for(let x=8;x<CW;x+=18)for(let y=8;y<CH;y+=18){ctx.beginPath();ctx.arc(x,y,0.25,0,Math.PI*2);ctx.fill()}

      // Ambient
      if(!ha)amb.current.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=CW;if(p.x>CW)p.x=0;if(p.y<0)p.y=CH;if(p.y>CH)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.sz,0,Math.PI*2);ctx.fillStyle=`rgba(190,175,130,${p.al})`;ctx.fill()});

      // ═══ TIME AXIS LABELS (top) ═══
      ctx.save();ctx.font="500 7px 'SF Mono','Menlo',monospace";ctx.textAlign="center";
      const timeLabels=[
        {x:50,t:"2020"},{x:90,t:""},{x:130,t:"2021"},{x:170,t:""},
        {x:220,t:"2022"},{x:270,t:""},{x:330,t:"2023"},{x:380,t:"2024"},
        {x:540,t:"2025"},{x:660,t:"2026"},
        {x:780,t:"→"},{x:900,t:"Skills"},
      ];
      timeLabels.forEach(lb=>{
        if(lb.t){ctx.fillStyle=lb.t==="Skills"||lb.t==="→"?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.3)";ctx.fillText(lb.t,lb.x,16)}
      });
      // Time axis line
      ctx.strokeStyle="rgba(255,255,255,0.06)";ctx.lineWidth=0.5;
      ctx.beginPath();ctx.moveTo(40,22);ctx.lineTo(870,22);ctx.stroke();
      // Tick marks
      [50,130,220,330,380,540,660].forEach(x=>{ctx.beginPath();ctx.moveTo(x,20);ctx.lineTo(x,25);ctx.stroke()});
      ctx.restore();

      // Stage type labels (right side vertical)
      ctx.save();ctx.font="400 5px 'SF Mono',monospace";ctx.fillStyle="rgba(255,255,255,0.08)";
      ctx.textAlign="right";
      ctx.fillText("token / enc",38,150);ctx.fillText("token / enc",38,350);ctx.fillText("token / enc",38,520);
      ctx.restore();

      // Modality bands
      [{y:30,h:235,c:MC.A,l:"A · Art"},{y:268,h:170,c:MC.B,l:"B · Tech"},{y:445,h:170,c:MC.C,l:"C · Econ"}].forEach(b=>{
        ctx.fillStyle=`rgba(${b.c.r},${b.c.g},${b.c.b},0.008)`;ctx.fillRect(8,b.y,CW-16,b.h);
        ctx.save();ctx.font="500 5px 'SF Mono',monospace";ctx.fillStyle=`rgba(${b.c.r},${b.c.g},${b.c.b},0.12)`;
        ctx.textAlign="left";ctx.fillText(b.l,12,b.y+10);ctx.restore();
      });

      // ═══ SELF-ATTENTION ARCS ═══
      SELF_ATT.forEach(([a,b,w])=>{
        const na=nMap[a],nb=nMap[b];if(!na||!nb)return;
        const aIn=aN.has(a)||a===act;const bIn=aN.has(b)||b===act;
        const both=ha&&aIn&&bIn;const oneIn=ha&&(aIn||bIn)&&!both;const dim=ha&&!both&&!oneIn;
        const cc=MC[na.mod]||MC.A;
        // Arc direction: curve downward if same x, rightward if different x
        const sameCol=Math.abs(na.x-nb.x)<20;
        ctx.beginPath();
        if(sameCol){
          const midX=na.x+16+w*14;
          ctx.moveTo(na.x+3,na.y);ctx.quadraticCurveTo(midX,(na.y+nb.y)/2,nb.x+3,nb.y);
        }else{
          const midY=Math.min(na.y,nb.y)-10-w*8;
          ctx.moveTo(na.x,na.y);ctx.quadraticCurveTo((na.x+nb.x)/2,midY,nb.x,nb.y);
        }
        if(dim){ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},0.004)`;ctx.lineWidth=0.05}
        else if(both){ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${0.2+w*0.5})`;ctx.lineWidth=0.6+w*2.5}
        else if(oneIn){ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${0.05+w*0.15})`;ctx.lineWidth=0.2+w*0.8}
        else{ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${0.02+w*0.08})`;ctx.lineWidth=0.15+w*0.7}
        ctx.stroke();
      });

      // ═══ FLOW EDGES ═══
      E.forEach(([a,b])=>{
        const f=nMap[a],t=nMap[b];if(!f||!t)return;const ek=a+"→"+b;const ia=aE.has(ek);const sk=skipSet.has(ek);const cc=MC[f.mod]||MC.T;
        ctx.beginPath();
        if(sk){ctx.moveTo(f.x,f.y);ctx.quadraticCurveTo((f.x+t.x)/2,f.y<300?25:CH-18,t.x,t.y);ctx.setLineDash([3,3])}
        else{const dx=t.x-f.x,dy=t.y-f.y;
          if(Math.abs(dx)<30){ctx.moveTo(f.x,f.y);ctx.bezierCurveTo(f.x,f.y+dy*0.4,t.x,t.y-dy*0.4,t.x,t.y)}
          else{ctx.moveTo(f.x,f.y);ctx.bezierCurveTo(f.x+dx*0.4,f.y,t.x-dx*0.4,t.y,t.x,t.y)}
          ctx.setLineDash([])}
        if(ha){ctx.strokeStyle=ia?`rgba(${cc.r},${cc.g},${cc.b},${sk?0.5:0.2})`:"rgba(255,255,255,0.003)";ctx.lineWidth=ia?(sk?1:0.4):0.05}
        else{ctx.strokeStyle=sk?"rgba(210,190,140,0.06)":"rgba(255,255,255,0.02)";ctx.lineWidth=sk?0.5:0.2}
        ctx.stroke();ctx.setLineDash([]);
      });

      // Particles
      pts.current.forEach(p=>{p.t+=p.sp;if(p.t>=1){p.a=false;return}const t=p.t,mt=1-t,dx=p.tx-p.fx;const c1=p.fx+dx*0.4,c2=p.tx-dx*0.4;const px=mt*mt*mt*p.fx+3*mt*mt*t*c1+3*mt*t*t*c2+t*t*t*p.tx;const py=mt*mt*mt*p.fy+3*mt*mt*t*p.fy+3*mt*t*t*p.ty+t*t*t*p.ty;const al=Math.sin(t*Math.PI);ctx.beginPath();ctx.arc(px,py,p.sz+2,0,Math.PI*2);ctx.fillStyle=`rgba(210,195,130,${al*0.1})`;ctx.fill();ctx.beginPath();ctx.arc(px,py,p.sz,0,Math.PI*2);ctx.fillStyle=`rgba(245,230,170,${al*0.85})`;ctx.fill()});
      pts.current=pts.current.filter(p=>p.a);
      if(ha&&pts.current.length<60){aE.forEach(e=>{if(Math.random()<0.04){const[a,b]=e.split("→");const f=nMap[a],t=nMap[b];if(f&&t)pts.current.push({fx:f.x,fy:f.y,tx:t.x,ty:t.y,t:0,sp:0.002+Math.random()*0.003,sz:0.3+Math.random()*1,a:true})}})}

      // ═══ NODES ═══
      N.forEach(n=>{
        const cc=MC[n.mod]||MC.T;const ia=ha&&(aN.has(n.id)||n.id===act);const ih=n.id===hov;
        const saW=ha?saNeighbors[n.id]||0:0;const dim=ha&&!ia&&saW===0;const isSA=ha&&!ia&&saW>0;
        ctx.globalAlpha=dim?0.04:isSA?(0.15+saW*0.6):1;
        const fa=ih?0.8:ia?0.55:isSA?(0.1+saW*0.5):0.22;const sa=n.sch?SA_C[n.sch]:null;

        if(n.type==="repr"){
          rr(n.x-20,n.y-7,40,14,4);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fa*0.9})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.04:0.35})`;ctx.lineWidth=0.5;ctx.stroke();
          for(let i=0;i<36;i+=2.5){const v=0.06+0.14*Math.sin(tm.current*2+i*0.3+n.y*0.01);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${v})`;ctx.fillRect(n.x-18+i,n.y-5,1.5,10)}
          ctx.font="500 6px 'SF Mono','Menlo',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.04:0.45})`;ctx.textAlign="center";ctx.fillText(n.l,n.x,n.y+18);
        }else if(n.type==="struct"){
          const tw=n.l.length*3+16,th=14;rr(n.x-tw/2,n.y-th/2,tw,th,3);
          ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},0.05)`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.03:0.15})`;ctx.lineWidth=0.4;
          if(!n.id.includes("an"))ctx.setLineDash([2,2]);ctx.stroke();ctx.setLineDash([]);
          ctx.font="500 5px 'SF Mono','Menlo',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.04:0.4})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y);
          if(n.id==="st-an"){ctx.font="500 9px monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},0.12)`;ctx.fillText("+",n.x+tw/2+7,n.y)}
        }else if(n.st===0){
          ctx.beginPath();ctx.arc(n.x,n.y,3.2,0,Math.PI*2);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fa*1.3})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.05:0.4})`;ctx.lineWidth=0.3;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.35)`;ctx.lineWidth=0.5;ctx.stroke()}
        }else if(n.st===1){
          rr(n.x-20,n.y-5.5,40,11,2);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fa*0.75})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.04:0.22})`;ctx.lineWidth=0.3;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.25)`;ctx.lineWidth=0.4;ctx.stroke()}
          if(ih||ia){ctx.font="500 4px 'SF Mono','Menlo',monospace";ctx.fillStyle=`rgba(255,255,255,${ih?0.85:0.55})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y)}
        }else if(n.st===3){
          rr(n.x-26,n.y-5.5,52,11,2);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fa*0.65})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.04:0.18})`;ctx.lineWidth=0.3;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.22)`;ctx.lineWidth=0.4;ctx.stroke()}
          ctx.font="500 3.8px 'SF Mono','Menlo',monospace";ctx.fillStyle=`rgba(255,255,255,${dim?0.04:(ih?0.75:0.35)})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y);
        }else if(n.st===4&&!n.type){
          rr(n.x-28,n.y-9,56,18,3);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fa*0.6})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.04:0.15})`;ctx.lineWidth=0.35;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.28)`;ctx.lineWidth=0.5;ctx.stroke()}
          ctx.font="500 4.5px 'SF Mono','Menlo',monospace";ctx.fillStyle=`rgba(255,255,255,${dim?0.04:(ih?0.85:0.5)})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y);
        }else if(n.st===5){
          ctx.beginPath();for(let i=0;i<6;i++){const ang=Math.PI/3*i-Math.PI/6;ctx.lineTo(n.x+9*Math.cos(ang),n.y+9*Math.sin(ang))}ctx.closePath();
          ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fa*1.1})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.04:0.35})`;ctx.lineWidth=0.35;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.28)`;ctx.lineWidth=0.5;ctx.stroke()}
          ctx.font="500 5px 'SF Mono','Menlo',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.04:0.6})`;ctx.textAlign="center";ctx.fillText(n.l,n.x,n.y+16);
          if(n.yr){ctx.font="400 4px 'SF Mono',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.02:0.25})`;ctx.fillText(n.yr,n.x,n.y+24)}
        }else if(n.st===6){
          rr(n.x-33,n.y-5,66,10,2);ctx.fillStyle="rgba(255,255,255,0.012)";ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.03:0.08})`;ctx.lineWidth=0.25;ctx.stroke();
          ctx.font="500 4.2px 'SF Mono','Menlo',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.04:0.38})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y);
        }
        if((ia||ih)&&!dim){ctx.beginPath();ctx.arc(n.x,n.y,14,0,Math.PI*2);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},0.06)`;ctx.fill()}
        ctx.globalAlpha=1;
      });

      // Skip labels
      ctx.save();ctx.font="400 5px 'SF Mono',monospace";ctx.textAlign="center";
      ctx.fillStyle="rgba(200,170,120,0.1)";ctx.fillText("residual skip",630,25);
      ctx.restore();

      ctx.save();ctx.font="400 5px 'SF Mono',monospace";ctx.fillStyle="rgba(255,255,255,0.06)";
      ctx.textAlign="left";ctx.fillText("Tsinghua · Cornell · Harvard GSD · MIT",12,CH-6);
      ctx.textAlign="right";ctx.fillText("Multimodal Transformer · Time-Series Architecture",CW-12,CH-6);
      ctx.restore();

      raf.current=requestAnimationFrame(draw);
    }
    draw();return()=>cancelAnimationFrame(raf.current);
  },[act,hov,dpr]);

  return React.createElement("div",{style:{position:"relative"}},
    React.createElement("canvas",{ref:cvs,onClick:oc,onMouseMove:om,onMouseLeave:()=>{setHov(null);setTip(null)},style:{width:"100%",minWidth:850,height:"auto",aspectRatio:CW+"/"+CH,display:"block",borderRadius:8,cursor:"default"}}),
    tip&&React.createElement("div",{style:{position:"absolute",left:Math.min(tip.x,CW-150),top:Math.max(tip.y,0),background:"rgba(14,14,14,0.96)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:4,padding:"5px 10px",pointerEvents:"none",zIndex:10,backdropFilter:"blur(12px)"}},
      React.createElement("div",{style:{color:"rgba(220,200,145,0.92)",fontSize:9,fontWeight:500}},tip.n.l),
      React.createElement("div",{style:{color:"rgba(255,255,255,0.28)",fontSize:7,marginTop:2}},(tip.n.sch||"")+(tip.n.sch?" · ":"")+(tip.n.tm||"")+" · Mod "+tip.n.mod)),
    React.createElement("div",{style:{display:"flex",gap:10,marginTop:10,flexWrap:"wrap",alignItems:"center"}},
      [{l:"THU",c:"rgba(255,255,255,0.18)"},{l:"Cornell",c:"rgba(180,40,40,0.5)"},{l:"Harvard",c:"rgba(200,170,100,0.5)"},{l:"MIT",c:"rgba(100,180,200,0.5)"}].map(s=>React.createElement("span",{key:s.l,style:{display:"flex",alignItems:"center",gap:3,fontSize:7,color:"rgba(255,255,255,0.18)"}},React.createElement("span",{style:{width:5,height:5,borderRadius:1,background:s.c,display:"inline-block"}}),s.l)),
      React.createElement("span",{style:{marginLeft:"auto",fontSize:5.5,color:"rgba(255,255,255,0.1)"}},"○ token · ▭ enc · ▬ repr · ⌒ self-attn · ⬡ output · ╌ skip"))
  );
}

window.NNSelfAttn = NNSelfAttn;
