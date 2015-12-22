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
