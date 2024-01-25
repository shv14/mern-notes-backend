var jwt = require('jsonwebtoken')
const jwt_sec = process.env.REACT_APP_JWT_SEC;

const fetchuser = (req, res, next) => {
    const token = req.header("auth-token");
    if (!token) {
        return res.status(401).json({ errors: "Denied Access" })
    }
    try {
        const data = jwt.verify(token, jwt_sec)
        req.user = data.user
        next();
    } catch (error) {
        return res.status(401).json({ errors: "Denied Access" })
    }
} 

module.exports = fetchuser