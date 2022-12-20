require('dotenv').config();
const express = require('express');
const { string } = require('joi');
const joi = require('joi');
const { ObjectId } = require('mongodb');
const router = express.Router();
const db = require('../db/db.util').getDb();


/**
 * @swagger
 * definitions:
 *   User:
 *     properties:
 *       _id:
 *         type: object
 *         example: 639e8b766721f047ac096ffd
 *       username:
 *         type: string
 *         minLength: 4
 *         maxLength: 25
 *         example: johnDoe123
 *       password:
 *         type: string
 *         minLength: 3
 *         maxLength: 30
 *         pattern: '^[a-zA-Z0-9]{3,30}$'
 *       email:
 *         type: string
 *         example: example@gmail.com
 *       documents:
 *         type: array
 *         items:
 *           type: object
 *           example: 639e8c426721f047ac096ffe
 *       favorites:
 *         type: array
 *         items:
 *           type: object
 *           example: 639e8c426721f047ac096ffe
 *   Post_user:
 *     properties:
 *       username:
 *         type: string
 *         minLength: 4
 *         maxLength: 25
 *         example: johnDoe123
 *       password:
 *         type: string
 *         minLength: 3
 *         maxLength: 30
 *         pattern: '^[a-zA-Z0-9]{3,30}$'
 *         example: password123
 *       email:
 *         type: string
 *         example: johnDoe@gmail.com
 *     required:
 *      - username
 *      - password
 *      - email
 *   Edit_user:
 *     properties:
 *       username:
 *         type: string
 *         minLength: 4
 *         maxLength: 25
 *         example: johnDoe123
 *       password:
 *         type: string
 *         minLength: 3
 *         maxLength: 30
 *         pattern: '^[a-zA-Z0-9]{3,30}$'
 *         example: password123
 *       email:
 *         type: string
 *         example: johnDoe@gmail.com
 */

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Returns all users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of users
 *         users:
 *         type: array
 *         items:
 *          type: schema
 *          $ref: '#/definitions/User'
 *       500:
 *         description: error on server side
 */
router.get('/', (req, res) => {

    try {
        db.collection(process.env.COLLECTION_USERS).find({}).toArray().then((docs) => {
            res.status(200).json(docs)
        });


    }catch(error){
        res.status(500).json({message: 'Error getting all users', error}); 
    }

});

/**
 * @swagger
 * /users/{user_id}:
 *   get:
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: user document of specified id
 *         schema:
 *           $ref: '#/definitions/User'
 *       400:
 *         description: user_id was not found
 */
router.get('/:user_id', (req, res) => {
    
    db.collection(process.env.COLLECTION_USERS)
        .findOne({_id: ObjectId(req.params.user_id)})
        .then((doc, err) => {
            if(!err){
                res.status(200).json(doc); 
            }else{
                res.status(400).json({message: 'user_id was not found'});
            }
        });
});

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *     - Users
 *     summary: Creates a new user
 *     consumes:
 *      - application/json
 *     parameters:
 *      - in: body
 *        name: user
 *        schema:
 *         $ref: '#/definitions/Post_user' 
 *   produces:
 *     - application/json
 *   responses:
 *     200:
 *       description: user document of specified id
 *       schema:
 *         $ref: '#/definitions/User'
 *     422:
 *       description: request body is invalid
 *     500:
 *       description: error on server side
 */
router.post('/', async (req, res) => {

    const userSchema = joi.object().keys({
        username: joi.string().alphanum().min(4).max(25).required(),
        password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).min(3).max(20).required(),
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required()
    });

    const {error} = userSchema.validate(req.body);
    const valid = error == null;

    if(!valid){
        res.status(422).json({error: error.message});
    }else{
        
        try{
            const data = await db.collection(process.env.COLLECTION_USERS).insertOne({
                username: req.body.username,
                password: req.body.password,
                email: req.body.email,
                documents: [],
                favorites: []
            });
    
            if(data){
                res.status(200).send({message: 'user was created'});
            }
    
        }catch(error){
            res.status(500).json({message: 'Error creating user', error});
        }
    }

})

/**
 * @swagger
 * /users/{user_id}:
 *   put:
 *     summary: Edit a user by ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *       - in: body
 *         name: user
 *         schema:
 *          $ref: '#/definitions/Edit_user'
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: user document of specified id with edited fields
 *         schema:
 *           $ref: '#/definitions/User'
 *       422:
 *         description: request body is invalid
 *       500:
 *         description: error in server side
 */
router.put('/:user_id', (req,res) => {

    const userEditSchema = joi.object().keys({
        username: joi.string().alphanum().min(4).max(25),
        password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).min(3).max(20),
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    });
    const {error} = userEditSchema.validate(req.body);
    const valid = error == null;

    if(!valid){
        res.status(422).json({error: error.message});
    }else{
        const updateQuery = {$set: req.body};
        try {
            db.collection(process.env.COLLECTION_USERS)
                .updateOne({_id: ObjectId(req.params.user_id)}, updateQuery)
                .then(() => {
                    res.status(200).send({message: 'user updated succesfully'});
                });
        }catch(error){
            res.status(500).json({message: 'Error deleting user', error}); 
        }
    }
});

/**
 * @swagger
 * /users/{user_id}:
 *   delete:
 *     summary: Delete a user by ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     tags:
 *       - Users
 *     description: Deletes user of specified id along with its documents
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: message of successful deletion 
 *         schema:
 *           $ref: '#/definitions/User'
 *       400:
 *         description: user_id is invalid
 *       500:
 *         description: error on server side
 */
router.delete('/:user_id', async (req, res) => {

    try {
        var docs;
        await db.collection(process.env.COLLECTION_USERS).findOne(ObjectId(req.params.user_id)).then((result,err) => {
            if(!err){
               docs = result.documents;
            }else{
                res.status(400).json({message: 'invalid user_id'});
            }
        });
        db.collection(process.env.COLLECTION_DOCUMENTS).deleteMany({_id: {$in: docs}});
        db.collection(process.env.COLLECTION_USERS).updateMany({favorites: {$in: docs}},{
            $pull: {
                favorites: {$in: docs}
            }
        });
        db.collection(process.env.COLLECTION_USERS).deleteOne({_id: ObjectId(req.params.user_id)}).then(() => {
            res.status(200).send({message: 'user deleted succesfully'});
        });

    }catch(error){
        res.status(500).json({message: 'Error deleting user', error}); 
    }
});

module.exports = router;