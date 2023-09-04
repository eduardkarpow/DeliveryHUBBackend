const requestToDB = (sql, connection, callback) => {
    connection.query(sql, (err, result) => {
        if(err) throw err;
        const Res = JSON.parse(JSON.stringify(result));
        return callback(Res);
    })
}
module.exports =  requestToDB;