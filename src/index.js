const express = require('express');
require('dotenv').config();

const app = express();
const db = require('./db/db.util');
const userRoutes = require('./routes/users');
const documentRoutes = require('./routes/documents');
const favoritesRoutes = require('./routes/favorites');
const swaggerJsDocs = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

app.use(express.json());
app.use('/users', userRoutes);
app.use('/documents',  documentRoutes);
app.use('/favorites', favoritesRoutes);

const options = {
    definition: {
        info:{
            title: 'NoteToday API',
            description: 'Note today API information',
            contact: {
                name1: 'Gonzalo Rossin, 60135',
                name2: 'Alberto Abancens, XXXXX'
            },
            servers: [{url: 'http://localhost:7070'}] 
        }
    },
    apis: ['./routes/*.js']
};

const specs = swaggerJsDocs(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {explorer: true}));

(async () => {
    
    await db.init();

    app.listen(process.env.PORT, () => {
        console.log(`it's alive on http://localhost:${process.env.PORT}/`);
        console.log(`swagger interface up in http://localhost:${process.env.PORT}/api-docs`);
    });
})();
