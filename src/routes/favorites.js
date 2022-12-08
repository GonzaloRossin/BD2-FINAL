require('dotenv').config();
const express = require('express');
const joi = require('joi');
const { ObjectId } = require('mongodb');
const router = express.Router();
const db = require('../db/db.util').getDb();

router.get('/:user_id', (req, res) => {
    
    
});

router.post('/:user_id/:document_id', (req, res) => {
    
    
});

router.delete('/:user_id/:document_id', (req, res) => {
    
    
});

module.exports = router;