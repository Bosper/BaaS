var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PanelNavSchema = new Schema({
    id: Number,
    name: String,
    class: String,
    status: Boolean
}, {
    collection: "panel"
});

module.exports = mongoose.model('Panel', PanelNavSchema);
