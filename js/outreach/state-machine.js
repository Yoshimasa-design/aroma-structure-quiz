import{createTimer}from"./timer.js";
import{createPlaylist}from"./playlist.js";
import{createQuizController}from"./quiz-controller.js";
import{createProgressBar}from"./progress-bar.js";
import{loadCompounds,shuffle}from"../common.js";

const STATE_ORDER=[
  "IDLE_QUESTION",
  "IDLE_COUNTDOWN",
  "IDLE_ANSWER",
  "IDLE_STRUCTURE",
  "IDLE_USAGE",
  "IDLE_NEXT"
];
const PANEL_FADE_MS=170;

export function createStateMachine(options){
  const timer=options.timer;
  const states=options.states;
  let current=null;
  let transitionSequence=0;

  function transition(nextState){
    if(!states[nextState])throw new Error("未定義の状態です: "+nextState);
    const sequence=transitionSequence+1;
    transitionSequence=sequence;

    timer.cancel();

    if(current&&states[current].exit){
      states[current].exit();
    }

    current=nextState;
    Promise.resolve(options.render(current)).then(function(){
      if(sequence!==transitionSequence||current!==nextState)return;
      states[nextState].enter();
    }).catch(options.onError);
  }

  function restart(){
    if(current)transition(current);
  }

  function getState(){
    return current;
  }

  function cancel(){
    transitionSequence+=1;
    timer.cancel();
  }

  return{transition,restart,getState,cancel};
}

function createPanelRenderer(){
  const panels=Array.from(document.querySelectorAll("[data-state-panel]"));
  const reducedMotion=window.matchMedia&&
    window.matchMedia("(prefers-reduced-motion: reduce)");
  let renderQueue=Promise.resolve();

  function panelForState(state){
    return panels.find(function(panel){
      const states=panel.getAttribute("data-state-panel").split(" ");
      return states.indexOf(state)!==-1;
    });
  }

  function delay(){
    return new Promise(function(resolve){
      window.setTimeout(resolve,PANEL_FADE_MS);
    });
  }

  function setOnlyPanel(nextPanel){
    panels.forEach(function(panel){
      panel.classList.toggle("hidden",panel!==nextPanel);
      panel.classList.remove("is-fading");
    });
  }

  function perform(state,updateContent){
    const nextPanel=panelForState(state);
    const currentPanel=panels.find(function(panel){
      return !panel.classList.contains("hidden");
    });
    if(!nextPanel)throw new Error("表示パネルが見つかりません: "+state);

    if(
      (reducedMotion&&reducedMotion.matches)||
      !currentPanel||
      currentPanel===nextPanel
    ){
      setOnlyPanel(nextPanel);
      updateContent();
      return Promise.resolve();
    }

    currentPanel.classList.add("is-fading");
    return delay().then(function(){
      currentPanel.classList.add("hidden");
      currentPanel.classList.remove("is-fading");
      updateContent();
      nextPanel.classList.remove("hidden");
      nextPanel.classList.add("is-fading");
      void nextPanel.offsetWidth;
      nextPanel.classList.remove("is-fading");
      return delay();
    });
  }

  function render(state,updateContent){
    renderQueue=renderQueue.then(function(){
      return perform(state,updateContent);
    });
    return renderQueue;
  }

  return{render:render};
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
  if(!config)throw new Error("オープンキャンパス設定がありません");
  validateTimings(config.timings);
}

function validateOutreachData(data){
  if(!data||!Array.isArray(data.compounds)||data.compounds.length<4){
    throw new Error("問題データが不足しています");
  }

  const slugs={};
  data.compounds.forEach(function(compound){
    if(
      !compound||
      typeof compound.slug!=="string"||
      !compound.slug.trim()||
      typeof compound.name!=="string"||
      !compound.name.trim()||
      typeof compound.englishName!=="string"||
      !compound.englishName.trim()||
      typeof compound.smell!=="string"||
      !compound.smell.trim()||
      typeof compound.comment!=="string"||
      !compound.comment.trim()||
      !Array.isArray(compound.foundIn)||
      !compound.foundIn.length
    )throw new Error("展示用成分データが不正です");

    if(slugs[compound.slug]){
      throw new Error("展示用成分IDが重複しています: "+compound.slug);
    }
    slugs[compound.slug]=true;

    compound.foundIn.forEach(function(item){
      if(
        !item||
        typeof item.label!=="string"||
        !item.label.trim()||
        (item.type!=="natural"&&item.type!=="product")
      )throw new Error("代表例データが不正です: "+compound.slug);
    });
  });
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

function applyCompoundData(compound,choices,structureSrc){
  document.querySelectorAll("[data-compound-odor]").forEach(function(element){
    element.textContent=compound.odor;
  });
  document.querySelectorAll("[data-compound-name]").forEach(function(element){
    element.textContent=compound.name_ja;
  });
  document.querySelectorAll("[data-compound-english]").forEach(function(element){
    element.textContent=compound.name_en;
  });
  document.querySelectorAll("[data-compound-comment]").forEach(function(element){
    element.textContent=compound.outreach.comment;
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
  ["natural","product"].forEach(function(type){
    compound.outreach.foundIn.forEach(function(item){
      if(item.type!==type)return;
      const listItem=document.createElement("li");
      listItem.className="found-in-badge found-in-"+type;
      listItem.textContent=item.label;
      foundInList.appendChild(listItem);
    });
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
  const responses=await Promise.all([
    fetch("../data/open-campus.json"),
    fetch("../data/open-campus-compounds.json")
  ]);
  if(!responses[0].ok)throw new Error("オープンキャンパス設定を読み込めません");
  if(!responses[1].ok)throw new Error("展示用成分データを読み込めません");

  const data=await Promise.all([
    responses[0].json(),
    responses[1].json()
  ]);
  const config=data[0];
  const outreachData=data[1];
  validateConfig(config);
  validateOutreachData(outreachData);
  const displayTimings=Object.assign({},config.timings,{
    answerMs:config.timings.answerMs*2.5,
    structureMs:config.timings.structureMs*2,
    usageMs:config.timings.usageMs*2,
    nextMs:config.timings.nextMs*8
  });

  const compounds=await loadCompounds();
  const compoundsById=new Map(compounds.map(function(compound){
    return[compound.id,compound];
  }));
  const idleCompounds=outreachData.compounds.map(function(outreachCompound){
    const compound=compoundsById.get(outreachCompound.slug);
    if(!compound){
      throw new Error("指定された成分が見つかりません: "+outreachCompound.slug);
    }
    return Object.assign({},compound,{
      name_ja:outreachCompound.name,
      name_en:outreachCompound.englishName,
      odor:outreachCompound.smell,
      outreach:outreachCompound
    });
  });
  if(idleCompounds.length<4)throw new Error("問題データが不足しています");

  const timer=createTimer();
  const playlist=createPlaylist(idleCompounds);
  const announcement=document.querySelector("#stateAnnouncement");
  const countdown=document.querySelector("#countdown");
  const countdownNumber=countdown.querySelector("span");
  const panelRenderer=createPanelRenderer();
  const progressBar=createProgressBar(
    document.querySelector("[data-progress]")
  );
  let machine=null;
  let currentCompound=null;
  let lastChoiceOrder="";
  let idleActive=true;

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

    await loadImage(structureSrc);
    applyCompoundData(compound,choices,structureSrc);
    currentCompound=compound;
    return{compound:compound,choices:choices};
  }

  function showDataError(error){
    timer.cancel();
    progressBar.hide();
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
    return panelRenderer.render(state,function(){
      document.body.setAttribute("data-state",state);
      progressBar.hide();
      if(state==="IDLE_QUESTION"){
        countdown.classList.add("thinking");
        countdownNumber.textContent="考えてみよう";
        countdown.setAttribute("aria-label","考えてみよう");
      }
      announce(stateLabel(state,currentCompound));
    });
  }

  function showPanel(state){
    return panelRenderer.render(state,function(){
      document.body.setAttribute("data-state",state);
      progressBar.hide();
    });
  }

  function nextState(state){
    const index=STATE_ORDER.indexOf(state);
    return STATE_ORDER[(index+1)%STATE_ORDER.length];
  }

  function scheduleNext(state,duration){
    progressBar.start(duration);
    timer.schedule(duration,function(){
      machine.transition(nextState(state));
    });
  }

  function runCountdown(){
    let remaining=5;
    progressBar.start(config.timings.countdownStepMs*remaining);
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
      enter:function(){scheduleNext("IDLE_ANSWER",displayTimings.answerMs)}
    },
    IDLE_STRUCTURE:{
      enter:function(){scheduleNext("IDLE_STRUCTURE",displayTimings.structureMs)}
    },
    IDLE_USAGE:{
      enter:function(){scheduleNext("IDLE_USAGE",displayTimings.usageMs)}
    },
    IDLE_NEXT:{
      enter:function(){
        progressBar.start(displayTimings.nextMs);
        timer.schedule(displayTimings.nextMs,function(){
          prepareNextCompound().then(function(){
            machine.transition("IDLE_QUESTION");
          }).catch(showDataError);
        });
      }
    }
  };

  machine=createStateMachine({
    timer:timer,
    states:states,
    render:render,
    onError:showDataError
  });
  machine.transition("IDLE_QUESTION");

  createQuizController({
    card:document.querySelector(".experience-card"),
    timings:displayTimings,
    pauseIdle:function(){
      idleActive=false;
      machine.cancel();
      progressBar.hide();
    },
    resumeIdle:function(){
      idleActive=true;
      prepareNextCompound().then(function(){
        machine.transition("IDLE_QUESTION");
      }).catch(showDataError);
    },
    prepareQuestion:prepareNextCompound,
    showPanel:showPanel,
    progressBar:progressBar,
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
