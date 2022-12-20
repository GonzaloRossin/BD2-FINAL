require('dotenv').config();
const express = require('express');
const joi = require('joi');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');
const { constants } = require('buffer');
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
 * /documents/{document_id}:
 *   get:
 *     summary: Get a document by ID
 *     parameters:
 *       - in: path
 *         name: document_id
 *         required: true
 *     tags:
 *       - Documents
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: document of specified id
 *         schema:
 *           $ref: '#/definitions/Document'
 */
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


/**
 * @swagger
 * /documents/{document_id}:
 *   put:
 *     summary: Edit a document by ID
 *     parameters:
 *       - in: path
 *         name: document_id
 *         required: true
 *       - in: body
 *         name: document
 *         schema:
 *          $ref: '#/definitions/Edit_document'
 *     tags:
 *       - Documents
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: document of specified id with edited fields
 *         schema:
 *           $ref: '#/definitions/Document'
 */
router.put('/:document_id', async (req, res) => {
    //no deberia modificar los bloques
    const documentSchema = joi.object().keys({
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
            await db.collection(process.env.COLLECTION_DOCUMENTS)
                .updateOne({_id: ObjectId(req.params.document_id)}, updateQuery)
            
            db.collection(process.env.COLLECTION_DOCUMENTS)
                .findOne({_id: ObjectId(req.params.document_id)})
                .then((doc) => {
                    res.status(200).json(doc);
                });
        } catch (error) {
            res.status(500).json({message: 'Error updating document', error}); 
        }
    }
});

/**
 * @swagger
 * /documents/{document_id}:
 *   delete:
 *     summary: Delete a document by ID
 *     parameters:
 *       - in: path
 *         name: document_id
 *         required: true
 *     tags:
 *       - Documents
 *     description: Deletes document of specified id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: message of successful deletion 
 *         schema:
 *           $ref: '#/definitions/Document'
 */
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

/**
 * @swagger
 * /documents:
 *   post:
 *     summary: Creates a new document
 *     consumes:
 *      - application/json
 *     parameters:
 *      - in: body
 *        name: document
 *        schema:
 *         $ref: '#/definitions/Post_Document' 
 *     tags:
 *       - Documents
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: document of specified id
 *         schema:
 *           $ref: '#/definitions/Document'
 */
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
                db.collection(process.env.COLLECTION_DOCUMENTS)
                    .findOne({_id: ObjectId(documentData.insertedId)})
                    .then((doc) => {
                        res.status(200).json(doc);
                    });
            }

        }catch(error){
            res.status(500).json({message: 'Error creating document', error});
        }
    }

    
});

/**
 * @swagger
 * /documents/{document_id}/blocks:
 *   post:
 *     summary: Creates a new block to a document by ID
 *     consumes:
 *      - application/json
 *     parameters:
 *      - in: path
 *        name: document_id
 *        required: true
 * 
 *      - in: body
 *        name: PostBlock
 *        schema:
 *         $ref: '#/definitions/Post_block' 
 *     tags:
 *       - Documents
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: document of specified id
 *         schema:
 *           $ref: '#/definitions/Document'
 */
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
                db.collection(process.env.COLLECTION_DOCUMENTS)
                    .findOne({_id: ObjectId(req.params.document_id)})
                    .then((doc) => {
                        res.status(200).json(doc);
                    });
            }
    
        }catch(error){
            res.status(500).json({message: 'Error creating block', error});
        }
    }
    
});

/**
 * @swagger
 * /documents/{document_id}/blocks/{block_id}:
 *   put:
 *     summary: Edit a block by document ID and block ID
 *     parameters:
 *       - in: path
 *         name: document_id
 *         required: true
 *       - in: path
 *         name: block_id
 *         required: true
 *       - in: body
 *         name: document
 *         schema:
 *          $ref: '#/definitions/Post_block'
 *     tags:
 *       - Documents
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: document of specified id with edited fields
 *         schema:
 *           $ref: '#/definitions/Document'
 */
router.put('/:document_id/blocks/:block_id', async (req, res) => {
    // ver como hacer para agregar un indice(posiciones)
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
        const updateQuery = {$set: req.body};
        try{ 
            const documentData = await db.collection(process.env.COLLECTION_DOCUMENTS)
                .updateOne({'blocks._id': req.params.block_id}, {$set:{
                    "blocks.$[updateBlock].content" : req.body.content,
                    "blocks.$[updateBlock].contentType" : req.body.contentType,
                    "blocks.$[updateBlock].status" : req.body.status,
                    "blocks.$[updateBlock].index" : req.body.index
                } }, {
                    arrayFilters: [
                      {"updateBlock._id" : req.params.block_id}
                    ]
                })
                .then(() => {
                    db.collection(process.env.COLLECTION_DOCUMENTS)
                        .findOne({_id: ObjectId(req.params.document_id)})
                        .then((doc) => {
                            doc.blocks = doc.blocks.sort((a,b) => a.index - b.index);
                            res.status(200).json(doc);
                        });
                });
        } catch(error) {
            res.status(500).json({message: 'Error updating block', error}); 
        }
    }
});

/**
 * @swagger
 * /documents/{document_id}/blocks/{block_id}:
 *   delete:
 *     summary: Delete a block by ID
 *     parameters:
 *       - in: path
 *         name: document_id
 *         required: true
 *       - in: path
 *         name: block_id
 *         required: true
 *     tags:
 *       - Documents
 *     description: Deletes block of specified document id and block id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: message of successful deletion 
 *         schema:
 *           $ref: '#/definitions/Document'
 */
router.delete('/:document_id/blocks/:block_id', async (req, res) => {
    const data = await db.collection(process.env.COLLECTION_DOCUMENTS)
                        .updateOne({_id: ObjectId(req.params.document_id)}, {$pull:
                             { blocks: {_id: req.params.block_id}}});
    
    if(data){
        res.status(200).send({message: 'block removed from document'});
    }else{
        res.status(500).send({message: 'error while removing block from document'});
    }
});

module.exports = router;