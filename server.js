const express = require('express');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const multer = require('multer');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let db;
const url = 'mongodb+srv://admin:qwer1234@suin.h292lqx.mongodb.net/?retryWrites=true&w=majority&appName=suin'; // MongoDB URL을 여기에 입력하세요
new MongoClient(url).connect().then((client) => {
    console.log('DB 연결 성공');
    db = client.db('web');
    app.listen(8080, () => {
        console.log('http://localhost:8080 running~');
    });
}).catch((err) => {
    console.log(err);
});

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');


app.get('/', async (req, res) => {
    try {
        let posts = await db.collection('posts').find().toArray();
        res.render('index.ejs', { posts });
    } catch (err) {
        res.status(500).send('게시글을 불러오는 중 오류가 발생했습니다.');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    let result = await db.collection('user').findOne({ userId: req.body.username });
    if (!result) {
        return res.status(401).send('아이디 DB에 없음');
    } else {
        if (result.pw == req.body.password) {
            res.redirect('/');
        } else {
            res.status(401).send('비밀번호 일치하지 않음.');
        }
    }
});

app.get('/join', (req, res) => {
    res.render('join');
});

app.post('/join', (req, res) => {
    db.collection('user').insertOne({
        userId: req.body.id,
        pw: req.body.pw
    }, (err, result) => {
        if (err) {
            return res.status(500).send('사용자 등록 실패');
        }
        res.redirect('/login');
    });
});

app.get('/posts', async (req, res) => {
    let posts = await db.collection('posts').find().toArray();
    res.json(posts);
});

app.get('/newpost', (req, res) => {
    res.render('newpost.ejs');
});

app.post('/newpost', (req, res) => {
    let newPost = {
        title: req.body.title,
        content: req.body.content,
        summary: req.body.summary,
        date: new Date()
    };

    db.collection('posts').insertOne(newPost, (err, result) => {
        if (err) {
            return res.status(500).send('게시글 등록 실패');
        }
        res.redirect('/');
    });
});

app.get('/post/:id', async (req, res) => {
    try {
        let post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
        if (post) {
            res.render('post.ejs', { post });
        } else {
            res.status(404).send('게시글을 찾을 수 없습니다.');
        }
    } catch (err) {
        res.status(500).send('게시글을 불러오는 중 오류가 발생했습니다.');
    }
});

app.get('/userinfo', async (req, res) => {
    let users = await db.collection('user').find().toArray();
    res.render('list', { users });
});
