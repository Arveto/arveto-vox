//This file contains constructors, functions, etc...

//Basically everything where we don't interact with the client, to make
//th code more readable


    //Database connection
//Allows to use promises with queries
class Database {
    constructor(mysql, config) {
        this.connection = mysql.createConnection(config);
    }
    query(sql, args) {
        return new Promise( (resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject(err);
                resolve( rows );
            });
        });
    }
    close() {
        return new Promise( (resolve, reject) => {
            this.connection.end( err => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
}


    //Categories
function Category(id, name, description){
    this.id = id;
    this.name = name;
    this.description = description;
}


module.exports = {Database, Category};
