
export const CLASS_INFO={
 "テルペン類":{color:"#2e7d32",light:"#e8f5e9"},"エステル類":{color:"#ef6c00",light:"#fff3e0"},
 "アルデヒド類":{color:"#9a7600",light:"#fff8d8"},"ケトン類":{color:"#c62828",light:"#ffebee"},
 "アルコール類":{color:"#1565c0",light:"#e3f2fd"},"フェノール類":{color:"#6a1b9a",light:"#f3e5f5"},
 "含硫化合物":{color:"#455a64",light:"#eceff1"},"その他":{color:"#795548",light:"#efebe9"}
};
export async function loadCompounds(){const r=await fetch("../data/compounds.json");if(!r.ok)throw new Error("データを読み込めません");return r.json()}
export async function loadCompoundsHome(){const r=await fetch("data/compounds.json");if(!r.ok)throw new Error("データを読み込めません");return r.json()}
export function shuffle(items){const a=Array.from(items);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
export function theme(el,c){const t=CLASS_INFO[c.class_group]||CLASS_INFO["その他"];el.style.setProperty("--class-color",t.color);el.style.setProperty("--class-light",t.light)}
export function getStats(){return JSON.parse(localStorage.getItem("aromaStatsV21")||"{}")}
export function saveStats(stats){localStorage.setItem("aromaStatsV21",JSON.stringify(stats))}
export function addResult(id,ok,mode){const s=getStats(),r=s[id]||{correct:0,wrong:0,learned:0};ok?r.correct++:r.wrong++;if(mode==="learn"&&ok)r.learned++;s[id]=r;saveStats(s)}
export function recordSession(correct,total){const sessions=JSON.parse(localStorage.getItem("aromaSessionsV21")||"[]");sessions.push({date:new Date().toISOString(),correct,total});localStorage.setItem("aromaSessionsV21",JSON.stringify(sessions.slice(-100)))}
export function distract(all,a){const same=shuffle(all.filter(c=>c.id!==a.id&&c.class_group===a.class_group)).slice(0,2);const other=shuffle(all.filter(c=>c.id!==a.id&&!same.some(x=>x.id===c.id))).slice(0,3-same.length);return shuffle([a,...same,...other])}
