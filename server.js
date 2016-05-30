/**
 * Created by kevinmitchell on 5/28/16.
 */
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos=[];
var todoNextId = 1;

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
    res.send('Todo API Root');
});

//GET / todos?completed=true
app.get('/todos', function(req, res){
    var  queryParams = req.query;
    var filteredTodos = todos;
    var isCompleted;

    if(!_.isUndefined(queryParams)){
        if(queryParams.hasOwnProperty('completed')){
            isCompleted = stringToBoolean(queryParams.completed);
            filteredTodos = _.where(filteredTodos, {completed: isCompleted});
        }
    }

    if(queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0){
        var filter = queryParams.q.toLowerCase();
        filteredTodos = _.filter(filteredTodos, function(todo){
            return todo.description.toLowerCase().indexOf(filter) >=0;
        })
    }

    res.json(filteredTodos);
});

//GET / todos/:id
app.get('/todos/:id', function(req, res){
    var todoid = parseInt(req.params.id, 10);

    db.todo.findById(todoid).then(function(todo){
        if(!!todo){
            res.json(todo.toJSON());
        } else {
            res.status(404).send({"error": "No Item found with that id"});
        }
    }, function(e){
        res.status(500).json(e);
    });


    // var foundItem;
    //
    // foundItem = _.findWhere(todos, {id: todoid});
    // if(foundItem){
    //     res.json(foundItem);
    // } else {
    //     res.status(404).send();
    // }
});

//POST /todos
app.post('/todos', function(req, res){
    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function(todo){
        res.json(todo.toJSON());
    }, function(e){
       res.status(400).json(e);
    });
});

//DELETE /todos/:id
app.delete('/todos/:id', function(req, res){
    var todoid = parseInt(req.params.id, 10);
    var foundItem = _.findWhere(todos, {id: todoid});

    if(!foundItem){
        res.status(404).json({"error": "No Item found with that id"});
    } else {
        var newTodo = _.without(todos, foundItem);
        todos = newTodo;

        res.json(foundItem);
    }
});

//PUT /todos/:id
app.put('/todos/:id', function(req, res){
    var body = _.pick(req.body, 'description', 'completed');
    var todoid = parseInt(req.params.id, 10);
    var foundItem = _.findWhere(todos, {id: todoid});

    var validAttributes = {};

    if(!foundItem){
        return res.status(404).send();
    }

    if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')){
        //completed is not boolean
        return res.status(400).send();
    }

    if(body.hasOwnProperty('description') && _.isString(body.completed) && body.completed.trim().length > 0){
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')){
        return res.status(400).json({'error': 'description not formatted correctly'});
    }

    _.extend(foundItem, validAttributes);
    res.json(foundItem);



});

db.sequelize.sync().then(function(){
    app.listen(PORT, function(){
        console.log('Express listening on port' + PORT + '!');
    });
});




