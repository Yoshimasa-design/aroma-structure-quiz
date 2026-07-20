
import{loadCompoundsHome,getStats}from"./common.js";
const c=await loadCompoundsHome(),s=getStats();let attempts=0,correct=0,learned=0;
c.forEach(x=>{const r=s[x.id]||{};attempts+=(r.correct||0)+(r.wrong||0);correct+=r.correct||0;if((r.learned||0)>0)learned++});
document.querySelector("#compoundCount").textContent=c.length;
document.querySelector("#learnedCount").textContent=learned;
document.querySelector("#accuracy").textContent=attempts?Math.round(correct/attempts*100)+"%":"0%";
if("serviceWorker"in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("service-worker.js").catch(()=>{});
