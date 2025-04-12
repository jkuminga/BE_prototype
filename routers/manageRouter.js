const express = require('express')
const router = express.Router();
const manage = require('../lib/manage');


router.post('/login', (req, res)=>{
    manage.login(req, res);
})

router.post('/find/id', (req, res)=>{
    manage.find_id(req, res);
})

router.post('/find/pw', (req, res)=>{
    manage.find_pw(req, res);
})



module.exports = router;