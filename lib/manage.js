const db = require('./db');

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
                            "result" : "login Successfully"
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
    }
}