require('dotenv').config();
const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const db = require('../db/db.util').getDb();

/**
 * @swagger
 * definitions:
 *   Block:
 *    properties:
 *     _id:
 *       type: object
 *       example: 639e8b766721f047ac096ffd
 *     contentType:
 *       type: string
 *       enum:
 *        - header1
 *        - header2
 *        - text
 *        - page
 *        - link
 *        - image
 *       example: text
 *     content:
 *       type: string
 *       minLength: 1
 *       maxLength: 500
 *       example: Contenido
 *     status:
 *       enum:
 *         - done
 *         - toDo
 *         - none
 *     index:
 *       type: integer
 *       min: 0
 *   Document:
 *     properties:
 *       _id:
 *         type: object
 *         example: 639e8b766721f047ac096ffd
 *       title:
 *         type: string
 *         minLength: 1
 *         maxLength: 24
 *         example: Titulo
 *       documentType:
 *         type: string
 *         enum:
 *          - TaskList
 *          - Note
 *         example: Note
 *       blocks:
 *         type: array
 *         items: 
 *           $ref: '#/definitions/Block'
 *       parent_id:
 *         type: object
 *         example: 639e8b766721f047ac096ffd
 *       createdBy:
 *         type: object
 *         example: 639e8b766721f047ac096ffd
 *       createdAt:
 *         type: string
 *         format: date-time
 *         example: 2022-12-20T12:52:27.587Z
 *       lastEditedBy:
 *         type: object
 *         example: 639e8b766721f047ac096ffd
 *       lastEditedAt:
 *         type: string
 *         format: date-time
 *         example: 2022-12-20T12:52:27.587Z
 *       owners:
 *         type: array
 *         items: 
 *           type: object
 *       status:
 *         type: string
 *         enum:
 *          - private
 *          - public
 *          - readOnly
 *          - everyOneEdits
 *         example: private
 *   Post_Document:
 *     properties:
 *       user_id:
 *         type: object
 *         example: 639e8b766721f047ac096ffd
 *       title:
 *         type: string
 *         minLength: 1
 *         maxLength: 24
 *         example: Titulo
 *       documentType:
 *         type: string
 *         enum:
 *          - TaskList
 *          - Note
 *         example: Note
 *       status:
 *         type: string
 *         enum:
 *          - private
 *          - public
 *          - readOnly
 *          - everyOneEdits
 *         example: private
 *     required:
 *       - user_id
 *       - title
 *   Edit_document:
 *     properties:
 *       title:
 *         type: string
 *         minLength: 1
 *         maxLength: 24
 *         example: Titulo
 *       documentType:
 *         type: string
 *         enum:
 *          - TaskList
 *          - Note
 *         example: Note
 *       status:
 *         enum:
 *          - private
 *          - public
 *          - readOnly
 *          - everyOneEdits
 *         example: private
 *   Post_block:
 *     properties:
 *       contentType:
 *         type: string
 *         enum:
 *          - header1
 *          - header2
 *          - text
 *          - page
 *          - link
 *          - image
 *         example: text
 *       content:
 *         type: string
 *         minLength: 1
 *         maxLength: 500
 *         example: Contenido
 *       status:
 *         enum:
 *           - done
 *           - toDo
 *           - none
 *       index:
 *         type: integer
 *         min: 0
 *     required:
 *       - contentType
 *       - content
 *       - status
 *       - index
 */


/**
 * @swagger
 * /favorites/{user_id}:
 *   get:
 *     tags:
 *     - Favorites
 *     summary: gets the documents set as favorites
 *     parameters:
 *      - in: path
 *        name: user_id
 *        required: true
 *   produces:
 *     - application/json
 *   responses:
 *     200:
 *       description: return array of favorite documents
 *       schema:
 *         $ref: '#/definitions/Document'
 *     500:
 *       description: user_id was not found
 */
router.get('/:user_id', async (req, res) => {

    try{
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

    }catch(error){
        res.status(500).json({message: 'user_id was not found'});
    }
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
 *        name: user_id
 *        required: true
 *      - in: path
 *        name: document_id
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
 *        name: user_id
 *        required: true
 *        example: 639e8c426721f047ac096ffe
 *      - in: path
 *        name: document_id
 *        required: true
 *        example: 639e8c426721f047ac096ffe
 *   produces:
 *     - application/json
 *   responses:
 *     200:
 *       description: returns a message that the document was removed
 *     500:
 *       description: user_id is invalid
 */
router.delete('/:user_id/:document_id', async (req, res) => {
    try{
        const data = await db.collection(process.env.COLLECTION_USERS)
                        .updateOne({_id: ObjectId(req.params.user_id)}, {$pull: { favorites: req.params.document_id}});
    
    if(data){
        res.status(200).json({message: 'document removed from favorites'});
    }
    }catch(error){
        res.status(500).json({message: 'user_id is invalid'});
    }
});

module.exports = router;