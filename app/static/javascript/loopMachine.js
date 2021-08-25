const TICKS_PER_COMPLETE_ITERATION = 8;
let currentActivePlayersCount = 0;
let tick = 0;
let tickIncreaserInterval = null;
let lastActivePlayersList = null;
let recordActionsQueue = []; // [{tick: tick_val, players: [active players]}]
let isRecording = false;
let recordingTick = 0;
let recordingTickIncreaserInterval = null;

function updateTickToNextTickValue() {
    tick = tick < TICKS_PER_COMPLETE_ITERATION? tick + 1 : 1;
}

function stopPlayer(playerElement) {
    let audioElement = getPlayerAudio(playerElement);
    stopAudio(audioElement);
    playerElement.classList.remove("active");
}

function stopAudio(audioElement){
    const isLastPlayer = currentActivePlayersCount === 1;
    if (isLastPlayer){
        //TODO: write reset tick interval function
        clearInterval(tickIncreaserInterval);
        tick = 0;
    }

    audioElement.pause();
    audioElement.currentTime = 0;
    currentActivePlayersCount--;
    audioElement.classList.add("off");
}

function startPlayer(playerElement) {
    let audioElement = getPlayerAudio(playerElement);
    startAudio(audioElement);
    playerElement.classList.add("active");
}

function startAudio(audioElement) {
    const isFirstPlayer = currentActivePlayersCount === 0;
    if (isFirstPlayer){
        tickIncreaserInterval = setInterval(updateTickToNextTickValue,1000);
        audioElement.play();
    }
    else{
        const secondsUntilNextLoop = (TICKS_PER_COMPLETE_ITERATION - tick) * 1000;
        setTimeout(()=>{
                    const isPlayerStillTurnedOff = !audioElement.classList.contains("off");
                    if(isPlayerStillTurnedOff){
                        audioElement.play();
                    }
        }, secondsUntilNextLoop);
    }
    currentActivePlayersCount++;
    audioElement.classList.remove("off");
}

function onPlayerClickHandler(event) {
    const playerElement = event.target;
    togglePlayer(playerElement);
    addRecordingAction(playerElement);
}

function getPlayerAudio(playerElement) {
    return playerElement.firstElementChild;
}

function addRecordingAction(playerElement) {
    if(isRecording){
        const players = Array.isArray(playerElement) ? playerElement : [playerElement];
        const action = {tick: recordingTick, players: players};
        recordActionsQueue.push(action);
    }
}

function togglePlayer(playerElement) {
    let isPlayerActive = playerElement.classList.contains("active");
    isPlayerActive ? stopPlayer(playerElement) : startPlayer(playerElement);
}

function stopCurrentActivePlayers() {
    lastActivePlayersList = document.querySelectorAll(".active");
    if (lastActivePlayersList.length > 0){
        for (let player of lastActivePlayersList){
            stopPlayer(player);
        }
        addRecordingAction(Array.from(lastActivePlayersList));
    }
}

function startLastActivePlayers() {
    if (lastActivePlayersList.length > 0){
        for (let player of lastActivePlayersList){
            startPlayer(player);
        }
        addRecordingAction(Array.from(lastActivePlayersList));
    }
    lastActivePlayersList = null;
}

function record(event) {
    stopCurrentActivePlayers();
    isRecording = !isRecording;
    if (isRecording){
        clearInterval(recordingTickIncreaserInterval);
        recordingTick = 0;
        recordingTickIncreaserInterval = setInterval(() => recordingTick++,1000);
    }

    event.target.classList.toggle("recording");
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}


async function playRecordSession() {
    // stopCurrentActivePlayers();
    let action = null;

    while(recordActionsQueue.length > 0){
        action = recordActionsQueue.shift();
        for (let player of action['players']){
                togglePlayer(player);
            }
        const currentActionTick = action['tick'];
        const nextActionTick = recordActionsQueue.length === 0 ? currentActionTick : recordActionsQueue[0]['tick'] ;
        const waitingTimeToNextAction = recordActionsQueue[0] ? (nextActionTick - currentActionTick) * 1000 : 0;
        await delay(waitingTimeToNextAction);
    }
}
