var db = require('./db');   
var logError = require('./errorhandler');

module.exports = {
    sign_up : (req, res)=>{
        var user = req.body;
        
        var name = user['name'];
        var id = user['id'];
        var pw = user['password'];
        var birth = user['birth'];
        var car = user['car'];

        db.query('SELECT * FROM user WHERE id = ?',[id], (error, user_list)=>{
            if(error){
                // function logErrorToServer(code, error, level, component)
                logError(405, 'DB 처리 중 오류 발생', 'warn', '사용자 서버')
                return res.status(500).json({
                    "status_code" : 500,
                    "result"   :  "error occured",
                    "error" : error
                });
            }else{
                if(user_list.length > 0){
                    logError(409, '이미 등록된 회원정보로 로그인 시도', 'info', '사용자 서버');
                    return res.status(500).json({
                    "status_code" : 500,
                    "result"   :  "An account already exists",
                    })
                }else{
                    db.query('INSERT INTO user (name, id, password, birth, car) VALUES (?,?,?,?,?)', [name,id, pw, birth, car], (error2, results)=>{
                        if(error2){
                            logError(405, 'DB 처리 중 오류 발생', 'warn', '사용자 서버')
                            return res.status.json({
                                "status_code" : 500,
                                "result" : "error occured",
                                "error" : error2
                            })
                        }else{
                            return res.json({
                                "status_code" : 200,
                                "result" : "signed-up Successfully",
                                "user_id" : results.insertId
                            })
                        }
                    })
                }
            }
        });
    },

    login : (req, res)=>{
        var login = req.body;
        
        var id = login['id'];
        var pw = login['password'];

        db.query('SELECT id from user where id = ?', [id], (err, id_result)=>{
            if(err){
                logError(405, 'DB 처리 중 오류 발생', 'warn', '사용자 서버')
                res.status(500).json({
                    "status_code" : 500,
                    "result" : "error occured",
                    "error" : err
                })
            }else{
                if(id_result.length == 0 ){
                    logError(401, '로그인 실패-사용자 없음', 'info', '사용자 서버')
                    res.status(500).json({
                        "status_code" : 500,
                        "result" : "no user exists",
                    })
                }else{
                    db.query('SELECT * FROM user where password = ? ', [pw], (err2, result)=>{
                        if(err2){
                            logError(405, 'DB 처리 중 오류 발생', 'warn', '사용자 서버')
                            res.status(500).json({
                                "status_code" : 500,
                                "result" : "error occured",
                                "error" : err2
                            })
                        }else{
                            if(result == 0){
                                logError(401, '로그인 실패-비밀번호 오류', 'info', '사용자 서버')
                                res.status(500).json({
                                    "status_code" : 500,
                                    "result" : "Invalid password"
                                })
                            }else{res.json({
                                "status_code" : 200,
                                "result" : "login successfully"
                            })
                        }    
                        }
                    })
                }
            }
        })
    },

    get_user_data : (req, res)=>{
        var id = req.params.id;

        db.query('SELECT * FROM user WHERE id=?',[id], (error, userData)=>{
            if(error){
                logError(405, 'DB 처리 중 오류 발생', 'warn', '사용자 서버')
                res.status(500).json({                    
                    "status_code" : 500,
                    "result" : "error occured while getting user data",
                    "error" : error
                })
            }else{
                if(userData.length == 0 ){
                    logError(401, '등록된 사용자 없음', 'info', '사용자 서버')
                    res.status(500).json({
                        "status_code" : 500,
                        "result" : "No user exists"
                    })
                }else{
                    res.json(userData)
                }
                
            }
        })
    },

    find_id : (req, res)=>{
        var user = req.body;

        var name = user['name'];
        var birth = user['birth'];

        db.query('SELECT id FROM user WHERE name = ? and birth = ?', [name, birth], (error, result_id)=>{
            if(error) {
                logError(405, 'DB 처리 중 오류 발생', 'warn', '사용자 서버')
                res.status(500).json({
                    "status_code" : 500,
                    "result" : "error occured",
                    "error" : error
                })
            }else{
                if(result_id.length == 0 ){
                    logError(401, '등록된 사용자 없음', 'info', '사용자 서버')
                    res.status(500).json({
                        "status_code" : 500,
                        "result" : "no user exists"
                    })
                }else{
                    console.log(result_id)
                    res.json({
                        "status_code" : 200,
                        "result" : "find user id",
                        "id" : result_id[0]['id']
                    })
                }
            }
        })
    },

    find_pw : (req, res)=>{
        var data = req.body
        var id = data['id']
        var name = data['name']
        var birth = data['birth']

        db.query('SELECT password FROM user WHERE ide =? and name = ? and birth = ?',[id, name, birth], (error, password)=>{
            if(error){
                logError(405, 'DB 처리 중 오류 발생', 'warn', '사용자 서버')
                res.status(500).json({
                    "status_code" : 500,
                    "result" : "error occured",
                    "error" : error
                })
            }else{
                if(password.length == 0){
                    logError(401, '등록된 사용자 없음', 'info', '사용자 서버')
                    res.status(500).json({
                        "status_code" : 500,
                        "result" : "No user exists",
                    })
                }else{
                    res.json({
                        "status_code" : 200,
                        "result" : "find user pw",
                        "password" : password[0].password
                    })
                }
            }
        })
    },

    edit_user_data : (req, res)=>{
        var user = req.body;
        
        var id = user['id'];
        var name = user['name'];
        var password = user['password'];
        var birth = user['birth'];
        var car = user['car'];

        if(name == null || name ==""){
            logError(400, '전송 파라미터 누락 - 사용자 이름', 'info', '사용자 서버')
            return res.status.json({
                "status_code" : 500,
                "result" : "empty value : name",
            })
        }
        if(password == null || password ==""){
            logError(400, '전송 파라미터 누락 - 사용자 이름', 'info', '사용자 서버')
            return res.status.json({
                "status_code" : 500,
                "result" : "empty value : password",
            })
        }
        db.query('UPDATE user SET name = ?, password = ?, birth = ? , car = ?  WHERE id = ?',[name, password, birth,car,id],(error, result)=>{
            if(error){
                logError(405, 'DB 처리 중 오류 발생', 'warn', '사용자 서버')
                res.status.json({
                    "status_code" : 500,
                    "result" : "error occured",
                    "error" : error
                })
            }else{
                res.json({
                    "status_code" : 200,
                    "result" : "User data uploaded successfully"
                })
            }
        })
        

    }
   
}