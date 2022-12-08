const express = require('express');
require('dotenv').config();

const app = express();
const db = require('./db/db.util');
const userRoutes = require('./routes/users');

app.use(express.json());
app.use('/users', userRoutes);

(async () => {
    await db.init();

    app.listen(process.env.PORT, () => console.log(`it's alive on http://localhost:${process.env.PORT}`));
})();
