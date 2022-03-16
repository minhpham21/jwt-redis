const express = require('express')
const randToken = require('rand-token')
// const jwt = require('jsonwebtoken')
const auth = require('./auth/auth')
const jwt = require('jsonwebtoken')


require('dotenv').config()

const redis = require('redis')
const { log } = require('async')
const cookies = require('cookie-parser')
// const bodyParser = require('body-parser')
const redisClient = redis.createClient(6379, '127.0.0.1');
const app = express()
const port = 3000

app.use(express.json())
app.use(cookies())


var users = [{
    name: 'minhpham_1',
    pass: 12345678,
    refreshToken: ''
}]

var ACCESS_TOKEN = 'token_'

var data = [
    {
        name: 'name_1',
        class: 1,
        math: 1,
        history: 1,
        id: 1
    },
    {
        name: 'name_2',
        class: 2,
        math: 2,
        history: 2,
        id: 2
    },
    {
        name: 'name_3',
        class: 3,
        math: 3,
        history: 3,
        id: 3
    },
    {
        name: 'name_4',
        class: 3,
        math: 4,
        history: 4,
        id: 4
    },
    {
        name: 'name_5',
        class: 3,
        math: 5,
        history: 5,
        id: 5
    },
    {
        name: 'name_6',
        class: 3,
        math: 6,
        history: 6,
        id: 6
    },
    {
        name: 'name_7',
        class: 3,
        math: 7,
        history: 7,
        id: 7
    },
    {
        name: 'name_8',
        class: 3,
        math: 8,
        history: 8,
        id: 8
    },
    {   
        name: 'name_9',
        class: 3,
        math: 9,
        history: 9,
        id: 9
    },
    {
        name: 'name_10',
        class: 3,
        math: 10,
        history: 10,
        id: 10
    }
]

// function checkUsername (username) {
//     return users.filter( user => user.name != username) ;
// }

app.get('/', (req, res) => {
    // console.log(process.env.ACCESS_TOKEN_LIFE);
    res.json(data);
})

app.post('/login', async (req, res, next) => {
    let request = req.body

    if (users[0].name != request.name)
        return res.status(401).json("don't user name")
    if (users[0].pass != request.pass)
        return res.status(401).json("pass is correct")


    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

    const dataForAccessToken = {
        username: users[0].name,
    };

    const accessToken = await auth.generateToken(dataForAccessToken, accessTokenSecret, accessTokenLife)


    console.log('accessToken', accessToken);



    if (!accessToken)
        return res.status(401).json(`falase`)

    let refreshToken = randToken.generate(100);

    console.log('refreshToken', users[0].refreshToken);

    if (!users[0].refreshToken) {
        users[0].refreshToken = refreshToken;
    } else {
        refreshToken = users[0].refreshToken;
    }

    console.log('refreshToken', users[0].refreshToken);



    redisClient.get("tokenCouter", (err, data) => {
        redisClient.set("tokenCouter", users[0].name);
        redisClient.set(users[0].name, accessToken);
    })

    res.cookie("token-id", users[0].name);



    return res.json({
        msg: 'True',
        accessToken,
        refreshToken,
        users,
    });

});
function checkToken(req, res, next) {

    const tokenId = req.cookies['token-id'];
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

    redisClient.get('minhpham_1', (err, data) => {
        console.log(data);
        if (!data)
            return res.status(401).json('not access token')

        jwt.verify(data, accessTokenSecret, (error, decoded) => {
            if(error){
                console.log(error);
                return res.json(error);
            }
            next();
        });
    });

}
app.post('/api/create', checkToken, (req, res) => {
    let student = req.body;
    student['id'] = data[data.length - 1].id + 1;
    data.push(student);

    console.log(data);
    res.status(200).json({
        success: true,
        data: data
    });

})

app.delete('/api/delete/:studentId', checkToken, (req, res) => {
    let studentId = req.params.studentId;
    let result = data.filter(student => student.id != studentId);

    data = result;

    res.status(200).json({
        success: true,
        data: data
    });
})

app.put('/api/update/:studentId', checkToken, (req, res) => {
    let studentId = req.params.studentId;

    console.log('studentId', studentId);

    let result = data.filter(student => {
        if (student.id == studentId) {
            req.on('data', chunk => {
                let val = JSON.parse(chunk);
                student.name = val.name;
                student.class = val.class;
                student.math = val.math;
                student.history = val.history;
            })
        }
    })
    req.on('end', () => {
        res.status(200).json({
            success: true,
            data: data
        });
        res.end();
    })
})

app.get('/api/getMath/:studentId', (req, res) => {
    let studentId = req.params.studentId;

    let result = data.filter(student => student.id == studentId);
    console.log('result', result);

    res.status(200).json({
        success: true,
        data: result[0].math
    });
})

app.get('/api/getHistory/:studentId', (req, res) => {
    let studentId = req.params.studentId;

    let result = data.filter(student => student.id == studentId);

    res.status(200).json({
        success: true,
        data: result[0].history
    });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})