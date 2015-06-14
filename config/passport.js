var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/userModel');
var bcrypt = require('bcrypt');

module.exports = function (passport) {

    // use these strategies
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'nickname',
                passwordField: 'password'
            },
            function (nickname, password, done) {

                process.nextTick(function () {
                    User.findOne({nickname: nickname}, function (err, user) {

                        if (err) return done(err);
                        if (!user) {
                            return done(null, false, {message: '用户名不存在!'});
                        }

                        bcrypt.compare(password, user['password'], function (err, res) {
                            if (err || !res)
                                return done(null, false, {message: '密码错误!'});
                            else
                                return done(null, user);
                        });

                    });
                });

            })
    );

    // serialize sessions
    passport.serializeUser(function (user, done) {
        done(null, user.id)
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user)
        });
    });

};