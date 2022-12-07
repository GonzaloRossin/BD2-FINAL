const {MongoClient} = require('mongodb');

const url = `mongodb://localhost:27017/BD2Final`;

const client = new MongoClient(url);

const init = async () => {
    try{
        await client.connect();
        console.log("Connected");
    }catch (error) {
        console.log('error');
    }
};

const getDb = () => {
    return client.db('BD2Final');
};

module.exports.init = init;
module.exports.getDb = getDb;