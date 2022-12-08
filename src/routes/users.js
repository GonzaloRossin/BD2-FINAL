require('dotenv').config();
const express = require('express');
const joi = require('joi');
const { ObjectId } = require('mongodb');
const router = express.Router();
const mongo = require('../db/db.util');


router.get('/', (req, res) => {

    try {
        mongo.getDb().collection(process.env.COLLECTION_USERS).find({}).toArray().then((docs) => {
            res.status(200).json(docs)
        });


    }catch(error){
        res.status(500).json({message: 'Error getting all users', error}); 
    }

});

router.get('/:user_id', (req, res) => {
    
    try {
        mongo.getDb().collection(process.env.COLLECTION_USERS).findOne({_id: ObjectId(req.params.user_id)}).then((doc) => {
            res.status(200).json(doc);
        });


    }catch(error){
        res.status(500).json({message: 'Error getting user', error}); 
    }
})

router.post('/', async (req, res) => {

    const userSchema = joi.object().keys({
        username: joi.string().alphanum().min(4).max(12).required(),
        password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).min(3).max(20).required(),
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required()
    });

    const {error} = userSchema.validate(req.body);
    const valid = error == null;

    if(!valid){
        res.status(422).json({error: error.message});
    }else{
        
        try{
            const data = await mongo.getDb().collection(process.env.COLLECTION_USERS).insertOne({
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

router.put('/:user_id', (req,res) => {
    res.status(200).send({message: 'a user should be modified'});
})

router.delete('/:user_id', (req, res) => {

    try {
        mongo.getDb().collection(process.env.COLLECTION_USERS).deleteOne({_id: ObjectId(req.params.user_id)}).then(() => {
            res.status(200).send({message: 'user deleted succesfully'});
        });


    }catch(error){
        res.status(500).json({message: 'Error deleting user', error}); 
    }
})

module.exports = router;