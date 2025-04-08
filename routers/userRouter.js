const express = require('express')
const router = express.Router();
const user = require('../lib/user');

router.post('/signup',(req, res)=>{
    user.sign_up(req, res);
})


module.exports = router;