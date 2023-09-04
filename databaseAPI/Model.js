const requestToDB = require("./RequestAPI");

class Model{
    constructor(tableName, colNames, connection) {
        this.tableName = tableName;
        this.colNames = colNames;
        this.connection = connection;
    }
    getAll(res){
        const sql = `SELECT * FROM ${this.tableName}`
        requestToDB(sql, this.connection, (json) => {
            res.send(json);
        });
    }
    findOne(res, col){
        let sql;
        if(typeof Object.values(col)[0] === "number"){
            sql = `SELECT * FROM ${this.tableName} WHERE ${Object.keys(col)[0]} = ${Object.values(col)[0]}`
        } else{
            sql = `SELECT * FROM ${this.tableName} WHERE ${Object.keys(col)[0]} = '${Object.values(col)[0]}'`
        }
        requestToDB(sql,this.connection, (json) => {
            res.send(json);
        })
    }
    addRecord(res, data){
        const sql = `INSERT INTO ${this.tableName} VALUES ('${Object.values(data).join("', '")}');`;
        requestToDB(sql,this.connection, (json) => {
            res.send(json);
        })
    }
    deleteRecord(res,data){
        const sql = `DELETE FROM ${this.tableName} WHERE ${Object.keys(data)[0]}='${Object.values(data)[0]}';`;
        requestToDB(sql,this.connection, (json) => {
            res.send(json);
        })
    }
    updateRecord(res, data, id){
        let sql = `UPDATE ${this.tableName} SET `;
        const set = [];
        for(let key in Object.keys(data)){
            set.push(`${key} = '${data[key]}'`);
        }
        sql += set.join(", ");
        sql += `WHERE ${Object.keys(id)[0]} = '${Object.values(id)[0]}';`;
        requestToDB(sql,this.connection, (json) => {
            res.send(json);
        })
    }
}
module.exports = Model;