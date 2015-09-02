var port = 80;
var path = require("path");
var express = require("express");
var http = require('http');

var app = express();

// Declare web root
app.use(express.static(path.join(__dirname, "web")));

// Set default directory
app.get("/", function (req, res)
{
  res.sendfile(path.join(__dirname, "web/index.html"));
});

// Create node HTTP Server object
var server = http.createServer(app);

// Run HTTP Server
server.listen(port, function ()
{
  console.log("Server listening on port " + port);
});

//#region Socket.io

var io = require('socket.io')(server);

io.on('connection', function (socket)
{
  console.log('User connected');

  socket.on("stock get", function (data)
  {
    console.log("Stock get!");

    StockControl.StockGet(function (result)
    {
      socket.emit("stock get", result);
    }, data ? data.Name : null);
  });

});

//#endregion

//#region Mongo DB

var mongodb = require('mongodb');

var mongoClient = mongodb.MongoClient;

// Connect to Mongo database
mongoClient.connect('mongodb://localhost:27017/StockControl', function (err, db)
{
  console.log("Connected to MongoDB");

  if (err)
    throw err;

  Data.SetDatabase(db);
});

// Helper class for CRUD operations
// Don't worry too much about how this works internally
// Black box - ought to do its job.
class Data
{
  private static _db;

  // Store the Mongo DB object
  public static SetDatabase(db: any)
  {
    Data._db = db;
  }

  public static Get(collection: string, query: any, callback: Function)
  {
    var col = Data._db.collection(collection);

    query = query || {};

    col.find(query).toArray(function (err, results)
    {
      callback(results);
    });
  }

  public static Insert(collection: string, data: any, callback: Function)
  {
    var col = Data._db.collection(collection);

    col.insert(data, function (err, result)
    {
      console.log("Inserted into the " + collection + " collection");
      callback(result);
    });
  }

  public static Update(collection: string, query: any, setObj: any, callback: Function)
  {
    var col = Data._db.collection(collection);

    query = query || {};

    col.update(query, { $set: setObj }, function (err, result)
    {
      console.log("Updated the " + collection + " collection");
      callback(result);
    });
  }

  public static Delete(collection: string, query: any, callback: Function)
  {
    var col = Data._db.collection(collection);

    query = query || {};

    col.remove(query, function (err, result)
    {
      console.log("Deleted from the " + collection + " collection");
      callback(result);
    });
  }
}

//#endregion

class StockControl
{
  public static StockGet(callback: (result: Object) => void, name?: string)
  {
    Data.Get("Stock", name ? { Name: name } : null, function (result)
    {
      callback(result);
    });
  }

  public static StockAdd(name: string, quantity: number)
  {
    Data.Insert("Stock", { Name: name, Quantity: quantity }, function (result)
    {

    });
  }

  public static LogAdd(name: string, quantity: number, comment?: string)
  {
    Data.Insert("Log", { Name: name, Quantity: quantity, Comment: comment }, function (result)
    {
      // Done
    });
  }
}
