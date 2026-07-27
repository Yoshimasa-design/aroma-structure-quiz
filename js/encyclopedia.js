import{loadCompounds,CLASS_INFO}from"./common.js";
import{getFavorites,favoriteButtonMarkup,bindFavoriteButtons}from"./storage.js";
import{createDetailModal}from"./detail-modal.js";

let all=[];
let active="";
let favoritesOnly=false;
let detailModal=null;

const $=selector=>document.querySelector(selector);

function renderFilters(){
 const groups=[...new Set(all.map(c=>c.class_group))];

 $("#filters").innerHTML=
  `<button class="filter active" data-group="">すべて</button>`+
  groups.map(group=>{
   const info=CLASS_INFO[group]||CLASS_INFO["その他"];
   return `<button class="filter" data-group="${group}" style="--class-color:${info.color};--class-light:${info.light}">${group}</button>`;
  }).join("");

 document.querySelectorAll(".filter").forEach(button=>{
  button.onclick=()=>{
   active=button.dataset.group;

   document.querySelectorAll(".filter").forEach(item=>{
    item.classList.toggle("active",item===button);
   });

   render();
  };
 });
}

function render(){
 const query=$("#search").value.toLowerCase();
 const favorites=new Set(getFavorites());

 const list=all.filter(c=>
  (!active||c.class_group===active)&&
  (!favoritesOnly||favorites.has(c.id))&&
  (
   !query||
   `${c.name_ja} ${c.name_en} ${c.odor} ${c.sources} ${c.class_group} ${c.category} ${c.functional_group}`
    .toLowerCase()
    .includes(query)
  )
 );

 $("#count").textContent=list.length;

 $("#cards").innerHTML=list.length
  ?list.map(c=>{
   const info=CLASS_INFO[c.class_group]||CLASS_INFO["その他"];

   return `<article class="compound-card" data-id="${c.id}" tabindex="0" role="button" aria-label="${c.name_ja}の詳細を見る" style="--class-color:${info.color};--class-light:${info.light}">
<div class="card-favorite">${favoriteButtonMarkup(c.id,"favorite-button icon-only")}</div>
<img src="../${c.structure}" alt="${c.name_ja}の構造式">
<span class="tag">${c.class_group}</span>
<h3>${c.odor_icon} ${c.name_ja}</h3>
<div class="muted">${c.name_en}｜${c.formula}</div>
<p>${c.odor}</p>
</article>`;
  }).join("")
  :`<div class="empty-state"><p>${favoritesOnly
    ?"お気に入りに登録した成分はまだありません。"
    :"条件に一致する成分がありません。"
   }</p></div>`;

 document.querySelectorAll(".compound-card").forEach(card=>{
  card.onclick=event=>{
   if(event.target.closest(".favorite-button"))return;
   openDetail(card.dataset.id);
  };

  card.onkeydown=event=>{
   if(event.key==="Enter"||event.key===" "){
    event.preventDefault();
    openDetail(card.dataset.id);
   }
  };
 });

 bindFavoriteButtons($("#cards"),()=>{
  if(favoritesOnly)render();
 });
}

function openDetail(id){
 const compound=all.find(item=>item.id===id);
 if(!compound)return;

 detailModal.open(compound);
}

async function init(){
 all=await loadCompounds();
 detailModal=createDetailModal({
  onFavoriteChange:()=>{
   render();
  }
 });

 $("#search").oninput=render;

 $("#favoriteOnly").onclick=()=>{
  favoritesOnly=!favoritesOnly;

  $("#favoriteOnly").classList.toggle("active",favoritesOnly);
  $("#favoriteOnly").setAttribute(
   "aria-pressed",
   String(favoritesOnly)
  );
  $("#favoriteOnly").innerHTML=favoritesOnly
   ?"★ お気に入りのみ"
   :"☆ お気に入りのみ";

  render();
 };

 window.addEventListener("aroma:favorites-changed",()=>{
  if(favoritesOnly)render();
 });

 renderFilters();
 render();

 const requested=new URLSearchParams(location.search).get("id");

 if(requested){
  setTimeout(()=>{
   openDetail(requested);
  },50);
 }
}

init().catch(error=>{
 console.error(error);
 $("#count").textContent="エラー";
});
