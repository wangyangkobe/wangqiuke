var express = require('express');
var router = express.Router();
var User = require('../models/userModel.js');
var request = require('request');
var passport = require('passport');

router.post('/getverifycode', function (req, res, next) {
    var phoneNumber = req.body['phone'];

    if (!phoneNumber) {
        return res.json({'errMsg': 'the phone number is invalid!'});
    }

    User.findOne({'phone': phoneNumber}, function (err, user) {
        if (err || user) {
            return res.json({'res': false, 'errMsg': '该电话号码已被注册!'});
        } else {
            var verifyCode = createRandom(6);
            sendVerifyCode(phoneNumber, verifyCode);

            User.create(
                {
                    'phone': phoneNumber,
                    'verifyCode': verifyCode,
                    'createTime': Date.now()
                }, function (err, user) {
                    console.log(err);
                    if (err) {
                        return res.json({'res': false, 'errMsg': 'generate mobile verify code failed!'});
                    } else {
                        return res.json(user);
                    }
                });

        }
    });
});

router.get('/verify', function (req, res) {
    var phoneNumber = req.query['phone'];
    var verifyCode = req.query['code'];

    if (phoneNumber && verifyCode) {
        User.findOne({'phone': phoneNumber}, function (err, user) {

            if (user && user.verifyCode == verifyCode) {

                if (Date.now() - user.createTime > 60 * 1000) { //1分钟
                    return res.json({'res': false, 'errMsg': '验证码过期.'});
                } else {
                    return res.json({'res': true});
                }

            } else if (!user) {
                return res.json({'res': false, 'errMsg': '请输入正确的手机号码.'});
            } else {
                return res.json({'res': false, 'errMsg': "验证码有误，请输入正确的验证码."})
            }
        });
    } else {
        return res.json({'res': false, 'errMsg': '请输入正确的手机号码或验证码.'});
    }
});
router.post('/register', function (req, res) {
    req.assert('phone', '手机号码不能为空!').notEmpty();
    req.assert('nickname', '用户名不能为空!').notEmpty();
    req.assert('password', '密码不能为空!').notEmpty();

    var mappedErrors = req.validationErrors(true);
    if (mappedErrors) {
        return res.json(mappedErrors);
    } else {

        User.findOne({'nickname': req.body['nickname']},
            function (err, user) {
                if (user) {
                    return res.json({'res': false, 'errMsg': "该用户名已经存在!"});
                } else {
                    var regUser = new User(req.body);

                    regUser['password'] = regUser.encryptPassword(regUser.password);

                    User.create(regUser, function (err, user) {

                        req.logIn(user, function (err) {
                            if (err)
                                return res.json({'res': false, 'errMsg': "注册失败!"});
                            else
                                res.json(user);
                        });

                    });
                }
            });
    }
});
/*
 router.post('/login',
 passport.authenticate('local', {
 successRedirect: '/',
 failureRedirect: '/'
 })
 );*/

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err || !user) {
            console.log(req.flash());
            return res.json({'res': false, 'errMsg': "用户名或者密码错误!"});
        }

        req.logIn(user, function (err) {
            if (err) {
                return res.json({'res': false, 'errMsg': "用户名或者密码错误!"});
            }
            // Redirect if it succeeds
            return res.json(req.user);
        });
    })(req, res, next);
});


router.get('/logout', function (req, res) {
    console.log(req.user, req.isAuthenticated());
    req.logout();
    return res.json({'res': true});
});

module.exports = router;

function createRandom(length) {
    var result = "";
    for (var i = 0; i < length; ++i) {
        result += Math.floor((Math.random() * 10))
    }
    return result;
}

function sendVerifyCode(phoneNumber, verifyCode) {
    var formData = {
        'account': 'jiekou-clcs-01',
        'pswd': 'Tch111222',
        'mobile': '' + phoneNumber,
        'msg': "亲爱的用户，您的手机验证码是" + verifyCode + "，此验证码半小时内有效，请尽快完成验证.",
        'needstatus': true
    };

    request.post({
            url: 'http://222.73.117.158/msg/HttpBatchSendSM',
            form: formData
        },
        function (err, httpResponse, body) {
            console.log("验证码发送结果: ", err, body.split('\n'));
        });
}