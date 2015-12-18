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
// ...
if (!window.module)
    window.module = {};
//#endregion
$(document).ready(function () {
    SocketManager.Init();
    Notifications.Init();
    // Hide any success notifications after 3 seconds
    setTimeout(function () { $("#messageSuccess").slideUp(200); }, 3000);
});
var SocketManager = (function () {
    function SocketManager() {
    }
    SocketManager.Init = function () {
        var skt = io();
        skt.on("connect", SocketManager.OnConnect);
        skt.on("disconnect", SocketManager.OnDisconnect);
        skt.on(Helpers.Events.Notification, Notifications.OnNotification);
        skt.on(Helpers.Events.StockIssue, Inventory.OnStockIssue);
        skt.on(Helpers.Events.StockAdd, Inventory.OnStockAdd);
        skt.on(Helpers.Events.StockUpdate, Inventory.OnStockUpdate);
        skt.on(Helpers.Events.StockAdjust, Inventory.OnStockAdjust);
        skt.on(Helpers.Events.StockDelete, Inventory.OnStockDelete);
        skt.on(Helpers.Events.GroupUpdate, StockGroups.OnStockGroupUpdate);
        skt.on(Helpers.Events.GroupDelete, StockGroups.OnStockGroupDelete);
        SocketManager._socket = skt;
    };
    SocketManager.Emit = function (evt, data) {
        SocketManager._socket.emit(evt, data);
    };
    SocketManager.Register = function (evt, handler) {
        SocketManager._socket.on(evt, handler);
    };
    SocketManager.OnConnect = function () {
    };
    SocketManager.OnDisconnect = function () {
    };
    return SocketManager;
})();
var Throttler = (function () {
    function Throttler(id, timeout, callback, startNow) {
        if (!Throttler.ThrottleTimeouts)
            Throttler.ThrottleTimeouts = [];
        var existing = Throttler.GetFromId(id);
        if (existing && startNow) {
            clearTimeout(existing.TimeoutId);
            existing.TimeoutId = setTimeout(callback, timeout);
        }
        else {
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
                console.log(url + (data.Success ? "" : " not") + " updated");
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
                console.log(url + (data.Success ? "" : " not") + " deleted");
                callback(data);
            }
        });
    };
    return Api;
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
var Notifications = (function () {
    function Notifications() {
    }
    Notifications.Init = function () {
        if ($("#lstNotifications").length == 0)
            return;
        Notifications.UpdateInterval = setInterval(function () {
            $("#lstNotifications [data-time]").each(function () {
                var $this = $(this);
                var dt = new Date(parseFloat($this.attr("data-time")));
                $this.text(Helpers.FormatDate(dt));
            });
        }, 5000);
    };
    Notifications.OnNotification = function (data) {
        Notifications.NotificationEvent.Trigger(data);
    };
    Notifications.NotificationEvent = new PublishedEvent();
    return Notifications;
})();
var Inventory = (function () {
    function Inventory() {
    }
    Inventory.IssueStock = function (id) {
        Api.Get("/api/stock/issue/" + id, function (data) {
            if (!data.Success) {
                alertTop(data.Message, data.Success);
            }
        });
    };
    Inventory.OnStockIssue = function (item) {
        Inventory.StockIssueEvent.Trigger(item);
    };
    Inventory.OnStockAdd = function (item) {
        Inventory.StockAddEvent.Trigger(item);
    };
    Inventory.OnStockUpdate = function (item) {
        Inventory.StockUpdateEvent.Trigger(item);
    };
    Inventory.OnStockAdjust = function (adjust) {
        Inventory.StockAdjustEvent.Trigger(adjust);
    };
    Inventory.OnStockDelete = function (id) {
        Inventory.StockDeleteEvent.Trigger(id);
    };
    Inventory.StockIssueEvent = new PublishedEvent();
    Inventory.StockAddEvent = new PublishedEvent();
    Inventory.StockUpdateEvent = new PublishedEvent();
    Inventory.StockAdjustEvent = new PublishedEvent();
    Inventory.StockDeleteEvent = new PublishedEvent();
    return Inventory;
})();
var StockGroups = (function () {
    function StockGroups() {
    }
    StockGroups.OnStockGroupUpdate = function (group) {
        StockGroups.StockGroupUpdateEvent.Trigger(group);
    };
    StockGroups.OnStockGroupDelete = function (id) {
        StockGroups.StockGroupDeleteEvent.Trigger(id);
    };
    StockGroups.StockGroupUpdateEvent = new PublishedEvent();
    StockGroups.StockGroupDeleteEvent = new PublishedEvent();
    return StockGroups;
})();
