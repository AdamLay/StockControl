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

  // Hide any success notifications after 3 seconds
  setTimeout(function () { $("#messageSuccess").slideUp(200); }, 3000);
});

declare var io: any;

class SocketManager
{
  // This holds the socket.io socket object,
  // so we can access it in other functions
  private static _socket;

  public static Init(): void
  {
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

  }

  public static OnDisconnect(): void
  {

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
      clearTimeout(existing.TimeoutId);

      existing.TimeoutId = setTimeout(callback, timeout);
    }
    else
    {
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
        console.log(url + (data.Success ? "" : " not") + " updated");

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
    if ($("#lstNotifications").length == 0)
      return;

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

  public static NotificationEvent = new PublishedEvent<IAuditEntry<any>>();

  public static OnNotification(data: IAuditEntry<any>): void
  {
    Notifications.NotificationEvent.Trigger(data);
  }
}

class Inventory
{
  public static IssueStock(id: number): void
  {
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

  public static StockUpdateEvent = new PublishedEvent<IStockItem>();

  public static OnStockUpdate(item: IStockItem): void
  {
    Inventory.StockUpdateEvent.Trigger(item);
  }

  public static StockAdjustEvent = new PublishedEvent<IStockAdjust>();

  public static OnStockAdjust(adjust: IStockAdjust): void
  {
    Inventory.StockAdjustEvent.Trigger(adjust);
  }

  public static StockDeleteEvent = new PublishedEvent<number>();

  public static OnStockDelete(id: number): void
  {
    Inventory.StockDeleteEvent.Trigger(id);
  }
}

class StockGroups
{
  public static StockGroupUpdateEvent = new PublishedEvent<IStockGroup>();

  public static OnStockGroupUpdate(group: IStockGroup): void
  {
    StockGroups.StockGroupUpdateEvent.Trigger(group);
  }

  public static StockGroupDeleteEvent = new PublishedEvent<number>();

  public static OnStockGroupDelete(id: number): void
  {
    StockGroups.StockGroupDeleteEvent.Trigger(id);
  }
}
