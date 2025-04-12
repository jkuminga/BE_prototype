const db = require('./db');

function logErrorToServer(code, error, level, component) {
    // const timestamp = new Date().toISOString();
    const timestamp = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    
    db.query('INSERT INTO errors (timestamp, component, status_code, level, description) VALUES (?,?,?,?,?)',[timestamp, component, code, level, error],(error, result)=>{
        if(error){
            console.log(error)
            return 1;
        }else{
            console.log('logged Error');
        }
    })   
}

module.exports = logErrorToServer;