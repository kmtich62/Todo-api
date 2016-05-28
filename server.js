/**
 * Created by kevinmitchell on 5/28/16.
 */
var express = require('express');

var app = express();
var PORT = process.env.PORT || 3000;

var todos=[{
    id: 1,
    description: 'Meet mom for lunch',
    completed: false
}, {
    id:2,
    description: 'goto market',
    completed: false
}, {
    id:3,
    description: 'this one is a dummy',
    completed: true
}]

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
    todos.forEach(function(todo){
       if(todo.id === todoid){
           foundItem = todo;
       }
    });

    if(foundItem){
        res.json(foundItem);
    } else {
        res.status(404).send();
    }
});

app.listen(PORT, function(){
    console.log('Express listening on port' + PORT + '!');
});
