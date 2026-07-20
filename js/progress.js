
import{loadCompounds,getStats,CLASS_INFO}from"./common.js";
const all=await loadCompounds(),stats=getStats(),sessions=JSON.parse(localStorage.getItem("aromaSessionsV21")||"[]");let attempts=0,correct=0,learned=0;
all.forEach(c=>{const r=stats[c.id]||{};attempts+=(r.correct||0)+(r.wrong||0);correct+=r.correct||0;if((r.learned||0)>0)learned++});
document.querySelector("#attempts").textContent=attempts;document.querySelector("#accuracy").textContent=attempts?Math.round(correct/attempts*100)+"%":"0%";document.querySelector("#learned").textContent=`${learned} / ${all.length}`;
document.querySelector("#rows").innerHTML=all.map(c=>{const r=stats[c.id]||{},t=(r.correct||0)+(r.wrong||0),a=t?Math.round((r.correct||0)/t*100):0,color=(CLASS_INFO[c.class_group]||CLASS_INFO["その他"]).color;return `<div class="row"><strong>${c.name_ja}</strong><div class="mini"><span style="width:${a}%;background:${color}"></span></div><small>${t?a+"%":"未回答"}</small></div>`}).join("");
document.querySelector("#reset").onclick=()=>{if(confirm("学習記録を削除しますか？")){localStorage.removeItem("aromaStatsV21");localStorage.removeItem("aromaSessionsV21");location.reload()}};
