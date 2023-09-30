const requestToDB = require("./RequestAPI");

class Model{
    constructor(tableName, colNames, connection) {
        this.tableName = tableName;
        this.colNames = colNames;
        this.connection = connection;
    }
}
module.exports = Model;