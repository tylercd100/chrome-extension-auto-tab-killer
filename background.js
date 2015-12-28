var canvas = document.createElement("canvas").getContext("2d");
var tabTimes = {}
var kill_under_amount = 25;
var kill_under_type = "%";
var kill_every_amount = 1;
var kill_every_type = 'minutes';
var kill_time_amount = 15;
var kill_time_type = 'minutes';
var kill_timeout = 0;
var enabled = true;
var mem_available = 0;
var mem_capacity = 1;
var systemState = 'active';


/*===============================
=            Options            =
===============================*/

function options() { 
  chrome.storage.sync.get({
    kill_under_amount: 25,
    kill_under_type: "%",
    kill_every_amount: 1,
    kill_every_type: 'minutes',
    kill_time_amount: 10,
    kill_time_type: 'minutes',
    enabled: true,
  }, function(items) {
    kill_under_amount = items.kill_under_amount;
    kill_under_type = items.kill_under_type;
    kill_every_amount = items.kill_every_amount;
    kill_every_type = items.kill_every_type;
    kill_time_amount = items.kill_time_amount;
    kill_time_type = items.kill_time_type;
    enabled = items.enabled;
    if(kill_timeout>0){
      clearTimeout(kill_timeout);
      kill_timeout = 0;
    }
    checkState();
  });
}
window.addEventListener("load", options);
chrome.storage.onChanged.addListener(options);

/*=====  End of Options  ======*/

function isAboveKillUnder(){
  if(kill_under_type === '%' && kill_under_amount/100>mem_available/mem_capacity){
    return false;
  }
  if(kill_under_type === 'GB' && kill_under_amount>toGB(mem_available,2)){
    return false;
  }
  if(kill_under_type === 'MB' && kill_under_amount>toMB(mem_available,2)){
    return false;
  }
  return true;
}

function updateTime(tab){
  tabTimes[tab.id] = new Date();
}

function killTheOldestTab(){
  kill_timeout = 0;
  var killed = false;
  var compareTime = moment().subtract(kill_time_amount,kill_time_type);
  _.each(tabTimes,function(t,k){
    tabTime = moment(t);
    if(!killed && tabTime.isBefore(compareTime)){
      console.log('killing the oldest');
      chrome.tabs.remove(parseInt(k),function(){
        if(chrome.runtime.lastError !== undefined){
          delete tabTimes[k];
        }
      });
      killed = true;
    }
  });

  if(!killed)
    console.log('Nothing was killed');
}

//Loop
setInterval(function(){
  chrome.system.memory.getInfo(function(memory) {
    mem_available = memory.availableCapacity;
    mem_capacity = memory.capacity;

    chrome.tabs.query({active:true},function(tabs){
      _.each(tabs,updateTime)
    });

    checkState();
    
    if(!!enabled && systemState === 'active'){
      //Check if memory is below limit
      var is_under = !isAboveKillUnder();

      //Set a kill timeout if one doesn't exist
      if(!!is_under && !kill_timeout>0) {
        console.log('under limit and timeout doesn\'t exists')
        kill_timeout = setTimeout(killTheOldestTab,getMillisecondsFromAmountTime(kill_every_amount,kill_every_type))
      } else if(!is_under && kill_timeout>0){ 
        //else kill timout if one exists
        console.log('over the limit and timeout exists')
        clearTimeout(kill_timeout);
        kill_timeout = 0;
      } else {
        console.log('waiting...')
      }
    } else if(!enabled && kill_timeout>0){ 
      clearTimeout(kill_timeout);
      kill_timeout = 0;
    }
  });
},1000);


/*============================
=            Icon            =
============================*/

chrome.browserAction.onClicked.addListener(function(tab){
  toggleEnabled();
});

function setIcon(state,fill_color,text_color){
  canvas.font = "8px Verdana, Geneva, sans-serif";
  canvas.textAlign = 'center';
  canvas.clearRect(0, 0, 19, 19);
  canvas.fillStyle = fill_color;
  canvas.fillRect(0, 0, 19, 19);
  canvas.fillStyle = text_color;
  // canvas.fillText("Kill",9.5, 8.5);
  canvas.fillText(state,  9.5, 11.5);
  chrome.browserAction.setIcon({ imageData: canvas.getImageData(0, 0, 19, 19)});
}
function setIconIdle(){
  setIcon("IDLE","#449d44","#FFFFFF")
}
function setIconLook(){
  setIcon("LOW","#f0ad4e","#FFFFFF")
}
function setIconOff(){
  setIcon("OFF","#c9302c","#FFFFFF")
}

window.addEventListener("load",function(){
  checkState();
});

/*=====  End of Icon  ======*/


function checkState(){
  console.log('enabled',enabled);
  title = "Auto Tab Killer";
  if(systemState !== 'active'){
    setIconIdle();
    title = "Currently not checking for tabs...";
  }
  else if(enabled && systemState === 'active' && isAboveKillUnder()){
    setIconIdle();
    title = "You have plenty of system memory available. Idle tabs will NOT be automatically closed.";
  }
  else if(enabled && systemState === 'active' && !isAboveKillUnder()){
    setIconLook();
    title = "Your available system memory has dropped below the desired minimum. Idle tabs will be automatically closed.";
  }
  else if(!enabled){
    setIconOff();
    title = "Currently not checking for idle tabs. Idle tabs will NOT be automatically closed.";
  }
  chrome.browserAction.setTitle({ title: title });
}

function toggleEnabled(){
  enabled = !enabled;
  chrome.storage.sync.set({
    enabled: enabled
  });
}


/*============================
=            Idle            =
============================*/

function setIdle(){
  chrome.idle.setDetectionInterval(15);
}

function onIdleStateChanged(newState){
  systemState = newState;
}

window.addEventListener("load", setIdle);
chrome.idle.onStateChanged.addListener(onIdleStateChanged)


/*=====  End of Idle  ======*/


/*==================================
=            Tab Events            =
==================================*/

chrome.tabs.onCreated.addListener(updateTime);

chrome.tabs.onRemoved.addListener(function(tabId){
  delete tabTimes[tabId];
  console.log(tabTimes);
})

/*=====  End of Tab Events  ======*/


/*================================================
=            INSTALLATION and UPDATES            =
================================================*/

function onInstalled(details){
    if(details.reason == "install"){
        chrome.tabs.create({ url: "options.html" });
    }else if(details.reason == "update"){
        // chrome.tabs.create({ url: "options.html" });
    }
}



