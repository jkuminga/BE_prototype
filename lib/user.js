var db = require('./db');   

module.exports = {
    sign_up : (req, res)=>{
        var user = req.body;

        var imageUrl;
        if(user['imageUrl'] == '' || user['imageUrl'] == null){
            imageUrl = null;
        } else{
            imageUrl = user['imageUrl'];
        }
        var name = user['name'];
        var pw = user['pw'];
        var birth = user['birth'];
        

        db.query('INSERT INTO user (name, password, birth, preferred_mode, car, photo) VALUES (?,?,?,?,?,?)',[name, pw, birth, user['mode'], user['car'], imageUrl],
            (error, result)=>{
                if(error){
                    console.log(error)
                    res.status(500).json({
                        "result" : "error",
                        "error" : error
                    })
                }else{
                    res.json({
                        "result" : "Signed up successfully",
                    })
                }
            }
        )
    },

    login : (req, res)=>{
        var name = req.body['name'];
        var pw = req.body['pw'];
        console.log('name:', name, 'pw:',pw);

        db.query('SELECT id, name, password FROM user', (error, userData)=>{
            if(error){
                console.log(error)
            }else{
                for(var i =0 ;i <userData.length;i++){
                    if(userData[i]['name'] == name){
                        if(userData[i]['password'] == pw){
                            res.json({
                                "result": "login succeed",
                                "user_id" : userData[i]['id']
                            })
                        }else{
                            res.status(500).json({
                                "result" : "invalid password"
                            })
                        }
                    }
                }
                res.status(500).json({
                    "result" : "no user"
                })
            }
        })
    },

    get_user_data : (req, res)=>{
        var id = req.params.id;
        var name = req.params.name;
        console.log(id, name);

        db.query('SELECT * FROM user WHERE id=? and name=?',[id, name], (error, userData)=>{
            if(error){
                console.log(error)
                res.status(500).json({
                    "result" : "error occured while getting user data"
                })
            }else{
                console.log(userData);
                res.json(userData)
            }
        })
    }
}