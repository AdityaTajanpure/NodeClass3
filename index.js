const express = require('express');
const dotenv = require('dotenv');
const {
    MongoClient
} = require('mongodb');
const app = express();
const PORT = 3000;
dotenv.config();
const MONGO_URL = process.env.MONGO_URL;

let createConnections = async () => {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log('Connected to db');
    return client;
}

app.use(express.json())

let client;

app.listen(PORT, async (error) => {
    client = await createConnections();
    if (!error)
        console.log("Server is Successfully Running, and App is listening on port " + PORT)
    else
        console.log("Error occured, server can't start", error);
});


// Routes
app.get('/', (req, res) => {
    res.send({
        msg: 'Hello world!'
    });
})

app.get('/movies', async (req, res) => {
    await client.db('aditya').collection('movies').find().toArray((err, results) => {
        res.json({
            data: results
        })
    })
});

app.get('/movies/:id', async (req, res) => {
    let {
        id
    } = req.params
    let response = await client.db('aditya').collection('movies').findOne({
        id: id
    })
    response ? res.send(response) : res.status(404).send({
        'msg': 'No such movie found'
    })
})

app.post('/movies', async (req, res) => {
    let movies = (req.body);
    if (movies.length > 0) {
        movies = await client.db('aditya').collection('movies').insertMany(movies);
        res.send({
            'msg': movies
        })
    } else {
        res.send({
            'msg': 'Send data first'
        })
    }
})

app.delete('/movies/:id', async (req, res) => {
    let {
        id
    } = req.params;
    id ? res.send(await client.db('aditya').collection('movies').deleteOne({
        id: id
    })) : res.send({
        'msg': 'invalid id provided'
    }).status(404);
})