//create web server
const express = require('express');
const router = express.Router();
const Coment = require('../models/coment');
const User = require('../models/user');
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const auth = require('../middleware/auth');
const checkAuth = require('../middleware/checkAuth');
const checkAdmin = require('../middleware/checkAdmin');
const { check, validationResult } = require('express-validator/check');
const {matchedData, sanitize} = require('express-validator/filter');

//GET all coments
router.get('/', auth, checkAuth, checkAdmin, (req, res, next) => {
  Coment.find()
    .populate('user')
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        coments: docs.map(doc => {
          return {
            _id: doc._id,
            user: doc.user,
            coment: doc.coment,
            date: doc.date,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/coments/' + doc._id
            }
          }
        })
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
});

//GET coment by ID
router.get('/:comentId', auth, checkAuth, checkAdmin, (req, res, next) => {
  const id = req.params.comentId;
  Coment.findById(id)
    .populate('user')
    .exec()
    .then(doc => {
      if(doc) {
        res.status(200).json({
          coment: doc,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/coments/'
          }
        })
      } else {
        res.status(404).json({
          message: 'No valid entry found for provided ID'
        })
      }
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
});

//POST coment
router.post('/', auth, checkAuth, [
  check('coment')
    .isLength({min: 5})
    .withMessage('Must be at least 5 chars long')
    .trim()
    .escape()
], (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json({errors: errors.mapped()});
  }

  const coment = new Coment({
    _id: new mongoose.Types.ObjectId(),
    user: req.body.user,
    coment: req.body.coment,
    date: req.body.date
  });
  coment.save()
    .then(result => {
      res.status(201).json({
        message: 'Created coment successfully',
        createdComent: {
          _id: result._id,
          user: result.user,
          coment: result.coment,
          date: result.date,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/coments/' + result._id
          }
        }
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
}