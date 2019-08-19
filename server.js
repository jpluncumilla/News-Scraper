const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");

const port = process.env.PORT || 8000;

const app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json({
    type: "application/json"
}));

app.use(express.static("public"));

mongoose.Promise = Promise;

mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost/newsScraper");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));

db.once("open", function () {
    console.log("Connected to Mongoose!");
});

app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");


const db = require("./models");

app.get("/scrape", function (req, res) {
    axios.get("https://www.npr.org/sections/technology/").then(function (response) {
        var $ = cheerio.load(response.data);

        $("article").each(function (i, element) {

            var result = {};

            result.title = $(this)
                .find("h2")
                .text();
            result.link = $(this)
                .find("h2")
                .children("a")
                .attr("href");
            result.summary = $(this)
                .find("p")
                .children("a")
                .text();

            if (result.title && result.link && result.summary) {
                db.Article.create(result)
                    .then(function (dbArticle) {
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        console.log(err);
                        console.log(result);
                    });
            };
        });
        res.send("Scrape Complete");
    });

});

app.get("/", function (req, res) {
    db.Article.find({
        saved: false
    },
        function (error, dbArticle) {
            if (error) {
                console.log(error);
            } else {
                res.render("index", {
                    articles: dbArticle
                });
            }
        })
});

app.get("/saved", function (req, res) {
    db.Article.find({
        saved: true
    })
       
        .populate("comment")
        .then(function (dbArticle) {
         
            res.render("saved", {
                articles: dbArticle
            })
        })
        .catch(function (err) {
       
            res.json(err);
        })
});

app.put("/saved/:id", function (req, res) {
    db.Article.findByIdAndUpdate(
        req.params.id, {
            $set: req.body
        }, {
            new: true
        })
        .then(function (dbArticle) {
            res.render("saved", {
                articles: dbArticle
            })
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.post("/articles/:id", function (req, res) {
    db.Comment.create(req.body)
        .then(function (dbComment) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
     
            res.json(err);
        });
});


app.post("/submit/:id", function (req, res) {
    db.Comment.create(req.body)
        .then(function (dbComment) {
            var articleIdFromString = mongoose.Types.ObjectId(req.params.id)
            return db.Article.findByIdAndUpdate(articleIdFromString, {
                $push: {
                    comments: dbComment._id
                }
            })
        })
        .then(function (dbArticle) {
            res.json(dbComment);
        })
        .catch(function (err) {
   
            res.json(err);
        });
});

app.get("/comments/article/:id", function (req, res) {
    db.Article.findOne({ "_id": req.params.id })
        .populate("comments")
        .exec(function (error, data) {
            if (error) {
                console.log(error);
            } else {
                res.json(data);
            }
        });
});

app.get("/comments/:id", function (req, res) {

    db.Comment.findOneAndRemove({ _id: req.params.id }, function (error, data) {
        if (error) {
            console.log(error);
        } else {
        }
        res.json(data);
    });
});


app.listen(port, function () {
    console.log("App is listening on PORT " + port);
});