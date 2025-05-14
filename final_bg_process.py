import socketio
import asyncio
import cv2
import random
from datetime import datetime

sio = socketio.AsyncClient() # 웹소켓 클라이언트

is_running = False # 현재 실행 상태
current_mode = 'mid' # 현재 모드 
camera_task = None # 모델 실행 상태

model = None # yolo 모델
cap = None # 카메라
user_id = None # 연결된 사용자
system_time = None # 시스템 작동 시각

pse_motor = 0 # 가상 모터
warning_type = ['주의','경고'] 

# 연결 시 이밴드
@sio.event
async def connect():
    print('connected To server!')

# 연결 테스트 용
@sio.on('test')
async def test(msg):    
    print(msg)
    await sio.emit('test result', 'checked in python')

# 시스템 켜기
# 동작아 이니라 실행만 하는 곳
# 카메라를 등록, 작동여부 확인 및 모델 여부를 확인만 하고
# global 변수로 카메라와 모델을 반환만 함(cap, model)
async def initialize_system():
    try: 
        cap = cv2.VideoCapture(0) ## 카메라 연결
        if not cap.isOpened(): ## 카메라 문제 잇는 경우
            print('카메라 열기 실패')
            return None, None  ## 실행 실패 반환
        
        ## 랜덤 값으로 모델 실행 여부 확인
        model_result = random.randint(0,1) 

        ## 실제 모델 존재 여부 확인 필요

        if model_result == 0: ## 카메라, 모델 둘 다 실행 성공하는 경우
            print('시스템 시작 성공, 카메라 :', cap)
            return cap, model_result ## 카메라, 모델을 직접 반환
        
        else:
            print('모델 실행 실패')
            return cap, None
        
    except Exception as e:
        print('Error occured while initializing system,', e)
        return None, None
    

# ai모니터링 실행 루프(카메라 실행 + ai 모델 실행)
# initialize_system()으로 받은 cap, model에 대해서 이벤트 루프에 올리는 역할
async def start_camera_loop():
    global is_running, cap, pse_motor, system_time

     ## 가상 경고 발생 및 처리 프로세스 구현(임시)
    warning_frame = random.randint(50, 150) ## 경고가 발생할 프레임 수
    current_frame = 0 ## 현재 진행 된 프레임
    warning_sent = False ## 딱 한번만 경고 발생시킬거기 때문에 경고 발생 여부

    while is_running:
        ret, frame = cap.read()
        if not ret:
            print('프레임 읽기 실패')
            break 

        current_frame += 1 # 현재 프레임을 1씩 올림

        if not warning_sent and current_frame == warning_frame: ## 경고 발생 조건
            warning_sent = True # 경고 발생 시 경고 발생 여부를 True로 변경
            logs = {
                'warning occured' : True,
                'date': datetime.now().strftime('%Y.%m.%d - %H:%M:%S'),
                'type' : warning_type[random.randint(0,1)],
                'reason' : '눈 감음',
                'system_time' : system_time
            }
            await sio.emit('warning occured',logs)
            pse_motor = 90
            print('현재 모터 각도 : ', pse_motor)
            
        await asyncio.sleep(0.01)
        

    cap.release()
    print('모니터링 종료')

# 시스템 시작/정지 명령 리스너
@sio.on('running command') 
async def running_command(command): # 시스템 명령 수신 시 작동
    global is_running, cap, model, camera_task, system_time

    if command == 'start': # 수신받은 명령이 '시작' 이라면
        is_running = True  # is_running (명령 시작) 을 true
        cap, model = await initialize_system() # 모델 시작 함수 실행 후 결과 반환 받음

        if cap != None and model != None: # 모델이랑 카메라가 잘 작동되서 실행이 된다면
            result = 'success' # 결과는 success 
            system_time = datetime.now().strftime('%Y.%m.%d - %H:%M:%S') # 시작 시간 저장
            await sio.emit('running result', result) # 실행 결과를 서버로 전송해주고
            camera_task = asyncio.create_task(start_camera_loop()) # 카메라 감시 시작

        else: # 카메라 혹은 모델 시작에 실패했다면
            is_running = False  # 정지 명령
            result = 'failed'   # 결과는 failed 
            await sio.emit('running result', result)  # 실행 결과를 서버로 전송
        
        print('result emitted to server')
    else: # 명령이 '정지' 라면
        print('stopping system..')
        is_running = False # 시스템 작동 을 정지 시켜주고
        if camera_task: # 카메라 테스크가 작동중이라면
            await camera_task # 완전히 끝날때 까지 대기
            #is_running 을 껐기 때문에 while문 탈출 후 cap.release()까지 시간 소요
        print('exit from camera loop')
        result = 'success' #정지 성공
        await sio.emit('running result', result) # 실행 결과 전송
        print('result emitted to server')



async def main():
    await sio.connect('http://localhost:3000?role=python')

    try:
        print('Listening events..')
        await sio.wait()
    except KeyboardInterrupt:
        print('Disconnecting..')
    finally:
        await sio.disconnect()
        print('Disconnected!')


asyncio.run(main())