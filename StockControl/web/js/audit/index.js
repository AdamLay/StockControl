$(document).ready(function () {
    var id = getQueryStringValue("id");
    if (id) {
        $("html, body").animate({ scrollTop: $('#' + id).offset().top - 100 }, 1000);
        $("#" + id).addClass("focussed").fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200);
    }
    Notifications.NotificationEvent.Subscribe(function (data) {
        console.log(data);
        var invert = !$(".timeline li").first().hasClass("timeline-inverted");
        var $log = $(Handlebars.templates["auditLog"](data));
        if (invert)
            $log.addClass("timeline-inverted");
        var $badge = $log.children(".timeline-badge");
        $badge.addClass(Helpers.GetColour(data.Title));
        $badge.children("i").addClass(Helpers.GetIcon(data.Title));
        $(".timeline").prepend($log);
    });
});
//# sourceMappingURL=index.js.map