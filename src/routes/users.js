const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
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

router.post('/', (req, res) => {
    
    const { username } = req.body;
    const { password } = req.body;
    const { email } = req.body;

    if(!username && !password && !email){
        res.status(418).send({message: 'request body is empty'});
    }
    if(!username){
        res.status(418).send({message: 'username is empty'});
    }
    if(!password){
        res.status(418).send({message: 'password is empty'});
    }
    if(!email){
        res.status(418).send({message: 'email is empty'});
    }


    res.status(200).send({
        message: 'user was created'
    })
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