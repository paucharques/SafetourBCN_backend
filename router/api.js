const express = require('express');
const router = express.Router();

app.get('/api', (req, res) => res.send('Its working!'));

router.get('/usuarios',function(req,res){
    res.send({type: 'GET'});
});

router.post('/usuarios', function(req, res){
    res.send({
        type: 'POST',
        name: req.body.name,
        roll: req.body.roll
    });
});

router.put('/usuarios/:id', function(req, res){
    res.send({type: 'PUT'});
});

router.delete('/usuarios/:id', function(req, res){
    res.send({type: 'DELETE'});
});