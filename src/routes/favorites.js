require('dotenv').config();
const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const db = require('../db/db.util').getDb();

/**
 * @swagger
 * /favorites/{user_id}:
 *   get:
 *     tags:
 *     - Favorites
 *     summary: gets the documents set as favorites
 *     parameters:
 *      - in: path
 *        name: userId
 *        required: true
 *   produces:
 *     - application/json
 *   responses:
 *     200:
 *       description: return array of favorite documents
 *       schema:
 *         $ref: '#/definitions/Document'
 *     400:
 *       description: user_id was not found
 */
router.get('/:user_id', async (req, res) => {

    var favorite_array;
    await db.collection(process.env.COLLECTION_USERS)
    .findOne({_id: ObjectId(req.params.user_id)})
    .then((result, err) => {
        if(!err){
            favorite_array = result.favorites;
        }
        else{
            res.status(400).json({message: 'user_id was not found'});
        }
    });   
    
    await db.collection(process.env.COLLECTION_DOCUMENTS).find({_id: {$in: favorite_array}}).toArray().then((docs,err) =>{
        if(!err){
            res.status(200).json(docs);
        }
    });
});

/**
 * @swagger
 * /favorites/{user_id}/{document_id}:
 *   post:
 *     tags:
 *     - Favorites
 *     summary: Add a document to favorites
 *     parameters:
 *      - in: path
 *        name: userId
 *        required: true
 *      - in: path
 *        name: documentId
 *        required: true
 *   produces:
 *    - application/json
 *   responses:
 *     200:
 *       description: id of document added to favorites
 *       schema:
 *         $ref: '#/definitions/Document'
 *     400:
 *       description: 1 or more of the ids are invalid
 */
router.post('/:user_id/:document_id', async (req, res) => {

    const data = await db.collection(process.env.COLLECTION_USERS)
                        .updateOne({_id: ObjectId(req.params.user_id)}, {$push: { favorites: new ObjectId(req.params.document_id)}});
    
    if(data){
        res.status(200).send({message: 'document added to favorites'});
    }else{
        res.status(400).send({message: '1 or more ids are invalid'});
    }
    
});


/**
 * @swagger
 * /favorites/{user_id}/{document_id}:
 *   delete:
 *     tags:
 *     - Favorites
 *     summary: Deletes a document from favorites
 *     parameters:
 *      - in: path
 *        name: userId
 *        required: true
 *        example: 639e8c426721f047ac096ffe
 *      - in: path
 *        name: documentId
 *        required: true
 *        example: 639e8c426721f047ac096ffe
 *   produces:
 *     - application/json
 *   responses:
 *     200:
 *       description: returns the document that was removed
 *       schema:
 *         $ref: '#/definitions/Document'
 *     400:
 *       description: 1 or more of the ids are invalid
 */
router.delete('/:user_id/:document_id', async (req, res) => {
    
    const data = await db.collection(process.env.COLLECTION_USERS)
                        .updateOne({_id: ObjectId(req.params.user_id)}, {$pull: { favorites: req.params.document_id}});
    
    if(data){
        res.status(200).send({message: 'document removed from favorites'});
    }else{
        res.status(400).send({message: '1 or more ids are invalid'});
    }
});

module.exports = router;