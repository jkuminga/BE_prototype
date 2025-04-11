var db = require('./db');

module.exports = {
    get_logs : (req, res)=>{
        var id = req.params.id;

        db.query('SELECT user_id from user WHERE id = ?', [id], (error, user_id)=>{
            if(error){
                res.status(500).json({
                    "status_code" : 500,
                    "result" : "error occured",
                    "error" : error
                })
            }else{
                if(user_id.length == 0 ){
                    res.status(500).json({
                        "status_code" : 500,
                        "result" : "No user exists",
                    })
                }else{
                    db.query('SELECT * FROM logs WHERE user_id = ?' ,[user_id[0]['user_id']], (error2, logs)=>{
                        if(error2){
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