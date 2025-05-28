const express = require('express')
const router = express.Router();
const user = require('../lib/user');
const db = require('../lib/db');

router.post('/signup',(req, res)=>{
    user.sign_up(req, res);
})

router.post('/login', (req, res)=>{
    user.login(req, res);
})

router.post('/find/id', (req, res)=>{
    user.find_id(req, res);
})

router.post('/find/pw', (req, res)=>{
    user.find_pw(req, res);
})

router.get('/data/:id', (req, res)=>{
    user.get_user_data(req, res);
})

router.put('/data', (req, res)=>{
    user.edit_user_data(req, res);
})



module.exports = router;