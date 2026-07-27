import{createTimer}from"./timer.js";
import{createPlaylist}from"./playlist.js";
import{createQuizController}from"./quiz-controller.js";
import{loadCompounds,shuffle}from"../common.js";

const STATE_ORDER=[
  "IDLE_QUESTION",
  "IDLE_COUNTDOWN",
  "IDLE_ANSWER",
  "IDLE_STRUCTURE",
  "IDLE_USAGE",
  "IDLE_NEXT"
];

export function createStateMachine(options){
  const timer=options.timer;
  const states=options.states;
  let current=null;

  function transition(nextState){
    if(!states[nextState])throw new Error("未定義の状態です: "+nextState);

    timer.cancel();

    if(current&&states[current].exit){
      states[current].exit();
    }

    current=nextState;
    options.render(current);
    states[current].enter();
  }

  function restart(){
    if(current)transition(current);
  }

  function getState(){
    return current;
  }

  return{transition,restart,getState};
}

function validateTimings(timings){
  const required=[
    "questionMs",
    "countdownStepMs",
    "answerMs",
    "structureMs",
    "usageMs",
    "nextMs",
    "quizIntroMs",
    "quizFeedbackMs",
    "quizInactivityMs"
  ];

  required.forEach(function(key){
    if(typeof timings[key]!=="number"||timings[key]<=0){
      throw new Error("タイマー設定が不正です: "+key);
    }
  });
}

function validateConfig(config){
  if(!config||!Array.isArray(config.idleCompoundIds)){
    throw new Error("表示する成分ID一覧が設定されていません");
  }
  if(config.idleCompoundIds.length<4){
    throw new Error("問題データが不足しています");
  }
  const uniqueIds=new Set(config.idleCompoundIds);
  if(uniqueIds.size!==config.idleCompoundIds.length){
    throw new Error("表示する成分IDが重複しています");
  }
  validateTimings(config.timings);
}

function getDataErrorMessage(error){
  return error&&error.message==="問題データが不足しています"?
    "問題データが不足しています。":
    "オープンキャンパス用データを読み込めませんでした。";
}

function loadImage(src){
  return new Promise(function(resolve,reject){
    const image=new Image();
    image.onload=function(){resolve()};
    image.onerror=function(){reject(new Error("構造式画像を読み込めません: "+src))};
    image.src=src;
  });
}

function applyCompoundData(compound,choices,foundIn,structureSrc){
  const odorText=(compound.odor_icon?compound.odor_icon+" ":"")+compound.odor;

  document.querySelectorAll("[data-compound-odor]").forEach(function(element){
    element.textContent=odorText;
  });
  document.querySelectorAll("[data-compound-name]").forEach(function(element){
    element.textContent=compound.name_ja;
  });
  document.querySelectorAll("[data-compound-structure]").forEach(function(image){
    image.src=structureSrc;
    image.alt=compound.name_ja+"の構造式";
  });
  document.querySelectorAll("[data-choice-index]").forEach(function(button){
    const index=Number(button.getAttribute("data-choice-index"));
    button.textContent=choices[index].name_ja;
    button.setAttribute("data-choice-id",choices[index].id);
  });

  const foundInList=document.querySelector("#foundInList");
  while(foundInList.firstChild){
    foundInList.removeChild(foundInList.firstChild);
  }
  foundIn.forEach(function(item){
    const listItem=document.createElement("li");
    listItem.textContent=item;
    foundInList.appendChild(listItem);
  });
  foundInList.setAttribute("aria-label",compound.name_ja+"が含まれる代表的なもの");
}

function stateLabel(state,compound){
  const labels={
    IDLE_QUESTION:"問題を表示しました",
    IDLE_COUNTDOWN:"カウントダウンを開始します",
    IDLE_ANSWER:"正解は"+compound.name_ja+"です",
    IDLE_STRUCTURE:compound.name_ja+"の構造式を表示しました",
    IDLE_USAGE:compound.name_ja+"が含まれる代表的なものを表示しました",
    IDLE_NEXT:"次の問題へ進みます"
  };
  return labels[state];
}

async function init(){
  const response=await fetch("../data/open-campus.json");
  if(!response.ok)throw new Error("オープンキャンパス設定を読み込めません");

  const config=await response.json();
  validateConfig(config);

  const compounds=await loadCompounds();
  const compoundsById=new Map(compounds.map(function(compound){
    return[compound.id,compound];
  }));
  const idleCompounds=config.idleCompoundIds.map(function(id){
    const compound=compoundsById.get(id);
    if(!compound)throw new Error("指定された成分が見つかりません: "+id);
    return compound;
  });
  if(idleCompounds.length<4)throw new Error("問題データが不足しています");

  const timer=createTimer();
  const playlist=createPlaylist(idleCompounds);
  const announcement=document.querySelector("#stateAnnouncement");
  const countdown=document.querySelector("#countdown");
  const countdownNumber=countdown.querySelector("span");
  let machine=null;
  let currentCompound=null;
  let lastChoiceOrder="";
  let idleActive=true;

  function getFoundIn(compound){
    const outreach=config.outreachCompounds&&config.outreachCompounds[compound.id];
    if(outreach&&Array.isArray(outreach.foundIn)&&outreach.foundIn.length){
      return outreach.foundIn;
    }
    if(Array.isArray(compound.sources_list)&&compound.sources_list.length){
      return compound.sources_list.map(function(source){
        return(compound.odor_icon?compound.odor_icon+" ":"")+source;
      });
    }
    throw new Error("代表製品データがありません: "+compound.id);
  }

  function makeChoices(compound){
    const distractors=shuffle(idleCompounds.filter(function(candidate){
      return candidate.id!==compound.id;
    })).slice(0,3);
    const choices=shuffle([compound].concat(distractors));
    let signature=choices.map(function(choice){return choice.id}).join(",");

    if(signature===lastChoiceOrder&&choices.length>1){
      const first=choices[0];
      choices[0]=choices[1];
      choices[1]=first;
      signature=choices.map(function(choice){return choice.id}).join(",");
    }

    lastChoiceOrder=signature;
    return choices;
  }

  async function prepareNextCompound(){
    const compound=playlist.getNextCompound();
    const choices=makeChoices(compound);
    const structureSrc="../"+compound.structure;
    const foundIn=getFoundIn(compound);

    await loadImage(structureSrc);
    applyCompoundData(compound,choices,foundIn,structureSrc);
    currentCompound=compound;
    return{compound:compound,choices:choices};
  }

  function showDataError(error){
    timer.cancel();
    console.error(error);
    const card=document.querySelector(".experience-card");
    if(card){
      card.innerHTML="<h1>読み込みエラー</h1><p>"+getDataErrorMessage(error)+"</p>";
    }
  }

  await prepareNextCompound();

  function announce(message){
    announcement.textContent=message;
  }

  function render(state){
    document.body.setAttribute("data-state",state);
    document.querySelectorAll("[data-state-panel]").forEach(function(panel){
      const panelStates=panel.getAttribute("data-state-panel").split(" ");
      panel.classList.toggle("hidden",panelStates.indexOf(state)===-1);
    });
    if(state==="IDLE_QUESTION"){
      countdown.classList.add("thinking");
      countdownNumber.textContent="考えてみよう";
      countdown.setAttribute("aria-label","考えてみよう");
    }
    announce(stateLabel(state,currentCompound));
  }

  function showPanel(state){
    document.body.setAttribute("data-state",state);
    document.querySelectorAll("[data-state-panel]").forEach(function(panel){
      const panelStates=panel.getAttribute("data-state-panel").split(" ");
      panel.classList.toggle("hidden",panelStates.indexOf(state)===-1);
    });
  }

  function nextState(state){
    const index=STATE_ORDER.indexOf(state);
    return STATE_ORDER[(index+1)%STATE_ORDER.length];
  }

  function scheduleNext(state,duration){
    timer.schedule(duration,function(){
      machine.transition(nextState(state));
    });
  }

  function runCountdown(){
    let remaining=5;
    countdown.classList.remove("thinking");
    countdownNumber.textContent=String(remaining);
    countdown.setAttribute("aria-label","残り"+remaining+"秒");
    announce("カウントダウンを開始します。残り5秒");

    function step(){
      remaining-=1;

      if(remaining===0){
        machine.transition("IDLE_ANSWER");
        return;
      }

      countdownNumber.textContent=String(remaining);
      countdown.setAttribute("aria-label","残り"+remaining+"秒");

      if(remaining===3||remaining===1){
        announce("残り"+remaining+"秒");
      }

      timer.restart(config.timings.countdownStepMs,step);
    }

    timer.schedule(config.timings.countdownStepMs,step);
  }

  const states={
    IDLE_QUESTION:{
      enter:function(){scheduleNext("IDLE_QUESTION",config.timings.questionMs)}
    },
    IDLE_COUNTDOWN:{
      enter:runCountdown
    },
    IDLE_ANSWER:{
      enter:function(){scheduleNext("IDLE_ANSWER",config.timings.answerMs)}
    },
    IDLE_STRUCTURE:{
      enter:function(){scheduleNext("IDLE_STRUCTURE",config.timings.structureMs)}
    },
    IDLE_USAGE:{
      enter:function(){scheduleNext("IDLE_USAGE",config.timings.usageMs)}
    },
    IDLE_NEXT:{
      enter:function(){
        timer.schedule(config.timings.nextMs,function(){
          prepareNextCompound().then(function(){
            machine.transition("IDLE_QUESTION");
          }).catch(showDataError);
        });
      }
    }
  };

  machine=createStateMachine({timer:timer,states:states,render:render});
  machine.transition("IDLE_QUESTION");

  createQuizController({
    card:document.querySelector(".experience-card"),
    timings:config.timings,
    pauseIdle:function(){
      idleActive=false;
      timer.cancel();
    },
    resumeIdle:function(){
      idleActive=true;
      prepareNextCompound().then(function(){
        machine.transition("IDLE_QUESTION");
      }).catch(showDataError);
    },
    prepareQuestion:prepareNextCompound,
    showPanel:showPanel,
    announce:announce,
    showError:showDataError
  });

  document.addEventListener("visibilitychange",function(){
    if(document.visibilityState==="visible"&&idleActive){
      machine.restart();
    }
  });
}

init().catch(function(error){
  console.error(error);
  const card=document.querySelector(".experience-card");
  if(card){
    card.innerHTML="<h1>読み込みエラー</h1><p>"+getDataErrorMessage(error)+"</p>";
  }
});
