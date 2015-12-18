class Helpers
{
  public static Events = {
    StockAdd: "stock add",
    StockUpdate: "stock update",
    StockDelete: "stock delete",
    StockIssue: "stock issue",
    StockAdjust: "stock adjust",
    GroupUpdate: "stock-group update",
    GroupDelete: "stock-group delete",
    Notification: "notification"
  }

  public static ErrorCodes = ErrorCodes;

  public static GetIcon(name: string): string
  {
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
  }

  public static GetColour(name: string): string
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

  public static FormatDate(d: Date): string
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

enum ErrorCodes
{
  PasswordsDontMatch,
  UserExists
}

module.exports = Helpers;
