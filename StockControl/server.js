var port = process.env.PORT || 8080;
var path = require("path");
var express = require("express");
var bodyParser = require("body-parser");
var http = require('http');
var app = express();
var groupBy = function (arr, prop, nameProp) {
    var groups = {};
    for (var i = 0; i < arr.length; i++) {
        var p = arr[i][prop];
        if (!groups[p])
            groups[p] = { Name: arr[i][nameProp], Items: [] };
        groups[p].Items.push(arr[i]);
    }
    return groups;
};
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.locals.Helpers = Helpers;
app.use(express.static(path.join(__dirname, "web")));
app.use(bodyParser.urlencoded({ extended: false }));
app.get(["/", "/index"], function (req, res) {
    StockControl.StockGet(function (stock) {
        var groups = groupBy(stock, "StockGroupId", "StockGroup");
        Audit.GetLogEntries(null, function (audit) {
            res.render("index", {
                stockGroups: groups,
                reorders: stock.filter(function (stk) { return stk.Quantity <= stk.Reorder; }),
                notifications: Audit.SortDesc(audit).slice(0, 6)
            });
        });
    });
});
app.get("/stock/new", function (req, res) {
    StockControl.StockGroupGet(function (groups) {
        res.render("stock/new", { success: req.query.success, stockGroups: groups });
    });
});
app.post("/stock/create", function (req, res) {
    var stockItem = {
        Name: req.body.name.trim(),
        StockGroupId: parseInt(req.body.group),
        Quantity: parseInt(req.body.quantity),
        Reorder: parseInt(req.body.reorder)
    };
    if (stockItem.Quantity === NaN || stockItem.Reorder === NaN) {
        res.redirect(303, "/stock/new?success=false");
        return;
    }
    StockControl.StockAdd(stockItem, function (result) {
        Audit.AddLog(Enums.AuditTypes.StockAdd, "Added item: " + stockItem.Name, stockItem);
        StockControl.StockGet(function (result) {
            io.sockets.emit(Helpers.Events.StockAdd, result[0]);
            res.redirect(303, "/stock/new?success=true");
        }, stockItem.Name);
    });
});
app.get("/stock/edit/:id?", function (req, res) {
    var id = req.params.id;
    StockControl.StockGet(function (results) {
        if (id) {
            if (results.length != 1) {
                res.render("stock/edit-list", { items: results });
                return;
            }
            StockControl.StockGroupGet(function (stockGroups) {
                res.render("stock/edit", { item: results[0], stockGroups: stockGroups });
            });
        }
        else {
            res.render("stock/editList", { success: req.query.success, items: results });
        }
    }, id ? parseInt(id) : null);
});
app.put("/stock/edit", function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var item = {
        Id: parseInt(req.body.Id),
        Name: req.body.name.trim(),
        StockGroupId: parseInt(req.body.group),
        Quantity: parseInt(req.body.quantity),
        Reorder: parseInt(req.body.reorder)
    };
    StockControl.StockGet(function (existingItems) {
        Data.Custom(function (db) {
            var query = "UPDATE Stock SET Name = '" + item.Name + "', Quantity = " + item.Quantity + ", Reorder = " + item.Reorder + ", StockGroupId = " + item.StockGroupId + " WHERE Id = " + item.Id;
            db.run(query, function () {
                Audit.AddLog(Enums.AuditTypes.StockUpdate, item.Name + " item Updated.", item, existingItems[0]);
                io.sockets.emit(Helpers.Events.StockUpdate, item);
                res.send(JSON.stringify({ Success: true }));
            });
        });
    }, item.Id);
});
app.delete("/stock/:id", function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var id = req.params.id;
    StockControl.StockGet(function (results) {
        if (results.filter(function (m) { return m.Id == id; }).length == 1) {
            Data.Delete("Stock", "Id = " + id, function () {
                Audit.AddLog(Enums.AuditTypes.StockRemove, "Deleted item: " + results[0].Name, null, results[0]);
                io.sockets.emit(Helpers.Events.StockDelete, id);
                res.send(JSON.stringify({ Success: true }));
            });
        }
    });
});
app.put("/stock/adjust/:id", function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var adjust = {
        Original: parseInt(req.body.Original),
        Quantity: parseInt(req.body.Quantity)
    };
    Data.Custom(function (db) {
        db.run("UPDATE Stock SET Quantity = " + adjust.Quantity + " WHERE Id = " + req.params.id, function () {
            Audit.AddLog(Enums.AuditTypes.StockAdjust, "Adjusted from " + adjust.Original + " to " + adjust.Quantity, adjust.Quantity, adjust.Original);
            io.emit(Helpers.Events.StockAdjust, { Id: req.params.id, Quantity: adjust.Quantity });
            res.send(JSON.stringify({ Success: true }));
        });
    });
});
app.get("/api/stock/:id", function (req, res) {
    StockControl.StockGet(function (result) {
        res.setHeader('Content-Type', 'application/json');
        if (result.length > 0) {
            res.send(JSON.stringify({ Success: true, Result: result[0] }));
        }
        else {
            res.send(JSON.stringify({ Success: false }));
        }
    }, req.params.id);
});
app.get("/api/stock/issue/:id", function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var id = parseInt(req.params.id);
    StockControl.StockGet(function (results) {
        if (results.length !== 1) {
            res.send(JSON.stringify({ Success: false, Message: "Stock item not found" }));
            return;
        }
        var item = results[0];
        if (item.Quantity < 1) {
            res.send(JSON.stringify({ Success: false, Message: "There are no remaining items of type \"" + item.Name + "\"" }));
            return;
        }
        Data.Update("Stock", { Quantity: --item.Quantity }, "Id = " + id, function () {
            Audit.AddLog(Enums.AuditTypes.StockIssue, "1 " + item.Name + " has been issued.", item.Quantity, item.Quantity + 1);
            io.emit(Helpers.Events.StockIssue, item);
            res.send(JSON.stringify({ Success: true, Quantity: item.Quantity }));
        });
        if (item.Quantity <= item.Reorder) {
        }
    }, id);
});
app.get("/stock-groups/new", function (req, res) {
    res.render("stock-groups/new", { success: req.query.success });
});
app.post("/stock-groups/create", function (req, res) {
    var stockGroup = {
        Name: req.body.name.trim()
    };
    StockControl.StockGroupAdd(stockGroup, function (result) {
        Audit.AddLog(Enums.AuditTypes.StockGroupAdd, "New group: ", stockGroup);
        res.redirect(303, "/stock-groups/new?success=true");
    });
});
app.get("/stock-groups/edit", function (req, res) {
    StockControl.StockGroupGet(function (data) {
        res.render("stock-groups/edit", { groups: data });
    });
});
app.put("/stock-groups/edit/:id", function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var grp = {
        Id: parseInt(req.params.id),
        Name: req.body.Name.trim()
    };
    StockControl.StockGroupGet(function (existingGroups) {
        Data.Update("StockGroups", { Name: grp.Name }, "Id = " + grp.Id, function () {
            Audit.AddLog(Enums.AuditTypes.StockGroupUpdate, "Updated group: " + grp.Id, grp, existingGroups[0]);
            io.emit(Helpers.Events.GroupUpdate, grp);
            res.send(JSON.stringify({ Success: true }));
        });
    }, grp.Id);
});
app.delete("/stock-groups/:id", function (req, res) {
    var id = parseInt(req.params.id);
    res.setHeader('Content-Type', 'application/json');
    Data.Custom(function (db) {
        db.all("SELECT * FROM Stock WHERE StockGroupId = " + id, function (err, rows) {
            if (rows.length > 0) {
                res.send(JSON.stringify({ Success: false, Message: "Cannot delete Stock Group with Stock Items still associated." }));
                return;
            }
            StockControl.StockGroupGet(function (existingGroups) {
                Data.Delete("StockGroups", "Id = " + sqlEscape(id), function () {
                    Audit.AddLog(Enums.AuditTypes.StockGroupRemove, "Removed group: " + id, null, existingGroups[0]);
                    io.emit(Helpers.Events.GroupDelete, id);
                    res.send(JSON.stringify({ Success: true, Message: "" }));
                });
            }, id);
        });
    });
});
app.get("/api/stock-groups", function (req, res) {
    StockControl.StockGroupGet(function (result) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Success: result.length > 0, Results: result }));
    });
});
app.get("/api/stock-groups/:id", function (req, res) {
    StockControl.StockGroupGet(function (result) {
        res.setHeader('Content-Type', 'application/json');
        if (result.length > 0) {
            res.send(JSON.stringify({ Success: true, Result: result[0] }));
        }
        else {
            res.send(JSON.stringify({ Success: false }));
        }
    }, req.params.id);
});
app.get("/audit(/index)?", function (req, res) {
    Audit.GetLogEntries(null, function (results) {
        results = Audit.SortDesc(results);
        res.render("audit/index", { audit: results.slice(0, 50) });
    });
});
var server = http.createServer(app);
server.listen(port, function () {
    console.log("Server listening on port " + port);
});
var io = require('socket.io')(server);
io.on('connection', function (socket) {
    console.log('User connected', socket.handshake.address);
});
var sqlEscape = function (str) {
    return (str + "").replace(/'/g, "''");
};
var sqlite3 = require('sqlite3').verbose();
var Data = (function () {
    function Data() {
    }
    Data.Init = function () {
        var db = new sqlite3.Database('stockcontrol.sqlite3');
        db.run("CREATE TABLE if not exists Stock (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Quantity INTEGER NOT NULL, Reorder INTEGER, StockGroupId INTEGER);");
        db.run("CREATE TABLE if not exists StockGroups (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL);");
        db.run("CREATE TABLE if not exists Audit (Id INTEGER PRIMARY KEY AUTOINCREMENT, AuditType INTEGER NOT NULL, Message TEXT NOT NULL, Timestamp TEXT NOT NULL, OriginalData TEXT, NewData TEXT);");
        Data._db = db;
    };
    Data.Get = function (table, query, callback) {
        Data._db.all("SELECT * FROM " + table + (query ? " WHERE " + query : ""), function (err, rows) {
            callback(rows);
        });
    };
    Data.GetTop = function (table, query, count, callback) {
        Data.Get(table, query, function (rows) {
            callback(rows.slice(0, count));
        });
    };
    Data.Insert = function (table, data) {
        if (data.length < 1)
            return;
        var props = "";
        var j = 0;
        for (var p in data[0])
            props += (j++ == 0 ? "" : ",") + p;
        for (var i = 0; i < data.length; i++) {
            var vals = "";
            j = 0;
            for (var p in data[i]) {
                var val = data[i][p];
                vals += j++ == 0 ? "" : ",";
                if (typeof (val) == "object")
                    val = JSON.stringify(val);
                if (typeof (val) == "string")
                    val = "'" + val + "'";
                vals += val;
            }
            var query = "INSERT INTO " + table + "(" + props + ") VALUES (" + vals + ")";
            Data._db.run(query);
        }
    };
    Data.Update = function (table, set, where, callback) {
        var setStr = "";
        var i = 0;
        for (var prop in set) {
            setStr += i++ == 0 ? "" : ",";
            var val = set[prop];
            setStr += prop + " = " + (typeof (val) == "string" ? "'" + sqlEscape(val) + "'" : val);
        }
        var query = "UPDATE " + table + " SET " + setStr + " WHERE " + where;
        Data._db.run(query, callback);
    };
    Data.Delete = function (table, where, callback) {
        Data._db.run("DELETE FROM " + table + " WHERE " + where, callback);
    };
    Data.Custom = function (query) {
        query(Data._db);
    };
    return Data;
})();
Data.Init();
var StockControl = (function () {
    function StockControl() {
    }
    StockControl.StockGet = function (callback, name) {
        Data.Custom(function (db) {
            var where = name ? " WHERE " + (typeof (name) == "number" ? "s.Id" : "s.Name") + " = '" + name + "'" : "";
            db.all("SELECT s.Id, s.Name, s.Quantity, s.Reorder, s.StockGroupId, sg.Name as 'StockGroup' FROM Stock s JOIN StockGroups sg ON s.StockGroupId = sg.Id" + where, function (err, rows) {
                callback(rows);
            });
        });
    };
    StockControl.StockAdd = function (item, callback) {
        Data.Insert("Stock", [item]);
        callback(item);
    };
    StockControl.StockGroupGet = function (callback, name) {
        Data.Get("StockGroups", typeof (name) == "number" ? "Id = " + name : name ? "Name = '" + name + "'" : null, function (result) {
            callback(result);
        });
    };
    StockControl.StockGroupAdd = function (group, callback) {
        Data.Insert("StockGroups", [group]);
        callback(group);
    };
    return StockControl;
})();
var Audit = (function () {
    function Audit() {
    }
    Audit.AddLog = function (t, entry, newData, originalData) {
        var audit = {
            AuditType: t,
            Message: entry,
            Timestamp: new Date().toString()
        };
        if (newData)
            audit.NewData = newData;
        if (originalData)
            audit.OriginalData = originalData;
        Data.Insert("Audit", [audit]);
        Data.Custom(function (db) {
            db.get("SELECT last_insert_rowid() as Id", function (err, row) {
                audit.Id = row.Id;
                io.emit(Helpers.Events.Notification, audit);
            });
        });
    };
    Audit.GetLogEntries = function (type, callback) {
        Data.GetTop("Audit", type ? { Title: type } : null, 100, function (results) {
            callback(results);
        });
    };
    Audit.SortDesc = function (arr) {
        return arr.sort(function (a, b) {
            var d1 = new Date(a.Timestamp);
            var d2 = new Date(b.Timestamp);
            return d1 > d2 ? -1 : d2 > d1 ? 1 : 0;
        });
    };
    Audit.Types = {
        StockIssue: "Stock Issue",
        StockAdd: "Stock Add",
        StockUpdate: "Stock Update",
        StockAdjust: "Stock Adjust",
        StockRemove: "Stock Delete",
        StockGroupAdd: "Stock Group Add",
        StockGroupUpdate: "Stock Group Update",
        StockGroupRemove: "Stock Group Delete"
    };
    return Audit;
})();
