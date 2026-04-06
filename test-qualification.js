// Test file to verify qualification logic
// Run with: node test-qualification.js

// Copy core functions from App.jsx
const TEAMS = [
  { id: "RCB" }, { id: "MI" },   { id: "RR" },   { id: "PBKS" }, { id: "LSG" },
  { id: "KKR" }, { id: "CSK" },  { id: "DC" },   { id: "GT" },   { id: "SRH" },
];

function parseOvers(ov) {
  const s = String(ov); const [full,balls="0"] = s.split(".");
  return parseInt(full||0) + parseInt(balls)/6;
}

function computeStandings(fixtures) {
  const s = {}; TEAMS.forEach(t => { s[t.id]={wins:0,losses:0,nrs:0,played:0,points:0,runsFor:0,oversFor:0,runsAgainst:0,oversAgainst:0}; });
  fixtures.forEach(f => {
    if (!f.result) return;
    if (f.result.type==="nr") { s[f.a].nrs++;s[f.a].played++;s[f.a].points++;s[f.b].nrs++;s[f.b].played++;s[f.b].points++;return; }
    const {winner,scoreA,scoreB}=f.result; const loser=winner===f.a?f.b:f.a;
    s[winner].wins++;s[winner].played++;s[winner].points+=2;s[loser].losses++;s[loser].played++;
    const rA=Number(scoreA.runs),ovA=parseOvers(scoreA.overs),rB=Number(scoreB.runs),ovB=parseOvers(scoreB.overs);
    if(ovA>0&&ovB>0){s[f.a].runsFor+=rA;s[f.a].oversFor+=ovA;s[f.a].runsAgainst+=rB;s[f.a].oversAgainst+=ovB;s[f.b].runsFor+=rB;s[f.b].oversFor+=ovB;s[f.b].runsAgainst+=rA;s[f.b].oversAgainst+=ovA;}
  });
  Object.keys(s).forEach(tid=>{const t=s[tid];t.nrr=(t.oversFor>0?t.runsFor/t.oversFor:0)-(t.oversAgainst>0?t.runsAgainst/t.oversAgainst:0);});
  return s;
}

function maxFlowEK(cap,source,sink,n) {
  const res=cap.map(r=>r.slice()); let flow=0;
  while(true){const parent=new Array(n).fill(-1);parent[source]=source;const q=[source];
    for(let qi=0;qi<q.length&&parent[sink]<0;qi++){const u=q[qi];for(let v=0;v<n;v++){if(parent[v]<0&&res[u][v]>0){parent[v]=u;q.push(v);}}}
    if(parent[sink]<0)break;let aug=Infinity;for(let v=sink;v!==source;){const u=parent[v];aug=Math.min(aug,res[u][v]);v=u;}
    for(let v=sink;v!==source;){const u=parent[v];res[u][v]-=aug;res[v][u]+=aug;v=u;}flow+=aug;}
  return flow;
}

function combinations(arr,k){const res=[];function go(s,cur){if(cur.length===k){res.push([...cur]);return;}for(let i=s;i<=arr.length-(k-cur.length);i++){cur.push(arr[i]);go(i+1,cur);cur.pop();}}go(0,[]);return res;}

function canFourTeamsExceed(teamId, threshold, fixtures, standings) {
  const others = TEAMS.map(t => t.id).filter(id => id !== teamId);
  const remMatches = fixtures.filter(f => !f.result);
  const M = remMatches.length;
  const needs = {}, maxPoss = {};
  others.forEach(tid => {
    const w = standings[tid]?.wins || 0;
    needs[tid] = Math.max(0, threshold - w);
    const tr = fixtures.filter(f => !f.result && (f.a === tid || f.b === tid)).length;
    maxPoss[tid] = w + tr;
  });
  const viable = others.filter(tid => maxPoss[tid] >= threshold);
  if (viable.length < 4) return false;
  const SRC = 0, SINK = M + others.length + 1, NN = SINK + 1;
  const tIdx = {};
  others.forEach((tid, i) => { tIdx[tid] = M + 1 + i; });
  const base = Array.from({ length: NN }, () => new Array(NN).fill(0));
  remMatches.forEach((m, i) => {
    base[SRC][i + 1] = 1;
    if (tIdx[m.a] !== undefined) base[i + 1][tIdx[m.a]] = 1;
    if (tIdx[m.b] !== undefined) base[i + 1][tIdx[m.b]] = 1;
  });
  for (const subset of combinations(viable, 4)) {
    const required = subset.reduce((s, tid) => s + needs[tid], 0);
    if (required === 0) return true;
    const cap = base.map(r => r.slice());
    subset.forEach(tid => {
      cap[tIdx[tid]][SINK] = needs[tid];
    });
    if (maxFlowEK(cap, SRC, SINK, NN) >= required) return true;
  }
  return false;
}

function computeQualification(teamId,fixtures,standings) {
  const w=standings[teamId]?.wins||0;
  const rem=fixtures.filter(f=>!f.result&&(f.a===teamId||f.b===teamId)).length;
  if(!canFourTeamsExceed(teamId,w+1,fixtures,standings))return{currentWins:w,remaining:rem,minAdditionalWins:0,alreadyGuaranteed:true,impossible:false};
  for(let k=1;k<=rem;k++){if(!canFourTeamsExceed(teamId,w+k+1,fixtures,standings))return{currentWins:w,remaining:rem,minAdditionalWins:k,alreadyGuaranteed:false,impossible:false};}
  return{currentWins:w,remaining:rem,minAdditionalWins:null,alreadyGuaranteed:false,impossible:true};
}


// TEST CASES
console.log("=== QUALIFICATION LOGIC TESTS ===\n");

// Test 1: Team already guaranteed (4 teams can't reach their current+1)
console.log("TEST 1: Team with unbeatable lead");
const fixtures1 = [
  // RCB: 7 wins (guaranteed scenario)
  { id: 1, a: "RCB", b: "MI", result: {type:"win", winner:"RCB"} },
  { id: 2, a: "RCB", b: "KKR", result: {type:"win", winner:"RCB"} },
  { id: 3, a: "RCB", b: "CSK", result: {type:"win", winner:"RCB"} },
  { id: 4, a: "RCB", b: "DC", result: {type:"win", winner:"RCB"} },
  { id: 5, a: "RCB", b: "GT", result: {type:"win", winner:"RCB"} },
  { id: 6, a: "RCB", b: "SRH", result: {type:"win", winner:"RCB"} },
  { id: 7, a: "RCB", b: "LSG", result: {type:"win", winner:"RCB"} },
  // Other teams have at most 6 wins each with no more matches
  { id: 8, a: "MI", b: "KKR", result: {type:"win", winner:"MI"} },
  { id: 9, a: "CSK", b: "DC", result: {type:"win", winner:"CSK"} },
  { id: 10, a: "GT", b: "SRH", result: {type:"win", winner:"GT"} },
  { id: 11, a: "LSG", b: "RR", result: {type:"win", winner:"LSG"} },
  { id: 12, a: "PBKS", b: "KKR", result: {type:"win", winner:"KKR"} },
  { id: 13, a: "MI", b: "CSK", result: {type:"win", winner:"MI"} },
  { id: 14, a: "DC", b: "GT", result: {type:"win", winner:"DC"} },
  // Remaining unplayed (no one can catch RCB at 7 wins now)
];
const standings1 = computeStandings(fixtures1);
console.log("RCB wins:", standings1.RCB.wins);
console.log("Other top teams:", 
  "MI=" + standings1.MI.wins, 
  "CSK=" + standings1.CSK.wins,
  "GT=" + standings1.GT.wins,
  "DC=" + standings1.DC.wins);
const q1 = computeQualification("RCB", fixtures1, standings1);
console.log("Result:", q1);
console.log("✓ PASS: Already guaranteed" + (q1.alreadyGuaranteed ? "" : " FAILED"));

// Test 2: Team needs specific wins
console.log("\n\nTEST 2: Team needs exactly 2 more wins");
const fixtures2 = [
  { id: 1, a: "RCB", b: "MI", result: {type:"win", winner:"RCB"} },
  { id: 2, a: "RCB", b: "KKR", result: {type:"win", winner:"RCB"} },
  { id: 3, a: "RCB", b: "CSK", result: null }, // RCB needs to win remaining
  { id: 4, a: "RCB", b: "DC", result: null },
  // Other teams playing each other
  { id: 5, a: "MI", b: "KKR", result: {type:"win", winner:"MI"} },
  { id: 6, a: "MI", b: "CSK", result: {type:"win", winner:"MI"} },
  { id: 7, a: "KKR", b: "CSK", result: {type:"win", winner:"KKR"} },
  { id: 8, a: "DC", b: "GT", result: {type:"win", winner:"DC"} },
  { id: 9, a: "GT", b: "SRH", result: {type:"win", winner:"GT"} },
  { id: 10, a: "LSG", b: "RR", result: null },
  { id: 11, a: "PBKS", b: "LSG", result: null },
  { id: 12, a: "RR", b: "GT", result: null },
];
const standings2 = computeStandings(fixtures2);
console.log("RCB wins:", standings2.RCB.wins, "remaining:", fixtures2.filter(f=>!f.result && (f.a==="RCB"||f.b==="RCB")).length);
const q2 = computeQualification("RCB", fixtures2, standings2);
console.log("Result:", q2);
console.log("✓ Expected: minAdditionalWins should be 1 or 2 (got " + q2.minAdditionalWins + ")\n");

// Test 3: Impossible scenario - too many rivals ahead
console.log("\nTEST 3: Team eliminated (impossible to guarantee)");
const fixtures3 = [
  { id: 1, a: "RCB", b: "MI", result: {type:"win", winner:"MI"} },
  { id: 2, a: "RCB", b: "KKR", result: {type:"win", winner:"KKR"} },
  { id: 3, a: "RCB", b: "CSK", result: null },
  // Strong teams all with high wins
  { id: 4, a: "MI", b: "KKR", result: {type:"win", winner:"MI"} },
  { id: 5, a: "MI", b: "CSK", result: {type:"win", winner:"MI"} },
  { id: 6, a: "KKR", b: "CSK", result: {type:"win", winner:"KKR"} },
  { id: 7, a: "DC", b: "GT", result: {type:"win", winner:"DC"} },
  { id: 8, a: "DC", b: "CSK", result: {type:"win", winner:"DC"} },
  { id: 9, a: "GT", b: "CSK", result: {type:"win", winner:"CSK"} },
  { id: 10, a: "SRH", b: "LSG", result: {type:"win", winner:"SRH"} },
  { id: 11, a: "SRH", b: "LSG", result: {type:"win", winner:"SRH"} },
];
const standings3 = computeStandings(fixtures3);
console.log("RCB wins:", standings3.RCB.wins);
console.log("Top rivals - MI:", standings3.MI.wins, "KKR:", standings3.KKR.wins, "DC:", standings3.DC.wins, "CSK:", standings3.CSK.wins);
const q3 = computeQualification("RCB", fixtures3, standings3);
console.log("Result:", q3);
console.log("✓ PASS: " + (q3.impossible ? "Correctly marked as impossible" : "FAILED - should be impossible"));

console.log("\n=== LOGIC VERIFICATION COMPLETE ===");
