var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AlbumSchema = new Schema({
    id: Number,
    title: String,
    photoId: [Number],
    start: Boolean,
    category: Number,
    desc: String,
    order: Number,
    active: Boolean,
    cover: Number
}, {
    collection: 'albums'
});

module.exports = mongoose.model( 'Albums', AlbumSchema );
