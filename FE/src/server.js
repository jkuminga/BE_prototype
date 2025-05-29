const express = require('express')
require('dotenv').config();
const app = express();
const {Server} = require('socket.io')
const http = require('http');
const axios = require('axios'); 
const bodyParser = require('body-parser')
const cors = require('cors');
const db = require('./lib/db');

//cors세팅
app.use(cors());

app.use(bodyParser.json());

app.set('views', __dirname + '/views')
app.set('view engine', 'pug');

app.use("/public", express.static(__dirname + "/public"));

// 라우터 세팅
const statisticsRouter = require('./routers/statisticsRouter');
const userRouter = require('./routers/userRouter');
const manageRouter = require('./routers/manageRouter');


app.use('/statistics', statisticsRouter);
app.use('/user', userRouter);
app.use('/manage', manageRouter);

app.get('/',(req, res)=>{
    res.render('home');
})  

app.post('/log', async (req, res)=>{
    var log = req.body

    console.log(log)
    // logs = {
    //     'warning occured' : True,
    //     'date': datetime.now().strftime('%Y.%m.%d - %H:%M:%S'),
    //     'type' : warning_type[random.randint(0,1)],
    //     'reason' : '눈 감음',
    //     'system_time' : system_time
    // }

    var isOccured = log['warning occured'];
    var type = log['type'];
    var reason = log['reason'];
    var date = log['date'];
    var systemTime = log['system_time'];



    if(log) {
        res.status(200).send('done!')
    }else{
        res.status(500).send('error occured')
    }
})

const httpServer = http.createServer(app);
const io = new Server(httpServer);

// 1. FE에서 명령 후 서버로 Emit: running command with command
// 2. 서버에서 python으로 emit : running command with command
// 3. 파이썬에서 받고 동작 진행 후 서버로 결과 emit : running result with result
// 4. 서버에서 결과 대로 클라이언트 콜백 실행

var sockets = new Map();

io.on('connection',(socket)=>{
    const role = socket.handshake.query.role;
    console.log(`연결 확인 : { 소켓아이디 : ${socket.id} | 소켓 role : ${role}}`)
    if(!sockets.has(role)){
        sockets.set(role, socket) // 위치 이름 : 소켓으로 map 에 등록
    }else{ // 기존에 등록된 role값의 value를 바꿔줘야 함
        sockets.set(role, socket);
        console.log('소켓 변경됨:', socket.id)
    }

    // 연결 테스트 용 리스너
    socket.on('test', (msg, done)=>{
        console.log('test connected')
        const pythonSocket = sockets.get('python')

        pythonSocket.emit('test', msg)
        pythonSocket.once('test result', (result)=>{
            console.log(result)
            done()
        })
    })

    // 모터 테스트 용 리스너
    socket.on('motor test', (cmd)=>{
        console.log('모터 테스트..')
        const pythonSocket = sockets.get('python')

        pythonSocket.emit('motor test', cmd);
    })

    // 경고 전송 테스트용 리스너 : feP to FE 
    socket.on('warning test', (test)=>{
        console.log('경고 전송 테스트...');
        const fesocket = sockets.get('fe');
        const warning = {
            date : Date.now(),
            type : '경고',
            reason : '눈 감음'
        }
        const cautions = {
            date : Date.now(),
            type : '주의',
            reason : '5분간 5회 하품 발생'
        }
        if(test === "warning"){
            fesocket.emit('warning test', warning);
        }else{
            fesocket.emit('warning test', cautions);
        }
        
    })

    // 시작 / 정지 명령용 리스너
    socket.on('running command', (command, done)=>{
        const pythonSocket = sockets.get('python')

        console.log('command requested from FE')
        pythonSocket.emit('running command', command)

        pythonSocket.on('running result', (result)=>{
            done(result)
        })
    })

    // 모드 변경 리스너
    socket.on('change mode', (mode, done)=>{
        console.log('selected Mode:', mode)
        
        const pythonSocket = sockets.get('python') 
        pythonSocket.emit('change mode', mode)

        pythonSocket.once('change result',(result)=>{
            console.log('result:', result)
            done(result)
        })
    })

    // 경고 발생 시 리스너
    socket.on('warning occured', async (warningLog)=>{
        const fesocket = sockets.get('fe')
        console.log('오류 발생!')
        fesocket.emit('warning occured', warningLog);

        try{ 
            let response = await axios.post('http://localhost:3000/log', warningLog)
            console.log('로그 전송 완료')  
            console.log(response);
        }
        catch(e){
            console.log(e)
        }
        
    })
})

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT,()=>{
    console.log(`connected to port ${PORT}`)
})


