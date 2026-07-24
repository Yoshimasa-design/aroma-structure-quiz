import{loadCompounds,CLASS_INFO}from"./common.js";
import{getLearningStats,getFavorites,getWeakCompoundIds,clearLearningData}from"./storage.js";
let all=[],stats={};
let attempts=0,correct=0,learned=0;
async function init(){
 all=await loadCompounds();
 stats=getLearningStats();

 all.forEach(c=>{
  const r=stats[c.id]||{};
  attempts+=(r.correct||0)+(r.wrong||0);
  correct+=r.correct||0;
  if((r.learned||0)>0)learned++;
 });

 document.querySelector("#attempts").textContent=attempts;
 document.querySelector("#accuracy").textContent=attempts?Math.round(correct/attempts*100)+"%":"0%";
 document.querySelector("#learned").textContent=`${learned} / ${all.length}`;
 document.querySelector("#favorites").textContent=getFavorites().length;

 const weakIds=getWeakCompoundIds();
 const weakSet=new Set(weakIds);

 document.querySelector("#weakCount").textContent=weakIds.length;

 document.querySelector("#rows").innerHTML=all.map(c=>{
  const r=stats[c.id]||{};
  const t=(r.correct||0)+(r.wrong||0);
  const a=t?Math.round((r.correct||0)/t*100):0;
  const color=(CLASS_INFO[c.class_group]||CLASS_INFO["その他"]).color;
  const last=r.lastStudied?new Date(r.lastStudied).toLocaleDateString("ja-JP"):"—";

  return `<div class="row${weakSet.has(c.id)?" weak":""}">
<strong>${c.name_ja}${weakSet.has(c.id)?'<span class="weak-label">復習</span>':''}</strong>
<div class="mini"><span style="width:${a}%;background:${color}"></span></div>
<small>${t?a+"%":"未回答"}</small>
<small class="last-date">${last}</small>
</div>`;
 }).join("");

 document.querySelector("#reset").onclick=()=>{
  if(confirm("学習記録を削除しますか？ お気に入りは残ります。")){
   clearLearningData();
   location.reload();
  }
 };
}

init().catch(error=>{
 console.error(error);
});
