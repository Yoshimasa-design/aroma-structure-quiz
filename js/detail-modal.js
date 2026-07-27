import{theme}from"./common.js";
import{favoriteButtonMarkup,bindFavoriteButtons}from"./storage.js";

const $=selector=>document.querySelector(selector);

export function createDetailModal(options={}){
 const overlay=$("#detailOverlay");
 const modal=$("#detail");
 const content=$("#detailContent");
 const onFavoriteChange=options.onFavoriteChange||function(){};
 const structurePathPrefix=options.structurePathPrefix||"../";
 let lastFocusedElement=null;

 function close(){
  overlay.classList.add("hidden");
  overlay.setAttribute("aria-hidden","true");
  document.body.classList.remove("modal-open");

  if(lastFocusedElement&&typeof lastFocusedElement.focus==="function"){
   lastFocusedElement.focus();
  }
 }

 function open(compound){
  if(!compound)return;

  lastFocusedElement=document.activeElement;

  theme(modal,compound);

  content.innerHTML=
   `<div class="dialog-head">
<div>
<span class="tag">${compound.class_group}</span>
<h2 id="detailTitle">${compound.odor_icon} ${compound.name_ja}</h2>
<p class="muted">${compound.name_en}</p>
</div>
<div class="dialog-actions">
${favoriteButtonMarkup(compound.id)}
<button class="close" id="close" type="button" aria-label="閉じる">×</button>
</div>
</div>
<div class="detail-grid">
<img src="${structurePathPrefix}${compound.structure}" alt="${compound.name_ja}の構造式">
<div>
<div class="fact"><b>香り</b><br>${compound.odor}</div>
<div class="fact"><b>天然に存在するもの</b><br>${compound.sources_list.join("・")}</div>
<div class="fact"><b>分類</b><br>${compound.class_group}／${compound.category}</div>
<div class="fact"><b>分子式・分子量</b><br>${compound.formula}／${compound.molecular_weight}</div>
<div class="fact"><b>官能基</b><br>${compound.functional_group}</div>
<div class="fact"><b>構造の特徴</b><br>${compound.structure_feature}</div>
<div class="fact"><b>利用例</b><br>${compound.uses.join("・")}</div>
</div>
</div>`;

  $("#close").onclick=close;

  bindFavoriteButtons(content,onFavoriteChange);

  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden","false");
  document.body.classList.add("modal-open");

  setTimeout(()=>{
   $("#close").focus();
  },0);
 }

 overlay.onclick=event=>{
  if(event.target===overlay){
   close();
  }
 };

 document.addEventListener("keydown",event=>{
  if(
   event.key==="Escape"&&
   !overlay.classList.contains("hidden")
  ){
   close();
  }
 });

 return{open,close};
}
