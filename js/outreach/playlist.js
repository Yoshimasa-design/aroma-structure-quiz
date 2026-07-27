import{shuffle}from"../common.js";

export function createPlaylist(compounds){
  let queue=[];
  let index=0;
  let lastCompound=null;

  function refill(){
    queue=shuffle(compounds);
    index=0;

    if(
      lastCompound&&
      queue.length>1&&
      queue[0].id===lastCompound.id
    ){
      const first=queue[0];
      queue[0]=queue[1];
      queue[1]=first;
    }
  }

  function getNextCompound(){
    if(index>=queue.length){
      refill();
    }

    const compound=queue[index];
    index+=1;
    lastCompound=compound;
    return compound;
  }

  return{getNextCompound};
}
