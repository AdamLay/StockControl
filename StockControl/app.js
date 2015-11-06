var port = 1337;
var path = require("path");
var express = require("express");
var bodyParser = require("body-parser");
var http = require('http');
var app = express();
// Set up view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
// Middleware
app.use(express.static(path.join(__dirname, "web")));
app.use(bodyParser.urlencoded({ extended: false }));
// Set up routing
app.get("/", function (req, res) { res.render('index'); });
app.get("/stock/add", function (req, res) {
    res.render("stock/add", { success: req.query.success });
});
app.post("/stock/add", function (req, res) {
    var name = req.body.name;
    var qty = req.body.quantity;
    console.log("Stock add POST: " + name + ", " + qty);
    res.redirect(303, "/stock/add?success=true");
});
// Create node HTTP Server object
var server = http.createServer(app);
// Run HTTP Server
server.listen(port, function () {
    console.log("Server listening on port " + port);
});
//#region Socket.io
var io = require('socket.io')(server);
// This just established a "full duplex" two way communication channel (websockets) with the client
io.on('connection', function (socket) {
    // The socket object is what we'll use to attach to and sent events
    console.log('User connected');
    // When the server receives a "stock get" event, it will run this function...
    socket.on("stock get", function (data) {
        // The data parameter has any data in it that's been passed up from the client
        console.log("Stock get!");
        // StockGet is a function that takes a callback function as a parameter
        StockControl.StockGet(function (result) {
            // Now we're inside the callback function, and have access to the "result" object which has our stock in it
            // The socket will emit a "stock get" event, so the client can pick up on it
            socket.emit("stock get", result);
        }, data ? data.Name : null);
    });
    // Need a "stock add" event here, in the same format as the one above
    // The data ought to have Name and Quantity properties which can be passed to StockControl.StockAdd
    socket.on("stock add", function (data) {
        StockControl.StockAdd(data.name, data.quantity, function (result) {
            socket.emit("stock add", data);
        });
    });
});
//#endregion
//#region Mongo DB
// Interesting, but don't really worry about anything in here as you don't need to change it
var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
// Connect to Mongo database
mongoClient.connect('mongodb://localhost:27017/StockControl', function (err, db) {
    console.log("Connected to MongoDB");
    if (err)
        throw err;
    Data.SetDatabase(db);
});
// Helper class for CRUD operations
// Don't worry too much about how this works internally
// Black box - ought to do its job.
var Data = (function () {
    function Data() {
    }
    // Store the Mongo DB object
    Data.SetDatabase = function (db) {
        Data._db = db;
    };
    Data.Get = function (collection, query, callback) {
        var col = Data._db.collection(collection);
        query = query || {};
        col.find(query).toArray(function (err, results) {
            callback(results);
        });
    };
    Data.Insert = function (collection, data, callback) {
        var col = Data._db.collection(collection);
        col.insert(data, function (err, result) {
            console.log("Inserted into the " + collection + " collection");
            callback(result);
        });
    };
    Data.Update = function (collection, query, setObj, callback) {
        var col = Data._db.collection(collection);
        query = query || {};
        col.update(query, { $set: setObj }, function (err, result) {
            console.log("Updated the " + collection + " collection");
            callback(result);
        });
    };
    Data.Delete = function (collection, query, callback) {
        var col = Data._db.collection(collection);
        query = query || {};
        col.remove(query, function (err, result) {
            console.log("Deleted from the " + collection + " collection");
            callback(result);
        });
    };
    return Data;
})();
//#endregion
// StockControl class is grouping some helper functions that
// make it easier for us to get and add stock
var StockControl = (function () {
    function StockControl() {
    }
    /*
     * callback: (result: Object) => void
     * callback is the name of the parameter
     * () => foo is called a lambda, it's shorthand for a function
     * (result: Object) means the function will take a parameter called result, and it will be an Object
     * => void means it returns void (doesn't return anything)
     */
    /*
     * name?: string
     * ? means it's an optional parameter
     * : string means the parameter will be a string
     */
    StockControl.StockGet = function (callback, name) {
        Data.Get("Stock", name ? { Name: name } : null, function (result) {
            // Inside this bit, we've gotten the data from mongo and it's now inside a "result" object
            // We're calling the callback function, and passing the resulting mongo data to it
            callback(result);
        });
    };
    StockControl.StockAdd = function (name, quantity, callback) {
        Data.Insert("Stock", { Name: name, Quantity: quantity }, function (result) {
            // What do we want to happen when stock is added?
            callback(result);
        });
    };
    StockControl.LogAdd = function (name, quantity, comment) {
        Data.Insert("Log", { Name: name, Quantity: quantity, Comment: comment }, function (result) {
            // What do we want to happen when a log entry is added?
        });
    };
    return StockControl;
})();
