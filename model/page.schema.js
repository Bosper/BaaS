var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PagesSchema = new Schema({
    id:         Number,
    title:      String,
    paragraph1: String,
    paragraph2: String,
    paragraph3: String,
    imgMedia:   String,
    imgThumb1:  String,
    imgThumb2:  String,
    imgThumb3:  String
}, {
    collection: 'pages'
});

module.exports = mongoose.model('Pages', PagesSchema);
