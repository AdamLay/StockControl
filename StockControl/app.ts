var port = process.env.PORT || 8080;
var path = require("path");
var express = require("express");
var bodyParser = require("body-parser");
var http = require('http');

var app = express();

//#region helpers

var groupBy = function (arr, prop)
{
  var groups = {};

  for (var i = 0; i < arr.length; i++)
  {
    var p = arr[i][prop];

    if (!groups[p])
      groups[p] = [];

    groups[p].push(arr[i]);
  }

  return groups;
};

//#endregion

// Set up view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Middleware
app.use(express.static(path.join(__dirname, "web")));
app.use(bodyParser.urlencoded({ extended: false }));

//#region Set up routing

app.get(["/", "/index"], function (req, res)
{
  StockControl.StockGet(function (stock)
  {
    var groups = groupBy(stock, "StockGroup");

    Audit.GetLogEntries(null, function (audit)
    {
      res.render("index",
        {
          stockGroups: groups,
          notifications: Audit.SortDesc(audit).slice(0, 6)
        });
    });
  });
});

//#region Stock

// GET
app.get("/stock(/index)?", function (req, res)
{
  StockControl.StockGet(function (data)
  {
    var groups = groupBy(data, "StockGroup");

    res.render("stock/index", { stockGroups: groups });
  });
});

//GET /stock/Foo
app.get("/api/stock/:id", function (req, res)
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

// GET
app.get("/stock/new", function (req, res)
{
  res.render("stock/new", { success: req.query.success });
});

// POST
app.post("/stock/create", function (req, res)
{
  var stockItem = {
    Name: req.body.name.trim(),
    StockGroupId: req.body.group,
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
    Audit.AddLog(Audit.Types.StockAdd, "Stock item added: " + strItem);

    io.sockets.emit("stock add", stockItem);

    res.redirect(303, "/stock/new?success=true");
  });
});

// DELETE /Stock/1
app.delete("/stock/:id", function (req, res)
{
  var id = req.params.id;

  StockControl.StockGet(function (results)
  {
    if (results.filter((m) => { return m.Id == id; }).length == 1)
    {
      StockControl.StockRemove({ Id: id });

      Audit.AddLog(Audit.Types.StockRemove, "Stock item deleted: " + results[0].Name);
    }
  });
});

// GET
app.get("/stock/edit/:id?", function (req, res)
{
  var id = req.params.id;

  if (id)
  {
    StockControl.StockGet(function (results)
    {
      if (results.length != 1)
      {
        res.render("stock/edit-list");
        return;
      }

      res.render("stock/edit", { item: results[0] });

    }, parseInt(id));
  }
  else
  {
    res.render("stock/edit-list");
  }
});

// GET
app.get("/api/stock/issue/:id", function (req, res)
{
  res.setHeader('Content-Type', 'application/json');

  var id = parseInt(req.params.id);

  StockControl.StockGet(function (results)
  {
    if (results.length !== 1)
    {
      res.send(JSON.stringify({ Success: false, Message: "Stock item not found" }));
      return;
    }

    var item = results[0];

    if (item.Quantity < 1)
    {
      res.send(JSON.stringify({ Success: false, Message: "There are no remaining items of type \"" + item.Name + "\"" }));
      return;
    }

    Data.Update("Stock", { Quantity: --item.Quantity }, "Id = " + id);

    Audit.AddLog(Audit.Types.StockIssue, "1 " + item.Name + " has been issued.");
    
    res.send(JSON.stringify({ Success: true, Quantity: item.Quantity }));

    io.emit("stock issue", item);

  }, id);
});

//#endregion

//#region Stock Groups

//GET 
app.get("/stock-groups/new", function (req, res)
{
  res.render("stock-groups/new", { success: req.query.success });
});

//POST
app.post("/stock-groups/create", function (req, res)
{
  var stockGroup = {
    Name: req.body.name.trim()
  };

  var strGroup = JSON.stringify(stockGroup);

  StockControl.StockGroupAdd(stockGroup, (result) =>
  {
    Audit.AddLog(Audit.Types.StockGroupAdd, "Stock group added: " + strGroup);

    res.redirect(303, "/stock-groups/new?success=true");
  });
});

//GET
app.get("/api/stock-groups", function (req, res)
{
  StockControl.StockGroupGet((result) =>
  {
    res.setHeader('Content-Type', 'application/json');

    res.send(JSON.stringify({ Success: result.length > 0, Results: result }));
  });
});

//GET /api/stock-groups/Foo
app.get("/api/stock-groups/:id", function (req, res)
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

//GET
app.get("/stock-groups/edit", function (req, res)
{
  StockControl.StockGroupGet(function (data)
  {
    res.render("stock-groups/edit", { groups: data });
  });
});

//PUT
app.put("/stock-groups/:id", function (req, res)
{
  Data.Update("StockGroups", { Name: req.body.Name }, "Id = " + req.params.id);

  Audit.AddLog(Audit.Types.StockGroupUpdate, "Stock group updated: " + req.params.id + " = " + req.body.Name);

  res.setHeader('Content-Type', 'application/json');

  res.send(JSON.stringify({ Success: true }));
});

//DELETE
app.delete("/stock-groups/:id", function (req, res)
{
  var id = req.params.id;

  res.setHeader('Content-Type', 'application/json');

  Data.Custom(function (db)
  {
    db.all("SELECT * FROM Stock WHERE StockGroupId = " + id, function (err, rows)
    {
      if (rows.length == 0)
      {

        Data.Delete("StockGroups", "Id = " + sqlEscape(id));

        Audit.AddLog(Audit.Types.StockGroupRemove, "Stock group removed: " + id);

        res.send(JSON.stringify({ Success: true, Message: "" }));
      }
      else
      {
        res.send(JSON.stringify({ Success: false, Message: "Cannot delete Stock Group with Stock Items still associated." }));
      }
    });
  });
});

//#endregion

//#region Audit

//GET
app.get("/audit(/index)?", function (req, res)
{
  Audit.GetLogEntries(null, function (results)
  {
    // Sort by date descending
    results = Audit.SortDesc(results);

    // Return first 50 results
    res.render("audit/index", { audit: results.slice(0, 50) });
  });
});

//#endregion

//#endregion

//#region Server

// Create node HTTP Server object
var server = http.createServer(app);

// Run HTTP Server
server.listen(port, function ()
{
  console.log("Server listening on port " + port);
});

//#endregion

//#region Socket.io

var io = require('socket.io')(server);

io.on('connection', function (socket)
{
  console.log('User connected', socket.handshake.address);

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

//#region Sqlite3

var sqlEscape = function (str)
{
  return (str + "").replace(/'/g, "''");
}

var sqlite3 = require('sqlite3').verbose();

class Data
{
  // Sqlite3 Database
  private static _db;

  public static Init()
  {
    var db = new sqlite3.Database('stockcontrol.sqlite3');

    // Create Stock Table
    db.run("CREATE TABLE if not exists Stock (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Quantity INTEGER NOT NULL, Reorder INTEGER, StockGroupId INTEGER);");

    // Create Stock Groups Table
    db.run("CREATE TABLE if not exists StockGroups (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL);");

    // Create Stock Groups Table
    db.run("CREATE TABLE if not exists Audit (Id INTEGER PRIMARY KEY AUTOINCREMENT, Title TEXT NOT NULL, Message TEXT NOT NULL, Timestamp TEXT NOT NULL);");

    Data._db = db;
  }

  public static Get(table: string, query: string, callback: Function)
  {
    Data._db.all("SELECT * FROM " + table + (query ? " WHERE " + query : ""), function (err, rows)
    {
      callback(rows);
    });
  }

  public static GetTop(table: string, query: any, count: number, callback: Function)
  {
    Data.Get(table, query, function (rows)
    {
      callback(rows.slice(0, count));
    });
  }
  
  // Will work provided the object matches table structure
  public static Insert(table: string, data: Array<Object>)
  {
    if (data.length < 1)
      return;

    var props = "";

    var j = 0;

    for (var p in data[0])
      props += (j++ == 0 ? "" : ",") + p;

    for (var i = 0; i < data.length; i++)
    {
      var vals = "";

      j = 0;

      for (var p in data[i])
      {
        vals += j++ == 0 ? "" : ",";

        var val = data[i][p];

        if (typeof (val) == "string")
          vals += "'" + val + "'";
        else
          vals += val;
      }

      var query = "INSERT INTO " + table + "(" + props + ") VALUES (" + vals + ")";

      Data._db.run(query);
    }
  }

  public static Update(table: string, set: Object, where: string)
  {
    var setStr = "";

    var i = 0;

    for (var prop in set)
    {
      setStr += i++ == 0 ? "" : ",";

      var val = set[prop];

      setStr += prop + " = " + (typeof (val) == "string" ? "'" + sqlEscape(val) + "'" : val);
    }

    var query = "UPDATE " + table + " SET " + setStr + " WHERE " + where
    
    Data._db.run(query);
  }

  public static Delete(table: string, where: string)
  {
    Data._db.run("DELETE FROM " + table + " WHERE " + where);
  }

  public static Custom(query: (db: any) => void)
  {
    query(Data._db);
  }
}

Data.Init();

//#endregion

class StockControl
{
  public static StockGet(callback: (result: Array<any>) => void, name?: string | number): void
  {
    Data.Custom(function (db)
    {
      var where = name ? " WHERE " + (typeof (name) == "number" ? "s.Id" : "s.Name") + " = '" + name + "'" : "";

      db.all("SELECT s.Id, s.Name, s.Quantity, s.Reorder, sg.Name as 'StockGroup' FROM Stock s JOIN StockGroups sg ON s.StockGroupId = sg.Id" + where, function (err, rows)
      {
        callback(rows);
      });
    });
  }

  public static StockAdd(item: IStockItem, callback: (result) => void): void
  {
    Data.Insert("Stock", [item]);

    callback(item);
  }

  public static StockRemove(item: IModel): void
  {
    Data.Delete("Stock", "Id = " + item.Id);
  }

  public static StockGroupGet(callback: (result: Array<any>) => void, name?: string): void
  {
    Data.Get("StockGroups", name ? "Name = '" + name + "'" : null, function (result)
    {
      callback(result);
    });
  }

  public static StockGroupAdd(group: IStockGroup, callback: (result) => void): void
  {
    Data.Insert("StockGroups", [group]);

    callback(group);
  }

  public static StockGroupRemove(group: IModel): void
  {
    Data.Delete("StockGroups", "Id = " + group.Id);
  }
}

class Audit
{
  public static Types = {
    StockIssue: "Stock Issue",
    StockAdd: "Stock Add",
    StockUpdate: "Stock Update",
    StockRemove: "Stock Delete",
    StockGroupAdd: "Stock Group Add",
    StockGroupUpdate: "Stock Group Update",
    StockGroupRemove: "Stock Group Delete"
  }

  public static AddLog(title: string, entry: string): void
  {
    var audit: IAuditEntry = { Title: title, Message: entry, Timestamp: new Date().toString() };

    Data.Insert("Audit", [audit]);

    io.emit("notification", audit);
  }

  public static GetLogEntries(type: string, callback: Function)
  {
    Data.GetTop("Audit", type ? { Title: type } : null, 100, function (results)
    {
      callback(results);
    });
  }

  public static SortDesc(arr: Array<IAuditEntry>): Array<IAuditEntry>
  {
    return arr.sort(function (a, b)
    {
      var d1 = new Date(a.Timestamp);
      var d2 = new Date(b.Timestamp);

      return d1 > d2 ? -1 : d2 > d1 ? 1 : 0;
    });
  }
}
