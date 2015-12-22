var Enums;
(function (Enums) {
    (function (AuditTypes) {
        AuditTypes[AuditTypes["StockIssue"] = 0] = "StockIssue";
        AuditTypes[AuditTypes["StockAdd"] = 1] = "StockAdd";
        AuditTypes[AuditTypes["StockUpdate"] = 2] = "StockUpdate";
        AuditTypes[AuditTypes["StockAdjust"] = 3] = "StockAdjust";
        AuditTypes[AuditTypes["StockRemove"] = 4] = "StockRemove";
        AuditTypes[AuditTypes["StockGroupAdd"] = 5] = "StockGroupAdd";
        AuditTypes[AuditTypes["StockGroupUpdate"] = 6] = "StockGroupUpdate";
        AuditTypes[AuditTypes["StockGroupRemove"] = 7] = "StockGroupRemove";
    })(Enums.AuditTypes || (Enums.AuditTypes = {}));
    var AuditTypes = Enums.AuditTypes;
    (function (Events) {
    })(Enums.Events || (Enums.Events = {}));
    var Events = Enums.Events;
})(Enums || (Enums = {}));

var Helpers;
(function (Helpers) {
    var Events = (function () {
        function Events() {
        }
        Events.StockAdd = "stock add";
        Events.StockUpdate = "stock update";
        Events.StockDelete = "stock delete";
        Events.StockIssue = "stock issue";
        Events.StockAdjust = "stock adjust";
        Events.GroupUpdate = "stock-group update";
        Events.GroupDelete = "stock-group delete";
        Events.Notification = "notification";
        return Events;
    })();
    Helpers.Events = Events;
    function GetIcon(type) {
        var icon = "";
        switch (type) {
            case Enums.AuditTypes.StockAdd:
            case Enums.AuditTypes.StockGroupAdd:
                icon = "plus";
                break;
            case Enums.AuditTypes.StockUpdate:
            case Enums.AuditTypes.StockGroupUpdate:
            case Enums.AuditTypes.StockAdjust:
                icon = "pencil";
                break;
            case Enums.AuditTypes.StockRemove:
            case Enums.AuditTypes.StockGroupRemove:
                icon = "trash-o";
                break;
            case Enums.AuditTypes.StockIssue:
                icon = "gbp";
                break;
            default:
                icon = "pencil";
                break;
        }
        return "fa fa-" + icon;
    }
    Helpers.GetIcon = GetIcon;
    function GetColour(type) {
        var col = "";
        switch (type) {
            case Enums.AuditTypes.StockAdd:
            case Enums.AuditTypes.StockGroupAdd:
                col = "Success";
                break;
            case Enums.AuditTypes.StockUpdate:
            case Enums.AuditTypes.StockGroupUpdate:
            case Enums.AuditTypes.StockAdjust:
                col = "default";
                break;
            case Enums.AuditTypes.StockRemove:
            case Enums.AuditTypes.StockGroupRemove:
                col = "danger";
                break;
            case Enums.AuditTypes.StockIssue:
                col = "info";
                break;
            default:
                col = "default";
                break;
        }
        return col;
    }
    Helpers.GetColour = GetColour;
    function GetAuditInfo(entry) {
        switch (entry.AuditType) {
            case Enums.AuditTypes.StockAdd:
                return {
                    Title: "Stock Item Added",
                    Colour: "success",
                    Icon: "plus"
                };
            case Enums.AuditTypes.StockGroupAdd:
                return {
                    Title: "Stock Group Added",
                    Colour: "success",
                    Icon: "plus"
                };
            case Enums.AuditTypes.StockUpdate:
                return {
                    Title: "Stock Item Updated",
                    Colour: "default",
                    Icon: "pencil"
                };
            case Enums.AuditTypes.StockGroupUpdate:
                return {
                    Title: "Stock Group Updated",
                    Colour: "default",
                    Icon: "pencil"
                };
            case Enums.AuditTypes.StockAdjust:
                return {
                    Title: "Stock Quantity Adjusted",
                    Colour: "default",
                    Icon: "pencil"
                };
            case Enums.AuditTypes.StockRemove:
                return {
                    Title: "Stock Item Removed",
                    Colour: "danger",
                    Icon: "trash-o"
                };
            case Enums.AuditTypes.StockGroupRemove:
                return {
                    Title: "Stock Group Removed",
                    Colour: "danger",
                    Icon: "trash-o"
                };
            case Enums.AuditTypes.StockIssue:
                return {
                    Title: "Stock Issued",
                    Colour: "info",
                    Icon: "gbp"
                };
        }
    }
    Helpers.GetAuditInfo = GetAuditInfo;
    function FormatDate(d) {
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
    }
    Helpers.FormatDate = FormatDate;
})(Helpers || (Helpers = {}));

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
if (!window.module)
    window.module = {};
$(document).ready(function () {
    SocketManager.Init();
    Notifications.Init();
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

this["Templates"] = this["Templates"] || {};
this["Templates"]["auditEntry"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (Date, Helpers, index, log) {
buf.push("<li" + (jade.cls(["" + (index % 2 == 1 ? 'timeline-inverted' : '') + ""], [true])) + "><div" + (jade.cls(['timeline-badge',(Helpers.GetAuditInfo(log).Colour)], [null,true])) + "><i" + (jade.cls(['fa',"fa fa-" + (Helpers.GetAuditInfo(log).Icon) + ""], [null,true])) + "></i></div><div" + (jade.attr("id", "" + (log.Id) + "", true, false)) + " class=\"timeline-panel\"><div class=\"timeline-heading\"><h4 class=\"timeline-title\">" + (jade.escape((jade_interp = Helpers.GetAuditInfo(log).Title) == null ? '' : jade_interp)) + "</h4><p><small class=\"text-muted\">" + (jade.escape((jade_interp = new Date(log.Timestamp).toUTCString()) == null ? '' : jade_interp)) + "</small></p></div><div class=\"timeline-body\"><p>" + (jade.escape((jade_interp = log.Message) == null ? '' : jade_interp)) + "</p></div></div></li>");}.call(this,"Date" in locals_for_with?locals_for_with.Date:typeof Date!=="undefined"?Date:undefined,"Helpers" in locals_for_with?locals_for_with.Helpers:typeof Helpers!=="undefined"?Helpers:undefined,"index" in locals_for_with?locals_for_with.index:typeof index!=="undefined"?index:undefined,"log" in locals_for_with?locals_for_with.log:typeof log!=="undefined"?log:undefined));;return buf.join("");
};
this["Templates"]["modalDialog"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (dialog) {
buf.push("<div" + (jade.attr("id", dialog.Id, true, false)) + " tabindex=\"-1\" role=\"dialog\" class=\"modal fade\"><div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-header\"><button data-dismiss=\"modal\" class=\"close\"><span>&times;</span></button><h4 class=\"modal-title\">" + (jade.escape((jade_interp = dialog.Title) == null ? '' : jade_interp)) + "</h4></div><div class=\"modal-body\"><p>" + (jade.escape((jade_interp = dialog.Message) == null ? '' : jade_interp)) + "</p></div><div class=\"modal-footer\"><button data-dismiss=\"modal\" class=\"btn btn-default\">Close</button><button" + (jade.attr("onclick", dialog.OnClick, true, false)) + " data-dismiss=\"modal\" class=\"btn btn-primary btn-ok\">" + (jade.escape((jade_interp = dialog.ButtonLabel) == null ? '' : jade_interp)) + "</button></div></div></div></div>");}.call(this,"dialog" in locals_for_with?locals_for_with.dialog:typeof dialog!=="undefined"?dialog:undefined));;return buf.join("");
};
this["Templates"]["notification"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (Date, Helpers, item) {
buf.push("<a" + (jade.attr("href", "/audit?id=" + (item.Id) + "", true, false)) + " style=\"display:block;\" class=\"list-group-item\"><i" + (jade.cls(["fa fa-" + (Helpers.GetAuditInfo(item).Icon) + ""], [true])) + "></i> " + (jade.escape((jade_interp = Helpers.GetAuditInfo(item).Title) == null ? '' : jade_interp)) + "<span" + (jade.attr("data-time", "" + (new Date(item.Timestamp).getTime()) + "", true, false)) + " class=\"pull-right text-muted small\">" + (jade.escape((jade_interp = Helpers.FormatDate(new Date(item.Timestamp))) == null ? '' : jade_interp)) + "</span></a>");}.call(this,"Date" in locals_for_with?locals_for_with.Date:typeof Date!=="undefined"?Date:undefined,"Helpers" in locals_for_with?locals_for_with.Helpers:typeof Helpers!=="undefined"?Helpers:undefined,"item" in locals_for_with?locals_for_with.item:typeof item!=="undefined"?item:undefined));;return buf.join("");
};
this["Templates"]["stockGroup"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (group, key, undefined) {
buf.push("<div" + (jade.attr("data-groupid", "" + (key) + "", true, false)) + " onclick=\"toggleGroup(this)\" class=\"panel-heading stock-group-heading\"><span>" + (jade.escape((jade_interp = group.Name) == null ? '' : jade_interp)) + "</span><i class=\"fa fa-chevron-up pull-right text-muted\"></i><i class=\"fa fa-chevron-down pull-right text-muted\"></i></div><ul" + (jade.attr("data-groupid", "" + (key) + "", true, false)) + " class=\"list-group stock-group\">");
// iterate group.Items
;(function(){
  var $$obj = group.Items;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var item = $$obj[$index];

buf.push("<li" + (jade.attr("data-stockid", "" + (item.Id) + "", true, false)) + " class=\"list-group-item stock-item\"><button" + (jade.attr("onclick", "Inventory.IssueStock(" + (item.Id) + ")", true, false)) + " title=\"Release 1 item from inventory\"" + (jade.attr("disabled", (item.Quantity == 0 ? 'disabled' : null), true, false)) + " class=\"btn btn-primary pull-right\"><i class=\"fa fa-gbp\"></i> Issue</button><h3 class=\"name\">" + (jade.escape((jade_interp = item.Name) == null ? '' : jade_interp)) + "</h3><div class=\"quantity\">In Stock: " + (jade.escape((jade_interp = item.Quantity) == null ? '' : jade_interp)) + "</div></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var item = $$obj[$index];

buf.push("<li" + (jade.attr("data-stockid", "" + (item.Id) + "", true, false)) + " class=\"list-group-item stock-item\"><button" + (jade.attr("onclick", "Inventory.IssueStock(" + (item.Id) + ")", true, false)) + " title=\"Release 1 item from inventory\"" + (jade.attr("disabled", (item.Quantity == 0 ? 'disabled' : null), true, false)) + " class=\"btn btn-primary pull-right\"><i class=\"fa fa-gbp\"></i> Issue</button><h3 class=\"name\">" + (jade.escape((jade_interp = item.Name) == null ? '' : jade_interp)) + "</h3><div class=\"quantity\">In Stock: " + (jade.escape((jade_interp = item.Quantity) == null ? '' : jade_interp)) + "</div></li>");
    }

  }
}).call(this);

buf.push("</ul>");}.call(this,"group" in locals_for_with?locals_for_with.group:typeof group!=="undefined"?group:undefined,"key" in locals_for_with?locals_for_with.key:typeof key!=="undefined"?key:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
this["Templates"]["stockItem"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (item) {
buf.push("<li" + (jade.attr("data-stockid", "" + (item.Id) + "", true, false)) + " class=\"list-group-item stock-item\"><button" + (jade.attr("onclick", "Inventory.IssueStock(" + (item.Id) + ")", true, false)) + " title=\"Release 1 item from inventory\"" + (jade.attr("disabled", (item.Quantity == 0 ? 'disabled' : null), true, false)) + " class=\"btn btn-primary pull-right\"><i class=\"fa fa-gbp\"></i> Issue</button><h3 class=\"name\">" + (jade.escape((jade_interp = item.Name) == null ? '' : jade_interp)) + "</h3><div class=\"quantity\">In Stock: " + (jade.escape((jade_interp = item.Quantity) == null ? '' : jade_interp)) + "</div></li>");}.call(this,"item" in locals_for_with?locals_for_with.item:typeof item!=="undefined"?item:undefined));;return buf.join("");
};