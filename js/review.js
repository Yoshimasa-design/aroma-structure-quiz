import{loadCompounds,shuffle,theme,addResult,recordSession}from"./common.js";
import{distract}from"./quiz-engine.js";
import{getFavorites,getIncorrectCompoundIds,getWeakCompoundIds,favoriteButtonMarkup,bindFavoriteButtons}from"./storage.js";
const all=await loadCompounds();
const byId=new Map(all.map(c=>[c.id,c]));
const $=s=>document.querySelector(s);
let queue=[],index=0,score=0,locked=false,selectedMode="mixed";
const sources={favorites:()=>getFavorites(),incorrect:()=>getIncorrectCompoundIds(),weak:()=>getWeakCompoundIds(),all:()=>all.map(c=>c.id)};
$("#favoriteCount").textContent=`${getFavorites().filter(id=>byId.has(id)).length}成分`;
$("#incorrectCount").textContent=`${getIncorrectCompoundIds().filter(id=>byId.has(id)).length}成分`;
$("#weakCount").textContent=`${getWeakCompoundIds().filter(id=>byId.has(id)).length}成分`;
$("#allCount").textContent=`${all.length}成分`;
document.querySelectorAll("[data-source]").forEach(button=>button.addEventListener("click",()=>start(button.dataset.source)));
function start(source){
  const candidates=sources[source]().map(id=>byId.get(id)).filter(Boolean);
  if(!candidates.length){const m=$("#setupMessage");m.textContent=source==="favorites"?"お気に入りがまだありません。図鑑や解答画面の☆から登録してください。":"該当する学習記録がまだありません。先にクイズへ挑戦してください。";m.classList.remove("hidden");return}
  selectedMode=$("#mode").value;const limit=Number($("#limit").value);queue=shuffle(candidates).slice(0,Math.min(limit,candidates.length)).map(compound=>({compound,mode:selectedMode==="mixed"?(Math.random()<.5?"odor":"structure"):selectedMode}));index=0;score=0;$("#setup").classList.add("hidden");$("#quiz").classList.remove("hidden");render();
}
function render(){const item=queue[index],a=item.compound;locked=false;theme($("#quiz"),a);$("#result").classList.add("hidden");$("#count").textContent=`${index+1} / ${queue.length}`;$("#bar").style.width=`${index/queue.length*100}%`;$("#quizTitle").textContent=item.mode==="structure"?"構造式の復習":"香りの復習";$("#question").textContent=item.mode==="structure"?`${a.name_ja}の構造式はどれ？`:a.odor;$("#choices").innerHTML="";distract(all,a).forEach(o=>{const b=document.createElement("button");b.className="choice";b.dataset.id=o.id;b.innerHTML=item.mode==="structure"?`<img src="../${o.structure}" alt="構造式候補">`:`<strong>${o.name_ja}</strong><br><small>${o.name_en}</small>`;b.onclick=()=>answer(o,b);$("#choices").appendChild(b)})}
function answer(o,btn){if(locked)return;locked=true;const item=queue[index],a=item.compound,ok=o.id===a.id;if(ok)score++;addResult(a.id,ok,"review");document.querySelectorAll(".choice").forEach(b=>{b.disabled=true;if(b.dataset.id===a.id)b.classList.add("correct")});if(!ok)btn.classList.add("wrong");const r=$("#result");theme(r,a);r.classList.remove("hidden");r.innerHTML=`<h2>${ok?"正解です":"正解は"}：${a.name_ja}</h2><span class="tag">${a.class_group}</span><p>${a.odor}</p><div class="review-answer"><img src="../${a.structure}" alt="${a.name_ja}の構造式"><div><b>官能基</b><br>${a.functional_group}<br><b>覚えるポイント</b><br>${a.memorize.filter(Boolean).join("／")}</div></div><div class="actions">${favoriteButtonMarkup(a.id)}<button class="btn primary" id="next">${index===queue.length-1?"結果を見る":"次へ"}</button></div>`;bindFavoriteButtons(r);$("#next").onclick=next;r.scrollIntoView({behavior:"smooth",block:"nearest"})}
function next(){if(index<queue.length-1){index++;render();scrollTo({top:0,behavior:"smooth"});return}recordSession(score,queue.length);$("#quiz").innerHTML=`<h1>復習終了</h1><h2>${score} / ${queue.length}</h2><p>${score===queue.length?"すべて正解です。": "間違えた成分は学習記録からもう一度復習できます。"}</p><div class="actions"><button class="btn primary" onclick="location.reload()">別の復習を選ぶ</button><a class="btn secondary" href="progress.html">学習記録を見る</a></div>`}
