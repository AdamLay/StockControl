$(document).ready(function () {
    SocketManager.Init();
    Inventory.StockGet();
});
var Inventory = (function () {
    function Inventory() {
    }
    Inventory.StockGet = function () {
        SocketManager.Request("stock get");
    };
    Inventory.OnStockGet = function (data) {
        console.log(data);
        var $list = $("#stockList");
        $list.html("");
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var $item = $("<div>", {
                "class": "stock-item"
            });
            $item.append($("<div>", { "class": "stock-desc", "text": item.Name }));
            $item.append($("<div>", { "class": "stock-use" }));
            $item.append($("<div>", { "class": "stock-qty", "text": item.Quantity }));
            $list.append($item);
        }
    };
    Inventory.OnStockUpdate = function () {
    };
    return Inventory;
})();
var Audit = (function () {
    function Audit() {
    }
    Audit.OnLogGet = function () {
    };
    return Audit;
})();
var SocketManager = (function () {
    function SocketManager() {
    }
    SocketManager.Init = function () {
        var skt = io();
        skt.on("connect", SocketManager.OnConnect);
        skt.on("disconnect", SocketManager.OnDisconnect);
        skt.on("stock get", Inventory.OnStockGet);
        skt.on("stock update", Inventory.OnStockUpdate);
        skt.on("log get", Audit.OnLogGet);
        SocketManager._socket = skt;
    };
    SocketManager.Emit = function (evt, data) {
        SocketManager._socket.emit(evt, data);
    };
    SocketManager.Request = function (evt, data) {
        SocketManager._socket.emit(evt, data);
    };
    SocketManager.OnConnect = function () {
    };
    SocketManager.OnDisconnect = function () {
    };
    return SocketManager;
})();
//# sourceMappingURL=main.js.map