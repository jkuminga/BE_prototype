const express = require('express')
const router = express.Router();
const ss = require('../lib/statistics')

router.get('/logs/:id', (req, res)=>{
    ss.get_logs(req, res);
})

router.post('/log/:userId', (req, res)=>{
    ss.new_warning_log(req, res)
})


module.exports = router;