var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    // username: { type: String, required: true, index: { unique: true } },
    // password: { type: String, required: true}}, { collection: 'users' });
    username: String,
    password: String
}, { collection: "users" });

module.exports = mongoose.model('User', userSchema);
