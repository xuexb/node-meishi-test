var request = require('request-regexp');
var open = require('open');
var express = require('express');
var app = express();
var data = require('./lib/data.json');




/**
 * 主页
 */
app.get('/', function(req, res) {
    res.json({
        error: 0,
        msg: 'meishichina for API'
    });
});


/**
 * 菜谱列表
 */
app.get('/recipe/', function(req, res) {
    var page = parseInt(req.query.page, 10) || 1;

    request({
        url: data.recipe_list.url.replace('{page}', page),
        regexp: {
            list: data.recipe_list.regexp
        }
    }, function(error, response, body) {
        var json = {};
        if (error) {
            json.error = 1;
            json.msg = error.message;
        } else {
            json.error = 0;
            json.list = [];
            body.list.forEach(function(value){
                json.list.push({
                    url: value[0],
                    value: value[1],
                    id: parseInt((value[0].match(data.recipe_item.id_regexp)||['', ''])[1], 10) || null
                });
            });
        }

        res.json(json);
    });
});



/**
 * 菜谱详情页
 */
app.get(/^\/recipe\/([1-9]\d+)\/?$/, function(req, res) {
    var id = parseInt(req.params[0], 10) || null;
    var json = {};

    if(!id){
        json.error = 1;
        json.msg = 'ID is empty!';
        return res.json(json);
    }

    request({
        url: data.recipe_item.url.replace('{id}', id),
        regexp: {
            img: data.recipe_item.img_regexp,
            text: data.recipe_item.text_regexp
        }
    }, function(error, response, body) {
        if (error) {
            json.error = 1;
            json.msg = error.message;
        } else {
            json.error = 0;
            if(body.img && body.img.length){
               json.img = JSON.parse(body.img[0][0]);
            }

            if(body.text && body.text.length){
                json.content = JSON.parse(body.text[0][0]);
            }

            if(!json.img && !json.content){
                json.error = 1;
                json.msg = '404';
            }
        }

        res.json(json);
    });
});

app.get("*", function(req, res) {
    res.status(404);
    res.send('404');
});
app.listen(81);

open('http://127.0.0.1:81/recipe/198445');