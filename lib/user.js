var db = require('./db');   

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
                console.log(error)
                return res.status(500).json({
                    "status_code" : 500,
                    "result"   :  "error occured",
                    "error" : error
                });
            }else{
                if(user_list.length > 0){
                    return res.status(500).json({
                    "status_code" : 500,
                    "result"   :  "An account already exists",
                    })
                }else{
                    db.query('INSERT INTO user (name, id, password, birth, car) VALUES (?,?,?,?,?)', [name,id, pw, birth, car], (error2, results)=>{
                        if(error2){
                            console.log(error2)
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
                res.status(500).json({
                    "status_code" : 500,
                    "result" : "error occured",
                    "error" : err
                })
            }else{
                if(id_result.length == 0 ){
                    res.status(500).json({
                        "status_code" : 500,
                        "result" : "no user exists",
                    })
                }else{
                    db.query('SELECT * FROM user where password = ? ', [pw], (err2, result)=>{
                        if(err2){
                            res.status(500).json({
                                "status_code" : 500,
                                "result" : "error occured",
                                "error" : err2
                            })
                        }else{
                            if(result == 0){
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
                console.log(error)
                res.status(500).json({
                    "status_code" : 500,
                    "result" : "error occured while getting user data",
                    "error" : error
                })
            }else{
                if(userData.length == 0 ){
                    res.status(500).json({
                        "status_code" : 500,
                        "result" : "No user exists"
                    })
                }else{
                    console.log(userData);
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
                console.log(error)
                res.status(500).json({
                    "status_code" : 500,
                    "result" : "error occured",
                    "error" : err
                })
            }else{
                if(result_id.length == 0 ){
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

        db.query('SELECT password FROM user WHERE id =? and name = ? and birth = ?',[id, name, birth], (error, password)=>{
            if(error){
                res.status(500).json({
                    "status_code" : 500,
                    "result" : "error occured",
                    "error" : err
                })
            }else{
                if(password.length == 0){
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
    }
   
}