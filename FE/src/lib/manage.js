const db = require('./db');
var logError = require('./errorhandler');

module.exports = {
    login : (req, res)=>{
        var body = req.body;

        var id = body['id'];
        var pw = body['password'];

        db.query('SELECT * FROM user WHERE id = ? and password = ?',[id, pw], (error, result)=>{
            if(error){
                logError(405, 'DB 처리 중 오류 발생', 'warn', '관리자 서버')
                res.status(500).json({
                    "status_code" : 500,
                    "result" : "error occured",
                    "error" : error
                })
            }else{
                if(result.length == 0 ){
                    logError(401, '등록된 사용자 없음', 'info', '관리자 서버')
                    return res.status(500).json({
                        "status_code" : 500,
                        "result" : "No user exists"
                    })
                }else{
                    console.log(result[0]['isManager']);
                    if(result[0]['isManager'] == false || result[0]['isManager'] == null){
                        logError(403, '관리자 권한 없음', 'info', '관리자 서버')
                        res.status(500).json({
                            "status_code" : 500,
                            "result" : "Permission denied"
                        })
                    }else{
                        res.json({
                            "status_code" :200,
                            "result" : "login Successfully",
                            "isManager" : result[0]['isManager']
                        })
                    }
                }
            }
        })
    },

    find_id: (req, res)=>{
        var body = req.body;
        var name = body['name'];
        var birth = body['birth'];

        db.query('SELECT * FROM user WHERE name =? and birth = ?', [name, birth],(error, result)=>{
            if(error){
                logError(405, 'DB 처리 중 오류 발생', 'warn', '관리자 서버')
                res.status(500).json({
                    "status_code" : 500,
                    "result" : "error occured",
                    "error" : error
                })
            }else{
                var user = result[0]
                if(result.length == 0){
                    logError(401, '등록된 사용자 없음', 'info', '관리자 서버')
                    res.status(500).json({
                        "status_code" : 500,
                        "result" : "No user exists"
                    })
                }else{
                    if(user['isManager'] == null || user['isManager']==false){
                        logError(403, '관리자 권한 없음', 'info', '관리자 서버')
                        res.status(500).json({
                            "status_code" : 500,
                            "result" : "Permission denied"
                        })
                    }else{
                        res.json({
                            "status_code" :200,
                            "result" : "find id",
                            "id" : user['id']
                        })
                    }
                }
            }
        })
    },

    find_pw : (req, res)=>{
        var body = req.body;

        var id = body['id']
        var name = body['name']
        var birth = body['birth']

        db.query("SELECT * FROM user WHERE id = ?", [id], (error, result)=>{
            if(error){
                logError(405, 'DB 처리 중 오류 발생', 'warn', '관리자 서버')
                res.status(500).json({
                    "status_code" : 500,
                    "result" : "error occured",
                    "error" : error
                })
            }else{
                if(result.length == 0 ){
                    logError(401, '등록된 사용자 없음', 'info', '관리자 서버')
                    res.status(500).json({
                        "status_code" : 500,
                        "result" : "no user exists"
                    })
                }else{
                    if(result[0]['isManager'] == null || result[0]['isManager'] == false){
                        logError(403, '관리자 권한 없음', 'info', '관리자 서버')
                        res.status(500).json({
                            "status_code" : 500,
                            "result" : "Permission denied"
                        })
                    }else{
                        res.json({
                            "status_code" : 200,
                            "result" : "find pw",
                            "password" : result[0]['password']
                        })
                    }
                }
            }
        })
    },

    error_logs : (req, res)=>{
        var time = req.params.days;
        if(time == 24 || time == 48){
            db.query(`SELECT * FROM errors WHERE timestamp > CONVERT_TZ(now(), '+00:00','+09:00') - INTERVAL ${time} hour`,(error, result)=>{
                if(error){
                    res.status(500).json({
                        "status_code" : 500,
                        "result" : "error occured while logging errors",
                        "error" : error
                    })
                }else{
                    res.json(result);
                }
            })
        }else if(time == 7){
            db.query(`SELECT * FROM errors WHERE timestamp > CONVERT_TZ(now(), '+00:00','+09:00') - INTERVAL ${time} day`,(error, result)=>{
                if(error){
                    res.status(500).json({
                        "status_code" : 500,
                        "result" : "error occured while logging errors",
                        "error" : error
                    })
                }else{
                    res.json(result);
                }
            })
        }else if(time == 'all'){
            db.query(`SELECT * FROM errors`,(error, result)=>{
                if(error){
                    res.status(500).json({
                        "status_code" : 500,
                        "result" : "error occured while logging errors",
                        "error" : error
                    })
                }else{
                    res.json(result);
                }
            })
        }else{
            db.query(`SELECT * FROM errors WHERE timestamp > CONVERT_TZ(now(), '+00:00','+09:00') - INTERVAL ${time} minute`,(error, result)=>{
                if(error){
                    res.status(500).json({
                        "status_code" : 500,
                        "result" : "error occured while logging errors",
                        "error" : error
                    })
                }else{
                    res.json(result);
                }
            })
        }
    },

    delete_error_logs : (req, res)=>{
        db.query("DELETE FROM errors WHERE timestamp < CONVERT_TZ(now(), '+00:00','+09:00') - INTERVAL 14 DAY",(error, result)=>{
            if(error){
                logError(405, 'DB 처리 중 오류 발생', 'warn', '관리자 서버')
                res.status(500).json({
                    "status_code" : 500,
                    "result" : "error occured", 
                    "error" : error
                })
            }else{
                res.json({
                    "status_code" : 200,
                    "result" : "item deleted successfully"
                })
            }
        });
    }
}