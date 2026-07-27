import{createTimer}from"./timer.js";

export function getQuizResult(correctCount){
  const messages=[
    "もう一度挑戦すると、新しい発見があるかもしれません！",
    "香りの世界は奥深いですね！",
    "あと一歩！よくできました！",
    "全問正解！香り博士ですね！"
  ];
  if(
    typeof correctCount!=="number"||
    correctCount%1!==0||
    correctCount<0||
    correctCount>3
  ){
    const defaultMessage="香りの世界を楽しんでいただき、ありがとうございました！";
    return{
      score:"クイズ終了！",
      message:defaultMessage,
      announcement:"クイズ終了。"+defaultMessage
    };
  }
  const message=messages[correctCount];
  return{
    score:"3問中 "+correctCount+"問正解！",
    message:message,
    announcement:"クイズ終了。3問中"+correctCount+"問正解でした。"+message
  };
}

export function createQuizController(options){
  const phaseTimer=createTimer();
  const inactivityTimer=createTimer();
  const card=options.card;
  const feedback=document.querySelector("#quizFeedback");
  const nextButton=document.querySelector("#quizNext");
  const retryButton=document.querySelector("#quizRetry");
  const returnIdleButton=document.querySelector("#quizReturnIdle");
  const startButton=document.querySelector(".start-experience");
  const resultScore=document.querySelector("[data-quiz-result-score]");
  const resultMessage=document.querySelector("[data-quiz-result-message]");
  const choices=Array.from(document.querySelectorAll("[data-choice-index]"));
  let mode="idle";
  let questionNumber=0;
  let correctCount=0;
  let currentQuestion=null;
  let acceptingAnswer=false;

  function announce(message){
    options.announce(message);
  }

  function showPanel(state,message){
    options.showPanel(state);
    if(message)announce(message);
  }

  function resetInactivity(){
    if(mode!=="quiz")return;
    inactivityTimer.schedule(options.timings.quizInactivityMs,endQuiz);
  }

  function showQuestion(){
    options.prepareQuestion().then(function(question){
      currentQuestion=question;
      questionNumber+=1;
      acceptingAnswer=true;
      showPanel("QUIZ_QUESTION","第"+questionNumber+"問を表示しました");
      const countdown=document.querySelector("#countdown");
      countdown.classList.add("thinking");
      countdown.querySelector("span").textContent="第"+questionNumber+"問";
      countdown.setAttribute("aria-label","第"+questionNumber+"問");
      choices.forEach(function(button){
        button.disabled=false;
      });
      choices[0].focus();
      resetInactivity();
    }).catch(handleError);
  }

  function handleError(error){
    phaseTimer.cancel();
    inactivityTimer.cancel();
    acceptingAnswer=false;
    mode="idle";
    options.showError(error);
  }

  function showUsage(){
    showPanel(
      "QUIZ_USAGE",
      currentQuestion.compound.name_ja+"が含まれる代表的なものを表示しました"
    );
    phaseTimer.schedule(options.timings.usageMs,function(){
      showPanel("QUIZ_NEXT","次の問題ボタンを表示しました");
      nextButton.textContent=questionNumber===3?"結果を見る":"次の問題";
      nextButton.focus();
      resetInactivity();
    });
  }

  function showStructure(){
    showPanel(
      "QUIZ_STRUCTURE",
      currentQuestion.compound.name_ja+"の構造式を表示しました"
    );
    phaseTimer.schedule(options.timings.structureMs,showUsage);
  }

  function answer(button){
    if(!acceptingAnswer||!currentQuestion)return;
    acceptingAnswer=false;
    choices.forEach(function(choice){
      choice.disabled=true;
    });
    const isCorrect=button.getAttribute("data-choice-id")===currentQuestion.compound.id;
    const message=isCorrect?"○ 正解！":"× 残念！";
    if(isCorrect)correctCount+=1;
    feedback.textContent=message;
    showPanel("QUIZ_FEEDBACK",message);
    phaseTimer.schedule(options.timings.quizFeedbackMs,showStructure);
    resetInactivity();
  }

  function showResult(){
    const result=getQuizResult(correctCount);
    resultScore.textContent=result.score;
    resultMessage.textContent=result.message;
    showPanel("QUIZ_RESULT",result.announcement);
    resetInactivity();
    retryButton.focus();
  }

  function nextQuestion(){
    if(mode!=="quiz")return;
    resetInactivity();
    if(questionNumber>=3){
      showResult();
      return;
    }
    showQuestion();
  }

  function beginQuiz(){
    questionNumber=0;
    correctCount=0;
    currentQuestion=null;
    acceptingAnswer=false;
    showPanel("QUIZ_INTRO","クイズに挑戦。全部で3問です");
    phaseTimer.schedule(options.timings.quizIntroMs,showQuestion);
    resetInactivity();
  }

  function startQuiz(){
    if(mode!=="idle")return;
    mode="quiz";
    options.pauseIdle();
    document.body.setAttribute("data-mode","quiz");
    beginQuiz();
  }

  function retryQuiz(){
    if(mode!=="quiz")return;
    phaseTimer.cancel();
    inactivityTimer.cancel();
    beginQuiz();
  }

  function endQuiz(){
    if(mode!=="quiz")return;
    mode="idle";
    acceptingAnswer=false;
    phaseTimer.cancel();
    inactivityTimer.cancel();
    document.body.setAttribute("data-mode","idle");
    choices.forEach(function(button){
      button.disabled=false;
    });
    options.resumeIdle();
    startButton.focus();
  }

  card.addEventListener("click",function(event){
    if(mode!=="quiz")return;

    event.stopPropagation();
    resetInactivity();
    const choice=event.target.closest("[data-choice-index]");
    if(choice&&card.contains(choice)){
      answer(choice);
      return;
    }
    if(event.target.closest("#quizNext")){
      nextQuestion();
      return;
    }
    if(event.target.closest("#quizRetry")){
      retryQuiz();
      return;
    }
    if(event.target.closest("#quizReturnIdle")){
      endQuiz();
    }
  });

  document.addEventListener("click",function(event){
    if(mode==="idle"){
      event.preventDefault();
      startQuiz();
    }
  });

  document.addEventListener("touchend",function(){
    if(mode==="idle")startQuiz();
  });

  card.addEventListener("keydown",function(){
    if(mode==="quiz")resetInactivity();
  });

  document.body.setAttribute("data-mode","idle");

  return{start:startQuiz,end:endQuiz};
}
