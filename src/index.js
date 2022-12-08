const express = require('express');
require('dotenv').config();

const app = express();
const db = require('./db/db.util');
const userRoutes = require('./routes/users');
const documentRoutes = require('./routes/documents');
const favoritesRoutes = require('./routes/favorites');

app.use(express.json());
app.use('/users', userRoutes);
app.use('/documents',  documentRoutes);
app.use('/favorites', favoritesRoutes);

(async () => {
    await db.init();

    app.listen(process.env.PORT, () => console.log(`it's alive on http://localhost:${process.env.PORT}`));
})();
