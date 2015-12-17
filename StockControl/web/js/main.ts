//#region Prototypes

interface Array<T>
{
  where: (predicate: (elem: T) => boolean) => Array<T>;
  first: (predicate: (elem: T) => boolean) => T;
  contains: (predicate: (elem: T) => boolean) => boolean;
  groupBy: (prop: string) => Object;
}

Array.prototype.where = function (predicate: (elem) => boolean)
{
  var results = [];

  for (var i = 0; i < this.length; i++)
    if (predicate(this[i]))
      results.push(this[i]);

  if (results.length > 0)
    return results;

  return null;
};

Array.prototype.first = function (predicate: (elem) => boolean)
{
  for (var i = 0; i < this.length; i++)
    if (predicate(this[i]))
      return this[i];

  return null;
};

Array.prototype.contains = function (predicate: (elem) => boolean)
{
  for (var i = 0; i < this.length; i++)
    if (predicate(this[i]))
      return true;

  return false;
};

Array.prototype.groupBy = function (prop)
{
  var groups = {};

  for (var i = 0; i < this.length; i++)
  {
    var p = this[i][prop];

    if (!groups[p])
      groups[p] = [];

    groups[p].push(this[i]);
  }

  return groups;
};

//#endregion

//#region Helpers

function alertTop(msg: string, success: boolean)
{
  var $pop = $("<div>", {
    "class": "alert " + (success ? "alert-success" : "alert-danger"),
    "text": new Date().toLocaleString() + " " + msg
  });

  $("main.container").prepend($pop);

  setTimeout(function ()
  {
    $pop.slideUp(200, function ()
    {
      $pop.remove();
    });
  }, 3000);
}

function getQueryStringValue(key: string)
{
  key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");

  var regexS = "[\\?&]" + key + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);

  return results ? decodeURIComponent(results[1].replace(/\+/g, " ")) : null;
}

declare var Templates: any;

// ...
if (!(<any>window).module)
  (<any>window).module = {};

//#endregion

$(document).ready(function ()
{
  SocketManager.Init();

  Notifications.Init();
});

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

    skt.on("notification", Notifications.OnNotification);

    skt.on("stock issue", Inventory.OnStockIssue);
    skt.on("stock add", Inventory.OnStockAdd);

    skt.on("stock-group update", StockGroups.OnStockGroupUpdate);

    SocketManager._socket = skt;
  }

  public static Emit(evt: string, data: Object): void
  {
    SocketManager._socket.emit(evt, data);
  }

  public static Register(evt: string, handler: (data: any) => void): void
  {
    SocketManager._socket.on(evt, handler);
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

//#region Throttler

interface IThrottleTimeout
{
  ThrottleId: string;
  Timeout: number;
  TimeoutId?: any;
  Callback: () => void;
}

class Throttler
{
  public static ThrottleTimeouts: Array<IThrottleTimeout>;

  constructor(id: string, timeout: number, callback: () => void, startNow?: boolean)
  {
    if (!Throttler.ThrottleTimeouts)
      Throttler.ThrottleTimeouts = [];

    var existing = Throttler.GetFromId(id);

    if (existing && startNow)
    {
      console.log("existing");
      clearTimeout(existing.TimeoutId);

      existing.TimeoutId = setTimeout(callback, timeout);
    }
    else
    {
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

  public static GetFromId(id: string): IThrottleTimeout
  {
    return Throttler.ThrottleTimeouts.first((elem) => { return elem.ThrottleId == id; });
  }

  public static Start(id: string): void
  {
    var existing = Throttler.GetFromId(id);

    clearTimeout(existing.TimeoutId);

    existing.TimeoutId = setTimeout(existing.Callback, existing.Timeout);
  }

  public static Refresh(id: string): void
  {
    var existing = Throttler.GetFromId(id);

    clearTimeout(existing.TimeoutId);

    existing.TimeoutId = setTimeout(existing.Callback, existing.Timeout);
  }

  private static RemoveAfterRun(throttleTimeout: IThrottleTimeout): void
  {

  }
}

//#endregion

class Validation
{
  public static Error(elem)
  {
    var $p = $(elem).parent();

    $p.removeClass("has-success");
    $p.addClass("has-error");

    $("#btnSubmit").prop("disabled", "disabled");
  }

  public static Success(elem)
  {
    var $p = $(elem).parent();

    $p.removeClass("has-error");
    $p.addClass("has-success");

    if ($(".has-error").length == 0)
      $("#btnSubmit").removeAttr("disabled");
  }
}

class Api
{
  public static Get(url: string, callback: (data: any) => void): void
  {
    console.log("Getting " + url);

    $.get(url, function (data)
    {
      console.log(url + " response: ", data);

      callback(data);
    });
  }

  public static Post(url: string, data: Object, callback: (data: any) => void): void
  {
    console.log("Posting " + url, data);

    $.post(url, data, function (result)
    {
      console.log(url + " response: ", result);

      callback(result);
    });
  }

  public static Update(url: string, data: any, callback: Function): void
  {
    console.log("Updating " + url);

    $.ajax({
      url: url,
      type: "PUT",
      data: data,
      success: function (data)
      {
        console.log(url + " updated");

        callback(data);
      }
    });
  }

  public static Delete(url: string, callback: Function): void
  {
    console.log("Deleting " + url);

    $.ajax({
      url: url,
      type: "DELETE",
      success: function (data)
      {
        console.log(url + (data.Success ? "" : " not") + " deleted");

        callback(data);
      }
    });
  }
}

class PublishedEvent<T>
{
  private _handlers: Array<(data: T) => void> = [];

  public Subscribe(handler: (data: T) => void): void
  {
    this._handlers.push(handler);
  }

  public Trigger(data: T): void
  {
    for (var i = 0; i < this._handlers.length; i++)
      this._handlers[i](data);
  }
}

class Notifications
{
  public static UpdateInterval: any;

  public static Init(): void
  {
    if ($("#lstNotifications").length > 0)
    {
      Notifications.UpdateInterval = setInterval(function ()
      {
        $("#lstNotifications [data-time]").each(function ()
        {
          var $this = $(this);

          var dt = new Date(parseFloat($this.attr("data-time")));

          $this.text(Helpers.FormatDate(dt));
        });
      }, 5000);
    }
  }

  public static NotificationEvent = new PublishedEvent<IAuditEntry>();

  public static OnNotification(data: IAuditEntry): void
  {
    Notifications.NotificationEvent.Trigger(data);
  }
}

class Notification implements IAuditEntry
{
  public Id: number;
  public Title: string;
  public Message: string;
  public Timestamp: string;

  constructor(data: IAuditEntry)
  {
    this.Id = data.Id;
    this.Title = data.Title;
    this.Message = data.Message;
    this.Timestamp = data.Timestamp;
  }

  public GetFormattedTimestamp(): string
  {
    return Helpers.FormatDate(new Date(this.Timestamp));
  }

  public GetTimestampTicks(): string
  {
    return new Date(this.Timestamp).getTime() + "";
  }

  public GetIcon(): string
  {
    return Helpers.GetIcon(this.Title);
  }
}

class Inventory
{
  public static IssueStock(id: number): void
  {
    var $item = $("[data-stockid=\"" + id + "\"]");

    Api.Get("/api/stock/issue/" + id, function (data)
    {
      if (!data.Success)
      {
        alertTop(data.Message, data.Success);
      }
    });
  }
  
  public static StockIssueEvent = new PublishedEvent<IStockItem>();

  public static OnStockIssue(item: IStockItem): void
  {
    Inventory.StockIssueEvent.Trigger(item);
  }

  public static StockAddEvent = new PublishedEvent<IStockItem>();

  public static OnStockAdd(item: IStockItem): void
  {
    Inventory.StockAddEvent.Trigger(item);
  }
}

class StockGroups
{
  public static StockGroupUpdateEvent = new PublishedEvent<IStockGroup>();

  public static OnStockGroupUpdate(group: IStockGroup): void
  {
    StockGroups.StockGroupUpdateEvent.Trigger(group);
  }
}