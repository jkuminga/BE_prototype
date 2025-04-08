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


module.exports = router;