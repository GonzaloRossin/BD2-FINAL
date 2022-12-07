const express = require('express');
//const mongodb = require('mongodb');
const app = express();
const PORT = 7070
const userRoutes = require('./routes/users');

app.listen(PORT,
    () => console.log(`it's alive on http://localhost:${PORT}`)
)

//middleware para que parsee la request como json antes de la response
app.use(express.json());
app.use('/users', userRoutes);

