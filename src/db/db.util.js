const {MongoClient} = require('mongodb');
require('dotenv').config();

const url = `mongodb://localhost:27017/BD2Final`;

const client = new MongoClient(process.env.DB_URL);

const init = async () => {
    try{
        await client.connect();
        console.log("Connected");
    }catch (error) {
        console.log('error');
    }
};

const getDb = () => {
    return client.db(process.env.DB_NAME);
};

module.exports.init = init;
module.exports.getDb = getDb;