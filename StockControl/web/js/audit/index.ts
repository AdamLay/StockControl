$(document).ready(function ()
{
  var id = getQueryStringValue("id");

  if (id)
  {
    $("html, body").animate({ scrollTop: $('#' + id).offset().top - 100 }, 1000);

    $("#" + id).addClass("focussed").fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200);
  }

  Notifications.NotificationEvent.Subscribe(function (data: IAuditEntry)
  {
    console.log(data);

    var invert = $(".timeline li").first().hasClass("timeline-inverted");
  });
});