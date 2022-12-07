const express = require('express');

const app = express();
const db = require('./db/db.util');
const PORT = 7070;
const userRoutes = require('./routes/users');

app.use(express.json());
app.use('/users', userRoutes);

(async () => {
    await db.init();

    app.listen(PORT, () => console.log(`it's alive on http://localhost:${PORT}`));
})();
