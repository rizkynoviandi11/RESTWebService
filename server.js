'use strict';

const express    = require('express');        // call express
const app        = express();                 // define our app using express
const bodyParser = require('body-parser');
const request    = require('request');
const URL        = 'http://172.17.0.70:17088';
var fs           = require('fs');
var ip           = process.argv.slice(2);     // get ip from params
var count        = JSON.parse(fs.readFileSync('count.json', 'utf8'));

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = 80;        // set our port

// ROUTES FOR API
// =============================================================================
const router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working
router.get('/', function(req, res) {
    res.json({ message: 'Welcome to my api!' });
});

// more routes for API
router.route('/plus_one/:val')
    .get(function (req, res) {
        var value = parseInt(req.params.val);
        if(value){
            res.status(200).json({
                plusoneret: ++value,
                apiversion: 2
            });
        } else {
            res.status(404);
            res.json({
                detail: 'The requested URL was not found on the server.  If you entered the URL manually please check your spelling and try again.',
                status: 404,
                title: 'Not Found'
            });
        }
    }).all(function(req, res){
        res.status(405).json({
            detail: "method must be get",
            status: 405,
            title: "Wrong Method"
        });
    });

router.route('/hello')
    .post(function (req, res) {
        var nama = req.body.request;
        if(nama){
            request(URL, function(err, response, body){
                if(err)
                    console.log(err)
                else
                    count.visit++;
	                var resbody = JSON.parse(body);
	                res.status(200).json({
	                    apiversion: 2,
                        count: count.visit,
                        currentvisit: resbody.datetime,
                        response: "Good "+resbody.state+", "+nama
                    });
                    fs.writeFileSync('count.json', JSON.stringify(count, null, 2), 'utf-8');
                    nama = '';
	        });
        } else {
            res.status(400);
            res.json({
                detail: "'request' is a required property",
                status: 400,
                title: "Bad Request"
            });
        }
    }).all(function(req, res){
        res.status(405).json({
            detail: "method must be post",
            status: 405,
            title: "Wrong Method"
        });
    });

router.route('/spesifikasi.yaml')
    .get(function (req, res) {
        var spesificationDoc = '';
        fs.readFile('spesifikasi.yaml', 'utf8', function (err, data) {
            if(err)
                console.log(err);
            else
                spesificationDoc = data;
                spesificationDoc = spesificationDoc.replace('ALAMAT_BINDING_ANDA', ip);
                spesificationDoc = spesificationDoc.replace('PORT_ANDA', 80);
                res.status(200).send(spesificationDoc);
        });
    }).all(function(req, res){
        res.status(405).json({
            detail: "method must be get",
            status: 405,
            title: "Wrong Method"
        });
    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

//error handling

app.use(function(req, res, next){
    res.status(404).json(
        {
            detail: 'The requested URL was not found on the server.  If you entered the URL manually please check your spelling and try again.',
            status: 404,
            title: 'Not Found'
        });
});

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Starting server on port: ' + port);
