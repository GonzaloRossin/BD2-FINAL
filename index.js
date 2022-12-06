const express = require('express');
const app = express();
const PORT = 8080

app.listen(PORT,
    () => console.log(`it's alive on http://localhost:${PORT}`)
)

app.use(express.json())//middleware para que parsee la request como json antes de la response

app.get('/tshirt', (req, res) => {
    res.status(200).send({
        tshirt: 'shirt',
        size: 'large'
    })
});

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
