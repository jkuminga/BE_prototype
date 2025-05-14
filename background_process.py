###### 백그라운드 프로세스 ######
# 1. 파아썬과 서버 연결
# 2. isStart가 true가 되면 YOLO 모델을 수행 + opencv 카메라 시작
# 3. 욜로 모델의 감지를 지속적으로 하다가 경고 발생시 서버에게 주의 + 경보 emit
#  3-1. 경고 내용, 시간 등을 포함한 경고 로그를 서버에 emit
#  3-2. 오린에 연결된 모터 작동
# 4. currentMode 설정이 오면 핸들러가 변경
# 5. isStart = false 를 전송하면 욜로 및 opencv 카메라 종료

import socketio
import asyncio
import random


is_running = False
currentMode = 'mid'

sio = socketio.AsyncClient()

@sio.event()
async def connect():
    print('서버에 연결됨!', sio.sid)
    await sio.emit('connected', sio.sid)

# test listener
@sio.on('test')
async def test(data):
    print(data)
    await sio.emit('test result', 'test done!')

# 시스템 시작/ 정지 명령 리스너
@sio.on('running command')
async def running_command(command):
    global is_running
    print(command)

    if command == 'start':
        did_run_well = random.randint(0,1) # 0 : success
        if did_run_well == 0:
            print('모델 시작 성공')
            result = 'success'
        else:
            print('모델 시작 실패')
            result = 'failed'
        await sio.emit('running result', result)
        print('emitted successfully')
    else:
        print('모델 종료')
        result = 'success'
        await sio.emit('running result', result)
        print('emitted successfully')

# 시스템 모드 변경 리스너
@sio.on('change mode')
async def change_mode(mode):
    global currentMode

    print('selected Mode:', mode)
    result = random.randint(0,1) # 0이 성공
    if result == 0:
        currentMode = mode
        await sio.emit('change result', 'success')
    else:
        await sio.emit('change result', 'failed')
    
    

async def main():
    await sio.connect('http://localhost:3000?role=python', )

    try:
        print('이벤트 대기 중⏳')
        await sio.wait()  # 루프 유지
    except KeyboardInterrupt:
        print("⛔️ 인터럽트 감지, 연결 종료 중...")
    finally:
        await sio.disconnect()  # 🔥 연결 확실하게 닫기
        print("🔌 연결 종료 완료")


asyncio.run(main())