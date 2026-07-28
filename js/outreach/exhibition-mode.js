const page=document.documentElement;
const body=document.body;
const enterButton=document.querySelector("[data-exhibition-enter]");
const exitButton=document.querySelector("[data-exhibition-exit]");
const status=document.querySelector("[data-exhibition-status]");
let wakeLockSentinel=null;
let wakeLockRequestPending=false;

function getFullscreenElement(){
  return document.fullscreenElement||document.webkitFullscreenElement||null;
}

function getRequestFullscreen(){
  return page.requestFullscreen||page.webkitRequestFullscreen||null;
}

function getExitFullscreen(){
  return document.exitFullscreen||document.webkitExitFullscreen||null;
}

function announce(message){
  status.textContent=message;
}

function releaseWakeLock(){
  const sentinel=wakeLockSentinel;
  wakeLockSentinel=null;
  if(sentinel&&sentinel.release){
    Promise.resolve(sentinel.release()).catch(function(){});
  }
}

function requestWakeLock(){
  if(
    wakeLockSentinel||
    wakeLockRequestPending||
    document.visibilityState!=="visible"||
    !navigator.wakeLock||
    !navigator.wakeLock.request
  ){
    return;
  }

  wakeLockRequestPending=true;
  navigator.wakeLock.request("screen").then(function(sentinel){
    wakeLockRequestPending=false;
    wakeLockSentinel=sentinel;
    sentinel.addEventListener("release",function(){
      if(wakeLockSentinel===sentinel){
        wakeLockSentinel=null;
      }
    });
  }).catch(function(){
    wakeLockRequestPending=false;
  });
}

function syncFullscreenState(){
  const active=Boolean(getFullscreenElement());
  body.classList.toggle("is-exhibition",active);
  enterButton.hidden=active;
  exitButton.hidden=!active;

  if(active){
    requestWakeLock();
    announce("展示モードを開始しました。");
  }else{
    releaseWakeLock();
    announce("展示モードを終了しました。");
  }
}

function enterExhibitionMode(){
  const requestFullscreen=getRequestFullscreen();
  if(!requestFullscreen){
    announce(
      "このブラウザでは全画面表示を利用できません。通常表示でご利用ください。"
    );
    return;
  }

  Promise.resolve(requestFullscreen.call(page)).then(function(){
    syncFullscreenState();
  }).catch(function(){
    announce("全画面表示を開始できませんでした。通常表示でご利用ください。");
  });
}

function exitExhibitionMode(){
  const exitFullscreen=getExitFullscreen();
  if(!getFullscreenElement()||!exitFullscreen){
    syncFullscreenState();
    return;
  }

  Promise.resolve(exitFullscreen.call(document)).then(function(){
    syncFullscreenState();
  }).catch(function(){
    announce("全画面表示を終了できませんでした。Escキーをお試しください。");
  });
}

enterButton.addEventListener("click",enterExhibitionMode);
exitButton.addEventListener("click",exitExhibitionMode);
document.addEventListener("fullscreenchange",syncFullscreenState);
document.addEventListener("webkitfullscreenchange",syncFullscreenState);
document.addEventListener("keydown",function(event){
  if(event.key==="Escape"&&body.classList.contains("is-exhibition")){
    exitExhibitionMode();
  }
});
document.addEventListener("visibilitychange",function(){
  if(document.visibilityState==="visible"&&getFullscreenElement()){
    requestWakeLock();
  }else{
    releaseWakeLock();
  }
});
window.addEventListener("pagehide",releaseWakeLock);
