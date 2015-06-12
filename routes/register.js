var express = require('express');
var router = express.Router();
var User = require('../models/userModel.js');
var request = require('request');

router.post('/getverifycode', function (req, res, next) {
    var phoneNumber = req.body['phone'];
    if (!phoneNumber) {
        return res.json({'errMsg': 'the phone number is invalid!'});
    }
    var verifyCode = createRandom(6);
    console.log(phoneNumber);
    var formData =
    {
        'account': 'jiekou-clcs-01',
        'pswd': 'Tch111222',
        'mobile': '18616730721',
        'msg': "亲爱的用户，您的手机验证码是" + verifyCode + "，此验证码半小时内有效，请尽快完成验证.",
        'needstatus': true
    };

    request.post(
        {
            url: 'http://222.73.117.158/msg/HttpBatchSendSM',
            form: formData
        },
        function (err, httpResponse, body) {
            console.log("验证码发送结果: ", err, body.split('\n'));
        });
    User.findOneAndUpdate(
        {
            'phone': phoneNumber
        },
        {
            'phone': phoneNumber,
            'verifyCode': verifyCode
        },
        {
            'upsert': true
        },
        function (err, user) {
            if (err) {
                return res.json({'errMsg': 'generate mobile verify code failed!'});
            } else {
                console.log(user);
                return res.json(user);
            }
        });

});

module.exports = router;

function createRandom(length) {
    var result = "";
    for (var i = 0; i < length; ++i) {
        result += Math.floor((Math.random() * 10))
    }
    return result;
}