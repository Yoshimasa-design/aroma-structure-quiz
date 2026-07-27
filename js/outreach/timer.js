export function createTimer(){
  let timeoutId=null;
  let deadline=0;

  function cancel(){
    if(timeoutId!==null){
      clearTimeout(timeoutId);
      timeoutId=null;
    }
    deadline=0;
  }

  function schedule(duration,callback){
    cancel();
    const delay=Math.max(0,Number(duration)||0);
    deadline=Date.now()+delay;
    timeoutId=setTimeout(function(){
      timeoutId=null;
      deadline=0;
      callback();
    },delay);
  }

  function restart(duration,callback){
    schedule(duration,callback);
  }

  function getRemaining(){
    return deadline?Math.max(0,deadline-Date.now()):0;
  }

  return{schedule,restart,cancel,getRemaining};
}
