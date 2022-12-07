const express = require('express');
const mongoClient = require('mongodb').MongoClient;
const app = express();
let db
let connectionString = `mongodb://localhost:27017/BD2Final`
const PORT = 7070
const userRoutes = require('./routes/users');

mongoClient.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true},
    (err, client) => {
        if (err) {
            return console.log("Connection failed for some reason");
        }
        console.log("Connection established to mongo client");
        db = client.db()
        app.listen(PORT, () => console.log(`it's alive on http://localhost:${PORT}`) )
    })

//middleware para que parsee la request como json antes de la response
app.use(express.json());
app.use('/users', userRoutes);

app.post('/dummy', (req,res) => {

    db.collection('dummy').insertOne({
        username: req.body.username,
        password: req.body.password
    }, (err,info) => {res.status(200).send({message: 'post was successful'})})
})

