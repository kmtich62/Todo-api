var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/basicTodoDB.sqlite'
});

var Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len:[1,250]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

var User=sequelize.define('user', {
    email:Sequelize.STRING
});

Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync({
    //force: true
}).then(function() {
    console.log('everything is synched');

    User.findById(1).then(function(user){
       user.getTodos({where: {completed:false}}).then(function(todos){
          todos.forEach(function(todo){
               console.log(todo.toJSON());
           });
       });
    });
    // User.create({
    //     email:"kevin.mitchell@example.com"
    // }).then(function(){
    //     return Todo.create({
    //         description: 'clean yard'
    //     });
    // }).then(function(todo){
    //       User.findById(1).then(function(user){
    //           user.addTodo(todo);
    //       });
    // });

});
//     Todo.findById(1);
//     if(todo){
//         console.log(todo.toJSON());
//     } else {
//         console.log("Error: No todo found with that id");
//     }
//
//     //fetch todo item by id
//     //if found print to screen with toJSON()
//     //else print no item found
//
//     //
//     // Todo.create({
//     //     description: 'Walk the Dog',
//     //     completed: false
//     // }).then(function(todo){
//     //     return Todo.create({
//     //         description: 'cut the grass'
//     //     });
//     // }).then(function(){
//     //     // return Todo.findById(1)
//     //     return Todo.findAll({
//     //         where:{
//     //             description: {
//     //                 $like: '%grass%'
//     //             }
//     //         }
//     //     });
//     // }).then(function(todos){
//     //     if(todos){
//     //         todos.forEach(function(todo){
//     //             console.log(todo.toJSON());
//     //         });
//     //     } else {
//     //         console.log('no todo found');
//     //     }
//     // }).catch(function(e){
//     //     console.log(e);
//     // })
// });