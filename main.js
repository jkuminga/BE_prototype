const express = require('express');
require('dotenv').config();
const app = express();
const bodyParser = require('body-parser')
const cors = require('cors');

//cors세팅
app.use(cors());

// bodyParser 세팅
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// 라우터 세팅
const statisticsRouter = require('./routers/statisticsRouter');
const userRouter = require('./routers/userRouter');
app.use('/statistics', statisticsRouter);
app.use('/user', userRouter);

var port = process.env.PORT
app.listen(port, ()=>{
    console.log(`connected to port:${port} at ${Date.now()}`)
})