import{readFile}from"node:fs/promises";
import path from"node:path";
import{fileURLToPath}from"node:url";

const toolDirectory=path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot=path.resolve(toolDirectory,"..");
const compoundsPath=path.join(repositoryRoot,"data","compounds.json");
const openCampusPath=path.join(repositoryRoot,"data","open-campus.json");

const compounds=JSON.parse(await readFile(compoundsPath,"utf8"));
const openCampus=JSON.parse(await readFile(openCampusPath,"utf8"));
const registered=openCampus.outreachCompounds||{};
const draft={};

compounds.forEach(function(compound){
  if(Object.prototype.hasOwnProperty.call(registered,compound.id))return;

  if(!Array.isArray(compound.sources_list)||!compound.sources_list.length){
    console.error("警告: sources_listがありません: "+compound.id);
    return;
  }

  const foundIn=[];
  const seen=new Set();

  compound.sources_list.forEach(function(source){
    if(typeof source!=="string")return;
    const item=source.trim();
    if(!item||seen.has(item)||foundIn.length>=5)return;
    seen.add(item);
    foundIn.push(item);
  });

  if(!foundIn.length){
    console.error("警告: 有効なsources_listがありません: "+compound.id);
    return;
  }

  draft[compound.id]={foundIn:foundIn};
});

console.log(JSON.stringify(draft,null,2));
