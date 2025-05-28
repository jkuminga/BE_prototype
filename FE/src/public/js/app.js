const socket = io({query : { role : 'fe'}});

const divisStart = document.querySelector('#isStart');
const startBTN = divisStart.querySelector('button');
const currentStatus = divisStart.querySelector('h3')

var isStart = false; // 현재 시스템 동작 상태
var previous_isStart = null; // 명령 이전의 시스템 동작 상태

// 연결 테스트 버튼
const testButton = document.querySelector('#test')

function done() {
    console.log('done')
}

testButton.addEventListener('click', ()=>{
    console.log('clicked!')
    socket.emit('test', 'testing... send to python socket', ()=>{
        done()
    })
})

// 모터 작동 테스트
const motorTestButton = document.querySelector('#motortest');

motorTestButton.addEventListener('click', ()=>{
    console.log('모터 테스트..')
    socket.emit('motor test', true);
})

// 강제 종료
const forceButton = document.querySelector('#ForceStop');

forceButton.addEventListener('click', ()=>{
    previous_isStart = true;
    setCurrentState('stop')
    socket.emit('running command', 'stop', (result)=>{
        setCurrentState(result);
    })
})


// 현재 상태를 적용하는 함수
function editScreen(isStart) {
    (isStart == true) ? currentStatus.innerText = '현재상태 : 실행 중' : currentStatus.innerText = "현재상태 : 정지";
    (isStart == true) ? startBTN.innerText = '정지' : startBTN.innerText = '시작';
}

function setCurrentState(command){
    if(command == 'command'){           //시스템을 시작/정지 할것을 명령 하는 경우
        previous_isStart = isStart;     //이전 시스템 동닥 상태를 저장
        isStart = 'waiting'             //대기중으로 변경 >> 변경 완료 후 자동으로 콜백으로 다시 setCurrentState() 실행됨
        currentStatus.innerText = '대기 중'
        startBTN.innerText = '대기 중'
        // + 버튼 비활성화 필요..
    }else if(command == false || command == true) {   // 처음 시작 했을 때 화면 설정
        editScreen(command)
    }
    else{       // 명령 콜백 처리 부분
        console.log('실행결과:',command)
        console.log('이전 상태:', previous_isStart)
        if(command === 'success'){    // 파이썬에서 시스템 변경 성공 시 
            isStart = !previous_isStart; // 명령 이전의 반대 값을 isStart에 넣음 (정지 상태 > 시작 명령 > (파이썬)시작 성공 > 시작 상태)
            editScreen(isStart)
        }else{        //시스템 변경 실패 시 
            if(command == 'error'){  // 타임아웃 에러 시
                console.log('command failed: timout')
            }else{
                console.log('command failed: system error')
            }
            isStart = previous_isStart; // 상태 변경을 실패했으므로 이전의 값을 유지함
            editScreen(isStart)
        }
    }
}

setCurrentState(isStart);

// 시작/ 정지 버튼 리스너
startBTN.addEventListener('click', ()=>{
    command = null 
    setCurrentState('command') // 명령 상태로 변경 요청 
    if(previous_isStart === true){ // 이전 상태에 따른 명령 선택(시작 상태였을 경우 정지 요청, 정지 상태였을 경우 시작 요청
        command = 'stop'
    }else{
        command = 'start'
    }
    console.log(command)
    socket.emit('running command', command, (result)=>{
        setCurrentState(result)
    })
})





// 할 것 : 3개 모드 버튼 만들고 모드를 서버로 보내기
const divMode = document.querySelector('#mode');
const buttons = divMode.querySelectorAll('button');
const h3Mode = divMode.querySelector('h3');

var currentMode = 'mid';
var previousMode = null;

function setCurrentMode(btn, selectedMode){
    var currentButton = divMode.querySelector(`#${btn}`)
    buttons.forEach((button)=>{
        button.classList.remove('selected')
    })
    if(currentButton){
        currentButton.classList.add('selected')
    }
    if(selectedMode === 'low'){
        h3Mode.innerText = `현재 모드 : 낮음`;
    }else if(selectedMode === 'mid'){
        h3Mode.innerText = `현재 모드 : 보통`;
    }else if(selectedMode === 'high'){
        h3Mode.innerText = `현재 모드 : 높음`;
    }else{
        h3Mode.innerText = `현재 모드 : ${selectedMode}`;
    }
}

setCurrentMode('mid','보통');


buttons.forEach((button)=>{
    button.addEventListener("click", ()=>{
        previousMode = currentMode;
        selectedMode = button.id;
        currentMode = '대기 중'
        setCurrentMode('no', currentMode)
        socket.emit('change mode', selectedMode, (result)=>{
            if(result == 'success'){
                currentMode = selectedMode;
                setCurrentMode(selectedMode, selectedMode)
            }else{
                currentMode = previousMode;
                setCurrentMode(previousMode, previousMode)
            }
        })
    })
})



// 팝업 발생
const popupWidget = document.querySelector('#popup');
const popBtn = document.querySelector('#popupBtn');

function setPopupContent(warningLog){
    const closeBtn = document.querySelector('#closeBtn');
    const popupContents = popupWidget.querySelector('.popup-content');
    const warningType = popupContents.querySelector('h2');
    const warningReason =popupContents.querySelector('p');

    warningType.innerText = warningLog['type'];
    warningReason.innerText = warningLog['reason']

    closeBtn.addEventListener('click',()=>{
        popupWidget.classList.add('hidden')
    })
}

const warningLog1 = {
    'type' : '경고',
    'reason' : '눈감음'
}

// 임시 버튼
popBtn.addEventListener('click', ()=>{
    popupWidget.classList.remove('hidden')
    setPopupContent(warningLog1);
})


// 경고 발생 여부 확인
socket.on('warning occured', (warningLog)=>{
    if(warningLog['warning occured'] === true){
        setPopupContent(warningLog);
        popupWidget.classList.remove('hidden');
    }
})








