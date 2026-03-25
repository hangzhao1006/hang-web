const { useState, useRef, useEffect, useCallback } = React;

const MC={A:{r:200,g:170,b:120},B:{r:130,g:175,b:155},C:{r:155,g:145,b:185},AB:{r:170,g:172,b:135},AC:{r:178,g:158,b:152},BC:{r:142,g:160,b:170},ABC:{r:210,g:195,b:145},F:{r:215,g:195,b:140},T:{r:175,g:170,b:162}};
const SA_C={THU:null,Cornell:{r:180,g:40,b:40},Harvard:{r:200,g:170,b:100},MIT:{r:100,g:180,b:200}};

const N=[
  // S0 A
  {id:"a01",l:"Form Study",x:55,y:44,st:0,mod:"A",sch:"THU"},
  {id:"a02",l:"Visual Lang I",x:55,y:54,st:0,mod:"A",sch:"THU"},
  {id:"a03",l:"Visual Lang II",x:55,y:64,st:0,mod:"A",sch:"THU"},
  {id:"a04",l:"3D Fundmntl",x:55,y:74,st:0,mod:"A",sch:"THU"},
  {id:"a05",l:"CN Art Hist",x:55,y:84,st:0,mod:"A",sch:"THU"},
  {id:"a06",l:"Arts&Crafts",x:55,y:94,st:0,mod:"A",sch:"THU"},
  {id:"a07",l:"Calligraphy",x:55,y:104,st:0,mod:"A",sch:"THU"},
  {id:"a08",l:"Foreign Art",x:55,y:114,st:0,mod:"A",sch:"THU"},
  {id:"a09",l:"Western Dsgn",x:55,y:124,st:0,mod:"A",sch:"THU"},
  {id:"a10",l:"Color Paint",x:55,y:134,st:0,mod:"A",sch:"THU"},
  {id:"a11",l:"Forming I",x:55,y:144,st:0,mod:"A",sch:"THU"},
  {id:"a12",l:"Seal Carving",x:55,y:154,st:0,mod:"A",sch:"THU"},
  {id:"a13",l:"Dye Pattern",x:55,y:164,st:0,mod:"A",sch:"THU"},
  {id:"a14",l:"Color Textile",x:55,y:174,st:0,mod:"A",sch:"THU"},
  {id:"a15",l:"Textile Hist",x:55,y:184,st:0,mod:"A",sch:"THU"},
  {id:"a16",l:"Textile Mat",x:55,y:194,st:0,mod:"A",sch:"THU"},
  {id:"a17",l:"Print&Dye I",x:55,y:204,st:0,mod:"A",sch:"THU"},
  {id:"a18",l:"Logo Design",x:55,y:214,st:0,mod:"A",sch:"THU"},
  {id:"a19",l:"Embroidery",x:55,y:224,st:0,mod:"A",sch:"THU"},
  {id:"a20",l:"Weaving Tech",x:55,y:234,st:0,mod:"A",sch:"THU"},
  {id:"a21",l:"Print&Dye II",x:55,y:244,st:0,mod:"A",sch:"THU"},
  {id:"a22",l:"Weaving",x:55,y:254,st:0,mod:"A",sch:"THU"},
  // S0 B
  {id:"b01",l:"Intro Comp",x:55,y:305,st:0,mod:"B",sch:"Cornell"},
  {id:"b02",l:"Dsgn&Prog Web",x:55,y:330,st:0,mod:"B",sch:"Cornell"},
  // S0 C
  {id:"c01",l:"Accounting",x:55,y:400,st:0,mod:"C",sch:"THU"},
  {id:"c02",l:"Econ I",x:55,y:420,st:0,mod:"C",sch:"THU"},
  {id:"c03",l:"Econ II",x:55,y:440,st:0,mod:"C",sch:"THU"},
  {id:"c04",l:"China Econ",x:55,y:460,st:0,mod:"C",sch:"THU"},

  // S1 A
  {id:"e-arch",l:"Cultural Arch",x:190,y:50,st:1,mod:"A",sch:"THU"},
  {id:"e-video",l:"Video&Audio",x:190,y:66,st:1,mod:"A",sch:"THU"},
  {id:"e-creative",l:"Creative Think",x:190,y:82,st:1,mod:"A",sch:"THU"},
  {id:"e-film",l:"Language Film",x:190,y:98,st:1,mod:"A",sch:"THU"},
  {id:"e-exhib",l:"Exhibition",x:190,y:114,st:1,mod:"A",sch:"THU"},
  {id:"e-charh",l:"Char Dsgn Hist",x:190,y:130,st:1,mod:"A",sch:"THU"},
  {id:"e-newmed",l:"New Media Art",x:190,y:146,st:1,mod:"A",sch:"THU"},
  {id:"e-infod1",l:"InfoDsgn AIGC",x:190,y:162,st:1,mod:"AB",sch:"THU"},
  {id:"e-method",l:"Methodology",x:190,y:178,st:1,mod:"A",sch:"THU"},
  {id:"e-dsgnpsy",l:"Design Psych",x:190,y:194,st:1,mod:"A",sch:"THU"},
  {id:"e-paint",l:"Painting&View",x:190,y:210,st:1,mod:"A",sch:"THU"},
  {id:"e-socio",l:"Design Socio",x:190,y:226,st:1,mod:"A",sch:"THU"},
  {id:"e-display",l:"Display Dsgn",x:190,y:242,st:1,mod:"A",sch:"THU"},
  {id:"e-survey",l:"Special Survey",x:190,y:258,st:1,mod:"A",sch:"THU"},
  {id:"e-prosem",l:"Proseminar",x:190,y:274,st:1,mod:"A",sch:"Harvard"},
  // S1 B
  {id:"e-mfg",l:"Manufacturing",x:190,y:300,st:1,mod:"B",sch:"THU"},
  {id:"e-iface",l:"Interface Dsgn",x:190,y:316,st:1,mod:"B",sch:"THU"},
  {id:"e-ixt1",l:"Ix Tech I",x:190,y:332,st:1,mod:"B",sch:"THU"},
  {id:"e-web",l:"Design Web",x:190,y:348,st:1,mod:"B",sch:"THU"},
  {id:"e-smart",l:"Smart Space",x:190,y:364,st:1,mod:"B",sch:"THU"},
  {id:"e-ixt2",l:"Ix Tech II",x:190,y:380,st:1,mod:"B",sch:"THU"},
  {id:"e-usab",l:"Usability Eng",x:190,y:396,st:1,mod:"B",sch:"THU"},
  {id:"e-btpie",l:"Innovation",x:190,y:412,st:1,mod:"B",sch:"THU"},
  {id:"e-ubiq",l:"Ubiquitous Tech",x:190,y:428,st:1,mod:"B",sch:"THU"},
  // S1 C
  {id:"e-finrpt",l:"Financial Rpt",x:190,y:450,st:1,mod:"C",sch:"Cornell"},
  {id:"e-micro",l:"Micro Econ",x:190,y:466,st:1,mod:"C",sch:"THU"},
  {id:"e-macro",l:"Macro Econ",x:190,y:482,st:1,mod:"C",sch:"THU"},
  {id:"e-econth",l:"Econ Thought",x:190,y:498,st:1,mod:"C",sch:"THU"},
  {id:"e-corpfin",l:"Corp Finance",x:190,y:514,st:1,mod:"C",sch:"THU"},
  {id:"e-polecon",l:"Political Econ",x:190,y:530,st:1,mod:"C",sch:"THU"},
  {id:"e-invest",l:"Investment",x:190,y:546,st:1,mod:"C",sch:"THU"},
  {id:"e-cpp",l:"C++ Prog",x:190,y:562,st:1,mod:"C",sch:"THU"},

  // S2 repr
  {id:"hA",l:"h_A",x:320,y:160,st:2,mod:"A",type:"repr"},
  {id:"hB",l:"h_B",x:320,y:365,st:2,mod:"B",type:"repr"},
  {id:"hC",l:"h_C",x:320,y:505,st:2,mod:"C",type:"repr"},

  // Struct Co-TRM
  {id:"st-coAB",l:"Co-TRM A↔B",x:395,y:255,st:2.5,mod:"AB",type:"struct"},
  {id:"st-coBC",l:"Co-TRM B↔C",x:395,y:440,st:2.5,mod:"BC",type:"struct"},
  {id:"st-coAC",l:"Co-TRM A↔C",x:395,y:345,st:2.5,mod:"AC",type:"struct"},

  // S3 cross-modal
  {id:"x01",l:"Dynamic Infogfx",x:475,y:170,st:3,mod:"AB",sch:"THU"},
  {id:"x02",l:"InfoDesign&Art",x:475,y:188,st:3,mod:"AB",sch:"THU"},
  {id:"x03",l:"Prototyping",x:475,y:206,st:3,mod:"AB",sch:"THU"},
  {id:"x04",l:"UI Foundation",x:475,y:224,st:3,mod:"AB",sch:"THU"},
  {id:"x05",l:"HCI Studio",x:475,y:242,st:3,mod:"AB",sch:"Cornell"},
  {id:"x06",l:"IxD Studio",x:475,y:260,st:3,mod:"AB",sch:"Cornell"},
  {id:"x07",l:"Intermed Web",x:475,y:278,st:3,mod:"AB",sch:"Cornell"},
  {id:"x08",l:"Ix Design I",x:475,y:296,st:3,mod:"AB",sch:"THU"},
  {id:"x09",l:"Comp Train II",x:475,y:314,st:3,mod:"AB",sch:"THU"},
  {id:"x10",l:"Prof Practice",x:475,y:332,st:3,mod:"AB",sch:"THU"},
  {id:"x11",l:"Ix Design II",x:475,y:350,st:3,mod:"AB",sch:"THU"},
  {id:"x12",l:"InfoDsgn TD",x:475,y:368,st:3,mod:"AB",sch:"THU"},
  {id:"x13",l:"Digital Prod",x:475,y:386,st:3,mod:"AB",sch:"Harvard"},
  {id:"x14",l:"Info Gfx Dsgn",x:475,y:408,st:3,mod:"AC",sch:"THU"},
  {id:"x15",l:"Quant Aesth",x:475,y:426,st:3,mod:"AC",sch:"Harvard"},
  {id:"x16",l:"Intro DataSci",x:475,y:452,st:3,mod:"BC",sch:"Cornell"},
  {id:"x17",l:"Cognitive Psy",x:475,y:470,st:3,mod:"BC",sch:"THU"},
  {id:"x18",l:"Adv DataSci",x:475,y:488,st:3,mod:"BC",sch:"Harvard"},
  {id:"x19",l:"Biomech",x:475,y:506,st:3,mod:"BC",sch:"Harvard"},
  {id:"x20",l:"Mobile Sensor",x:475,y:524,st:3,mod:"BC",sch:"MIT"},

  // Struct
  {id:"st-cat",l:"Concat + Proj",x:575,y:360,st:3.5,mod:"F",type:"struct"},
  {id:"st-sa",l:"Self-Attention",x:665,y:320,st:4,mod:"T",type:"struct"},
  {id:"st-ffn",l:"FFN",x:665,y:370,st:4,mod:"T",type:"struct"},
  {id:"st-an",l:"Add & Norm",x:665,y:415,st:4,mod:"T",type:"struct"},

  // S4
  {id:"t01",l:"Diploma Thesis",x:745,y:305,st:4,mod:"ABC",sch:"THU"},
  {id:"t02",l:"ML Algo→Apps",x:745,y:345,st:4,mod:"ABC",sch:"MIT"},
  {id:"t03",l:"Physics ML",x:745,y:385,st:4,mod:"ABC",sch:"MIT"},
  {id:"t04",l:"Media Tech",x:745,y:425,st:4,mod:"ABC",sch:"MIT"},

  // S5
  {id:"o01",l:"Audeate",x:845,y:185,st:5,mod:"ABC",sch:"Harvard"},
  {id:"o02",l:"Tuchsure",x:845,y:245,st:5,mod:"AB",sch:"THU"},
  {id:"o03",l:"PG-MoE",x:845,y:305,st:5,mod:"BC",sch:"Harvard"},
  {id:"o04",l:"SerenEcho",x:845,y:365,st:5,mod:"AB",sch:"THU"},
  {id:"o05",l:"SeePal",x:845,y:425,st:5,mod:"AB",sch:"THU"},
  {id:"o06",l:"TideEcho",x:845,y:475,st:5,mod:"AB",sch:"THU"},
  {id:"o07",l:"SkinMe",x:845,y:530,st:5,mod:"BC",sch:"THU"},

  // S6
  {id:"s01",l:"Multimodal AI",x:960,y:60,st:6,mod:"ABC"},
  {id:"s02",l:"ML Systems",x:960,y:90,st:6,mod:"BC"},
  {id:"s03",l:"Edge AI",x:960,y:120,st:6,mod:"BC"},
  {id:"s04",l:"Embedded Sensing",x:960,y:150,st:6,mod:"BC"},
  {id:"s05",l:"Physical Comp",x:960,y:180,st:6,mod:"AB"},
  {id:"s06",l:"Full-Stack Proto",x:960,y:210,st:6,mod:"ABC"},
  {id:"s07",l:"Human-AI Ix",x:960,y:240,st:6,mod:"AB"},
  {id:"s08",l:"Interaction Dsgn",x:960,y:270,st:6,mod:"AB"},
  {id:"s09",l:"Tangible Interface",x:960,y:300,st:6,mod:"AB"},
  {id:"s10",l:"Info Viz",x:960,y:330,st:6,mod:"AC"},
  {id:"s11",l:"UX Research",x:960,y:360,st:6,mod:"AB"},
  {id:"s12",l:"Data-Driven Dsgn",x:960,y:390,st:6,mod:"AC"},
  {id:"s13",l:"Quant Analysis",x:960,y:420,st:6,mod:"C"},
  {id:"s14",l:"System Thinking",x:960,y:450,st:6,mod:"ABC"},
  {id:"s15",l:"Wearable Proto",x:960,y:480,st:6,mod:"AB"},
  {id:"s16",l:"Research→Proto",x:960,y:510,st:6,mod:"ABC"},
  {id:"s17",l:"Creative Coding",x:960,y:540,st:6,mod:"AB"},
  {id:"s18",l:"Sensor Fusion",x:960,y:565,st:6,mod:"BC"},
];

const nMap=Object.fromEntries(N.map(n=>[n.id,n]));

// SELF-ATTENTION: [idA, idB, weight(0-1)]
// Weight controls BOTH thickness AND opacity — higher = thicker + more visible
const SELF_ATT=[
  ["a01","a02",0.8],["a02","a03",0.9],["a01","a04",0.7],["a10","a14",0.8],
  ["a07","a12",0.85],["a13","a17",0.9],["a21","a17",0.8],["a20","a22",0.9],
  ["a19","a20",0.7],["a16","a15",0.75],["a05","a08",0.8],["a06","a09",0.8],
  ["a11","a04",0.7],["a18","a07",0.5],
  ["b01","b02",0.9],
  ["c01","c02",0.7],["c02","c03",0.95],["c03","c04",0.6],
  ["e-video","e-film",0.9],["e-film","e-newmed",0.75],["e-exhib","e-display",0.85],
  ["e-creative","e-newmed",0.6],["e-arch","e-exhib",0.7],["e-charh","e-method",0.5],
  ["e-infod1","e-method",0.8],["e-dsgnpsy","e-socio",0.75],["e-paint","e-display",0.5],
  ["e-survey","e-prosem",0.6],
  ["e-ixt1","e-ixt2",0.95],["e-iface","e-web",0.8],["e-smart","e-ubiq",0.85],
  ["e-usab","e-iface",0.7],["e-mfg","e-ubiq",0.5],["e-ixt2","e-ubiq",0.8],
  ["e-micro","e-macro",0.9],["e-corpfin","e-invest",0.85],["e-corpfin","e-finrpt",0.8],
  ["e-econth","e-polecon",0.75],["e-invest","e-finrpt",0.7],
  ["x01","x02",0.85],["x03","x04",0.8],["x05","x06",0.9],["x08","x11",0.95],
  ["x12","x01",0.7],["x07","x04",0.65],["x09","x10",0.8],["x13","x03",0.6],
  ["x11","x12",0.75],["x14","x15",0.7],
  ["x16","x18",0.85],["x17","x19",0.6],["x18","x20",0.7],["x19","x20",0.75],
  ["t01","t04",0.6],["t02","t03",0.9],["t02","t04",0.7],
];

// FLOW EDGES
const E=[];
let _s=42;function sr(){_s=((_s*1103515245+12345)&0x7fffffff);return _s/0x7fffffff}
N.filter(n=>n.st===0).forEach(t=>{const tg=N.filter(e=>e.st===1&&(e.mod===t.mod||e.mod.includes(t.mod)));[...tg].sort(()=>sr()-0.5).slice(0,2).forEach(e=>E.push([t.id,e.id]))});
N.filter(n=>n.st===1).forEach(e=>{if(e.mod==="A"||e.mod==="AB")E.push([e.id,"hA"]);if(e.mod==="B"||e.mod==="AB")E.push([e.id,"hB"]);if(e.mod==="C")E.push([e.id,"hC"])});
E.push(["hA","st-coAB"],["hB","st-coAB"],["hB","st-coBC"],["hC","st-coBC"],["hA","st-coAC"],["hC","st-coAC"]);
N.filter(n=>n.st===3&&n.mod==="AB").forEach(n=>E.push(["st-coAB",n.id]));
N.filter(n=>n.st===3&&n.mod==="BC").forEach(n=>E.push(["st-coBC",n.id]));
N.filter(n=>n.st===3&&n.mod==="AC").forEach(n=>E.push(["st-coAC",n.id]));
N.filter(n=>n.st===3).forEach(n=>E.push([n.id,"st-cat"]));
E.push(["st-cat","st-sa"],["st-sa","st-ffn"],["st-ffn","st-an"]);
N.filter(n=>n.st===4&&!n.type).forEach(n=>{E.push(["st-cat",n.id]);E.push([n.id,"st-an"])});
E.push(["hA","st-an"],["hC","st-an"],["st-cat","st-an"]);
N.filter(n=>n.st===5).forEach(n=>E.push(["st-an",n.id]));
N.filter(n=>n.st===5).forEach(o=>{N.filter(s=>s.st===6&&[...o.mod].some(m=>s.mod.includes(m))).sort(()=>sr()-0.5).slice(0,4).forEach(s=>E.push([o.id,s.id]))});
["e-ubiq","e-ixt2","e-prosem","e-cpp"].forEach(id=>{N.filter(n=>n.st===4&&!n.type).forEach(t=>E.push([id,t.id]))});

const skipSet=new Set(["hA→st-an","hC→st-an","st-cat→st-an",...["e-ubiq","e-ixt2","e-prosem","e-cpp"].flatMap(id=>N.filter(n=>n.st===4&&!n.type).map(t=>id+"→"+t.id))]);

function trace(id){
  const fw={},bw={};
  E.forEach(([a,b])=>{(fw[a]||(fw[a]=[])).push(b);(bw[b]||(bw[b]=[])).push(a)});
  SELF_ATT.forEach(([a,b])=>{(fw[a]||(fw[a]=[])).push(b);(bw[b]||(bw[b]=[])).push(a);(fw[b]||(fw[b]=[])).push(a);(bw[a]||(bw[a]=[])).push(b)});
  const ns=new Set(),es=new Set();
  const f=i=>{if(ns.has(i))return;ns.add(i);(fw[i]||[]).forEach(n=>{es.add(i+"→"+n);f(n)})};
  const b=i=>{if(ns.has(i))return;ns.add(i);(bw[i]||[]).forEach(n=>{es.add(n+"→"+i);b(n)})};
  b(id);ns.delete(id);f(id);return{ns,es};
}

const CW=1060,CH=600;

function NNSelfAttn(){
  const cvs=useRef(null);const[act,setAct]=useState(null);const[hov,setHov]=useState(null);const[tip,setTip]=useState(null);
  const pts=useRef([]);const raf=useRef(null);const td=useRef({ns:new Set(),es:new Set()});const amb=useRef(null);const tm=useRef(0);
  const dpr=typeof window!=='undefined'?(window.devicePixelRatio||1):1;

  const spawn=useCallback(ed=>{const r=[];ed.forEach(e=>{const[a,b]=e.split("→");const f=nMap[a],t=nMap[b];if(f&&t)for(let i=0;i<2;i++)r.push({fx:f.x,fy:f.y,tx:t.x,ty:t.y,t:Math.random()*0.3,sp:0.002+Math.random()*0.003,sz:0.4+Math.random()*1.1,a:true})});pts.current=r},[]);
  const hit=useCallback((mx,my)=>{for(const n of N){const dx=mx-n.x,dy=my-n.y;const r=n.type==="struct"?20:n.type==="repr"?15:n.st===0?6:n.st===6?14:n.st===5?11:10;if(dx*dx+dy*dy<(r+5)*(r+5))return n}return null},[]);
  const oc=useCallback(e=>{const r=cvs.current.getBoundingClientRect();const n=hit((e.clientX-r.left)*(CW/r.width),(e.clientY-r.top)*(CH/r.height));if(n&&n.id!==act){setAct(n.id);const d=trace(n.id);td.current=d;spawn(d.es)}else{setAct(null);td.current={ns:new Set(),es:new Set()};pts.current=[]}},[act,spawn,hit]);
  const om=useCallback(e=>{const r=cvs.current.getBoundingClientRect();const n=hit((e.clientX-r.left)*(CW/r.width),(e.clientY-r.top)*(CH/r.height));setHov(n?n.id:null);setTip(n?{x:e.clientX-r.left+12,y:e.clientY-r.top-30,n}:null);cvs.current.style.cursor=n?'pointer':'default'},[hit]);

  useEffect(()=>{
    const c=cvs.current,ctx=c.getContext("2d");c.width=CW*dpr;c.height=CH*dpr;ctx.scale(dpr,dpr);
    if(!amb.current){amb.current=[];for(let i=0;i<130;i++)amb.current.push({x:Math.random()*CW,y:Math.random()*CH,vx:(Math.random()-0.5)*0.05,vy:(Math.random()-0.5)*0.03,sz:Math.random()*0.8,al:0.04+Math.random()*0.14})}
    function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}

    function draw(){
      tm.current+=0.016;ctx.fillStyle="#0b0b0b";ctx.fillRect(0,0,CW,CH);
      const ha=act!==null;const{ns:aN,es:aE}=td.current;

      // Grid
      ctx.fillStyle="rgba(255,255,255,0.007)";for(let x=8;x<CW;x+=18)for(let y=8;y<CH;y+=18){ctx.beginPath();ctx.arc(x,y,0.25,0,Math.PI*2);ctx.fill()}

      // Ambient
      if(!ha)amb.current.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=CW;if(p.x>CW)p.x=0;if(p.y<0)p.y=CH;if(p.y>CH)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.sz,0,Math.PI*2);ctx.fillStyle=`rgba(190,175,130,${p.al})`;ctx.fill()});

      // Labels
      ctx.save();ctx.font="500 6px 'SF Mono','Menlo','Courier New',monospace";ctx.textAlign="center";
      [{x:55,t:"Token Embed"},{x:190,t:"Unimodal Enc"},{x:320,t:"Repr h_i"},{x:395,t:"Co-TRM (Q,K,V)"},{x:475,t:"Cross-Modal"},{x:575,t:"Concat+Proj"},{x:665,t:"TRM (×N)"},{x:745,t:"Fusion"},{x:845,t:"Output"},{x:960,t:"Skill Readout"}].forEach(lb=>{ctx.fillStyle="rgba(255,255,255,0.13)";ctx.fillText(lb.t,lb.x,18)});
      ctx.restore();

      // Seps
      ctx.strokeStyle="rgba(255,255,255,0.015)";ctx.lineWidth=0.3;
      [130,260,355,435,530,615,705,790,900].forEach(x=>{ctx.beginPath();ctx.moveTo(x,25);ctx.lineTo(x,CH-10);ctx.stroke()});

      // Modality bands
      [{y:35,h:235,c:MC.A},{y:290,h:155,c:MC.B},{y:390,h:100,c:MC.C}].forEach(b=>{
        ctx.fillStyle=`rgba(${b.c.r},${b.c.g},${b.c.b},0.01)`;ctx.fillRect(12,b.y,250,b.h);
        ctx.strokeStyle=`rgba(${b.c.r},${b.c.g},${b.c.b},0.04)`;ctx.lineWidth=0.3;ctx.setLineDash([3,5]);ctx.strokeRect(12,b.y,250,b.h);ctx.setLineDash([]);
      });

      // ═══ SELF-ATTENTION ARCS (weight → thickness + opacity) ═══
      SELF_ATT.forEach(([a,b,w])=>{
        const na=nMap[a],nb=nMap[b];if(!na||!nb)return;
        const both=ha&&aN.has(a)&&aN.has(b);
        const dim=ha&&!both;
        const cc=MC[na.mod]||MC.A;
        const midX=Math.max(na.x,nb.x)+16+w*14;
        ctx.beginPath();ctx.moveTo(na.x+3,na.y);ctx.quadraticCurveTo(midX,(na.y+nb.y)/2,nb.x+3,nb.y);
        if(dim){
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},0.006)`;ctx.lineWidth=0.08;
        }else if(both){
          // Active: weight directly scales both
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${0.15+w*0.4})`;ctx.lineWidth=0.5+w*2;
        }else{
          // Default: weight scales both (the key visual!)
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${0.02+w*0.08})`;ctx.lineWidth=0.15+w*0.7;
        }
        ctx.stroke();
      });

      // ═══ FLOW EDGES ═══
      E.forEach(([a,b])=>{
        const f=nMap[a],t=nMap[b];if(!f||!t)return;const ek=a+"→"+b;const ia=aE.has(ek);const sk=skipSet.has(ek);const cc=MC[f.mod]||MC.T;
        ctx.beginPath();
        if(sk){ctx.moveTo(f.x,f.y);ctx.quadraticCurveTo((f.x+t.x)/2,ek.includes("hA")||ek.includes("e-")?28:CH-18,t.x,t.y);ctx.setLineDash([3,3])}
        else{const dx=t.x-f.x;ctx.moveTo(f.x,f.y);ctx.bezierCurveTo(f.x+dx*0.4,f.y,t.x-dx*0.4,t.y,t.x,t.y);ctx.setLineDash([])}
        if(ha){ctx.strokeStyle=ia?`rgba(${cc.r},${cc.g},${cc.b},${sk?0.5:0.22})`:"rgba(255,255,255,0.004)";ctx.lineWidth=ia?(sk?1:0.45):0.06}
        else{ctx.strokeStyle=sk?"rgba(210,190,140,0.06)":"rgba(255,255,255,0.025)";ctx.lineWidth=sk?0.55:0.22}
        ctx.stroke();ctx.setLineDash([]);
      });

      // Particles
      pts.current.forEach(p=>{p.t+=p.sp;if(p.t>=1){p.a=false;return}const t=p.t,mt=1-t,dx=p.tx-p.fx;const c1=p.fx+dx*0.4,c2=p.tx-dx*0.4;const px=mt*mt*mt*p.fx+3*mt*mt*t*c1+3*mt*t*t*c2+t*t*t*p.tx;const py=mt*mt*mt*p.fy+3*mt*mt*t*p.fy+3*mt*t*t*p.ty+t*t*t*p.ty;const al=Math.sin(t*Math.PI);ctx.beginPath();ctx.arc(px,py,p.sz+2,0,Math.PI*2);ctx.fillStyle=`rgba(210,195,130,${al*0.1})`;ctx.fill();ctx.beginPath();ctx.arc(px,py,p.sz,0,Math.PI*2);ctx.fillStyle=`rgba(245,230,170,${al*0.85})`;ctx.fill()});
      pts.current=pts.current.filter(p=>p.a);
      if(ha&&pts.current.length<60){aE.forEach(e=>{if(Math.random()<0.04){const[a,b]=e.split("→");const f=nMap[a],t=nMap[b];if(f&&t)pts.current.push({fx:f.x,fy:f.y,tx:t.x,ty:t.y,t:0,sp:0.002+Math.random()*0.003,sz:0.3+Math.random()*1,a:true})}})}

      // ═══ NODES ═══
      N.forEach(n=>{
        const cc=MC[n.mod]||MC.T;const ia=ha&&(aN.has(n.id)||n.id===act);const ih=n.id===hov;const dim=ha&&!ia;
        ctx.globalAlpha=dim?0.06:1;const fa=ih?0.8:ia?0.55:0.22;const sa=n.sch?SA_C[n.sch]:null;

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
          ctx.font="500 5.5px 'SF Mono','Menlo',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.04:0.6})`;ctx.textAlign="center";ctx.fillText(n.l,n.x,n.y+17);
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
      ctx.fillStyle="rgba(200,170,120,0.1)";ctx.fillText("residual skip (h_A)",530,22);
      ctx.fillStyle="rgba(155,145,185,0.1)";ctx.fillText("residual skip (h_C)",530,CH-6);
      ctx.restore();

      ctx.save();ctx.font="400 5px 'SF Mono',monospace";ctx.fillStyle="rgba(255,255,255,0.07)";
      ctx.textAlign="left";ctx.fillText("Tsinghua · Cornell · Harvard GSD · MIT — 2020–2026",12,CH-6);
      ctx.textAlign="right";ctx.fillText("Multimodal Transformer · Self-Attention · Cross-Attention · Residual",CW-12,CH-6);
      ctx.restore();

      raf.current=requestAnimationFrame(draw);
    }
    draw();return()=>cancelAnimationFrame(raf.current);
  },[act,hov,dpr]);

  return React.createElement("div",{style:{position:"relative"}},
    React.createElement("canvas",{ref:cvs,onClick:oc,onMouseMove:om,onMouseLeave:()=>{setHov(null);setTip(null)},style:{width:"100%",minWidth:850,height:"auto",aspectRatio:CW+"/"+CH,display:"block",borderRadius:8,cursor:"default"}}),
    tip&&React.createElement("div",{style:{position:"absolute",left:Math.min(tip.x,CW-150),top:Math.max(tip.y,0),background:"rgba(14,14,14,0.96)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:4,padding:"5px 10px",pointerEvents:"none",zIndex:10,backdropFilter:"blur(12px)"}},
      React.createElement("div",{style:{color:"rgba(220,200,145,0.92)",fontSize:9,fontWeight:500}},tip.n.l),
      React.createElement("div",{style:{color:"rgba(255,255,255,0.28)",fontSize:7,marginTop:2}},(tip.n.sch||"")+(tip.n.sch?" · ":"")+"Stage "+(tip.n.st>=0?tip.n.st:"S")+" · Mod "+tip.n.mod)),
    React.createElement("div",{style:{display:"flex",gap:10,marginTop:10,flexWrap:"wrap",alignItems:"center"}},
      [{l:"THU",c:"rgba(255,255,255,0.18)"},{l:"Cornell",c:"rgba(180,40,40,0.5)"},{l:"Harvard",c:"rgba(200,170,100,0.5)"},{l:"MIT",c:"rgba(100,180,200,0.5)"}].map(s=>React.createElement("span",{key:s.l,style:{display:"flex",alignItems:"center",gap:3,fontSize:7,color:"rgba(255,255,255,0.18)"}},React.createElement("span",{style:{width:5,height:5,borderRadius:1,background:s.c,display:"inline-block"}}),s.l)),
      React.createElement("span",{style:{marginLeft:"auto",fontSize:5.5,color:"rgba(255,255,255,0.1)"}},"○ token · ▭ enc · ▬ repr · ⌒ self-attn · ⬡ output · ╌ skip"))
  );
}

window.NNSelfAttn = NNSelfAttn;
