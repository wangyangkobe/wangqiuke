var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    phone: String,
    verifyCode: String,
    createTime: { type: Date, default: Date.now }
});

var UserModel = mongoose.model('UserModel', userSchema, 'user');

module.exports = UserModel;