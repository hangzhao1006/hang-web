const { useState, useRef, useEffect, useCallback } = React;

const MC={A:{r:200,g:170,b:120},B:{r:130,g:175,b:155},C:{r:155,g:145,b:185},AB:{r:170,g:172,b:135},AC:{r:178,g:158,b:152},BC:{r:142,g:160,b:170},ABC:{r:210,g:195,b:145},F:{r:215,g:195,b:140},T:{r:175,g:170,b:162}};
const SA_C={THU:null,Cornell:{r:180,g:40,b:40},Harvard:{r:200,g:170,b:100},MIT:{r:100,g:180,b:200}};

const CW=1180,CH=820;

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
add("a01","Form Study","20a",0,"A","THU",{full:"Form Study · THU · 2020F"});
add("a02","Visual Lang I","20a",0,"A","THU",{full:"Visual Language I · THU · 2020F"});
add("a03","Visual Lang II","20a",0,"A","THU",{full:"Visual Language II · THU · 2020F"});
add("a04","3D Fundmntl","20a",0,"A","THU",{full:"Fundamentals: 3D · THU · 2020F"});
add("a05","CN Art Hist","20a",0,"A","THU",{full:"Chinese Art History · THU · 2020F"});
add("a06","Arts&Crafts","20a",0,"A","THU",{full:"History of Chinese Arts and Crafts and Design · THU · 2020F"});
add("a07","Calligraphy","20b",0,"A","THU",{full:"Calligraphy · THU · 2021S"});
add("a08","Foreign Art","20b",0,"A","THU",{full:"Foreign Art History · THU · 2021S"});
add("a09","Western Dsgn","20b",0,"A","THU",{full:"History of Foreign Arts and Crafts and History of Western Modern Design · THU · 2021S"});
add("a10","Color Paint","20b",0,"A","THU",{full:"Color Painting · THU · 2021S"});
add("a11","Forming I","20b",0,"A","THU",{full:"Fundamentals of Forming I · THU · 2021S"});
add("a12","Seal Carving","21a",0,"A","THU",{full:"Calligraphy and Seal Carving Creation · THU · 2021F"});
add("a13","Dye Pattern","21a",0,"A","THU",{full:"Dyeing and Weaving Pattern Base · THU · 2021F"});
add("a14","Color Textile","21a",0,"A","THU",{full:"Color Design of Textile and Fashion · THU · 2021F"});
add("a15","Textile Hist","21a",0,"A","THU",{full:"History of Chinese and Foreign Textile Patterns · THU · 2021F"});
add("a16","Textile Mat","21a",0,"A","THU",{full:"Study of Textile Materials · THU · 2021F"});
add("a17","Print&Dye I","21a",0,"A","THU",{full:"Foundation of Printing and Dyeing Technology I · THU · 2021F"});
add("a18","Logo Design","21b",0,"A","THU",{full:"Logo Design · THU · 2022S"});
add("a19","Embroidery","21b",0,"A","THU",{full:"Embroidery Craft · THU · 2022S"});
add("a20","Weaving Tech","21b",0,"A","THU",{full:"Weaving Technology Foundation · THU · 2022S"});
add("a21","Print&Dye II","21b",0,"A","THU",{full:"Foundation of Printing and Dyeing Technology II · THU · 2022S"});
add("a22","Weaving","21b",0,"A","THU",{full:"Weaving · THU · 2022S"});
// Mod B (2023 Cornell — late entry)
add("b01","Intro Computing","23f",0,"B","Cornell",{full:"Intro Computing: Design & Dev · Cornell · 2023F"});
add("b02","Dsgn&Prog Web","23f",0,"B","Cornell",{full:"Intro Design & Prog for Web · Cornell · 2023F"});
// Mod C (2022 — mid entry)
add("c01","Accounting","22a",0,"C","THU",{full:"Accounting Principles · THU · 2022F"});
add("c02","Econ I","22a",0,"C","THU",{full:"Principles of Economics I · THU · 2022F"});
add("c03","Econ II","22b",0,"C","THU",{full:"Principles of Economics II · THU · 2023S"});
add("c04","China Econ","22b",0,"C","THU",{full:"Topics on China Economy · THU · 2023S"});

// S1: Unimodal Encoder
// Mod A
add("e-arch","Cultural Arch","22a",1,"A","THU",{full:"Cultural Learning on Architecture · THU · 2022F"});
add("e-video","Video&Audio","22a",1,"A","THU",{full:"Digital Video and Audio Design · THU · 2022F"});
add("e-creative","Creative Think","22a",1,"A","THU",{full:"Creative Thinking · THU · 2022F"});
add("e-film","Language Film","22a",1,"A","THU",{full:"The Language of Film · THU · 2022F"});
add("e-exhib","Exhibition","22b",1,"A","THU",{full:"Exhibition Design · THU · 2023S"});
add("e-newmed","New Media Art","22b",1,"A","THU",{full:"New Media Art · THU · 2023S"});
add("e-method","Methodology","24b",1,"A","THU",{full:"Methodology of Information Design · THU · 2024S"});
add("e-dsgnpsy","Design Psych","24b",1,"A","THU",{full:"Design Psychology · THU · 2024S"});
add("e-display","Display Dsgn","25a",1,"A","THU",{full:"Originality of Display Design · THU · 2024F"});
add("e-prosem","Proseminar","25f",1,"A","Harvard",{full:"Proseminar in MEDIUMS · Harvard · 2025F"});
// Mod B
add("e-iface","Interface Dsgn","24b",1,"B","THU",{full:"Interface Design · THU · 2024S"});
add("e-ixt1","Ix Tech I","24b",1,"B","THU",{full:"Interaction Technology I · THU · 2024S"});
add("e-web","Design Web","24b",1,"B","THU",{full:"Design for Web · THU · 2024S"});
add("e-smart","Smart Space","24b",1,"B","THU",{full:"Design of Smart Space · THU · 2024S"});
add("e-ixt2","Ix Tech II","24b",1,"B","THU",{full:"Interaction Technology II · THU · 2024S"});
add("e-usab","Usability","24b",1,"B","THU",{full:"Usability Engineering · THU · 2024S"});
add("e-infod1","InfoDsgn AIGC","24b",1,"AB","THU",{full:"Information Design I · THU · 2024S"});
add("e-ubiq","Ubiquitous Tech","25a",1,"B","THU",{full:"Ubiquitous Electronic Technology · THU · 2024F"});
// Mod C
add("c05","Financial Rpt","23f",1,"C","Cornell",{full:"Corp. Financial Reporting I · Cornell · 2023F"});
add("e-micro","Micro Econ","25a",1,"C","THU",{full:"Intermediate Microeconomics · THU · 2024F"});
add("e-macro","Macro Econ","25a",1,"C","THU",{full:"Intermediate Macroeconomics · THU · 2024F"});
add("e-corpfin","Corp Finance","25a",1,"C","THU",{full:"Corporate Finance · THU · 2024F"});
add("e-invest","Investment","25b",1,"C","THU",{full:"Investment · THU · 2025S"});
add("e-cpp","C++ Prog","25b",1,"C","THU",{full:"C++ Programming · THU · 2025S"});

// S2: Repr
add("hA","h_A","repr",2,"A",null,{type:"repr"});
add("hB","h_B","repr",2,"B",null,{type:"repr"});
add("hC","h_C","repr",2,"C",null,{type:"repr"});

// S2.5: Co-TRM structural
add("st-coAB","Co-TRM A↔B","cotrm",2.5,"AB",null,{type:"struct"});
add("st-coBC","Co-TRM B↔C","cotrm",2.5,"BC",null,{type:"struct"});
add("st-coAC","Co-TRM A↔C","cotrm",2.5,"AC",null,{type:"struct"});

// S3: Cross-Modal courses (sorted by time)
add("x01","Dynamic Infogfx","22a",3,"AB","THU",{full:"Dynamic Infographics · THU · 2022F"});
add("x02","InfoDesign&Art","22a",3,"AB","THU",{full:"Introduction to Information Design and Art · THU · 2022F"});
add("x03","Prototyping","22b",3,"AB","THU",{full:"Fundamental of Prototyping Design · THU · 2023S"});
add("x04","UI Foundation","22b",3,"AB","THU",{full:"Foundation of User Interface Design · THU · 2023S"});
add("x14","Info Gfx Dsgn","22b",3,"AC","THU",{full:"Information Graphic Design · THU · 2023S"});
add("x05","HCI Studio","23f",3,"AB","Cornell",{full:"HCI Studio · Cornell · 2023F"});
add("x06","IxD Studio","24s",3,"AB","Cornell",{full:"Interaction Design Studio · Cornell · 2024S"});
add("x07","Intermed Web","24s",3,"AB","Cornell",{full:"Intermed Design & Prog for Web · Cornell · 2024S"});
add("x16","Intro DataSci","24s",3,"BC","Cornell",{full:"Introduction to Data Science · Cornell · 2024S"});
add("x08","Ix Design I","24b",3,"AB","THU",{full:"Interaction Design I · THU · 2024S"});
add("x09","Comp Train II","25a",3,"AB","THU",{full:"Comprehensive Training II · THU · 2024 Sum"});
add("x10","Prof Practice","25a",3,"AB","THU",{full:"Professional Practice · THU · 2024 Sum"});
add("x11","Ix Design II","25a",3,"AB","THU",{full:"Interaction Design II · THU · 2024F"});
add("x12","InfoDsgn TD","25a",3,"AB","THU",{full:"Information Design II · THU · 2024F"});
add("x17","Cog Psychology","25b",3,"BC","THU",{full:"Cognitive Psychology · THU · 2025S"});
add("x13","Digital Prod","25f",3,"AB","Harvard",{full:"Digital Production at Scale · Harvard · 2025F"});
add("x15","Quant Aesthetics","25f",3,"AC","Harvard",{full:"Quantitative Aesthetics · Harvard · 2025F"});
add("x18","Adv DataSci","25f",3,"BC","Harvard",{full:"Adv Practical Data Science · Harvard · 2025F"});
add("x19","Biomech Move","26s",3,"BC","Harvard",{full:"Biomechanics of Movement · Harvard · 2026S"});
add("x20","Mobile Sensor","26s",3,"BC","MIT",{full:"Mobile and Sensor Computing · MIT · 2026S"});

// S3.5: Concat
add("st-cat","Concat+Proj","cat",3.5,"F",null,{type:"struct"});

// S4: Transformer / high fusion
add("st-sa","Self-Attention","trm",4,"T",null,{type:"struct"});
add("st-ffn","FFN","trm",4,"T",null,{type:"struct"});
add("t-diploma","Diploma Thesis","25b",4,"ABC","THU",{full:"Diploma Project (Creation) and Graduation Thesis · THU · 2025S"});
add("t-mlalgo","ML Algo→Apps","26s",4,"ABC","MIT",{full:"Model Mach Learn Algor to Apps · MIT · 2026S"});
add("t-physml","Physics ML","26s",4,"ABC","MIT",{full:"Phys Sys Mod Using Mach Learn · MIT · 2026S"});
add("t-media","Media Tech","26s",4,"ABC","MIT",{full:"Spec Subj in Media Technology · MIT · 2026S"});

// S4.5: Add&Norm
add("st-an","Add & Norm","an",4.5,"T",null,{type:"struct"});

// S5: Projects — positioned as SIDE BRANCHES from main backbone
// x = between the stage of their source courses and the next stage
// y = near their source courses' y position
add("o-tide","TideEcho","22b",5,"AB","THU",{yr:2022,srcStage:0,full:"TideEcho — Nature fabrication + sensor interaction · 2022"});
add("o-seepal","SeePal","23f",5,"AB","THU",{yr:2023,srcStage:1,full:"SeePal — HCI research + blind navigation · 2023"});
add("o-shadow","ShadowPlay","24s",5,"AB","THU",{yr:2024,srcStage:3,full:"ShadowPlay — Autism + interactive sensing · 2024"});
add("o-ehoura","Ehoura","24b",5,"AB","THU",{yr:2024,srcStage:3,full:"Ehoura — Interactive projection + sensing · 2024"});
add("o-seren","SerenEcho","25a",5,"AB","THU",{yr:2025,srcStage:3,full:"SerenEcho — Haptic interaction + sensor + spatial · 2025"});
add("o-symbio","Symbiophony","25a",5,"AB","THU",{yr:2025,srcStage:3,full:"Symbiophony — Sound interaction + sensor · 2025"});
add("o-tuch","Tuchsure","25b",5,"ABC","THU",{yr:2025,srcStage:4,full:"Tuchsure — Edge AI + haptic + blind recognition · 2025"});
add("o-skin","SkinMe","25b",5,"BC","THU",{yr:2025,srcStage:3,full:"SkinMe — AI app + API + CI/CD + Docker · 2025"});
add("o-light","LightScale","25b",5,"A","THU",{yr:2025,srcStage:1,full:"LightScale — Form design · 2025"});
add("o-pgmoe","PG-MoE","26s",5,"BC","Harvard",{yr:2026,srcStage:4,full:"PG-MoE — ML systems research · 2026"});
add("o-audeate","Audeate","26s",5,"ABC","Harvard",{yr:2026,srcStage:4,full:"Audeate — UIST 2026 · 2026"});

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
  const MY={A:[108,440],B:[470,620],C:[650,770]};
  const CROSS_Y={AB:[110,440],AC:[460,510],BC:[530,720],ABC:[410,610]};

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
  f("hA").x=SX[2];f("hA").y=260;
  f("hB").x=SX[2];f("hB").y=540;
  f("hC").x=SX[2];f("hC").y=710;

  // Struct nodes
  f("st-coAB").x=SX[2.5];f("st-coAB").y=400;
  f("st-coBC").x=SX[2.5];f("st-coBC").y=620;
  f("st-coAC").x=SX[2.5];f("st-coAC").y=510;
  f("st-cat").x=SX[3.5];f("st-cat").y=480;

  // S4: courses on TOP, structural below
  const s4Courses=N.filter(n=>n.st===4&&!n.type);
  s4Courses.sort((a,b)=>a.tOrd-b.tOrd);
  s4Courses.forEach((n,i)=>{n.x=SX[4];n.y=340+i*55});
  f("st-sa").x=SX[4];f("st-sa").y=590;
  f("st-ffn").x=SX[4]+5;f("st-ffn").y=650;
  f("st-an").x=SX[4.5];f("st-an").y=620;

  // Skills: evenly distributed full height
  const sk=N.filter(n=>n.st===6);
  sk.forEach((s,i)=>{s.x=SX[6];s.y=110+i*(CH-180)/(sk.length-1)});

  // ═══ PROJECTS — row just below stage labels ═══
  const projs=N.filter(n=>n.st===5);
  projs.sort((a,b)=>a.tOrd-b.tOrd);
  const projXBase={0:120,1:300,3:660,4:950};
  let projIdx=0;
  const projXUsed={};
  projs.forEach(p=>{
    const baseX=projXBase[p.srcStage]||660;
    const offsetKey=Math.round(baseX/50);
    projXUsed[offsetKey]=(projXUsed[offsetKey]||0);
    p.x=baseX+projXUsed[offsetKey]*65;
    p.y=55;
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

// ═══ EDGES ═══  [from, to, weight(0-1)]
const E=[];
let _s=42;function sr(){_s=((_s*1103515245+12345)&0x7fffffff);return _s/0x7fffffff}

// S0→S1 same modality, time-forward (weak — foundational)
N.filter(n=>n.st===0).forEach(t=>{
  const tg=N.filter(e=>e.st===1&&(e.mod===t.mod||e.mod.includes(t.mod))&&e.tOrd>=t.tOrd);
  [...tg].sort(()=>sr()-0.5).slice(0,Math.min(2,tg.length)).forEach(e=>E.push([t.id,e.id,0.2]));
});
// S1→repr
N.filter(n=>n.st===1).forEach(e=>{
  if(e.mod==="A"||e.mod==="AB")E.push([e.id,"hA",0.4]);
  if(e.mod==="B"||e.mod==="AB")E.push([e.id,"hB",0.4]);
  if(e.mod==="C")E.push([e.id,"hC",0.4]);
});
// repr→cotrm (structural, strong)
E.push(["hA","st-coAB",0.7],["hB","st-coAB",0.7],["hB","st-coBC",0.7],["hC","st-coBC",0.7],["hA","st-coAC",0.7],["hC","st-coAC",0.7]);
// cotrm→S3 (medium-strong)
N.filter(n=>n.st===3&&n.mod==="AB").forEach(n=>E.push(["st-coAB",n.id,0.5]));
N.filter(n=>n.st===3&&n.mod==="BC").forEach(n=>E.push(["st-coBC",n.id,0.5]));
N.filter(n=>n.st===3&&n.mod==="AC").forEach(n=>E.push(["st-coAC",n.id,0.5]));
// S3→concat (medium)
N.filter(n=>n.st===3).forEach(n=>E.push([n.id,"st-cat",0.4]));
// concat→trm struct (strong — backbone)
E.push(["st-cat","st-sa",0.8],["st-sa","st-ffn",0.8],["st-ffn","st-an",0.8]);
// concat→S4 courses (strong — key fusion)
N.filter(n=>n.st===4&&!n.type).forEach(n=>{E.push(["st-cat",n.id,0.7]);E.push([n.id,"st-an",0.7])});
// Skip connections (medium — residual)
E.push(["hA","st-an",0.5],["hC","st-an",0.5],["st-cat","st-an",0.6]);
// addnorm→late outputs (strong — direct output)
N.filter(n=>n.st===5&&(n.yr||0)>=2025).forEach(n=>E.push(["st-an",n.id,0.8]));
// Early outputs branch from nearby same-stage courses (medium)
N.filter(n=>n.st===5&&(n.yr||0)<2025).forEach(o=>{
  const srcSt=o.srcStage;
  const near=N.filter(n=>n.st===srcSt&&!n.type&&[...o.mod].some(m=>n.mod.includes(m)));
  near.sort((a,b)=>Math.abs(a.tOrd-o.tOrd)-Math.abs(b.tOrd-o.tOrd)).slice(0,3).forEach(n=>E.push([n.id,o.id,0.5]));
});
// Mid outputs (2025, srcStage 3) branch from S3
N.filter(n=>n.st===5&&(n.yr||0)===2025&&n.srcStage===3).forEach(o=>{
  const near=N.filter(n=>n.st===3&&[...o.mod].some(m=>n.mod.includes(m)));
  near.sort((a,b)=>Math.abs(a.tOrd-o.tOrd)-Math.abs(b.tOrd-o.tOrd)).slice(0,2).forEach(n=>E.push([n.id,o.id,0.6]));
});
// S5/S4/S3/S1 → S6: manually mapped by semantic relevance [from, to, weight]
// s00 Multimodal AI ← fusion courses + multimodal projects
E.push(["t-mlalgo","s00",0.9],["t-physml","s00",0.8],["t-media","s00",0.8],["o-audeate","s00",0.9],["o-pgmoe","s00",0.7]);
// s01 ML Systems ← ML courses + ML projects
E.push(["t-mlalgo","s01",0.9],["x18","s01",0.7],["o-pgmoe","s01",0.9],["o-skin","s01",0.5]);
// s02 Edge AI ← edge/embedded projects + mobile sensing
E.push(["o-tuch","s02",0.9],["e-ubiq","s02",0.6],["x20","s02",0.7],["t-mlalgo","s02",0.5]);
// s03 Embedded Sensing ← sensor courses + wearable projects
E.push(["x20","s03",0.9],["x19","s03",0.7],["e-ubiq","s03",0.6],["o-audeate","s03",0.8],["o-seren","s03",0.6]);
// s04 Physical Comp ← smart space, interaction tech, haptic projects
E.push(["e-smart","s04",0.8],["e-ubiq","s04",0.7],["e-ixt1","s04",0.6],["e-ixt2","s04",0.7],["o-ehoura","s04",0.8],["o-seren","s04",0.7]);
// s05 Full-Stack Proto ← web, digital prod, full-stack projects
E.push(["x07","s05",0.7],["e-web","s05",0.6],["x13","s05",0.8],["o-skin","s05",0.9],["o-audeate","s05",0.7]);
// s06 Human-AI Ix ← HCI studios, blind navigation
E.push(["x05","s06",0.9],["x06","s06",0.8],["x08","s06",0.7],["o-seepal","s06",0.9],["o-shadow","s06",0.8]);
// s07 Interaction Dsgn ← IxD courses + interaction projects
E.push(["x06","s07",0.9],["x08","s07",0.8],["x11","s07",0.9],["o-ehoura","s07",0.7],["o-symbio","s07",0.6]);
// s08 Tangible Interface ← smart space, haptic/sensor projects
E.push(["e-smart","s08",0.7],["o-seren","s08",0.9],["o-symbio","s08",0.8],["o-tide","s08",0.7],["e-ixt2","s08",0.6]);
// s09 Info Viz ← infographics, data viz courses
E.push(["x01","s09",0.9],["x02","s09",0.8],["x14","s09",0.8],["x15","s09",0.7]);
// s10 UX Research ← usability, psych, HCI
E.push(["e-usab","s10",0.9],["x17","s10",0.8],["x05","s10",0.7],["e-dsgnpsy","s10",0.8],["o-seepal","s10",0.6]);
// s11 Data-Driven Dsgn ← quant aesthetics, info design, data science
E.push(["x15","s11",0.9],["x14","s11",0.7],["x12","s11",0.6],["x18","s11",0.8]);
// s12 Quant Analysis ← data science, finance courses
E.push(["x16","s12",0.7],["x18","s12",0.9],["e-corpfin","s12",0.6],["e-invest","s12",0.5]);
// s13 System Thinking ← diploma, professional practice, comprehensive
E.push(["t-diploma","s13",0.9],["x10","s13",0.6],["x09","s13",0.5],["t-media","s13",0.7]);
// s14 Wearable Proto ← wearable projects + sensor courses
E.push(["o-audeate","s14",0.9],["o-tuch","s14",0.9],["x20","s14",0.8],["e-ubiq","s14",0.6],["o-seren","s14",0.7]);
// s15 Research→Proto ← thesis + research projects
E.push(["t-diploma","s15",0.8],["o-pgmoe","s15",0.9],["o-audeate","s15",0.9],["x13","s15",0.6]);
// s16 Creative Coding ← web dev, dynamic infographics, creative projects
E.push(["x07","s16",0.7],["e-web","s16",0.6],["x01","s16",0.8],["o-tide","s16",0.7]);
// s17 Sensor Fusion ← mobile sensor, biomech, wearable projects
E.push(["x20","s17",0.9],["x19","s17",0.8],["o-audeate","s17",0.9],["o-tuch","s17",0.7],["e-ubiq","s17",0.6]);
// Long skips (medium — cross-layer)
["e-ubiq","e-ixt2","e-prosem","e-cpp"].forEach(id=>{
  N.filter(n=>n.st===4&&!n.type).forEach(t=>E.push([id,t.id,0.4]));
});

const skipSet=new Set(["hA→st-an","hC→st-an","st-cat→st-an",...["e-ubiq","e-ixt2","e-prosem","e-cpp"].flatMap(id=>N.filter(n=>n.st===4&&!n.type).map(t=>id+"→"+t.id))]);

// Build edge weight map
const eW={};
E.forEach(([a,b,w])=>{eW[a+"→"+b]=w||0.3});

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
  const dpr=typeof window!=='undefined'?(window.devicePixelRatio||1)*2:2;

  const spawn=useCallback((ed,ns)=>{const r=[];
    // Flow edge particles
    ed.forEach(e=>{const[a,b]=e.split("→");const f=nMap[a],t=nMap[b];const w=eW[e]||0.3;if(f&&t&&f.x&&t.x){const cnt=Math.ceil(w*6);for(let i=0;i<cnt;i++)r.push({fx:f.x,fy:f.y,tx:t.x,ty:t.y,t:Math.random()*0.4,sp:0.002+w*0.004+Math.random()*0.003,sz:0.2+w*0.6+Math.random()*0.3,w,al:true})}});
    // SA arc particles for traced nodes
    if(ns)SELF_ATT.forEach(([a,b,w])=>{
      if(!ns.has(a)&&!ns.has(b))return;
      const na=nMap[a],nb=nMap[b];if(!na||!nb||!na.x||!nb.x)return;
      const sameX=Math.abs(na.x-nb.x)<30;
      let cx,cy;
      if(sameX){cx=na.x+12+w*8;cy=(na.y+nb.y)/2}
      else{cx=(na.x+nb.x)/2;cy=Math.min(na.y,nb.y)-4-w*3}
      const cnt=Math.ceil(w*4);
      for(let i=0;i<cnt;i++)r.push({fx:na.x+(sameX?3:0),fy:na.y,tx:nb.x+(sameX?3:0),ty:nb.y,cx,cy,t:Math.random()*0.5,sp:0.003+w*0.004+Math.random()*0.003,sz:0.25+w*0.55+Math.random()*0.25,w,al:true});
    });
    pts.current=r},[]);
  const hit=useCallback((mx,my)=>{for(const n of N){if(!n.x)return null;const dx=mx-n.x,dy=my-n.y;const r=n.type==="struct"?22:n.type==="repr"?16:n.st===0?5:n.st===6?16:n.st===5?13:11;if(dx*dx+dy*dy<(r+5)*(r+5))return n}return null},[]);
  const oc=useCallback(e=>{const r=cvs.current.getBoundingClientRect();const n=hit((e.clientX-r.left)*(CW/r.width),(e.clientY-r.top)*(CH/r.height));if(n&&n.id!==act){setAct(n.id);const d=trace(n.id);td.current=d;spawn(d.es,d.ns)}else{setAct(null);td.current={ns:new Set(),es:new Set(),saN:{}};pts.current=[]}},[act,spawn,hit]);
  const om=useCallback(e=>{const r=cvs.current.getBoundingClientRect();const n=hit((e.clientX-r.left)*(CW/r.width),(e.clientY-r.top)*(CH/r.height));setHov(n?n.id:null);setTip(n?{x:e.clientX-r.left+12,y:e.clientY-r.top-30,n}:null);cvs.current.style.cursor=n?'pointer':'default'},[hit]);

  useEffect(()=>{
    const c=cvs.current,ctx=c.getContext("2d");c.width=CW*dpr;c.height=CH*dpr;ctx.scale(dpr,dpr);
    if(!amb.current){amb.current=[];for(let i=0;i<300;i++)amb.current.push({x:Math.random()*CW,y:Math.random()*CH,vx:(Math.random()-0.5)*0.02,vy:(Math.random()-0.5)*0.01,sz:Math.random()*0.4,al:0.02+Math.random()*0.06})}
    function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}

    function draw(){
      tm.current+=0.016;ctx.fillStyle="#0b0b0b";ctx.fillRect(0,0,CW,CH);
      const ha=act!==null;const{ns:aN,es:aE,saN}=td.current;

      // Grid
      ctx.fillStyle="rgba(255,255,255,0.005)";for(let x=10;x<CW;x+=20)for(let y=10;y<CH;y+=20){ctx.beginPath();ctx.arc(x,y,0.2,0,Math.PI*2);ctx.fill()}
      // Ambient
      if(!ha)amb.current.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=CW;if(p.x>CW)p.x=0;if(p.y<0)p.y=CH;if(p.y>CH)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.sz,0,Math.PI*2);ctx.fillStyle=`rgba(190,175,130,${p.al})`;ctx.fill()});

      // ═══ STAGE LABELS (top) — like ResNet layer labels ═══
      ctx.save();ctx.font="600 8px 'SF Mono','Menlo',monospace";ctx.textAlign="center";ctx.fillStyle="rgba(255,255,255,0.7)";
      [{x:SX[0],t:"Token Embed"},{x:SX[1],t:"Unimodal Enc"},{x:SX[2],t:"Repr h_i"},{x:SX[2.5],t:"Co-TRM"},{x:SX[3],t:"Cross-Modal"},{x:SX[3.5],t:"Concat"},{x:SX[4],t:"TRM (×N)"},{x:SX[4.5],t:"Add&Norm"},{x:SX[6],t:"Skill Readout"}].forEach(lb=>{
        ctx.fillText(lb.t,lb.x,22);
      });
      // Vertical column lines
      ctx.strokeStyle="rgba(255,255,255,0.04)";ctx.lineWidth=0.4;
      Object.values(SX).filter(x=>x>0).forEach(x=>{ctx.beginPath();ctx.moveTo(x,90);ctx.lineTo(x,780);ctx.stroke()});
      ctx.restore();

      // ═══ MODALITY BANDS ═══
      [{y:100,h:350,c:MC.A,l:"A · Art & Design"},{y:460,h:165,c:MC.B,l:"B · Tech & HCI"},{y:640,h:140,c:MC.C,l:"C · Econ & Compute"}].forEach(b=>{
        ctx.fillStyle=`rgba(${b.c.r},${b.c.g},${b.c.b},0.01)`;ctx.fillRect(30,b.y,SX[6]-60,b.h);
        ctx.save();
        ctx.translate(14,b.y+b.h/2);ctx.rotate(-Math.PI/2);
        ctx.font="600 7px 'SF Mono',monospace";ctx.fillStyle=`rgba(${b.c.r},${b.c.g},${b.c.b},0.4)`;
        ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(b.l,0,0);
        ctx.restore();
      });
      // Project row — just below stage labels
      ctx.fillStyle="rgba(215,195,140,0.008)";ctx.fillRect(30,28,SX[6]-60,60);
      ctx.save();
      ctx.translate(14,58);ctx.rotate(-Math.PI/2);
      ctx.font="600 6px 'SF Mono',monospace";ctx.fillStyle="rgba(215,195,140,0.35)";
      ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("OUTPUT",0,0);
      ctx.restore();

      // ═══ TIME INDICATORS (small, inside S0 column) ═══
      ctx.save();ctx.font="500 6px 'SF Mono',monospace";ctx.textAlign="right";
      N.filter(n=>n.st===0&&n.mod==="A").forEach(n=>{
        const lbl=TIME_LABEL[n.tOrd];
        if(lbl){ctx.fillStyle="rgba(255,255,255,0.45)";ctx.fillText(lbl,n.x-12,n.y+2)}
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
        if(sameX){ctx.moveTo(na.x+3,na.y);ctx.quadraticCurveTo(na.x+12+w*8,(na.y+nb.y)/2,nb.x+3,nb.y)}
        else{const my=Math.min(na.y,nb.y)-4-w*3;ctx.moveTo(na.x,na.y);ctx.quadraticCurveTo((na.x+nb.x)/2,my,nb.x,nb.y)}
        if(dim){ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},0.002)`;ctx.lineWidth=0.02}
        else if(both){ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${0.15+w*0.35})`;ctx.lineWidth=0.3+w*1}
        else if(one){ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${0.03+w*0.08})`;ctx.lineWidth=0.1+w*0.3}
        else{ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${0.02+w*0.04})`;ctx.lineWidth=0.08+w*0.2}
        ctx.stroke();
      });

      // ═══ FLOW EDGES ═══
      E.forEach(([a,b,ew])=>{
        const f=nMap[a],t=nMap[b];if(!f||!t||!f.x||!t.x)return;
        const ek=a+"→"+b;const ia=aE.has(ek);const sk=skipSet.has(ek);const cc=MC[f.mod]||MC.T;
        const isToProj=t.st===5;const w=ew||0.3;
        ctx.beginPath();
        if(sk){ctx.moveTo(f.x,f.y);ctx.quadraticCurveTo((f.x+t.x)/2,f.y<350?30:CH-30,t.x,t.y);ctx.setLineDash([3,3])}
        else if(isToProj){
          ctx.moveTo(f.x,f.y);ctx.bezierCurveTo(f.x,f.y-30,t.x,t.y+30,t.x,t.y);ctx.setLineDash([2,2]);
        }
        else{const dx=t.x-f.x;ctx.moveTo(f.x,f.y);ctx.bezierCurveTo(f.x+dx*0.35,f.y,t.x-dx*0.35,t.y,t.x,t.y);ctx.setLineDash([])}
        if(ha){ctx.strokeStyle=ia?`rgba(${cc.r},${cc.g},${cc.b},${w*0.35})`:"rgba(255,255,255,0.002)";ctx.lineWidth=ia?(0.1+w*0.4):0.02}
        else{ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${w*0.05})`;ctx.lineWidth=0.05+w*0.2}
        ctx.stroke();ctx.setLineDash([]);
      });

      // Particles — density, size, brightness all scale with weight
      // Supports both bezier (flow edges) and quadratic (SA arcs) curves
      pts.current.forEach(p=>{p.t+=p.sp;if(p.t>=1){p.al=false;return}const t=p.t,mt=1-t;
        let px,py;
        if(p.cx!==undefined){
          // Quadratic curve: P = (1-t)²·P0 + 2(1-t)t·C + t²·P1
          px=mt*mt*p.fx+2*mt*t*p.cx+t*t*p.tx;
          py=mt*mt*p.fy+2*mt*t*p.cy+t*t*p.ty;
        }else{
          // Cubic bezier
          const dx=p.tx-p.fx;const c1=p.fx+dx*0.35,c2=p.tx-dx*0.35;
          px=mt*mt*mt*p.fx+3*mt*mt*t*c1+3*mt*t*t*c2+t*t*t*p.tx;
          py=mt*mt*mt*p.fy+3*mt*mt*t*p.fy+3*mt*t*t*p.ty+t*t*t*p.ty;
        }
        const al=Math.sin(t*Math.PI);ctx.beginPath();ctx.arc(px,py,p.sz,0,Math.PI*2);
        const bri=p.w||0.3;const r=Math.round(200+bri*55),g=Math.round(190+bri*55),b2=Math.round(140+bri*115);
        ctx.fillStyle=`rgba(${r},${g},${b2},${al*(0.4+bri*0.5)})`;ctx.fill()});
      pts.current=pts.current.filter(p=>p.al);
      if(ha&&pts.current.length<400){
        // Flow edge particles
        aE.forEach(e=>{
          const w=eW[e]||0.3;
          if(Math.random()<w*0.12){
            const[a,b]=e.split("→");const f=nMap[a],t=nMap[b];
            if(f&&t&&f.x&&t.x)pts.current.push({fx:f.x,fy:f.y,tx:t.x,ty:t.y,t:Math.random()*0.2,sp:0.002+w*0.005+Math.random()*0.003,sz:0.2+w*0.6+Math.random()*0.3,w,al:true})
          }
        });
        // SA arc particles — along the quadratic curves
        SELF_ATT.forEach(([a,b,w])=>{
          const na=nMap[a],nb=nMap[b];if(!na||!nb||!na.x||!nb.x)return;
          const aIn=aN.has(a)||a===act;const bIn=aN.has(b)||b===act;
          if(!(aIn||bIn))return;
          if(Math.random()<w*0.15){
            const sameX=Math.abs(na.x-nb.x)<30;
            let cx,cy;
            if(sameX){cx=na.x+12+w*8;cy=(na.y+nb.y)/2}
            else{cx=(na.x+nb.x)/2;cy=Math.min(na.y,nb.y)-4-w*3}
            pts.current.push({fx:na.x+(sameX?3:0),fy:na.y,tx:nb.x+(sameX?3:0),ty:nb.y,cx,cy,t:Math.random()*0.2,sp:0.003+w*0.004+Math.random()*0.003,sz:0.25+w*0.55+Math.random()*0.25,w,al:true})
          }
        });
      }

      // ═══ NODES ═══
      N.forEach(n=>{
        if(!n.x)return;
        const cc=MC[n.mod]||MC.T;const ia=ha&&(aN.has(n.id)||n.id===act);const ih=n.id===hov;
        const sw=ha?saN[n.id]||0:0;const dim=ha&&!ia&&sw===0;const isSA=ha&&!ia&&sw>0;
        ctx.globalAlpha=dim?0.07:isSA?(0.25+sw*0.5):1;
        const fa=ih?0.85:ia?0.65:isSA?(0.2+sw*0.45):0.4;const sa=n.sch?SA_C[n.sch]:null;

        if(n.type==="repr"){
          rr(n.x-22,n.y-8,44,16,4);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fa*0.9})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.06:0.5})`;ctx.lineWidth=0.6;ctx.stroke();
          for(let i=0;i<40;i+=2.5){const v=0.08+0.15*Math.sin(tm.current*2+i*0.3+n.y*0.01);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${v})`;ctx.fillRect(n.x-20+i,n.y-6,1.5,12)}
          ctx.font="600 7px 'SF Mono',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.06:0.7})`;ctx.textAlign="center";ctx.fillText(n.l,n.x,n.y+20);
        }else if(n.type==="struct"){
          const tw=n.l.length*3.5+20,th=16;rr(n.x-tw/2,n.y-th/2,tw,th,3);
          ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},0.1)`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.04:0.3})`;ctx.lineWidth=0.5;
          if(!n.id.includes("an"))ctx.setLineDash([2,2]);ctx.stroke();ctx.setLineDash([]);
          ctx.font="600 6px 'SF Mono',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.06:0.6})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y);
          if(n.id==="st-an"){ctx.font="600 10px monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},0.2)`;ctx.fillText("+",n.x+tw/2+8,n.y)}
        }else if(n.st===0){
          ctx.beginPath();ctx.arc(n.x,n.y,2.5,0,Math.PI*2);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fa*1.3})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.04:0.35})`;ctx.lineWidth=0.2;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.3)`;ctx.lineWidth=0.3;ctx.stroke()}
        }else if(n.st===1){
          rr(n.x-26,n.y-7,52,14,2);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fa*0.8})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.05:0.35})`;ctx.lineWidth=0.35;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.35)`;ctx.lineWidth=0.45;ctx.stroke()}
          if(ih||ia){ctx.font="500 5px 'SF Mono',monospace";ctx.fillStyle=`rgba(255,255,255,${ih?0.9:0.65})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y)}
        }else if(n.st===3){
          rr(n.x-32,n.y-7,64,14,2);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fa*0.7})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.05:0.3})`;ctx.lineWidth=0.35;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.3)`;ctx.lineWidth=0.45;ctx.stroke()}
          ctx.font="500 5px 'SF Mono',monospace";ctx.fillStyle=`rgba(255,255,255,${dim?0.05:(ih?0.85:0.55)})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y);
        }else if(n.st===4&&!n.type){
          rr(n.x-34,n.y-11,68,22,3);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fa*0.7})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.05:0.25})`;ctx.lineWidth=0.45;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.35)`;ctx.lineWidth=0.55;ctx.stroke()}
          ctx.font="600 6px 'SF Mono',monospace";ctx.fillStyle=`rgba(255,255,255,${dim?0.05:(ih?0.9:0.7)})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y);
        }else if(n.st===5){
          // Project hexagons
          ctx.beginPath();for(let i=0;i<6;i++){const ang=Math.PI/3*i-Math.PI/6;ctx.lineTo(n.x+12*Math.cos(ang),n.y+12*Math.sin(ang))}ctx.closePath();
          ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${fa*1.3})`;ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.05:0.5})`;ctx.lineWidth=0.5;ctx.stroke();
          if(sa){ctx.strokeStyle=`rgba(${sa.r},${sa.g},${sa.b},0.35)`;ctx.lineWidth=0.55;ctx.stroke()}
          ctx.font="600 6px 'SF Mono',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.05:0.8})`;ctx.textAlign="center";ctx.fillText(n.l,n.x,n.y-17);
          if(n.yr){ctx.font="500 5px 'SF Mono',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.04:0.6})`;ctx.fillText(n.yr,n.x,n.y+20)}
        }else if(n.st===6){
          rr(n.x-42,n.y-7,84,14,2);ctx.fillStyle="rgba(255,255,255,0.02)";ctx.fill();
          ctx.strokeStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.04:0.15})`;ctx.lineWidth=0.3;ctx.stroke();
          ctx.font="500 5px 'SF Mono',monospace";ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},${dim?0.05:0.5})`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.l,n.x,n.y);
        }
        if((ia||ih)&&!dim){ctx.beginPath();ctx.arc(n.x,n.y,10,0,Math.PI*2);ctx.fillStyle=`rgba(${cc.r},${cc.g},${cc.b},0.04)`;ctx.fill()}
        ctx.globalAlpha=1;
      });

      // Skip labels — between Concat(780) and TRM(880)
      ctx.save();ctx.font="500 6px 'SF Mono',monospace";ctx.fillStyle="rgba(200,170,120,0.3)";ctx.textAlign="center";
      ctx.fillText("residual skip (h_A)",830,108);ctx.fillStyle="rgba(155,145,185,0.3)";ctx.fillText("residual skip (h_C)",830,750);ctx.restore();

      // Legend — top right corner
      ctx.save();ctx.font="500 5px 'SF Mono',monospace";ctx.textAlign="right";ctx.fillStyle="rgba(255,255,255,0.35)";
      ctx.fillText("○ token  ▭ enc  ▬ repr  ⌒ self-attn  ⬡ output  ╌ skip",CW-20,14);
      ctx.restore();

      // Footer
      ctx.save();ctx.font="500 5px 'SF Mono',monospace";ctx.fillStyle="rgba(255,255,255,0.2)";
      ctx.textAlign="left";ctx.fillText("Tsinghua · Cornell · Harvard GSD · MIT — 2020–2026",15,CH-10);
      ctx.textAlign="right";ctx.fillText("Multimodal Transformer · Curriculum Architecture",CW-15,CH-10);
      ctx.restore();

      raf.current=requestAnimationFrame(draw);
    }
    draw();return()=>cancelAnimationFrame(raf.current);
  },[act,hov,dpr]);

  return React.createElement("div",{style:{position:"relative"}},
    React.createElement("canvas",{ref:cvs,onClick:oc,onMouseMove:om,onMouseLeave:()=>{setHov(null);setTip(null)},style:{width:"100%",minWidth:1000,height:"auto",aspectRatio:CW+"/"+CH,display:"block",borderRadius:8,cursor:"default"}}),
    tip&&React.createElement("div",{style:{position:"absolute",left:Math.min(tip.x,CW-160),top:Math.max(tip.y,0),background:"rgba(14,14,14,0.96)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:4,padding:"5px 10px",pointerEvents:"none",zIndex:10,backdropFilter:"blur(12px)"}},
      React.createElement("div",{style:{color:"rgba(220,200,145,0.92)",fontSize:9,fontWeight:500}},tip.n.full||tip.n.l),
      React.createElement("div",{style:{color:"rgba(255,255,255,0.28)",fontSize:7,marginTop:2}},(tip.n.sch||"")+(tip.n.sch?" · ":"")+(tip.n.yr?"Project "+tip.n.yr:"Stage "+tip.n.st)+" · "+tip.n.mod)),
    React.createElement("div",{style:{display:"flex",gap:14,marginTop:8,flexWrap:"wrap",alignItems:"center"}},
      [{l:"THU",c:"rgba(255,255,255,0.3)"},{l:"Cornell",c:"rgba(180,40,40,0.6)"},{l:"Harvard",c:"rgba(200,170,100,0.6)"},{l:"MIT",c:"rgba(100,180,200,0.6)"}].map(s=>React.createElement("span",{key:s.l,style:{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"rgba(255,255,255,0.5)"}},React.createElement("span",{style:{width:8,height:8,borderRadius:2,background:s.c,display:"inline-block"}}),s.l)))
  );
}

window.NNSelfAttn = NNSelfAttn;
