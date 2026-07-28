export function createProgressBar(element){
  const fill=element.querySelector("[data-progress-fill]");
  const reducedMotion=window.matchMedia&&
    window.matchMedia("(prefers-reduced-motion: reduce)");

  function resetFill(){
    fill.style.transition="none";
    fill.style.width="100%";
  }

  function hide(){
    resetFill();
    element.hidden=true;
  }

  function start(duration){
    const delay=Math.max(0,Number(duration)||0);
    resetFill();
    element.hidden=false;
    void fill.offsetWidth;

    if(!delay||(reducedMotion&&reducedMotion.matches)){
      fill.style.width="0%";
      return;
    }

    fill.style.transition="width "+delay+"ms linear";
    fill.style.width="0%";
  }

  hide();

  return{start:start,hide:hide};
}
