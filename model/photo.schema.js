var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PhotoSchema = new Schema({
    id:     Number,
    order:  Number,
    active: Boolean,
    url:    String
});

module.exports = mongoose.model( 'Photo', PhotoSchema );
