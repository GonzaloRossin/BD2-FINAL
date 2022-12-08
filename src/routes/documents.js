require('dotenv').config();
const express = require('express');
const joi = require('joi');
const { ObjectId } = require('mongodb');
const router = express.Router();
const db = require('../db/db.util').getDb();


router.get('/:document_id', (req, res) => {
    
    try {
        db.collection(process.env.COLLECTION_DOCUMENTS)
        .findOne({_id: ObjectId(req.params.document_id)})
        .then((doc) => {
            res.status(200).json(doc);
        });


    }catch(error){
        res.status(500).json({message: 'Error getting document', error}); 
    }
});

router.put('/:document_id', (req, res) => {
    
    
});

router.delete('/:document_id', (req, res) => {

    
});

router.post('/', (req, res) => {
    
    
});

router.post('/:document_id/blocks', (req, res) => {
    
    
});

router.put('/:document_id/blocks/:block_id', (req, res) => {
    
    
});

router.delete('/:document_id/blocks/:block_id', (req, res) => {
    
    
});

module.exports = router;