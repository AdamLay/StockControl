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



//#region Set up routing

app.get("/", function (req, res) { res.render("index"); });

//#region Stock

// GET
app.get("/stock(/index)?", function (req, res) { res.render("stock/index") });

// GET
app.get("/stock/new", function (req, res)
{
  res.render("stock/new", { success: req.query.success });
});

// POST
app.post("/stock/create", function (req, res)
{
  var stockItem = {
    Name: req.body.name,
    Quantity: parseInt(req.body.quantity),
    Reorder: parseInt(req.body.reorder)
  };

  if (stockItem.Quantity === NaN || stockItem.Reorder === NaN)
  {
    res.redirect(303, "/stock/new?success=false");

    return;
  }

  var strItem = JSON.stringify(stockItem);

  StockControl.StockAdd(stockItem, (result) =>
  {
    if (result.result.ok)
    {
      Audit.AddLog(Audit.Types.StockAdd, "Stock item added: " + strItem);

      io.sockets.emit("stock add", stockItem);

      res.redirect(303, "/stock/new?success=true");
    }
    else
    {
      res.redirect(303, "/stock/new?success=false");
    }
  });
});

//GET /stock/Foo
app.get("/stock/:id", function (req, res)
{
  StockControl.StockGet((result) =>
  {
    res.setHeader('Content-Type', 'application/json');

    if (result.length > 0)
    {
      res.send(JSON.stringify({ Success: true, Result: result[0] }));
    }
    else
    {
      res.send(JSON.stringify({ Success: false }));
    }
  }, req.params.id);
});

//#endregion

//#region Stock Groups

app.get("/stock-groups/new", function (req, res)
{
  res.render("stock-groups/new", { success: req.query.success });
});

// POST
app.post("/stock-groups/create", function (req, res)
{
  var stockGroup = {
    Name: req.body.name
  };
  
  var strGroup = JSON.stringify(stockGroup);

  StockControl.StockGroupAdd(stockGroup, (result) =>
  {
    if (result.result.ok)
    {
      Audit.AddLog(Audit.Types.StockGroupAdd, "Stock group added: " + strGroup);
      
      res.redirect(303, "/stock-groups/new?success=true");
    }
    else
    {
      res.redirect(303, "/stock-groups/new?success=false");
    }
  });
});

//GET /stock-groups/Foo
app.get("/stock-groups/:id", function (req, res)
{
  StockControl.StockGroupGet((result) =>
  {
    res.setHeader('Content-Type', 'application/json');

    if (result.length > 0)
    {
      res.send(JSON.stringify({ Success: true, Result: result[0] }));
    }
    else
    {
      res.send(JSON.stringify({ Success: false }));
    }
  }, req.params.id);
});

//#endregion

//#region Audit

app.get("/audit(/index)?", function (req, res)
{
  Audit.GetLogEntries(null, function (results)
  {
    res.render("audit/index", { audit: results });
  });
});

//#endregion

//#endregion

// Create node HTTP Server object
var server = http.createServer(app);

// Run HTTP Server
server.listen(port, function ()
{
  console.log("Server listening on port " + port);
});

//#region Socket.io

var io = require('socket.io')(server);

// This just established a "full duplex" two way communication channel (websockets) with the client
io.on('connection', function (socket)
{
  // The socket object is what we'll use to attach to and sent events
  
  console.log('User connected');

  // When the server receives a "stock get" event, it will run this function...
  socket.on("stock get", function (data)
  {
    // The data parameter has any data in it that's been passed up from the client

    console.log("Stock get!");

    // StockGet is a function that takes a callback function as a parameter
    StockControl.StockGet(function (result)
    {
      // Now we're inside the callback function, and have access to the "result" object which has our stock in it

      // The socket will emit a "stock get" event, so the client can pick up on it
      socket.emit("stock get", result);

    }, data ? data.Name : null);
  });
});


//#endregion

//#region Mongo DB
// Interesting, but don't really worry about anything in here as you don't need to change it

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

  public static GetTop(collection: string, query: any, count: number, callback: Function)
  {
    var col = Data._db.collection(collection);

    query = query || {};

    col.find(query).sort({ _id: -1 }).limit(count).toArray(function (err, results)
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
  public static StockGet(callback: (result: Array<any>) => void, name?: string): void
  {
    Data.Get("Stock", name ? { Name: name } : null, function (result)
    {
      callback(result);
    });
  }

  public static StockAdd(item: IStockItem, callback: (result) => void): void
  {
    Data.Insert("Stock", item, function (result)
    {
      callback(result);
    });
  }

  public static StockGroupGet(callback: (result: Array<any>) => void, name?: string): void
  {
    Data.Get("StockGroups", name ? { Name: name } : null, function (result)
    {
      callback(result);
    });
  }

  public static StockGroupAdd(group: IStockGroup, callback: (result) => void): void
  {
    Data.Insert("StockGroups", group, function (result)
    {
      callback(result);
    });
  }
}

class Audit
{
  public static Types = {
    StockAdd: "Stock Add",
    StockUpdate: "Stock Update",
    StockGroupAdd: "Stock Group Add"
  }

  public static AddLog(title: string, entry: string): void
  {
    Data.Insert("Audit", { Title: title, Message: entry, Timestamp: new Date() }, function (result)
    {

    });
  }

  public static GetLogEntries(type: string, callback: Function)
  {
    Data.GetTop("Audit", type ? { Title: type } : null, 100, function (results)
    {
      callback(results);
    });
  }
}
