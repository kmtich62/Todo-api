/**
 * Created by kevinmitchell on 5/28/16.
 */
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
// var cryptojs = require('crypto-js');
// var jsonWebToken = require('jsonwebtoken');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);
var app = express();
var PORT = process.env.PORT || 3000;
var todos=[];
// var todoNextId = 1;

function stringToBoolean(value){
    if(typeof value === 'undefined'){
        return false;
    }
    value = value.trim().toLowerCase();

    switch(value){
        case 'true':
        case 'yes':
        case '1':
            return true;
        default: return false;
    }
}

app.use(bodyParser.json());

app.get('/', function(req, res){
    //res.send('TEsting Todo API Root');
    res.redirect('/todos');
});

//GET / todos?completed=true&q='x'
app.get('/todos', middleware.requireAuthentication,function(req, res){
    var  queryParams = req.query;
    var where = {
        userId: req.user.get('id')
    };//req.user.get('id')

    if(queryParams.hasOwnProperty('completed')) {
        where.completed = stringToBoolean(queryParams.completed);
    }

    if(queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0){
        where.description = {$like: '%' + queryParams.q.toLowerCase() + '%'};
    }

    db.todo.findAll({where: where}).then(function(todos){
        res.json(todos);
    }, function(e){
        res.status(500).send({'Sever Error': 'An error occured on the database server'})
    });
});

//GET / todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function(req, res){
    var todoid = parseInt(req.params.id, 10);

    var where = {
        userId: req.user.get('id'),
        id: todoid
    };

    db.todo.findOne({where: where}).then(function(todo) {
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).send({"error": "No item found with that id"});
        }
    }, function(e) {
        res.status(500).json(e);
    });

});

//POST /todos
app.post('/todos', middleware.requireAuthentication, function(req, res){
    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function(todo){
        //req.user is created in the middleware method so accessible to this method
        req.user.addTodo(todo).then(function(){
            return todo.reload();
        }).then(function(todo){
            res.json(todo.toJSON());
        })
    }, function(e){
       res.status(400).json(e);
    });
});

//DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res){
    var todoid = parseInt(req.params.id, 10);

    db.todo.destroy({
        where:{
            id: todoid,
            userId: req.user.get('id')// make sure userid = req.user.get('id')
        }
    }).then(function(rowDeleted){
        if(rowDeleted === 1) {
            res.status(204).send();
        } else {
            res.status(404).json({"Error": "No Item found with that id"});
        }
    }, function(e){
       res.status(500).send();
    });
});

//PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function(req, res){
    var body = _.pick(req.body, 'description', 'completed');
    var todoid = parseInt(req.params.id, 10);

    var attributes = {};
    if(body.hasOwnProperty('completed')){
        attributes.completed = body.completed;
    }
    if(body.hasOwnProperty('description')){
        attributes.description = body.description;
    }

    //where statement for the following findOne method
    var where = {
        userId: req.user.get('id'),
        id: todoid
    };

    db.todo.findOne({where: where}).then(function(foundItem){
        if(foundItem){
            foundItem.update(attributes).then(function(foundItem){
                res.json(foundItem.toJSON());
            }, function(e){
                res.status(400).json(e);
            });
        } else {
            res.status(404).send({"error": "No Item found with that id"})
        }
    }, function(){
        res.status(500).send();
    });
});

//POST /users
app.post('/users', function(req, res){
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function(user){
        res.json(user.toPublicJSON());
    }, function(e){
        res.status(400).json(e);
    });
});

//POST: /users/login
app.post('/users/login', function(req, res){
    var body = _.pick(req.body, 'email', 'password');
    var userInstance;

    db.user.authenticate(body).then(function(user) {
        var token = user.generateToken('authentication');
        userInstance = user;
        //save token to database
        return db.token.create({
            token: token
        });
    }).then(function(tokenInstance){
        res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON);
    }).catch(function(){
        res.status(401).send();
    });

});

//DELETE: /users/login
app.delete('/users/login', middleware.requireAuthentication, function(req, res){
    req.token.destroy().then(function(){
        res.status(204).send();
    }).catch(function(){
        res.status(500).send();
    });
});

//{force:true}
db.sequelize.sync(
    {force:true}
).then(function(){
    app.listen(PORT, function(){
        console.log('Express listening on port' + PORT + '!');
    });
});




