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
module.exports = Enums;
