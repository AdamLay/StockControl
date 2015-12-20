var port = process.env.PORT || 8080;
var path = require("path");
var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var http = require("http");
var bcrypt = require("bcrypt");
var uuid = require("uuid");
var app = express();
//#region helpers
var helpers = require("./web/js/Helpers.js");
var errors = helpers.ErrorCodes;
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
//#endregion
// Set up view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.locals.Helpers = helpers;
// Middleware
app.use(express.static(path.join(__dirname, "web")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: "sc" }));
var unauthRoutes = [
    "/login",
    "/register"
];
// Authentication...
app.use(function (req, res, next) {
    console.log(req.method + " " + req.url);
    // Check to see if route needs auth
    for (var i = 0; i < unauthRoutes.length; i++)
        if (req.url == unauthRoutes[i]) {
            next();
            return;
        }
    var user = {
        Username: req.session.username || "",
        AuthToken: ""
    };
    Authentication.IsValid(user, function (valid) {
        if (!valid) {
            res.redirect("/login");
        }
        else {
            res.header("auth-username", user.Username);
        }
        next();
    });
});
//#region Set up routing
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
//#region Auth
// GET
app.get("/login", function (req, res) {
    res.render("auth/login", { hideHeader: true });
});
// POST
app.post("/login", function (req, res) {
    var user = {
        Username: req.body.username.trim(),
        Password: req.body.password
    };
    Authentication.Login(user.Username, user.Password, function (success) {
        if (!success) {
            res.redirect("/login?success=false");
            return;
        }
        req.session.username = user.Username;
        res.redirect("/index");
    });
});
// GET
app.get("/register", function (req, res) {
    res.render("auth/register", { hideHeader: true });
});
// POST
app.post("/register", function (req, res) {
    var usr = req.body.username.trim();
    var pwd1 = req.body.password;
    var pwd2 = req.body.passwordConfirm;
    if (pwd1 != pwd2) {
        res.redirect("/register?success=false&err=" + helpers.ErrorCodes.PasswordsDontMatch);
        return;
    }
    Authentication.Register(usr, pwd1, function (success) {
        if (success) {
            Authentication.Login(usr, pwd1, function () {
                res.redirect("/index");
            });
        }
        else {
            res.redirect("/register?success=false&err=" + helpers.ErrorCodes.UserExists);
        }
    });
});
//#endregion
//#region Stock
// GET
app.get("/stock/new", function (req, res) {
    StockControl.StockGroupGet(function (groups) {
        res.render("stock/new", { success: req.query.success, stockGroups: groups });
    });
});
// POST (new)
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
        Audit.AddLog(Audit.Types.StockAdd, "Added item: " + stockItem.Name, stockItem);
        StockControl.StockGet(function (result) {
            io.sockets.emit(helpers.Events.StockAdd, result[0]);
            res.redirect(303, "/stock/new?success=true");
        }, stockItem.Name);
    });
});
// GET
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
// PUT (update)
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
                Audit.AddLog(Audit.Types.StockUpdate, item.Name + " item Updated.", item, existingItems[0]);
                io.sockets.emit(helpers.Events.StockUpdate, item);
                res.send(JSON.stringify({ Success: true }));
            });
        });
    }, item.Id);
});
// DELETE /Stock/1
app.delete("/stock/:id", function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var id = req.params.id;
    StockControl.StockGet(function (results) {
        if (results.filter(function (m) { return m.Id == id; }).length == 1) {
            Data.Delete("Stock", "Id = " + id, function () {
                Audit.AddLog(Audit.Types.StockRemove, "Deleted item: " + results[0].Name, null, results[0]);
                io.sockets.emit(helpers.Events.StockDelete, id);
                res.send(JSON.stringify({ Success: true }));
            });
        }
    });
});
// PUT
app.put("/stock/adjust/:id", function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var adjust = {
        Original: parseInt(req.body.Original),
        Quantity: parseInt(req.body.Quantity)
    };
    Data.Custom(function (db) {
        db.run("UPDATE Stock SET Quantity = " + adjust.Quantity + " WHERE Id = " + req.params.id, function () {
            Audit.AddLog(Audit.Types.StockAdjust, "Adjusted from " + adjust.Original + " to " + adjust.Quantity, adjust.Quantity, adjust.Original);
            io.emit(helpers.Events.StockAdjust, { Id: req.params.id, Quantity: adjust.Quantity });
            res.send(JSON.stringify({ Success: true }));
        });
    });
});
// /api GET
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
// /api GET
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
        // Update in database
        Data.Update("Stock", { Quantity: --item.Quantity }, "Id = " + id, function () {
            // Add audit log
            Audit.AddLog(Audit.Types.StockIssue, "1 " + item.Name + " has been issued.", item.Quantity, item.Quantity + 1);
            // Trigger stock issue event
            io.emit(helpers.Events.StockIssue, item);
            // Send response
            res.send(JSON.stringify({ Success: true, Quantity: item.Quantity }));
        });
        if (item.Quantity <= item.Reorder) {
        }
    }, id);
});
//#endregion
//#region Stock Groups
// GET
app.get("/stock-groups/new", function (req, res) {
    res.render("stock-groups/new", { success: req.query.success });
});
// POST
app.post("/stock-groups/create", function (req, res) {
    var stockGroup = {
        Name: req.body.name.trim()
    };
    StockControl.StockGroupAdd(stockGroup, function (result) {
        Audit.AddLog(Audit.Types.StockGroupAdd, "New group: ", stockGroup);
        res.redirect(303, "/stock-groups/new?success=true");
    });
});
// GET
app.get("/stock-groups/edit", function (req, res) {
    StockControl.StockGroupGet(function (data) {
        res.render("stock-groups/edit", { groups: data });
    });
});
// PUT (update)
app.put("/stock-groups/edit/:id", function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var grp = {
        Id: parseInt(req.params.id),
        Name: req.body.Name.trim()
    };
    StockControl.StockGroupGet(function (existingGroups) {
        Data.Update("StockGroups", { Name: grp.Name }, "Id = " + grp.Id, function () {
            Audit.AddLog(Audit.Types.StockGroupUpdate, "Updated group: " + grp.Id, grp, existingGroups[0]);
            io.emit(helpers.Events.GroupUpdate, grp);
            res.send(JSON.stringify({ Success: true }));
        });
    }, grp.Id);
});
// DELETE
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
                    Audit.AddLog(Audit.Types.StockGroupRemove, "Removed group: " + id, null, existingGroups[0]);
                    io.emit(helpers.Events.GroupDelete, id);
                    res.send(JSON.stringify({ Success: true, Message: "" }));
                });
            }, id);
        });
    });
});
// /api GET
app.get("/api/stock-groups", function (req, res) {
    StockControl.StockGroupGet(function (result) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Success: result.length > 0, Results: result }));
    });
});
// /api GET
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
//#endregion
//#region Audit
// GET
app.get("/audit(/index)?", function (req, res) {
    Audit.GetLogEntries(null, function (results) {
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
server.listen(port, function () {
    console.log("Server listening on port " + port);
});
//#endregion
//#region Socket.io
var io = require('socket.io')(server);
io.on('connection', function (socket) {
    console.log('User connected', socket.handshake.address);
});
//#endregion
//#region Sqlite3
var sqlEscape = function (str) {
    return (str + "").replace(/'/g, "''");
};
var sqlite3 = require('sqlite3').verbose();
var Data = (function () {
    function Data() {
    }
    Data.Init = function () {
        var db = new sqlite3.Database('stockcontrol.sqlite3');
        // Create Stock Table
        db.run("CREATE TABLE if not exists Stock (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Quantity INTEGER NOT NULL, Reorder INTEGER, StockGroupId INTEGER);");
        // Create Stock Groups Table
        db.run("CREATE TABLE if not exists StockGroups (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL);");
        // Create Stock Groups Table
        db.run("CREATE TABLE if not exists Audit (Id INTEGER PRIMARY KEY AUTOINCREMENT, Title TEXT NOT NULL, Message TEXT NOT NULL, Timestamp TEXT NOT NULL, OriginalData TEXT, NewData TEXT);");
        // Create Users Table
        db.run("CREATE TABLE if not exists Users (Id INTEGER PRIMARY KEY AUTOINCREMENT, Username TEXT NOT NULL, Password TEXT NOT NULL);");
        // Create AuthTokens Table
        db.run("CREATE TABLE if not exists AuthTokens (Token TEXT PRIMARY KEY, Username TEXT NOT NULL);");
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
    // Will work provided the object matches table structure
    Data.Insert = function (table, data, callback) {
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
            Data._db.run(query, callback);
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
//#endregion
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
        Data.Insert("Stock", [item], function () {
            callback(item);
        });
    };
    StockControl.StockGroupGet = function (callback, name) {
        Data.Get("StockGroups", typeof (name) == "number" ? "Id = " + name : name ? "Name = '" + name + "'" : null, function (result) {
            callback(result);
        });
    };
    StockControl.StockGroupAdd = function (group, callback) {
        Data.Insert("StockGroups", [group], function () {
            callback(group);
        });
    };
    return StockControl;
})();
var Audit = (function () {
    function Audit() {
    }
    Audit.AddLog = function (title, entry, newData, originalData) {
        var audit = {
            Title: title,
            Message: entry,
            Timestamp: new Date().toString()
        };
        if (newData)
            audit.NewData = newData;
        if (originalData)
            audit.OriginalData = originalData;
        Data.Insert("Audit", [audit], function () {
            Data.Custom(function (db) {
                db.get("SELECT last_insert_rowid() as Id", function (err, row) {
                    audit.Id = row.Id;
                    io.emit(helpers.Events.Notification, audit);
                });
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
var Authentication = (function () {
    function Authentication() {
    }
    Authentication.Register = function (username, pwd, callback) {
        Data.Get("Users", "Username = '" + username + "'", function (results) {
            if (results.length > 0) {
                callback(false);
                return;
            }
            bcrypt.hash(pwd, 10, function (err, hash) {
                Data.Insert("Users", [{ Username: username, Password: hash }], function () {
                    callback(true);
                });
            });
        });
    };
    Authentication.Login = function (username, pwd, callback) {
        Data.Get("Users", "Username = '" + username + "'", function (results) {
            if (results.length < 1) {
                callback(false);
                return;
            }
            var usr = results[0];
            bcrypt.compare(pwd, usr.Password, function (err, res) {
                if (res) {
                    var newToken = {
                        Token: uuid.v1(),
                        Username: username
                    };
                    Data.Insert("AuthTokens", [newToken], function () {
                        callback(res);
                    });
                }
                else {
                    callback(res);
                }
            });
        });
    };
    Authentication.IsValid = function (user, callback) {
        Data.Get("AuthTokens", "Token = '" + user.AuthToken + "' AND Username = '" + user.Username + "'", function (results) {
            callback(results.length > 0);
        });
    };
    return Authentication;
})();
