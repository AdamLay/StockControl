$(document).ready(function ()
{
  SocketManager.Init();

  Inventory.StockGet();
});

class Inventory
{
  public static StockGet(): void
  {
    SocketManager.Request("stock get");
  }

  public static OnStockGet(data: any): void
  {
    console.log(data);

    var $list = $("#stockList");

    $list.html("");

    for (var i = 0; i < data.length; i++)
    {
      var item = data[i];

      var $item = $("<div>",
      {
        "class": "stock-item"
      });

      $item.append($("<div>", { "class": "stock-desc", "text": item.Name }));
      $item.append($("<div>", { "class": "stock-use" }));
      $item.append($("<div>", { "class": "stock-qty", "text": item.Quantity }));

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
  private static _socket;

  public static Init(): void
  {
    var skt = io();

    skt.on("connect", SocketManager.OnConnect);
    skt.on("disconnect", SocketManager.OnDisconnect);

    skt.on("stock get", Inventory.OnStockGet);
    skt.on("stock update", Inventory.OnStockUpdate);

    skt.on("log get", Audit.OnLogGet);

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

  }

  public static OnDisconnect(): void
  {

  }
}