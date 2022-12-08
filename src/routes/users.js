const express = require('express');
const joi = require('joi');
const router = express.Router();
const mongo = require('../db/db.util');


router.get('/', (req, res) => {

    try {
        const data = mongo.getDb().collection('dummy').find({});

        if(data){
            res.status(200).json(data);
        }
    }catch(error){
        res.status(500).json({message: 'Error getting all users', error}); 
    }

    res.status(200).send({
        response: 'this should return all users'
    })
});

router.get('/:user_id', (req, res) => {
    
    const { user_id } = req.params;


    res.status(200).send({
        response: `this should return the user of id=${user_id}`
    });
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
            const data = await mongo.getDb().collection('dummy').insertOne({
                username: req.body.username,
                password: req.body.password,
                email: req.body.email
            });
    
            if(data){
                res.status(200).send({message: 'user was created'});
            }
    
        }catch(error){
            res.status(500).json({message: 'Error creating user', error});
        }
    }

})

router.put('/', (req,res) => {
    res.status(200).send({message: 'a user should be modified'});
})

router.delete('/:user_id', (req, res) => {
    const { user_id } = req.params;

    if(!user_id){
        res.status(418).send({message:'user_id is not present'});
    }

    res.status(200).send({message: 'a user should be deleted'});
})

module.exports = router;