$(document).ready(function ()
{
  SocketManager.Init();

  //Inventory.StockGet();
});

class Inventory
{
  public static StockGet(): void
  {
    // Emit the "stock get" event to the server
    // Server will process the "stock get" event back again
    // Then we'll end up in the OnStockGet function
    SocketManager.Request("stock get");
  }

  // data: any should probably be something like data: Array<IStockItem>
  // and then we could take advantage of strongly typed things
  public static OnStockGet(data: any): void
  {
    console.log(data);

    // Get the html DOM element with id of stockList 
    var $list = $("#stockList");

    // Clear out it's content, so there's nowt inside it
    $list.html("");

    // For each item in "data", which we know is an array of stock items
    for (var i = 0; i < data.length; i++)
    {
      // Easier to type item than data[i] lol
      var item = data[i];

      // Using JQuery, making a div element with class of "stock-item"
      // this is essentially <div class="stock-item"></div>
      var $item = $("<div>",
      {
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
  }

  public static OnStockUpdate(): void
  {

  }
}

class Audit
{
  public static OnLogGet(): void
  {

  }
}

class SocketManager
{
  // This holds the socket.io socket object,
  // so we can access it in other functions
  private static _socket;

  public static Init(): void
  {
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
  }

  public static Emit(evt: string, data: Object): void
  {
    SocketManager._socket.emit(evt, data);
  }

  public static Request(evt: string, data?: Object): void
  {
    SocketManager._socket.emit(evt, data);
  }

  public static OnConnect(): void
  {
    // What do we want to do when we're successfully connected?
    // Probably get a list of stock
  }

  public static OnDisconnect(): void
  {
    // What do we want to do when we've disconnected or lost connection?
    // Probably show that there's an error communicating with the server
    // and disable some UI features
  }
}