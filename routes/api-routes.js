var database = require("../models");
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var moment = require("moment");

module.exports = function (app) {

    // Scrape route
    app.get("/scrape", function(req, res) {
        request("http://www.nintendolife.com/reviews", function(error, response, html) {
            var $ = cheerio.load(html);
            
            $("li.item-review").each(function(i, element) {

                var pubDate = $(element).children().children("div.info").children().children("ul.list").children().children("time").attr("datetime").split("T");

                var result = {};

                result.title = $(element).children().children("div.info").children().children().children("a.title").children("span.title").text();
                result.type = "game";
                result.link = "http://www.nintendolife.com/" + $(element).children().children("div.info").children().children().children("a.title").attr("href");
                result.published = pubDate[0]; 

                //console.log(result)

                database.Review.create(result)
                .then(function(dbGameReview) {
                    //console.log(dbGameReview)
                    request("https://www.avclub.com/c/review/movie-review", function(err, response, htmlM) {
                        var $ = cheerio.load(htmlM);
            
                        $("article.js_post_item").each(function(i, elementM) {
            
                            var pubDate = $(elementM).children().children("div.item__text").children("div.meta--pe ").children().children("time").attr("datetime").split("T");
            
                            var resultMovie = {};
            
                            resultMovie.title = $(elementM).children().children("div.item__text").children("h1.headline").children().text();
                            resultMovie.type = "movie";
                            resultMovie.link = $(elementM).children().children("div.item__text").children("h1.headline").children().attr("href");
                            resultMovie.published = pubDate[0];
            
                            //console.log(resultMovie);
            
                            database.Review.create(resultMovie)
                            .then(function(dbReview) {
                                console.log(dbReview)
                                res.end();
                            })
                            .catch(function(err) {
                            
                            })
                        });
                    })
                    .catch(function(error3){

                    });
                })
                .catch(function(err) {
                })
            })

        })
    });

    var dbReviews;
    // Route for getting all Posts from db
    app.get("/", function(req, res) {
        database.Review.find({}).sort({published: "asc"})
        .then(function(dbReview) {
            //console.log(dbReview);
            dbReviews = dbReview;
            var games = [];
            var movies = [];

            for (var i=0; i<dbReview.length; i++) {
                if(dbReview[i].type === "game") {
                    games.push(dbReview[i]);
                } else {
                    movies.push(dbReview[i]);
                }
            }

            res.render("index", { games, movies });
        })
        .catch(function(err) {
            res.json(err);
        });
    });

    app.post("/purge", function(req, res) {

        database.Review.remove({clicks:[]}, function(err, response){
            console.log(response);
            res.end();
        })
    })

    app.post("/update", function(req, res) {
        console.log(req.body);

        var clickTime = moment();

        console.log(clickTime);

        database.Review.findOneAndUpdate({link: req.body.link}, {$push: {clicks: clickTime}})
        .then(function(dbreview){
            console.log(dbreview)
        })
        .catch(function(err) {
            res.json(err);
        });
    });

    app.get("/:desc", function(req, res) {
        database.Review.find({}).sort({published: -1})
        .then(function(dbReview) {
            //console.log(dbReview);
            dbReviews = dbReview;
            var games = [];
            var movies = [];

            for (var i=0; i<dbReview.length; i++) {
                if(dbReview[i].type === "game") {
                    games.push(dbReview[i]);
                } else {
                    movies.push(dbReview[i]);
                }
            }

            res.render("index", { games, movies });
        })
        .catch(function(err) {
            res.json(err);
        });
    });
}