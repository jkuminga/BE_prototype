const db = require('./db');

function logErrorToServer(code, error, level, component) {
    const now = new Date();
    const timestamp = now.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).replace('T', ' '); //KST
    // const now2 = new Date(); 
    // const timestamp2 = now.toISOString().slice(0, 19).replace('T', ' '); // UTC
    
    db.query('INSERT INTO errors (timestamp, component, status_code, level, description) VALUES (?,?,?,?,?)',[timestamp, component, code, level, error],(error, result)=>{
        if(error){
            console.log(error)
            return error;
        }else{
            console.log(`logged Error : ${timestamp}`);
            
        }
    })   
}

module.exports = logErrorToServer;