const express = require('express')
const router = express.Router();
const fetchuser = require('../middleware/fetchuser')
const Notes = require('../models/Notes')
const { body, validationResult } = require('express-validator');
const { findByIdAndUpdate } = require('../models/User');


router.get('/fetchdetails', fetchuser, async (req, res) => {
  const notes = await Notes.find({ user: req.user.id })
  res.json(notes);
})

router.post('/adddetails', fetchuser, [
  body('title').isLength({ min: 3 }),
  body('tag').isLength({ min: 3 }),
], async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() })
  }

  const {title, tag, description} = req.body; 

  try {
    const notes = new Notes({
      title, tag, description, user: req.user.id
    })

    const savedNotes = await notes.save();
    res.json(savedNotes)
    
  } catch (error) {
    console.log(error);
    res.status(500).send({error: "Internal server error"})
  }

})

router.put('/updatedetails/:id', fetchuser, async (req, res) => {
  const {title, tag, description} = req.body; 

    const newDetails = {};
    if(title){
      newDetails.title = title
    } 
    if(tag){
      newDetails.tag = tag
    } 
    if(description){
      newDetails.description = description
    } 

    let notes = await Notes.findById(req.params.id);
    if (!notes) {
      return res.status(404).send("404 Not Found")
    }

    if (notes.user.toString() !== req.user.id) {
      return res.status(404).send("401 Not Allowed")
    }

    notes = await Notes.findByIdAndUpdate(req.params.id, {$set: newDetails}, {new: true})
    res.json(notes)
    
})

router.delete('/deletedetails/:id', fetchuser, async (req, res) => {

    let notes = await Notes.findById(req.params.id);
    if (!notes) {
      return res.status(404).send("Not Found")
    }

    if (notes.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed")
    }

    notes = await Notes.findByIdAndDelete(req.params.id)
    res.json({"Success": "The details has been deleted", notes: notes})
    
})

module.exports = router