﻿$(document).ready(function ()
{
  var id = getQueryStringValue("id");

  if (id)
  {
    $("html, body").animate({ scrollTop: $('#' + id).offset().top - 100 }, 1000);

    $("#" + id).addClass("focussed").fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200);
  }

  Notifications.NotificationEvent.Subscribe(function (data: IAuditEntry)
  {
    var $log = $(Templates["auditLog"](data));

    if (!$(".timeline li").first().hasClass("timeline-inverted"))
      $log.addClass("timeline-inverted");

    $log
      .children(".timeline-badge")
      .addClass(Helpers.GetColour(data.Title))
      .children("i")
      .addClass(Helpers.GetIcon(data.Title));

    $(".timeline").prepend($log);
  });
});
