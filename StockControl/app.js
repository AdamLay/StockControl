var port = 1337;
var path = require("path");
var express = require("express");
var http = require('http');
var app = express();
// Declare web root
app.use(express.static(path.join(__dirname, "web")));
// Set default directory
app.get("/", function (req, res) {
    res.sendfile(path.join(__dirname, "web/index.html"));
});
// Create node HTTP Server object
var server = http.createServer(app);
// Run HTTP Server
server.listen(port, function () {
    console.log("Server listening on port " + port);
});
//#region Socket.io
var io = require('socket.io')(server);
io.on('connection', function (socket) {
    console.log('User connected');
    socket.on("stock get", function (data) {
        console.log("Stock get!");
        StockControl.StockGet(function (result) {
            socket.emit("stock get", result);
        }, data ? data.Name : null);
    });
});
//#endregion
//#region Mongo DB
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
var StockControl = (function () {
    function StockControl() {
    }
    StockControl.StockGet = function (callback, name) {
        Data.Get("Stock", name ? { Name: name } : null, function (result) {
            callback(result);
        });
    };
    StockControl.StockAdd = function (name, quantity) {
        Data.Insert("Stock", { Name: name, Quantity: quantity }, function (result) {
        });
    };
    StockControl.LogAdd = function (name, quantity, comment) {
        Data.Insert("Log", { Name: name, Quantity: quantity, Comment: comment }, function (result) {
            // Done
        });
    };
    return StockControl;
})();
//# sourceMappingURL=app.js.map