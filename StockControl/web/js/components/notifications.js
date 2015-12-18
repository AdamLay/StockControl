$(document).ready(function () {
    Notifications.NotificationEvent.Subscribe(function (data) {
        var $entry = $(Templates["notification"]({ item: data })).hide().addClass("new");
        $("#lstNotifications").prepend($entry);
        var $all = $("#lstNotifications a");
        if ($all.length > 6)
            $all.last().slideUp(200, function () { $(this).remove(); });
        $entry.slideDown(200);
        $entry.on("mouseover", function () { $(this).removeClass("new"); });
    });
});
