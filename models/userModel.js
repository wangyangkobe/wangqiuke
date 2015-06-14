var mongoose = require('mongoose');
var crypto = require('crypto');
var bcrypt = require('bcrypt');

var UserSchema = mongoose.Schema({
    phone: String,
    verifyCode: String,
    createTime: {type: Date, default: Date.now},

    nickname: {type: String},
    password: {type: String},

    sex: {type: String, enum: ["M", "F"], default: "M"},
    birthDay: Date
});

UserSchema.methods = {
    authenticate: function (username, password) {
        UserModel.find({'nickname': username}, function (err, user) {
            if (user && user.password == encryptPassword(password))
                return true;
            else
                return false;
        })
    },

    makeSalt: function () {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    encryptPassword: function (password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    },

    skipValidation: function () {
        return ~oAuthTypes.indexOf(this.provider);
    }
};

var UserModel = mongoose.model('UserModel', UserSchema, 'user');

module.exports = UserModel;