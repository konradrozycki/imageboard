const express = require("express");
const app = express();
const db = require("./db.js");
const s3 = require("./s3");
const { s3Url } = require("./config");

app.use(express.static("public"));
app.use(express.json());

/////////////////////DONT TOUCH//////////////////////////////
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const { ServerlessApplicationRepository } = require("aws-sdk");

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});
////////////////////DONT TOUCH////////////////////////////////

app.get("/images", (req, res) => {
    db.getImages()
        .then((results) => {
            res.json(results.rows);
        })
        .catch((err) => {
            console.log("error in GET images: ", err);
        });
});

app.get("/image/:id", (req, res) => {
    db.getImage(req.params.id).then((results) => {
        res.json(results.rows);
    });
});

app.get("/more-images/:id", (req, res) => {
    // console.log('req.body :', req.params.id);
    let id = req.params.id;

    db.getMoreImages(id).then((resp) => {
        // console.log('resp :', resp);
        res.json(resp.rows);
    });
});

app.post("/upload", uploader.single("file"), s3.upload, function (req, res) {
    const { title, description, username } = req.body;
    const { filename } = req.file;
    const url = s3Url + filename;

    console.log("username: ", username);
    console.log("url: ", url);

    db.addImage(url, username, title, description)
        .then((results) => {
            console.log(results.rows);
            res.json(results.rows[0]);
        })
        .catch((err) => {
            console.log("error in POST image:", err);
        });
});

app.get("/comments/:id", (req, res) => {
    console.log("GET Comments req params id:", req.params.id);
    db.getComments(req.params.id).then((results) => {
        res.json(results.rows);
    });
});

app.post("/comments/:id", (req, res) => {
    console.log("POST req.body Comments: ", req.body);
    console.log(req.body.username);

    db.addComment(req.body.comment, req.body.username, req.body.id)
        .then((results) => {
            console.log("results from post comments: ", results);
            res.json(results.rows);
        })
        .catch((err) => {
            console.log("error in POST Comments/:id: ", err);
        });
});

app.listen(8080, () => console.log("Id server is running"));
