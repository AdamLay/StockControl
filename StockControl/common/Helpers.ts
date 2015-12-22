module Helpers
{
  export class Events
  {
    public static StockAdd = "stock add";
    public static StockUpdate = "stock update";
    public static StockDelete = "stock delete";
    public static StockIssue = "stock issue";
    public static StockAdjust = "stock adjust";
    public static GroupUpdate = "stock-group update";
    public static GroupDelete = "stock-group delete";
    public static Notification = "notification";
  }

  export function GetIcon(type: Enums.AuditTypes): string
  {
    var icon = "";

    switch (type)
    {
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

  export function GetColour(type: Enums.AuditTypes): string
  {
    var col = "";

    switch (type)
    {
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

  export function GetAuditInfo(entry: IAuditEntry<any>): IAuditInfo
  {
    switch (entry.AuditType)
    {
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

  export function FormatDate(d: Date): string
  {
    var now = new Date();

    var str = "";

    if (now.toLocaleDateString() == d.toLocaleDateString())
    {
      var diffSecs = (<any>now - <any>d) / 1000;

      if (diffSecs < 60)
        return Math.floor(diffSecs) + " second" + (Math.floor(diffSecs) == 1 ? "" : "s") + " ago";

      var diffMins = diffSecs / 60;

      if (diffMins < 60)
        return Math.floor(diffMins) + " minute" + (Math.floor(diffMins) == 1 ? "" : "s") + " ago";

      var diffHours = diffMins / 60;

      return Math.floor(diffHours) + " hour" + (Math.floor(diffHours) == 1 ? "" : "s") + " ago";
    }
    else
    {
      str += d.getHours() + ":" + d.getMinutes() + " ";
      str += d.getDate() + "/" + (d.getMonth() + 1);
    }
    return str;
  }
}
