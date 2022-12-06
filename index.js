const express = require('express');
const app = express();
const PORT = 7070

app.listen(PORT,
    () => console.log(`it's alive on http://localhost:${PORT}`)
)

app.use(express.json())//middleware para que parsee la request como json antes de la response

app.get('/users', (req, res) => {
    res.status(200).send({
        response: 'this should return all users'
    })
});

app.get('/users/:user_id', (req, res) => {
    
    const { user_id } = req.params;

    res.status(200).send({
        response: `this should return the user of id=${user_id}`
    })
})

app.post('/users', (req, res) => {
    
    const { username } = req.body;
    const { password } = req.body;
    const { email } = req.body;

    if(!username && !password && !email){
        res.status(418).send({message: 'request body is empty'})
    }
    if(!username){
        res.status(418).send({message: 'username is empty'})
    }
    if(!password){
        res.status(418).send({message: 'password is empty'})
    }
    if(!email){
        res.status(418).send({message: 'email is empty'})
    }

    res.status(200).send({
        message: `a user with user was created`,
        username: `${username}`,
        password: `${password}`,
        email: `${email}`
    })
})

app.put('/users', (req,res) => {
    res.status(200).send({message: 'a user should be modified'})
})

app.delete('/users', (req, res) => {
    res.status(200).send({message: 'a user should be deleted'})
})



app.post('/tshirt/:id', (req,res) => {

    const { id } = req.params; //si la info esta en el el body de la request usar req.body
    const { logo } = req.body;

    if(!logo){
        res.status(418).send({message: 'We need a logo!'})
    }

    res.status(200).send({
        tshirt: `shirt with your logo = ${logo} and id = ${id}`
    });
})
