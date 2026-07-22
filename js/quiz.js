
import{loadCompounds,theme,addResult,recordSession}from"./common.js";
import{makeQueue,distract}from"./quiz-engine.js";
import{favoriteButtonMarkup,bindFavoriteButtons}from"./storage.js";
const mode=document.body.dataset.mode,all=await loadCompounds(),queue=makeQueue(all,10);let i=0,score=0,locked=false;
const $=s=>document.querySelector(s);
function render(){const a=queue[i];locked=false;$("#result").classList.add("hidden");theme($("#card"),a);$("#count").textContent=`${i+1} / ${queue.length}`;$("#bar").style.width=(i/queue.length*100)+"%";
 const structural=mode==="structure";$("#question").textContent=structural?`${a.name_ja}の構造式はどれ？`:a.odor;$("#choices").innerHTML="";
 distract(all,a).forEach(o=>{const b=document.createElement("button");b.className="choice";b.dataset.id=o.id;b.innerHTML=structural?`<img src="../${o.structure}" alt="構造式候補">`:`<strong>${o.name_ja}</strong><br><small>${o.name_en}</small>`;b.onclick=()=>answer(o,b);$("#choices").appendChild(b)})}
function answer(o,btn){if(locked)return;locked=true;const a=queue[i],ok=o.id===a.id;if(ok)score++;addResult(a.id,ok,mode);document.querySelectorAll(".choice").forEach(b=>{b.disabled=true;if(b.dataset.id===a.id)b.classList.add("correct")});if(!ok)btn.classList.add("wrong");const r=$("#result");theme(r,a);r.classList.remove("hidden");r.innerHTML=`<h2>${ok?"正解です":"正解は"}：${a.name_ja}</h2><span class="tag">${a.class_group}</span><p>${a.odor}</p><div class="actions">${favoriteButtonMarkup(a.id)}<button class="btn primary" id="next">${i===queue.length-1?"結果を見る":"次へ"}</button></div>`;bindFavoriteButtons(r);$("#next").onclick=next}
function next(){if(i<queue.length-1){i++;render();scrollTo({top:0,behavior:"smooth"})}else{recordSession(score,queue.length);$("#card").innerHTML=`<h1>結果</h1><h2>${score} / ${queue.length}</h2><p>${score>=8?"よくできました。":"図鑑で復習して再挑戦しましょう。"}</p><a class="btn secondary" href="../index.html">トップへ</a>`}}
render();
