const requestToDB = require("./RequestAPI");

class Model{
    constructor(tableName, colNames, connection) {
        this.tableName = tableName;
        this.colNames = colNames;
        this.connection = connection;
    }
    async getAll(){
        const sql = `SELECT * FROM ${this.tableName}`
        return await requestToDB(sql, this.connection);
    }
    async findOne(col){
        let sql;
        if(typeof Object.values(col)[0] === "number"){
            sql = `SELECT * FROM ${this.tableName} WHERE ${Object.keys(col)[0]} = ${Object.values(col)[0]}`
        } else{
            sql = `SELECT * FROM ${this.tableName} WHERE ${Object.keys(col)[0]} = '${Object.values(col)[0]}'`
        }
        return await requestToDB(sql,this.connection);
    }
    async addRecord(data){
        const sql = `INSERT INTO ${this.tableName} VALUES ('${Object.values(data).join("', '")}');`;
        return await requestToDB(sql,this.connection);
    }
    async deleteRecord(data){
        const sql = `DELETE FROM ${this.tableName} WHERE ${Object.keys(data)[0]}='${Object.values(data)[0]}';`;
        return await requestToDB(sql,this.connection)
    }
    async updateRecord(data, id){
        let sql = `UPDATE ${this.tableName} SET `;
        const set = [];
        for(let key of Object.keys(data)){
            set.push(`${key} = '${data[key]}'`);
        }
        sql += set.join(", ");
        sql += `WHERE ${Object.keys(id)[0]} = '${Object.values(id)[0]}';`;
        return await requestToDB(sql,this.connection)
    }
}
module.exports = Model;