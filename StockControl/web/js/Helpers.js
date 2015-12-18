var Helpers = (function () {
    function Helpers() {
    }
    Helpers.GetIcon = function (name) {
        var icon = "";
        if (name.indexOf("Add") > -1)
            icon = "plus";
        else if (name.indexOf("Update") > -1)
            icon = "pencil";
        else if (name.indexOf("Issue") > -1)
            icon = "gbp";
        else if (name.indexOf("Delete") > -1)
            icon = "trash-o";
        return "fa fa-" + icon;
    };
    Helpers.GetColour = function (name) {
        var col = "";
        if (name.indexOf("Add") > -1)
            col = "success";
        else if (name.indexOf("Update") > -1)
            col = "default";
        else if (name.indexOf("Issue") > -1)
            col = "info";
        else if (name.indexOf("Delete") > -1)
            col = "danger";
        return col;
    };
    Helpers.FormatDate = function (d) {
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
    Helpers.Events = {
        StockAdd: "stock add",
        StockUpdate: "stock update",
        StockDelete: "stock delete",
        StockIssue: "stock issue",
        StockAdjust: "stock adjust",
        GroupUpdate: "stock-group update",
        GroupDelete: "stock-group delete",
        Notification: "notification"
    };
    Helpers.ErrorCodes = ErrorCodes;
    return Helpers;
})();
var ErrorCodes;
(function (ErrorCodes) {
    ErrorCodes[ErrorCodes["PasswordsDontMatch"] = 0] = "PasswordsDontMatch";
    ErrorCodes[ErrorCodes["UserExists"] = 1] = "UserExists";
})(ErrorCodes || (ErrorCodes = {}));
module.exports = Helpers;
