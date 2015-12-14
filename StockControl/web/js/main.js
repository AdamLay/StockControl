//#region Prototypes
Array.prototype.where = function (predicate) {
    var results = [];
    for (var i = 0; i < this.length; i++)
        if (predicate(this[i]))
            results.push(this[i]);
    if (results.length > 0)
        return results;
    return null;
};
Array.prototype.first = function (predicate) {
    for (var i = 0; i < this.length; i++)
        if (predicate(this[i]))
            return this[i];
    return null;
};
Array.prototype.contains = function (predicate) {
    for (var i = 0; i < this.length; i++)
        if (predicate(this[i]))
            return true;
    return false;
};
Array.prototype.groupBy = function (prop) {
    var groups = {};
    for (var i = 0; i < this.length; i++) {
        var p = this[i][prop];
        if (!groups[p])
            groups[p] = [];
        groups[p].push(this[i]);
    }
    return groups;
};
//#endregion
//#region Helpers
var formatDate = function (d) {
    var now = new Date();
    var str = "";
    if (now.toLocaleDateString() == d.toLocaleDateString()) {
        var diffSecs = (now - d) / 1000;
        if (diffSecs < 60)
            return Math.floor(diffSecs) + " second" + (Math.floor(diffSecs) == 1 ? "" : "s") + " ago";
        var diffMins = diffSecs / 60;
        if (diffMins < 60)
            return Math.floor(diffMins) + " minute" + (Math.floor(diffMins) == 1 ? "" : "s") + " ago";
        var diffHours = diffMins / 60;
        return Math.floor(diffHours) + " hour" + (Math.floor(diffHours) == 1 ? "" : "s") + " ago";
    }
    else {
        str += d.getHours() + ":" + d.getMinutes() + " ";
        str += d.getDate() + "/" + (d.getMonth() + 1);
    }
    return str;
};
function alertTop(msg, success) {
    var $pop = $("<div>", {
        "class": "alert " + (success ? "alert-success" : "alert-danger"),
        "text": new Date().toLocaleString() + " " + msg
    });
    $("main.container").prepend($pop);
    setTimeout(function () {
        $pop.slideUp(200, function () {
            $pop.remove();
        });
    }, 3000);
}
function getQueryStringValue(key) {
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + key + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    return results ? decodeURIComponent(results[1].replace(/\+/g, " ")) : null;
}
//#endregion
$(document).ready(function () {
    SocketManager.Init();
    Notifications.Init();
});
var SocketManager = (function () {
    function SocketManager() {
    }
    SocketManager.Init = function () {
        var skt = io();
        // Here we attach our functions to events
        // So for example whenever the "connect" event is received,
        // the SocketManager.OnConnect will execute
        skt.on("connect", SocketManager.OnConnect);
        skt.on("disconnect", SocketManager.OnDisconnect);
        skt.on("notification", Notifications.OnNotification);
        skt.on("stock issue", Inventory.OnStockIssue);
        SocketManager._socket = skt;
    };
    SocketManager.Emit = function (evt, data) {
        SocketManager._socket.emit(evt, data);
    };
    SocketManager.Register = function (evt, handler) {
        SocketManager._socket.on(evt, handler);
    };
    SocketManager.OnConnect = function () {
        // What do we want to do when we're successfully connected?
        // Probably get a list of stock
    };
    SocketManager.OnDisconnect = function () {
        // What do we want to do when we've disconnected or lost connection?
        // Probably show that there's an error communicating with the server
        // and disable some UI features
    };
    return SocketManager;
})();
var Throttler = (function () {
    function Throttler(id, timeout, callback, startNow) {
        if (!Throttler.ThrottleTimeouts)
            Throttler.ThrottleTimeouts = [];
        var existing = Throttler.GetFromId(id);
        if (existing && startNow) {
            console.log("existing");
            clearTimeout(existing.TimeoutId);
            existing.TimeoutId = setTimeout(callback, timeout);
        }
        else {
            console.log("new timeout");
            var throttleTimeout = {
                ThrottleId: id,
                Timeout: timeout,
                TimeoutId: startNow ? setTimeout(callback, timeout) : null,
                Callback: callback
            };
            Throttler.ThrottleTimeouts.push(throttleTimeout);
        }
    }
    Throttler.GetFromId = function (id) {
        return Throttler.ThrottleTimeouts.first(function (elem) { return elem.ThrottleId == id; });
    };
    Throttler.Start = function (id) {
        var existing = Throttler.GetFromId(id);
        clearTimeout(existing.TimeoutId);
        existing.TimeoutId = setTimeout(existing.Callback, existing.Timeout);
    };
    Throttler.Refresh = function (id) {
        var existing = Throttler.GetFromId(id);
        clearTimeout(existing.TimeoutId);
        existing.TimeoutId = setTimeout(existing.Callback, existing.Timeout);
    };
    Throttler.RemoveAfterRun = function (throttleTimeout) {
    };
    return Throttler;
})();
//#endregion
var Validation = (function () {
    function Validation() {
    }
    Validation.Error = function (elem) {
        var $p = $(elem).parent();
        $p.removeClass("has-success");
        $p.addClass("has-error");
        $("#btnSubmit").prop("disabled", "disabled");
    };
    Validation.Success = function (elem) {
        var $p = $(elem).parent();
        $p.removeClass("has-error");
        $p.addClass("has-success");
        if ($(".has-error").length == 0)
            $("#btnSubmit").removeAttr("disabled");
    };
    return Validation;
})();
var Api = (function () {
    function Api() {
    }
    Api.Get = function (url, callback) {
        console.log("Getting " + url);
        $.get(url, function (data) {
            console.log(url + " response: ", data);
            callback(data);
        });
    };
    Api.Post = function (url, data, callback) {
        console.log("Posting " + url, data);
        $.post(url, data, function (result) {
            console.log(url + " response: ", result);
            callback(result);
        });
    };
    Api.Update = function (url, data, callback) {
        console.log("Updating " + url);
        $.ajax({
            url: url,
            type: "PUT",
            data: data,
            success: function (data) {
                console.log(url + " updated");
                callback(data);
            }
        });
    };
    Api.Delete = function (url, callback) {
        console.log("Deleting " + url);
        $.ajax({
            url: url,
            type: "DELETE",
            success: function (data) {
                console.log(url + " deleted");
                callback(data);
            }
        });
    };
    return Api;
})();
var Notifications = (function () {
    function Notifications() {
    }
    Notifications.Init = function () {
        if ($("#lstNotifications").length > 0) {
            Notifications.UpdateInterval = setInterval(function () {
                $("#lstNotifications [data-time]").each(function () {
                    var $this = $(this);
                    var dt = new Date(parseFloat($this.attr("data-time")));
                    $this.text(formatDate(dt));
                });
            }, 5000);
        }
    };
    Notifications.OnNotification = function (data) {
        var getIcon = function (name) {
            var icon = "";
            if (name.indexOf("Add") > -1)
                icon = "plus";
            else if (name.indexOf("Update") > -1)
                icon = "pencil";
            else if (name.indexOf("Issue") > -1)
                icon = "gbp";
            else if (name.indexOf("Delete") > -1)
                icon = "ban";
            return "fa fa-" + icon;
        };
        var time = new Date(data.Timestamp);
        var $item = $("<a>", {
            "class": "list-group-item new",
            "text": " " + data.Title,
            "style": "display:block"
        });
        var $icon = $("<i>", {
            "class": getIcon(data.Title)
        });
        var $stamp = $("<span>", {
            "class": "pull-right text-muted small",
            "text": formatDate(time),
            "data-time": time.getTime()
        });
        $item.prepend($icon);
        $item.append($stamp);
        $item.hide();
        $("#lstNotifications").prepend($item);
        $("#lstNotifications a").last().slideUp(200, function () { $(this).remove(); });
        $item.slideDown(200);
        $item.on("mouseover", function () { $(this).removeClass("new"); });
    };
    return Notifications;
})();
var PublishedEvent = (function () {
    function PublishedEvent() {
        this._handlers = [];
    }
    PublishedEvent.prototype.Subscribe = function (handler) {
        this._handlers.push(handler);
    };
    PublishedEvent.prototype.Trigger = function (data) {
        for (var i = 0; i < this._handlers.length; i++)
            this._handlers[i](data);
    };
    return PublishedEvent;
})();
var Inventory = (function () {
    function Inventory() {
    }
    Inventory.IssueStock = function (id) {
        var $item = $("[data-stockid=\"" + id + "\"]");
        Api.Get("/api/stock/issue/" + id, function (data) {
            if (!data.Success) {
                alertTop(data.Message, data.Success);
            }
        });
    };
    Inventory.OnStockIssue = function (item) {
        Inventory.StockIssueEvent.Trigger(item);
    };
    Inventory.StockIssueEvent = new PublishedEvent();
    return Inventory;
})();
//# sourceMappingURL=main.js.map