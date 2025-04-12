var db = require('./db');
var logError = require('./errorhandler');

module.exports = {
    get_logs : (req, res)=>{
        var id = req.params.id;

        db.query('SELECT user_id from user WHERE id = ?', [id], (error, user_id)=>{
            if(error){
                logError(405, 'DB 처리 중 오류 발생', 'warn', '사용자 서버')
                res.status(500).json({
                    "status_code" : 500,
                    "result" : "error occured",
                    "error" : error
                })
            }else{
                if(user_id.length == 0 ){
                    logError(404, '등록된 사용자 없음', 'info', '사용자 서버')
                    res.status(500).json({
                        "status_code" : 500,
                        "result" : "No user exists",
                    })
                }else{
                    db.query('SELECT * FROM logs WHERE user_id = ?' ,[user_id[0]['user_id']], (error2, logs)=>{
                        if(error2){
                            logError(405, 'DB 처리 중 오류 발생', 'warn', '사용자 서버')
                            res.status(500).json({
                                "status_code" : 500,
                                "result" : "error occured",
                                "error" : error2
                            })
                        }else{
                            res.json(logs);
                        }
                    })
                }
            }
        })
    }
}