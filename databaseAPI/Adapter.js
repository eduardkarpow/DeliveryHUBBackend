class Adapter{
    static stackRecords(records, stackId, stackEl, filterCols=[]){
        const newRecords = {};
        for(let el of records){
            if(el[stackId] in newRecords){
                newRecords[el[stackId]][stackEl].push(el[stackEl]);
            } else{
                newRecords[el[stackId]] = {...el};
                for(let col of filterCols){
                    delete newRecords[el[stackId]][col];
                }
                newRecords[el[stackId]][stackEl] = [];
            }
        }
        return Object.values(newRecords);
    }
    static renameCols(records, renameObject){
        for(let record of records){
            for(let col of Object.keys(renameObject)){
                record[col] = record[renameObject[col]];
                delete record[renameObject[col]];
            }
        }
        return records;
    }
}
module.exports = Adapter;