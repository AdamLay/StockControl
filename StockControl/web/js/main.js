$(document).ready(function () {
    SocketManager.Init();
    Inventory.StockGet();
});
var Inventory = (function () {
    function Inventory() {
    }
    Inventory.StockGet = function () {
        // Emit the "stock get" event to the server
        // Server will process the "stock get" event back again
        // Then we'll end up in the OnStockGet function
        SocketManager.Request("stock get");
    };
    // data: any should probably be something like data: Array<IStockItem>
    // and then we could take advantage of strongly typed things
    Inventory.OnStockGet = function (data) {
        console.log(data);
        // Get the html DOM element with id of stockList 
        var $list = $("#stockList");
        // Clear out it's content, so there's nowt inside it
        $list.html("");
        // For each item in "data", which we know is an array of stock items
        for (var i = 0; i < data.length; i++) {
            // Easier to type item than data[i] lol
            var item = data[i];
            // Using JQuery, making a div element with class of "stock-item"
            // this is essentially <div class="stock-item"></div>
            var $item = $("<div>", {
                "class": "stock-item"
            });
            // Appending more divs into our $item element
            // The text property means inside the div element
            // So in this case <div class="stock-desc">Foo</div>
            $item.append($("<div>", { "class": "stock-desc", "text": item.Name }));
            $item.append($("<div>", { "class": "stock-use" }));
            $item.append($("<div>", { "class": "stock-qty", "text": item.Quantity }));
            // Finally attaching the item into the stock list, which is already in the DOM
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
        // Here we attach our functions to events
        // So for example whenever the "connect" event is received,
        // the SocketManager.OnConnect will execute
        skt.on("connect", SocketManager.OnConnect);
        skt.on("disconnect", SocketManager.OnDisconnect);
        // "stock get" is just an event we've made up
        // From app.ts, in our server side code, whenever we emit the "stock get" event
        // it'll run the function below... etc
        skt.on("stock get", Inventory.OnStockGet);
        skt.on("stock update", Inventory.OnStockUpdate);
        skt.on("log get", Audit.OnLogGet);
        // Store our socket so we can use it later outside this function
        // for emitting events
        SocketManager._socket = skt;
    };
    SocketManager.Emit = function (evt, data) {
        SocketManager._socket.emit(evt, data);
    };
    SocketManager.Request = function (evt, data) {
        SocketManager._socket.emit(evt, data);
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
//# sourceMappingURL=main.js.map