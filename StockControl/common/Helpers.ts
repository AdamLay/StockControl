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

  export function GetColour(name: string): string
  {
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
