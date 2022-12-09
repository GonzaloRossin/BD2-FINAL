require('dotenv').config();
const express = require('express');
const joi = require('joi');
const { ObjectId } = require('mongodb');
const router = express.Router();
const db = require('../db/db.util').getDb();

router.get('/:user_id', (req, res) => {
    
    
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
        res.status(500).send({message: 'error while removing document to favorites'});
    }
});

module.exports = router;