const requestToDB = (sql, connection,) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, (err, result) => {
            if(err) throw err;
            const Res = JSON.parse(JSON.stringify(result));
            return resolve(Res);
        })
    })

}
module.exports =  requestToDB;