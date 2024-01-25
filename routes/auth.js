const express = require('express')
const User = require('../models/User')
const fetchuser = require('../middleware/fetchuser')
const router = express.Router();
const { body, validationResult } = require('express-validator');
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')

const jwt_sec = process.env.REACT_APP_JWT_SEC;

// ---------------------Route1-----------------------------------------------------
router.post('/adduser', [
    body('name').isLength({ min: 3 }),
    body('email').isEmail(),
    body('password').isLength({ min: 4 }),
], async (req, res) => {
    let success = false;
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() })
    }

    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).json({ errors: 'Email already exists' })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
    })
    success = true;
    const data = {
        user: {
            id: user.id
        }
    }
    const auth_token = jwt.sign(data, jwt_sec)

    res.json({ success: success, auth_token })
})


// ---------------------Route2-----------------------------------------------------
router.post('/login', [
    body('email').isEmail(),
    body('password').exists()
], async (req, res) => {

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() })
    }

    const { email, password } = req.body;
    let success = false;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Enter valid email Credentials' })
        }

        const comparePass = await bcrypt.compare(password, user.password);
        if (!comparePass) {
            return res.status(400).json({ error: 'Enter valid password Credentials' })
        }
        
        success = true;
        const data = {
            user: {
                id: user.id
            }
        }

        const auth_token = jwt.sign(data, jwt_sec);
        res.json({ success: success, auth_token });

    } catch (error) {
        console.log(error);
    }
})

// ---------------------Route3-----------------------------------------------------
router.post('/getuser', fetchuser, async (req, res) => {

    try {
        let userid = req.user.id;
        const user = await User.findById(userid).select("-password")
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
})

module.exports = router