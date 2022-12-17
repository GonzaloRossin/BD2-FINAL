require('dotenv').config();
const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const db = require('../db/db.util').getDb();

router.get('/:user_id', async (req, res) => {

    var favorite_array = [];
    await db.collection(process.env.COLLECTION_USERS)
    .findOne({_id: ObjectId(req.params.user_id)})
    .then((result, err) => {
        if(!err){
            result.favorites.forEach((id,i) => {
                favorite_array.push(new ObjectId(id));
            })
        }
    });   
    
    await db.collection(process.env.COLLECTION_DOCUMENTS).find({_id: {$in: favorite_array}}).toArray().then((docs,err) =>{
        if(!err){
            res.status(200).json(docs);
        }
    });
});

router.post('/:user_id/:document_id', async (req, res) => {

    const data = await db.collection(process.env.COLLECTION_USERS)
                        .updateOne({_id: ObjectId(req.params.user_id)}, {$push: { favorites: req.params.document_id}});
    
    if(data){
        res.status(200).send({message: 'document added to favorites'});
    }else{
        res.status(500).send({message: 'error while adding document to favorites'});
    }
    
});

router.delete('/:user_id/:document_id', async (req, res) => {
    
    const data = await db.collection(process.env.COLLECTION_USERS)
                        .updateOne({_id: ObjectId(req.params.user_id)}, {$pull: { favorites: req.params.document_id}});
    
    if(data){
        res.status(200).send({message: 'document removed from favorites'});
    }else{
        res.status(500).send({message: 'error while removing document from favorites'});
    }
});

module.exports = router;