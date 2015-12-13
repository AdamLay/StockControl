function sgUpdate(id: number)
{
  Api.Update("/stock-groups/" + id, { Name: $("#txtGroup_" + id).val() }, function (data)
  {
    var msg = data.Success ? "Name updated successfully" : "Name failed to update";

    handleResponse(msg, data.Success);
  });
}

function sgDelete(id: number)
{
  Api.Delete("/stock-groups/" + id, function (data)
  {
    var msg = data.Success ? "Stock Group deleted successfully" : "Failed to delete Stock Group";

    handleResponse(msg, data.Success);

    if (data.Success)
    {
      $("#row_" + id).remove();
    }
  });
}

function handleResponse(msg: string, success: boolean)
{
  var $pop = $("<div>", {
    "class": "alert " + (success ? "alert-success" : "alert-danger"),
    "text": msg
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