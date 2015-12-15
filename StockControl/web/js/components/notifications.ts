$(document).ready(function ()
{
  Notifications.NotificationEvent.Subscribe(function (data: IAuditEntry)
  {
    var time = new Date(data.Timestamp);

    var $item = $("<a>", {
      "class": "list-group-item new",
      "text": " " + data.Title,
      "style": "display:block",
      "href": "/audit?id=" + data.Id
    });

    var $icon = $("<i>", {
      "class": getIcon(data.Title)
    });

    var $stamp = $("<span>", {
      "class": "pull-right text-muted small",
      "text": formatDate(time),
      "data-time": time.getTime()
    });

    $item.prepend($icon);
    $item.append($stamp);

    $item.hide();

    $("#lstNotifications").prepend($item);

    $("#lstNotifications a").last().slideUp(200, function () { $(this).remove(); });

    $item.slideDown(200);

    $item.on("mouseover", function () { $(this).removeClass("new"); });
  });
});