require('dotenv').config();
const express = require('express');
const joi = require('joi');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');
const { constants } = require('buffer');
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
    //no deberia modificar los bloques
    const documentSchema = joi.object().keys({
        user_id: joi.string().alphanum().length(24).required(),
        title: joi.string().min(5).max(29),
        documentType: joi.string().valid('TaskList', 'Note').default('Note'),
        status: joi.string().valid('private', 'public', 'readOnly', 'everyOneEdits').default('private')
    });
    const {error} = documentSchema.validate(req.body);
    const valid = error == null;

    if (!valid) {
        res.status(422).json({error: error.message});    
    } else {
        const updateQuery = {$set: req.body};
        try {
            db.collection(process.env.COLLECTION_DOCUMENTS)
                .updateOne({_id: ObjectId(req.params.document_id)}, updateQuery)
                .then(() => {
                    res.status(200).send({message: 'document updated succesfully'});
                });
        } catch (error) {
            res.status(500).json({message: 'Error updating document', error}); 
        }
    }
});

router.delete('/:document_id', (req, res) => {

    try {
        db.collection(process.env.COLLECTION_DOCUMENTS).deleteOne({_id: ObjectId(req.params.document_id)});
        db.collection(process.env.COLLECTION_USERS).updateMany({$or: [{favorites: req.params.document_id}, {documents: ObjectId(req.params.document_id)}]},{
            $pull: {
                favorites: req.params.document_id,
                documents: ObjectId(req.params.document_id)
            }
        }
        );
        res.status(200).send();
    }catch(error){
        res.status(500).json({message: 'Error deleting user', error}); 
    }
});

router.post('/', async (req, res) => {
    const documentSchema = joi.object().keys({
        user_id: joi.string().alphanum().length(24).required(),
        title: joi.string().min(5).max(29).required(),
        documentType: joi.string().valid('TaskList', 'Note').default('Note'),
        status: joi.string().valid('private', 'public', 'readOnly', 'everyOneEdits').default('private')
    });

    const {error} = documentSchema.validate(req.body);
    const valid = error == null;

    if(!valid){
        res.status(422).json({error: error.message});
    }else{

        try{
            const documentData = await db.collection(process.env.COLLECTION_DOCUMENTS).insertOne({
                title: req.body.title,
                documentType: req.body.documentType,
                blocks: [],
                parent_id: null,
                createdBy: req.body.user_id,
                createdAt: new Date(),
                lastEditedBy: req.body.user_id,
                lastEditedAt: new Date(),
                owners: [req.body.user_id],
                status: req.body.status
            });

            await db.collection(process.env.COLLECTION_USERS)
            .updateOne({_id: ObjectId(req.body.user_id)}, {$push: { documents: documentData.insertedId}});
    
            if(documentData){
                res.status(200).send({message: 'document was created'});
            }
    
        }catch(error){
            res.status(500).json({message: 'Error creating document', error});
        }
    }

    
});

router.post('/:document_id/blocks', async (req, res) => {
    const blockSchema = joi.object().keys({
        contentType: joi.string().valid('header1', 'header2', 'text', 'page', 'link', 'image').required(),
        content: joi.string().min(1).max(500).required(),
        status: joi.string().valid('done', 'toDo', 'none').required(),
        index: joi.number().integer().min(0).strict().required()
    });

    const {error} = blockSchema.validate(req.body);
    const valid = error == null;

    if(!valid){
        res.status(422).json({error: error.message});
    }else{
        try{
            const documentData = await db.collection(process.env.COLLECTION_DOCUMENTS)
                .updateOne({_id: ObjectId(req.params.document_id)}, 
                {
                    $push:{blocks:
                        {
                            $each: [{
                                _id : crypto.randomBytes(20).toString('hex'),
                                contentType: req.body.contentType,
                                content: req.body.content,
                                status: req.body.status,
                                index: req.body.index
                            }],
                            $sort: {index: 1}
                        }
                        
                    },
                    $set: {lastEditedAt: new Date()}
                }
            );

    
            if(documentData){
                res.status(200).send({message: 'block was added to document'});
            }
    
        }catch(error){
            res.status(500).json({message: 'Error creating block', error});
        }
    }
    
});

router.put('/:document_id/blocks/:block_id', (req, res) => {
    // ver como hacer para agregar un indice(posiciones)
    
});

router.delete('/:document_id/blocks/:block_id', async (req, res) => {
    const data = await db.collection(process.env.COLLECTION_DOCUMENTS)
                        .updateOne({_id: ObjectId(req.params.document_id)}, {$pull: { blocks: req.params.block_id}});
    
    if(data){
        res.status(200).send({message: 'block removed from document'});
    }else{
        res.status(500).send({message: 'error while removing block from document'});
    }
});

module.exports = router;