$(document).ready(function () {
    Notifications.NotificationEvent.Subscribe(function (data) {
        var $entry = $(Templates["notification"](new Notification(data))).hide();
        $("#lstNotifications").prepend($entry);
        $("#lstNotifications a").last().slideUp(200, function () { $(this).remove(); });
        $entry.slideDown(200);
        $entry.on("mouseover", function () { $(this).removeClass("new"); });
    });
});
