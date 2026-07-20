
import{loadCompounds,shuffle,distract,theme,addResult,recordSession}from"./common.js";
const all=await loadCompounds();const queue=shuffle(all).slice(0,10);let i=0,stage=0,score=0,locked=false;
const $=s=>document.querySelector(s), card=$("#card"),choices=$("#choices"),feedback=$("#feedback");
function render(){
 const a=queue[i];locked=false;feedback.classList.add("hidden");theme(card,a);
 $("#count").textContent=`${i+1} / ${queue.length}`;$("#bar").style.width=((i+(stage?0.5:0))/queue.length*100)+"%";
 $("#stage").textContent=stage===0?"STEP 1　香り → 成分名":"STEP 2　成分名 → 構造式";
 $("#icon").textContent=stage===0?a.odor_icon:"⚗️";$("#prompt").textContent=stage===0?a.odor:`${a.name_ja}の構造式はどれ？`;
 $("#subprompt").textContent=stage===0?"香りの特徴から成分名を選んでください。":"先ほど学んだ成分の構造を予想してください。";
 choices.innerHTML="";
 distract(all,a).forEach(o=>{const b=document.createElement("button");b.className="choice"+(stage===1?" structure":"");b.dataset.id=o.id;
 b.innerHTML=stage===0?`<strong>${o.name_ja}</strong><br><small>${o.name_en}</small>`:`<img src="../${o.structure}" alt="構造式候補">`;
 b.onclick=()=>answer(o,b);choices.appendChild(b)});
}
function answer(o,btn){
 if(locked)return;locked=true;const a=queue[i],ok=o.id===a.id;if(ok)score++;addResult(a.id,ok,"learn");
 document.querySelectorAll(".choice").forEach(b=>{b.disabled=true;if(b.dataset.id===a.id)b.classList.add("correct")});if(!ok)btn.classList.add("wrong");
 theme(feedback,a);feedback.classList.remove("hidden");
 if(stage===0){
   // Deliberately no structural formula, molecular formula, or functional group at this stage.
   feedback.innerHTML=`<h2>${ok?"正解です":"正解は"}：${a.name_ja}</h2>
   <span class="tag">${a.class_group}</span>
   <div class="feedback-grid"><div><b>香り</b><br>${a.odor}</div><div><b>天然に存在するもの</b><br>${a.sources_list.join("・")}</div><div><b>利用例</b><br>${a.uses.join("・")}</div><div><b>成分の概要</b><br>${a.description}</div></div>
   <p class="notice">どんな構造をしていると思いますか？　次の画面で構造式を選びます。</p>
   <div class="actions"><button class="btn primary" id="next">構造式へ進む</button></div>`;
 }else{
   feedback.innerHTML=`<h2>${ok?"正解です":"正解はこちら"}：${a.name_ja}</h2><span class="tag">${a.class_group}</span>
   <img class="final-structure" src="../${a.structure}" alt="${a.name_ja}の構造式">
   <div class="feedback-grid"><div><b>分子式</b><br>${a.formula}</div><div><b>分子量</b><br>${a.molecular_weight}</div><div><b>官能基</b><br>${a.functional_group}</div><div><b>構造の特徴</b><br>${a.structure_feature}</div></div>
   <div class="memory"><b>覚えるポイント</b><ul>${a.memorize.filter(Boolean).map(x=>`<li>${x}</li>`).join("")}</ul></div>
   <div class="actions"><a class="btn secondary" href="encyclopedia.html?id=${a.id}">図鑑で見る</a><button class="btn primary" id="next">${i===queue.length-1?"結果を見る":"次の問題"}</button></div>`;
 }
 $("#next").onclick=advance;feedback.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function advance(){
 if(stage===0){stage=1;render();scrollTo({top:0,behavior:"smooth"});return}
 if(i<queue.length-1){i++;stage=0;render();scrollTo({top:0,behavior:"smooth"});return}
 recordSession(score,queue.length*2);card.innerHTML=`<h1>学習終了</h1><p class="lead">${queue.length}成分について、香りと構造式を順番に学びました。</p><h2>${score} / ${queue.length*2}</h2><div class="actions"><a class="btn secondary" href="../index.html">トップへ</a><button class="btn primary" onclick="location.reload()">もう一度</button></div>`;
}
render();
