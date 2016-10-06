var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TestSchema = new Schema({
    name: String
}, {collection: 'test'});

module.exports = mongoose.model('Test', TestSchema);
