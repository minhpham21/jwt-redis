const jwt = require('jsonwebtoken');
// const bodyParser = require('body-parser');
const async = require("async");



exports.generateToken = async (user, secretSignature, tokenLife) => {
    try {
        return await jwt.sign(
            { data: user },
            secretSignature,
            {
                algorithm: 'HS256',
                expiresIn: tokenLife,
            }
        )
    } catch (err) {
        console.log(`Err gennerate token: + ${error}`);
        return;
    }
}

exports.verifyToken = async (token, secretKey) => {
    try {
        // console.log(123);
		return await verify(token, secretKey);
	} catch (error) {
		console.log(`Err verify token:  + ${error}`);
		return ;
	}
}