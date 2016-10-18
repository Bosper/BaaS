var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    // username: { type: String, required: true, index: { unique: true } },
    // password: { type: String, required: true}}, { collection: 'users' });
    username: String,
    password: String,
    token: String
}, { collection: "users" });

module.exports = mongoose.model('User', userSchema);

// var mongoose = require('mongoose');
// var Schema = mongoose.Schema;
// var bcrypt = require('bcrypt');
// const SALT_WORK_FACTOR = 10;
//
// var userSchema = new Schema({
//     username    : {
//         type    : String,
//         unique  : true,
//         required: true
//     },
//     password: {
//         type    : String,
//         required: true
//     }
// });
//
// userSchema.pre('save', function (next) {
//     var user = this;
//     if (this.isModified('password') || this.isNew) {
//         bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
//             if (err) return next(err);
//             bcrypt.hash(user.password, salt, function (err, hash) {
//                 if (err) return next(err);
//                 user.password = hash;
//                 next();
//             });
//         });
//     } else return next();
// });
//
// userSchema.methods.comparePassword = function (pass, cb) {
//     bcrypt.compare(pass, this.password, function (err, isMatch) {
//         if(err) return cb(err);
//         cb(null, isMatch)
//     });
// };
