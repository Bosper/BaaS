var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AlbumSchema = new Schema({
    id: Number,
    title: String,
    photoId: Number[],
    desc: String,
    order: Boolean,
    cover: Number
});

module.exports = mongoose.model( 'Albums', AlbumSchema );
