var mysql = require("mysql");
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sbst'
});

connection.connect(function(err){
    if(err){
        console.log(err.message);
        return;
    }
    else{
        console.log("Successfully connected to db");
    }
});

module.exports = connection;