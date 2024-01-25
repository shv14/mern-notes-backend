const mongoose = require('mongoose');
const mongouri = process.env.REACT_APP_MONGO_URI;

const connecttomongo = ()=>{
    mongoose.connect(mongouri, ()=>{
        console.log('connected to mongodb');
    })
}
module.exports = connecttomongo;