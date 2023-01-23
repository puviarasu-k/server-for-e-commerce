const mongoose = require('mongoose')
var userschema = mongoose.Schema({
    username: String,
    password: String,
    mobile : Number,
    email : String,
    userRole : String
});

const user = mongoose.model('user', userschema);
module.exports = user