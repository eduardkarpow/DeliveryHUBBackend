const requestToDB = require("./RequestAPI");
const connection = require("./Connection");
class SQLBuilder{
    constructor(connection) {
        this.sql = "";
        this.connection = connection;
    }
    getAll(tableName){
        this.sql += `SELECT * FROM ${tableName} `;
        return this;
    }
    filter(cols, filterCols) {
        for(let col of cols){
            if(!filterCols.includes(col)){
                this.sql += ` ${col},`;
            }
        }
        this.sql = this.sql.split("").slice(0,-1).join("");
    }
    getFiltered(cols, filterCols, tableName){
        this.sql += "SELECT"
        this.filter(cols, filterCols);
         this.sql +=`FROM ${tableName} `;
        return this;
    }
    join(table1, table2, columnTable1, columnTable2){
        this.sql += `INNER JOIN ${table2} ON ${table1}.${columnTable1} = ${table2}.${columnTable2} `;
        return this;
    }
    condition(conditionNames, conditions){
        this.sql += "WHERE ";
        for(let i = 0; i < conditionNames.length; i++){
            if(i > 0){
                this.sql += ",";
            }
            if(typeof conditions[i] === "number" || typeof conditions[i] === "null"){
                this.sql += `${conditionNames[i]} = ${conditions[i]}`;
            } else{
                this.sql += `${conditionNames[i]} = '${conditions[i]}'`;
            }
        }
        return this;
    }
    delete(tableName){
        this.sql += `DELETE FROM ${tableName} `;
        return this;
    }
    insert(tableName, cols, filterCols=[]){
        this.sql += `INSERT INTO ${tableName} (`;
        this.filter(cols, filterCols);
        this.sql += ") ";
        return this;
    }
    insertValues(values){
        this.sql += "VALUES (";
        let counter = 0;
        for(let value of values){
            if(counter > 0){
                this.sql += ",";
            }
            if(typeof value === "string"){
                this.sql += ` '${value}'`;
            } else{
                this.sql += ` ${value}`;
            }
            counter++;
        }
        this.sql += ")";
        return this;
    }
    update(tableName){
        this.sql += `UPDATE ${tableName} `;
        return this;
    }
    setValues(keys, values){
        for(let i = 0; i < keys.length; i++){
            if(i > 0){ this.sql += ",";}
            if(typeof values[i] === "string"){
                this.sql += ` ${keys[i]} = '${values[i]}'`;
            } else{
                this.sql += ` ${keys[i]} = ${values[i]}`;
            }
        }
        return this;
    }
    async request(){
        this.sql += ";";
        //console.log(this.sql)
        const response = await requestToDB(this.sql, this.connection);
        this.sql = "";
        return response;
    }
}
const sqlBuilder = new SQLBuilder(connection);
module.exports = sqlBuilder;
