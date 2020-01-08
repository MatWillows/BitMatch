'use strict';

const mq = require('./MatchQueue.js');

const matchManager = mq.createManager(); // TODO: set up config for manager

const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Working');
});


app.put('/api/requestMatch/', (req, res) => {
    //check 
    let playerID = req.body.playerID;
    let ppl = req.body.ppl;
    let data = req.body.data;

    res.send(matchManager.getMatch(playerID, ppl, data));

});

app.get('/api/status', (req, res) => {
    res.send(matchManager.ToString());
});

app.listen(3000, () => console.log('Listening on port 3000'));

