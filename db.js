/**
 * Created by kevinmitchell on 5/30/16.
 */

var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

//if is for heroku => postgres, else is for local sqlite
if(env==='production'){
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect:'postgres'
    });
} else {
    sequelize = new Sequelize(undefined, undefined, undefined, {
        'dialect': 'sqlite',
        'storage': __dirname + '/data/dev-todo-api.sqlite'
    });
}

var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js');
db.user = sequelize.import(__dirname + '/models/user.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;


module.exports = db;
