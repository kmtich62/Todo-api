/**
 * Created by kevinmitchell on 5/28/16.
 */
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos=[];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res){
    res.send('Todo API Root');
});

//GET / todos
app.get('/todos', function(req, res){
    res.json(todos);
});

//GET / todos/:id
app.get('/todos/:id', function(req, res){
    var todoid = parseInt(req.params.id, 10);
    var foundItem;

    foundItem = _.findWhere(todos, {id: todoid});
    if(foundItem){
        res.json(foundItem);
    } else {
        res.status(404).send();
    }
});

//POST /todos
app.post('/todos', function(req, res){
    var body = _.pick(req.body, 'description', 'completed');

    if(!_.isString(body.description) || !_.isBoolean(body.completed) || body.description.trim().length === 0){
        res.status(400).send();
    }

    body.id = todoNextId;
    body.description = body.description.trim();
    todoNextId++;
    todos.push(body);

    res.json(body);

});

app.listen(PORT, function(){
    console.log('Express listening on port' + PORT + '!');
});
