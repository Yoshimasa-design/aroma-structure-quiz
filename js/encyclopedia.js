import{loadCompounds,CLASS_INFO,theme}from"./common.js";
import{getFavorites,favoriteButtonMarkup,bindFavoriteButtons}from"./storage.js";
let all=[];
const $=s=>document.querySelector(s);
let active="",favoritesOnly=false;
function renderFilters(){const groups=[...new Set(all.map(c=>c.class_group))];$("#filters").innerHTML=`<button class="filter active" data-group="">すべて</button>`+groups.map(g=>{const t=CLASS_INFO[g]||CLASS_INFO["その他"];return `<button class="filter" data-group="${g}" style="--class-color:${t.color};--class-light:${t.light}">${g}</button>`}).join("");document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{active=b.dataset.group;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));render()})}
function render(){const q=$("#search").value.toLowerCase(),favorites=new Set(getFavorites());const list=all.filter(c=>(!active||c.class_group===active)&&(!favoritesOnly||favorites.has(c.id))&&(!q||`${c.name_ja} ${c.name_en} ${c.odor} ${c.sources} ${c.class_group} ${c.category} ${c.functional_group}`.toLowerCase().includes(q)));$("#count").textContent=list.length;$("#cards").innerHTML=list.length?list.map(c=>{const t=CLASS_INFO[c.class_group]||CLASS_INFO["その他"];return `<article class="compound-card" data-id="${c.id}" style="--class-color:${t.color};--class-light:${t.light}"><div class="card-favorite">${favoriteButtonMarkup(c.id,"favorite-button icon-only")}</div><img src="../${c.structure}" alt="${c.name_ja}の構造式"><span class="tag">${c.class_group}</span><h3>${c.odor_icon} ${c.name_ja}</h3><div class="muted">${c.name_en}｜${c.formula}</div><p>${c.odor}</p></article>`}).join(""):`<div class="empty-state"><p>${favoritesOnly?"お気に入りに登録した成分はまだありません。":"条件に一致する成分がありません。"}</p></div>`;document.querySelectorAll(".compound-card").forEach(x=>x.onclick=()=>openDetail(x.dataset.id));bindFavoriteButtons($("#cards"),()=>{if(favoritesOnly)render()})}
function openDetail(id){const c=all.find(x=>x.id===id),d=$("#detail");theme(d,c);$("#detailContent").innerHTML=`<div class="dialog-head"><div><span class="tag">${c.class_group}</span><h2>${c.odor_icon} ${c.name_ja}</h2><p class="muted">${c.name_en}</p></div><div class="dialog-actions">${favoriteButtonMarkup(c.id)}<button class="close" id="close" aria-label="閉じる">×</button></div></div><div class="detail-grid"><img src="../${c.structure}" alt="${c.name_ja}の構造式"><div><div class="fact"><b>香り</b><br>${c.odor}</div><div class="fact"><b>天然に存在するもの</b><br>${c.sources_list.join("・")}</div><div class="fact"><b>分類</b><br>${c.class_group}／${c.category}</div><div class="fact"><b>分子式・分子量</b><br>${c.formula}／${c.molecular_weight}</div><div class="fact"><b>官能基</b><br>${c.functional_group}</div><div class="fact"><b>構造の特徴</b><br>${c.structure_feature}</div><div class="fact"><b>利用例</b><br>${c.uses.join("・")}</div></div></div>`;$("#close").onclick=()=>d.close();bindFavoriteButtons($("#detailContent"),()=>render());d.showModal()}
async function init(){
 all=await loadCompounds();

 $("#search").oninput=render;
 $("#favoriteOnly").onclick=()=>{
  favoritesOnly=!favoritesOnly;
  $("#favoriteOnly").classList.toggle("active",favoritesOnly);
  $("#favoriteOnly").setAttribute("aria-pressed",String(favoritesOnly));
  $("#favoriteOnly").innerHTML=favoritesOnly?"★ お気に入りのみ":"☆ お気に入りのみ";
  render();
 };

 window.addEventListener("aroma:favorites-changed",()=>{
  if(favoritesOnly)render();
 });

 renderFilters();
 render();

 const requested=new URLSearchParams(location.search).get("id");
 if(requested)setTimeout(()=>openDetail(requested),0);
}

init().catch(error=>{
 console.error(error);
 $("#count").textContent="エラー";
});
