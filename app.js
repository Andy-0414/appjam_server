const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
var mysql = require('mysql');
var con = mysql.createConnection({
    host: 'localhost', // 202.182.123.138
    user: 'root',
    password: '1111',
    database: 'appjam'
});
con.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("data"));

app.listen(80, () => {
    console.log("SERVER OPEN");
})
app.get('/',(req,res)=>{
    res.send("Hello APPJAM");
})
app.post('/user/signin', (req, res) => { // 로그인
    var id = req.body.id; // 유저 아이디
    var pw = req.body.pw; // 유저 패스워드
    var sql = "SELECT id,password FROM login WHERE id=?"
    con.query(sql, [id], (err, result, fields) => {
        if (err) {
            res.status(505).end(); // 에러 시 505
        }
        if (!result[0]) {
            console.log("login id x");
            res.status(405).end(); // 아이디가 없을 시 405
        }
        else {
            if (result[0].password == pw) {
                console.log(`[LOGIN USER]\nID : ${id}`);
                res.status(200).end(); // 성공 시 200
            }
            else {
                console.log("login pw x");
                res.status(405).end(); // 비밀번호 불일치 시 405
            }
        }

    })
})
app.post('/user/signup', (req, res) => { // 회원가입
    var name = req.body.name; // 유저 이름
    var id = req.body.id; // 유저 아이디
    var pw = req.body.pw; // 유저 패스워드
    if (!name || !id || !pw) {
        console.log("[NOT DATA]")
        res.status(405).end() // 데이터가 없을 시 405
    }
    else {
        var sql = "SELECT id FROM login WHERE id=?";
        con.query(sql, [id], (err, result, fields) => {
            if (err) {
                res.status(505).end(); // 에러 시 505
            }
            if (!result[0]) {
                var sql = "INSERT INTO login (id, password, name) VALUES(?,?,?)";
                con.query(sql, [id, pw, name], (err, result, fields) => {
                    if (err) {
                        res.status(505).end(); // 에러 시 505
                    }
                    else {
                        console.log(`[Create User]\nID : ${id}\nNAME : ${name}`);
                        res.status(200).end() // 제대로 생성됬을 시 200
                    }
                })
            }
            else {
                console.log("[SAME USER]")
                res.status(405).end(); // 이미 있는 사용자일시 405
            }
        });
    }
})

app.post('/user/find', (req, res) => { // 비밀번호 변경을 위한 유저 찾기
    var id = req.body.id; // 유저 아이디
    var name = req.body.name; // 유저 이름
    if (!name || !id) {
        console.log("[NOT DATA]")
        res.status(405).end() // 데이터가 없을 시 405
    }
    else {
        var sql = "SELECT id,name FROM login WHERE id=?";
        con.query(sql, [id], (err, result, fields) => {
            if (err) {
                res.status(505).end(); // 에러 시 505
            }
            if (!result[0]) {
                console.log("[NOT DATA]")
                res.status(405).end() // 데이터가 없을 시 405
            }
            else {
                if (result[0].name == name) {
                    console.log("[FIND DATA]")
                    res.status(200).end() // 찾았을 시 200
                }
            }
        });
    }

})
app.post('/user/change', (req, res) => { // 유저찾기에 성공시 비밀번호 변경
    var id = req.body.id; // 유저 아이디
    var pw = req.body.password; // 유저 패스워드

    var sql = "UPDATE login SET password=? WHERE id=?"
    con.query(sql, [pw, id], (err, result, fields) => {
        if (err) {
            res.status(505).end(); // 에러 시 505
        }
        else {
            console.log("[CHANGE DATA]")
            res.status(200).end(); // 성공 시 200
        }
    })
})


// 글 쓰기

app.post('/post/create', (req, res) => { // 글쓰기
    var id = req.body.id;
    var day = new Date();
    var question = (req.body.question ? req.body.question : "");
    var mdata = {
        question: question,
        content: req.body.content,
        date: day,
        img: []
    }
    fs.readdir(`data/posts/`, (err, files) => {
        if (files[files.findIndex(file => file.split('.')[0] == id)] == -1) {
            var p_data = [mdata]
            fs.writeFile(`data/posts/${id}.json`, JSON.stringify(p_data), (err) => {
                if (err) {
                    res.status(505).end();
                }
                else {
                    res.status(200).end();
                }
            })
        }
        else {
            fs.readFile("data/posts/" + files[files.findIndex(file => file.split('.')[0] == id)], (err, data) => {
                var post = JSON.parse(data);
                post.push(mdata)
                fs.writeFile(`data/posts/${id}.json`, JSON.stringify(post), (err) => {
                    if (err) {
                        res.status(505).end(); // 에러 시 505
                    }
                    else {
                        console.log("[POST Up]")
                        res.status(200).end(); // 성공 시 200
                    }
                })
            })
        }
    })
})

app.post('/post/update', (req, res) => { // 글쓰기
    var id = req.body.id;
    var num = req.body.num
    var content = req.body.content;
    fs.readdir(`data/posts/`, (err, files) => {
        if (err) {
            res.status(505).end(); // 에러 시 505
        }
        else {
            fs.readFile("data/posts/" + files[files.findIndex(file => file.split('.')[0] == id)], (err, data) => {
                var post = JSON.parse(data);
                post[num].content = content;
                fs.writeFile(`data/posts/${id}.json`, JSON.stringify(post), (err) => {
                    if (err) {
                        res.status(505).end(); // 에러 시 505
                    }
                    else {
                        console.log("[POST Update]")
                        res.status(200).end(); // 성공 시 200
                    }
                })
            })
        }
    })
})

app.post('/post/delete', (req, res) => { // 글쓰기
    var id = req.body.id;
    var num = req.body.num
    fs.readdir(`data/posts/`, (err, files) => {
        if (err) {
            res.status(505).end(); // 에러 시 505
        }
        else {
            fs.readFile("data/posts/" + files[files.findIndex(file => file.split('.')[0] == id)], (err, data) => {
                var post = JSON.parse(data);
                post.splice(num,1);
                fs.writeFile(`data/posts/${id}.json`, JSON.stringify(post), (err) => {
                    if (err) {
                        res.status(505).end(); // 에러 시 505
                    }
                    else {
                        console.log("[POST Delete]")
                        res.status(200).end(); // 성공 시 200
                    }
                })
            })
        }
    })
})

app.post('/post/list', (req, res) => { // 글쓰기
    var id = req.body.id;
    fs.readdir(`data/posts/`, (err, files) => {
        if (err) {
            res.status(505).end(); // 에러 시 505
        }
        else {
            fs.readFile("data/posts/" + files[files.findIndex(file => file.split('.')[0] == id)], (err, data) => {
                var post = JSON.parse(data);
                res.send({
                    result: post
                });
            })
        }
    })
})