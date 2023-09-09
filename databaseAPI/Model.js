const requestToDB = require("./RequestAPI");

class Model{
    constructor(tableName, colNames, connection) {
        this.tableName = tableName;
        this.colNames = colNames;
        this.connection = connection;
    }
    static premake(data){
        for(let key of Object.keys(data)){
            if(typeof data[key] === "string" && data[key] !== "null"){
                data[key] = `'${data[key]}'`;
            }
        }
        return data;
    }
    async getAll(){
        const sql = `SELECT * FROM ${this.tableName}`
        return await requestToDB(sql, this.connection);
    }
    async findOne(col){
        let data = Model.premake(col);
        const sql = `SELECT * FROM ${this.tableName} WHERE ${Object.keys(data)[0]} = ${Object.values(data)[0]}`
        return await requestToDB(sql,this.connection);
    }
    async addRecord(data){
        const obj = Model.premake(data);
        const sql = `INSERT INTO ${this.tableName} (${Object.keys(obj).join(", ")}) VALUES (${Object.values(obj).join(", ")});`;
        return await requestToDB(sql,this.connection);
    }
    async deleteRecord(data){
        const obj = Model.premake(data);
        const sql = `DELETE FROM ${this.tableName} WHERE ${Object.keys(obj)[0]}=${Object.values(obj)[0]};`;
        return await requestToDB(sql,this.connection)
    }
    async updateRecord(data, id){
        const obj = Model.premake(data);
        let sql = `UPDATE ${this.tableName} SET `;
        const set = [];
        for(let key of Object.keys(obj)){
            set.push(`${key} = ${obj[key]}`);
        }
        sql += set.join(", ");
        sql += ` WHERE ${Object.keys(id)[0]} = '${Object.values(id)[0]}'`;
        console.log(sql);
        return await requestToDB(sql,this.connection);
    }
}
module.exports = Model;